export type MediaType = 'image' | 'video';

export enum ModelType {
  FLASH = 'gemini-2.5-flash-latest',
  PRO = 'gemini-3-pro-preview',
}

export enum PromptStyle {
  DESCRIPTIVE = 'descriptive',
  MIDJOURNEY = 'midjourney',
  ACCESSIBILITY = 'accessibility',
  TAGS = 'tags'
}

export interface UploadedFile {
  file: File;
  previewUrl: string;
  type: MediaType;
  base64?: string;
  mimeType: string;
}

export interface AnalysisState {
  isLoading: boolean;
  result: string | null;
  error: string | null;
}
