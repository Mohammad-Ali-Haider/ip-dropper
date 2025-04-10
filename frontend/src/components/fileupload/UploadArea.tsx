import { FileItem } from './FileItem';

interface UploadAreaProps {
  selectedFiles: File[];
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (file: File) => void;
}

export function UploadArea({ selectedFiles, onFileChange, onRemoveFile }: UploadAreaProps) {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

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

  return (
    <div
      className="upload-area"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <i className="fas fa-cloud-upload-alt upload-icon"></i>
      <input
        type="file"
        multiple
        onChange={onFileChange}
        className="file-input"
        id="file-input"
      />
      <label htmlFor="file-input" className="upload-label">
        Choose Files
      </label>
      {selectedFiles.length > 0 && (
        <div className="selected-files">
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