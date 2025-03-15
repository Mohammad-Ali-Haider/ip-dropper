import { useState } from 'react';

export function useFileSelection() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setSelectedFiles(prev => 
      prev.filter(file => file !== fileToRemove)
    );
  };

  const clearFiles = () => setSelectedFiles([]);

  return {
    selectedFiles,
    handleFileChange,
    handleRemoveFile,
    clearFiles
  };
}