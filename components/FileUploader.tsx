import React, { useRef, useState } from 'react';
import { Upload, FileImage, FileVideo, X } from 'lucide-react';
import { UploadedFile, MediaType } from '../types';

interface FileUploaderProps {
  onFileSelect: (file: UploadedFile) => void;
  onClear: () => void;
  currentFile: UploadedFile | null;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, onClear, currentFile }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndProcessFile = (file: File) => {
    setError(null);
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError("Please upload an image or video file.");
      return;
    }

    // Limit video size for browser performance (inline base64 limitation)
    if (isVideo && file.size > 20 * 1024 * 1024) {
       setError("For this demo, video files must be under 20MB.");
       return;
    }

    const previewUrl = URL.createObjectURL(file);
    onFileSelect({
      file,
      previewUrl,
      type: isImage ? 'image' : 'video',
      mimeType: file.type
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const triggerSelect = () => {
    inputRef.current?.click();
  };

  if (currentFile) {
    return (
      <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 shadow-lg group">
        <button 
          onClick={onClear}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center justify-center min-h-[300px] max-h-[60vh] bg-black/20">
            {currentFile.type === 'image' ? (
                <img 
                    src={currentFile.previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-contain max-h-[60vh]"
                />
            ) : (
                <video 
                    src={currentFile.previewUrl} 
                    controls 
                    className="w-full h-full object-contain max-h-[60vh]"
                />
            )}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-sm font-medium truncate">{currentFile.file.name}</p>
            <p className="text-xs text-slate-300">{(currentFile.file.size / (1024 * 1024)).toFixed(2)} MB</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className={`relative flex flex-col items-center justify-center w-full h-64 sm:h-80 rounded-2xl border-2 border-dashed transition-all duration-200 ease-in-out cursor-pointer overflow-hidden
          ${dragActive 
            ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20" 
            : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600"
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={triggerSelect}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*"
          onChange={handleChange}
        />
        
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            <div className={`p-4 rounded-full mb-4 transition-colors ${
                dragActive 
                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' 
                : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
            }`}>
                <Upload size={32} />
            </div>
            <p className="mb-2 text-lg font-medium text-slate-700 dark:text-slate-200">
                Click to upload or drag and drop
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                Supports Images (PNG, JPG, WEBP) and Video (MP4, WebM) up to 20MB
            </p>
            {error && (
                <p className="mt-4 text-sm font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full">
                    {error}
                </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default FileUploader;