import  { useState } from "react";
import { Form, Button, ProgressBar, Alert } from "react-bootstrap";
import { FiUpload, FiFile, FiX,  FiAlertCircle } from "react-icons/fi";
import axios from "../api/axios";

const FileUpload = ({ 
  label, 
  name, 
  onUpload, 
  accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx",
  maxSize = 5, // MB
  multiple = false,
  existingFiles = []
}) => {
  const [files, setFiles] = useState(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    setError(null);

    // Validate file size
    const oversizedFiles = selectedFiles.filter(f => f.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`${oversizedFiles.length} file(s) exceed ${maxSize}MB limit`);
      return;
    }

    setUploading(true);
    setProgress(0);

    const uploadedFiles = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "kyc");

      try {
        const response = await axios.post("/uploads", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted / selectedFiles.length);
          },
        });

        if (response.data.success) {
          uploadedFiles.push({
            name: file.name,
            url: response.data.url,
            size: file.size,
            type: file.type,
          });
        }
      } catch (error) {
        console.error("Upload failed:", error);
        setError(`Failed to upload ${file.name}`);
      }
    }

    setFiles([...files, ...uploadedFiles]);
    onUpload(name, [...files, ...uploadedFiles]);
    setUploading(false);
    setProgress(0);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onUpload(name, newFiles);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      
      <div className="file-upload-area">
        <input
          type="file"
          id={`file-upload-${name}`}
          onChange={handleFileSelect}
          accept={accept}
          multiple={multiple}
          style={{ display: "none" }}
        />
        <label htmlFor={`file-upload-${name}`} className="upload-label">
          <FiUpload size={24} />
          <p className="mb-0">Click or drag to upload</p>
          <small className="text-muted">
            Supported: PDF, JPG, PNG, DOC (Max {maxSize}MB)
          </small>
        </label>
      </div>

      {uploading && (
        <div className="mt-2">
          <ProgressBar now={progress} label={`${Math.round(progress)}%`} variant="info" />
          <small className="text-muted">Uploading...</small>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="mt-2">
          <FiAlertCircle className="me-2" />
          {error}
        </Alert>
      )}

      {files.length > 0 && (
        <div className="uploaded-files mt-2">
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <FiFile className="file-icon" />
              <div className="file-info">
                <div className="file-name">{file.name}</div>
                <div className="file-size">{formatFileSize(file.size)}</div>
              </div>
              <Button
                variant="link"
                size="sm"
                className="remove-file"
                onClick={() => removeFile(index)}
              >
                <FiX />
              </Button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .file-upload-area {
          border: 2px dashed var(--border-color);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .file-upload-area:hover {
          border-color: var(--primary-color);
          background: var(--bg-secondary);
        }
        .upload-label {
          cursor: pointer;
          display: block;
        }
        .uploaded-files {
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 0.5rem;
        }
        .file-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          border-bottom: 1px solid var(--border-color);
        }
        .file-item:last-child {
          border-bottom: none;
        }
        .file-icon {
          color: var(--primary-color);
        }
        .file-info {
          flex: 1;
        }
        .file-name {
          font-size: 14px;
          font-weight: 500;
        }
        .file-size {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .remove-file {
          color: var(--danger-color);
          padding: 0;
        }
      `}</style>
    </Form.Group>
  );
};

export default FileUpload;