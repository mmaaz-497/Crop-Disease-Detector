import { NextResponse } from 'next/server';
import { analyzeLeaf } from '@/lib/openai';
import { t } from '@/lib/i18n';
import type { Language, ErrorCode, DiagnosisResult } from '@/types/diagnosis';
import type { StringKey } from '@/lib/i18n';

export const maxDuration = 60; // seconds — effective on Vercel Pro; Hobby caps at 10s

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// ─── Rate limiting (in-memory, per serverless instance) ───────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

// ─── Magic-byte validation ────────────────────────────────────────────────────

function validateMagicBytes(buf: Buffer, mime: string): boolean {
  if (mime === 'image/jpeg') return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (mime === 'image/png')
    return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  if (mime === 'image/webp')
    return buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46;
  return false;
}

// ─── Schema guard ─────────────────────────────────────────────────────────────

function isDiagnosisResult(obj: unknown): obj is DiagnosisResult {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    (o.category === 'Disease' || o.category === 'Pest' || o.category === 'Nutrient Deficiency') &&
    typeof o.disease === 'string' &&
    o.disease.length > 0 &&
    (o.severity === 'Mild' || o.severity === 'Moderate' || o.severity === 'Severe') &&
    Array.isArray(o.treatmentSteps) &&
    (o.treatmentSteps as unknown[]).length >= 1 &&
    typeof o.spraySchedule === 'string' &&
    typeof o.medicines === 'object' &&
    o.medicines !== null &&
    Array.isArray((o.medicines as Record<string, unknown>).brandNames) &&
    Array.isArray((o.medicines as Record<string, unknown>).genericNames)
  );
}

// ─── Error response helper ────────────────────────────────────────────────────

const errorKeyMap: Record<ErrorCode, StringKey> = {
  INVALID_IMAGE: 'errInvalidImage',
  NOT_A_CROP: 'errNotACrop',
  DIAGNOSIS_FAILED: 'errDiagnosisFailed',
  UPSTREAM_ERROR: 'errUpstream',
  TIMEOUT: 'errTimeout',
  RATE_LIMITED: 'errRateLimited',
};

function errorResponse(code: ErrorCode, status: number, lang: Language): NextResponse {
  const key = errorKeyMap[code];
  return NextResponse.json(
    {
      error: {
        code,
        message: t(key, lang),
        messageEn: t(key, 'en'),
      },
    },
    { status },
  );
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.OPENAI_API_KEY) {
    console.error('[analyze] OPENAI_API_KEY is not set');
    return errorResponse('UPSTREAM_ERROR', 500, 'ur');
  }

  // 1. Rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip)) return errorResponse('RATE_LIMITED', 429, 'ur');

  // 2. Parse FormData
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse('INVALID_IMAGE', 400, 'ur');
  }

  const imageFile = formData.get('image') as File | null;
  const context = ((formData.get('context') as string | null) ?? '').trim();
  const rawLang = formData.get('language') as string | null;
  const language: Language = rawLang === 'en' ? 'en' : 'ur';

  // 3. Validate image presence
  if (!imageFile || imageFile.size === 0) {
    return errorResponse('INVALID_IMAGE', 400, language);
  }

  // 4. Validate MIME type (client-declared)
  if (!ALLOWED_MIMES.includes(imageFile.type as (typeof ALLOWED_MIMES)[number])) {
    return errorResponse('INVALID_IMAGE', 400, language);
  }

  // 5. Read buffer and validate magic bytes + size
  const buffer = Buffer.from(await imageFile.arrayBuffer());
  if (!validateMagicBytes(buffer, imageFile.type)) {
    return errorResponse('INVALID_IMAGE', 400, language);
  }
  if (buffer.length > MAX_BYTES) {
    return errorResponse('INVALID_IMAGE', 400, language);
  }

  // 6. Call OpenAI with 28-second timeout (leaves 2s headroom within maxDuration=30)
  let rawJson: string;
  try {
    rawJson = await Promise.race([
      analyzeLeaf(buffer, imageFile.type, context.slice(0, 500), language),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 55_000),
      ),
    ]);
  } catch (err) {
    const isTimeout = (err as Error).message === 'TIMEOUT';
    if (!isTimeout) {
      console.error('[analyze] OpenAI error:', err);
    }
    const code = isTimeout ? 'TIMEOUT' : 'UPSTREAM_ERROR';
    return errorResponse(code, code === 'TIMEOUT' ? 408 : 500, language);
  }

  // 7. Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return errorResponse('UPSTREAM_ERROR', 500, language);
  }

  // 8. Check AI sentinel errors
  const parsedObj = parsed as Record<string, unknown>;
  if (parsedObj?.error === 'NOT_A_CROP')
    return errorResponse('NOT_A_CROP', 400, language);
  if (parsedObj?.error === 'DIAGNOSIS_FAILED')
    return errorResponse('DIAGNOSIS_FAILED', 422, language);

  // 9. Validate DiagnosisResult schema
  if (!isDiagnosisResult(parsed)) {
    return errorResponse('UPSTREAM_ERROR', 500, language);
  }

  return NextResponse.json(parsed, { status: 200 });
}
