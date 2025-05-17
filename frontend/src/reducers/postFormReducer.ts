import { PostFormState, PostFormAction } from '../types/form';

export function postFormReducer(state: PostFormState, action: PostFormAction): PostFormState {
  switch (action.type) {
    case 'SET_TITLE':
      return { ...state, title: action.payload };
    case 'SET_VIDEO_URL':
      return { ...state, videoUrl: action.payload };
    case 'SET_CONTENT':
      return { ...state, content: action.payload };
    case 'SET_IMG_URL':
      return { ...state, imgUrl: action.payload };
    case 'SET_ATTACHMENTS':
      return { ...state, attachments: action.payload };
    case 'SET_EXISTING_ATTACHMENTS':
      return { ...state, existingAttachments: action.payload };
    case 'SET_PREVIEW_VIDEO':
      return { ...state, previewVideoId: action.payload.id, previewType: action.payload.type };
    case 'SET_LAST_SAVED':
      return { ...state, lastSaved: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'FOCUS_TITLE':
      return { ...state, focusTitle: true };
    case 'BLUR_TITLE':
      return { ...state, focusTitle: false };
    default:
      return state;
  }
} 