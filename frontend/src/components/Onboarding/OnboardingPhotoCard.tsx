"use client";

import React, { useState } from "react";

interface OnboardingPhotoCardProps {
  onSubmit: (base64Image?: string) => void;
  onSkip?: () => void;
}

export function OnboardingPhotoCard({ onSubmit, onSkip }: OnboardingPhotoCardProps) {
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const [isReading, setIsReading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(undefined);
      return;
    }

    const reader = new FileReader();
    setIsReading(true);
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      setIsReading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleContinue = () => {
    onSubmit(preview);
  };

  return (
    <div className="flex flex-col items-center p-4 sm:p-8 w-[90%] sm:w-[450px] mx-auto text-center">
      <h2 className="mb-2 text-2xl sm:text-3xl font-bold text-text-primary">Add a Profile Photo</h2>
      <p className="text-gray-600 text-center mb-6 text-sm sm:text-base">
        Upload a clear photo of yourself. You can skip and add it later.
      </p>

      <div className="mb-4">
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover mx-auto"
          />
        ) : (
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-200 flex items-center justify-center mx-auto text-gray-500">
            No image
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
      />

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleContinue}
          disabled={isReading}
          className="px-4 py-2 text-xs sm:text-sm bg-primary text-white rounded-md disabled:opacity-60"
        >
          {isReading ? "Processing..." : "Continue"}
        </button>
        {onSkip && (
          <button
            onClick={onSkip}
            className="px-4 py-2 text-xs sm:text-sm bg-gray-200 text-gray-700 rounded-md"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}


