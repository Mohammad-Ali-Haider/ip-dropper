interface FileItemProps {
  file: File;
  onRemove: (file: File) => void;
}

export function FileItem({ file, onRemove }: FileItemProps) {
  return (
    <div className="file-item">
      <i className="fas fa-file file-icon"></i>
      <span className="file-name">{file.name}</span>
      <button 
        className="remove-file-btn"
        onClick={() => onRemove(file)}
        title="Remove file"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
}