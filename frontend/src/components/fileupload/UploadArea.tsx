import { useState, forwardRef } from 'react';
import { FileItem } from './FileItem';

interface UploadAreaProps {
  selectedFiles: File[];
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (file: File) => void;
}

export const UploadArea = forwardRef<HTMLDivElement, UploadAreaProps>(
  ({ selectedFiles, onFileChange, onRemoveFile }, ref) => {
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(true);
      e.dataTransfer.dropEffect = "copy";
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        // Create a synthetic event to reuse onFileChange
        const dataTransfer = new DataTransfer();
        Array.from(files).forEach(file => dataTransfer.items.add(file));

        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.files = dataTransfer.files;

        const syntheticEvent = {
          target: input
        } as unknown as React.ChangeEvent<HTMLInputElement>;

        onFileChange(syntheticEvent);
      }
    };

    const handleClick = () => {
      document.getElementById('file-input')?.click();
    };

    return (
      <div
        ref={ref}
        className={`upload-area ${isDraggingOver ? 'dragging-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          multiple
          onChange={onFileChange}
          className="file-input"
          id="file-input"
        />
        <i className="fas fa-cloud-upload-alt upload-icon"></i>
        <span className="upload-text">Click or drag files here to upload</span>
        {selectedFiles.length > 0 && (
          <div className="selected-files" onClick={e => e.stopPropagation()}>
            {selectedFiles.map((file, index) => (
              <FileItem
                key={index}
                file={file}
                onRemove={onRemoveFile}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
);

UploadArea.displayName = 'UploadArea';
