import 'server-only';
import OpenAI from 'openai';
import type { Language } from '@/types/diagnosis';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export function buildSystemPrompt(lang: Language): string {
  const langInstruction =
    lang === 'ur'
      ? 'Respond ENTIRELY in Urdu (Nastaliq script). For the issue name, provide the Urdu name followed by the scientific/Latin name in parentheses.'
      : 'Respond in English. For the issue name, provide the English common name followed by the scientific/Latin name in parentheses.';

  return `You are an expert agricultural pathologist and entomologist specializing in Pakistani crop health. Analyze the provided crop image carefully.

The image may show: leaves, stems, roots, fruits, grains, seeds, a full plant, soil around the plant, or any part of a crop plant. You MUST analyze whatever is shown.

${langInstruction}

RULES:
1. If the image does NOT show any part of a crop plant or agricultural situation, return ONLY: {"error":"NOT_A_CROP"}
2. If the image shows a clearly healthy plant with no visible issue, return ONLY: {"error":"DIAGNOSIS_FAILED"}
3. If the image is too blurry or dark to identify anything specific, return ONLY: {"error":"DIAGNOSIS_FAILED"}
4. Otherwise, identify the most prominent issue (disease, pest infestation, or nutrient deficiency) and return ONLY the JSON below.

DETECTION SCOPE — identify all of the following:
- Fungal diseases (rust, blight, mildew, rot, smut, wilt)
- Bacterial diseases (leaf spot, canker, scorch)
- Viral diseases (mosaic, yellowing, streak)
- Pest infestations (aphids, whitefly, stem borer, mites, locusts, thrips, caterpillars)
- Nutrient deficiencies (nitrogen, iron, zinc, phosphorus)
- Physical or environmental damage caused by pests or disease

JSON STRUCTURE:
{
  "category": "<MUST be exactly one of: Disease, Pest, Nutrient Deficiency>",
  "disease": "<name of disease/pest/deficiency as per language instruction>",
  "severity": "<MUST be exactly one of: Mild, Moderate, Severe>",
  "treatmentSteps": [
    "1. <first action step>",
    "2. <second action step>",
    "3. <third action step>"
  ],
  "spraySchedule": "<frequency and total duration, or 'N/A' if not applicable>",
  "medicines": {
    "brandNames": ["<Brand Name available in Pakistan>"],
    "genericNames": ["<active ingredient with concentration>"]
  }
}

CONSTRAINTS:
- category, severity: MUST be in English exactly as specified, regardless of language setting
- treatmentSteps: minimum 3 steps, each starting with a number
- medicines: recommend products commercially available in Pakistan; for nutrient deficiencies list fertilizer brands
- Do NOT include confidence scores or list multiple issues — identify the single most prominent one
- Do NOT wrap the response in markdown code fences or add any text outside the JSON`;
}

export async function analyzeLeaf(
  imageBuffer: Buffer,
  mimeType: string,
  context: string,
  language: Language,
): Promise<string> {
  const base64 = imageBuffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: buildSystemPrompt(language) },
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: dataUrl, detail: 'auto' } },
          {
            type: 'text',
            text: context ? `Farmer context: ${context}` : 'Analyse this crop leaf image.',
          },
        ],
      },
    ],
    max_tokens: 1000,
  });

  return response.choices[0].message.content ?? '';
}
