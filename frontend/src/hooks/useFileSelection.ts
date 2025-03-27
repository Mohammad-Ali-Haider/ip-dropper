import { useState, useCallback } from 'react';

export function useFileSelection() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleRemoveFile = (fileToRemove: File) => {
    setSelectedFiles(prev => 
      prev.filter(file => file !== fileToRemove)
    );
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    // Clear any file input elements
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
      (input as HTMLInputElement).value = '';
    });
  };

  return {
    selectedFiles,
    handleFileChange,
    handleRemoveFile,
    clearFiles
  };
}
