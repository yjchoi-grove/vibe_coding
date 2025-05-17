import { Post } from './post';

export type PostFormState = {
  title: string;
  videoUrl: string;
  content: string;
  imgUrl: string;
  attachments: File[];
  existingAttachments: Post['attachments'];
  previewVideoId: string | null;
  previewType: 'youtube' | 'naver' | null;
  lastSaved: Date | null;
  error: string | null;
  focusTitle: boolean;
};

export type PostFormAction =
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'SET_VIDEO_URL'; payload: string }
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'SET_IMG_URL'; payload: string }
  | { type: 'SET_ATTACHMENTS'; payload: File[] }
  | { type: 'SET_EXISTING_ATTACHMENTS'; payload: Post['attachments'] }
  | { type: 'SET_PREVIEW_VIDEO'; payload: { id: string | null; type: 'youtube' | 'naver' | null } }
  | { type: 'SET_LAST_SAVED'; payload: Date | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'FOCUS_TITLE' }
  | { type: 'BLUR_TITLE' }; 