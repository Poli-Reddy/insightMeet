"use client";

import { useState, useRef, useCallback } from "react";
import { UploadCloud, Video } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UploadFormProps {
  onFileUpload: (file: File) => void;
}

export default function UploadForm({ onFileUpload }: UploadFormProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  }, [onFileUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex items-center justify-center w-full">
      <Card className="w-full max-w-2xl text-center shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Meeting Analysis</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Upload your meeting recording to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
            <input
              ref={inputRef}
              type="file"
              id="input-file-upload"
              className="hidden"
              accept=".mp4,.avi,.mkv,.mov,.webm"
              onChange={handleChange}
            />
            <label
              id="label-file-upload"
              htmlFor="input-file-upload"
              className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-secondary transition-colors ${dragActive ? "border-primary" : "border-border"}`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-12 h-12 mb-3 text-muted-foreground" />
                <p className="mb-2 text-lg font-semibold text-foreground">
                  <span className="font-bold text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-muted-foreground">MP4, AVI, MKV, MOV, or WEBM</p>
              </div>
              {dragActive && <div className="absolute inset-0 w-full h-full" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
            </label>
          </form>
          <Button onClick={onButtonClick} className="mt-6 w-full max-w-xs" size="lg">
            <Video className="mr-2 h-5 w-5" />
            Select Video File
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
