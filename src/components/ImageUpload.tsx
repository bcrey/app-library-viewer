"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";

interface ImageUploadProps {
  currentIcon: string;
  onUpload: (base64: string) => void;
}

export default function ImageUpload({ currentIcon, onUpload }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert("Image must be under 500KB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onUpload(reader.result);
      }
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  return (
    <div className="relative">
      <button
        onClick={() => inputRef.current?.click()}
        className="group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-gray-700/50 ring-1 ring-white/10 transition-all hover:ring-white/20"
        title="Upload custom icon"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentIcon}
          alt="Icon"
          className="h-full w-full object-contain p-1"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <Upload className="h-4 w-4 text-white" />
        </div>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
