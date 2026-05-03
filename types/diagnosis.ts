export type Language = 'ur' | 'en';

export type SeverityLevel = 'Mild' | 'Moderate' | 'Severe';

export type ErrorCode =
  | 'INVALID_IMAGE'
  | 'NOT_A_CROP'
  | 'DIAGNOSIS_FAILED'
  | 'UPSTREAM_ERROR'
  | 'TIMEOUT'
  | 'RATE_LIMITED';

export type IssueCategory = 'Disease' | 'Pest' | 'Nutrient Deficiency';

export interface MedicineSet {
  brandNames: string[];
  genericNames: string[];
}

export interface DiagnosisResult {
  category: IssueCategory;
  disease: string;
  severity: SeverityLevel;
  treatmentSteps: string[];
  spraySchedule: string;
  medicines: MedicineSet;
}

export interface ScanRecord extends DiagnosisResult {
  id: string;
  date: string;
  lang: Language;
  imageThumb?: string;
}

export interface DiagnosisError {
  error: {
    code: ErrorCode;
    message: string;
    messageEn: string;
  };
}
