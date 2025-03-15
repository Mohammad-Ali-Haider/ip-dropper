import { FileItem } from './FileItem';

interface UploadAreaProps {
  selectedFiles: File[];
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (file: File) => void;
}

export function UploadArea({ selectedFiles, onFileChange, onRemoveFile }: UploadAreaProps) {
  return (
    <div className="upload-area">
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