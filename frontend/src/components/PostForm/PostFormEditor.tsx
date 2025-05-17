import React, { useCallback, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// 에디터 스타일
const editorStyles = `
  .quill-editor .ql-container {
    border: none;
    border-radius: 0 0 0.5rem 0.5rem;
  }
  .quill-editor .ql-toolbar {
    border: none;
    border-bottom: 1px solid #e2e8f0;
    border-radius: 0.5rem 0.5rem 0 0;
  }
  .quill-editor .ql-editor {
    min-height: 200px;
  }
  .quill-editor .ql-editor.ql-blank::before {
    color: #9ca3af;
  }
  .quill-editor .ql-container.ql-snow:focus-within {
    border: none !important;
    box-shadow: none !important;
  }
  .quill-editor .ql-editor:focus {
    outline: none;
    box-shadow: none;
  }
  .quill-editor .ql-toolbar:focus {
    outline: none;
    box-shadow: none;
  }
  .quill-editor .ql-container.ql-snow {
    border: none !important;
  }
  .quill-editor .ql-editor.ql-blank:focus::before {
    color: #9ca3af;
  }
`;

interface PostFormEditorProps {
  value: string;
  onChange: (content: string) => void;
  quillRef: React.RefObject<ReactQuill>;
  error: boolean;
  maxLength: number;
  isContentTooLong: boolean;
  modules?: any;
  formats?: string[];
}

const PostFormEditor: React.FC<PostFormEditorProps> = ({
  value,
  onChange,
  quillRef,
  error,
  maxLength,
  isContentTooLong,
  modules,
  formats
}) => {
  const handleChange = useCallback((content: string) => {
    onChange(content);
  }, [onChange]);

  useEffect(() => {
    // 에디터가 마운트된 후 불필요한 이벤트 리스너 제거
    const cleanup = () => {
      const editor = quillRef.current?.getEditor();
      if (editor) {
        editor.off('text-change', () => {});
      }
    };
    return cleanup;
  }, [quillRef]);

  return (
    <div className="mb-4">
      <label className="text-sm font-medium text-gray-700">
        내용 <span className="text-red-600 ml-1">*</span>
      </label>
      <style>{editorStyles}</style>
      <div className={`quill-editor ${error ? 'border-red-500' : 'border-gray-300'} border rounded-lg`}>
        <ReactQuill
          ref={quillRef}
          value={value}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          theme="snow"
          className="h-64"
          preserveWhitespace={true}
          bounds=".quill-editor"
        />
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className={`text-sm ${isContentTooLong ? 'text-red-500' : 'text-gray-500'}`}>
          {value.replace(/<[^>]*>/g, '').length} / {maxLength}자
        </span>
        {error && (
          <span className="text-sm text-red-500">
            내용을 입력해주세요.
          </span>
        )}
      </div>
    </div>
  );
};

export default PostFormEditor; 