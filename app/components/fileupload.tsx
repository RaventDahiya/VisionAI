"use client";

import React, { useState, useRef } from "react";
import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";

interface FileUploadProps {
  onSuccess: (res: any) => void;
  onProgress?: (progress: number) => void;
  fileType?: "image" | "video";
}

const FileUpload: React.FC<FileUploadProps> = ({
  onSuccess,
  onProgress,
  fileType = "image",
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const abortController = useRef<AbortController | null>(null);

  // Validate file type and size, returns boolean
  const validateFile = (file: File): boolean => {
    if (fileType === "video" && !file.type.startsWith("video/")) {
      setError("Please upload a valid video file");
      return false;
    }
    if (fileType === "image" && !file.type.startsWith("image/")) {
      setError("Please upload a valid image file");
      return false;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("File size must be less than 100 MB");
      return false;
    }
    setError(null);
    return true;
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    // Create new abort controller for each upload to support cancellation if needed
    abortController.current = new AbortController();

    try {
      // Call your API route to get the upload authentication data
      const authRes = await fetch("/api/auth/imagekit-auth");
      if (!authRes.ok) {
        throw new Error("Failed to get upload auth data");
      }
      const authData = await authRes.json();

      const result = await upload({
        expire: authData.expire,
        token: authData.token,
        signature: authData.signature,
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY as string,
        file,
        fileName: file.name,
        onProgress: (event) => {
          if (event.total) {
            const percent = (event.loaded / event.total) * 100;
            setProgress(percent);
            if (onProgress) onProgress(percent);
          }
        },
        abortSignal: abortController.current.signal,
      });

      setUploading(false);
      onSuccess(result);
    } catch (err) {
      setUploading(false);

      // Optional: distinguish error types, set meaningful messages
      if (
        err instanceof ImageKitAbortError ||
        err instanceof ImageKitInvalidRequestError ||
        err instanceof ImageKitServerError ||
        err instanceof ImageKitUploadNetworkError
      ) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during upload");
      }
    }
  };

  return (
    <>
      <input
        type="file"
        accept={fileType === "video" ? "video/*" : "image/*"}
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <span>Uploading... {progress.toFixed(0)}%</span>}
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </>
  );
};

export default FileUpload;
