"use client";

import React, { useState } from "react";
import { IoMdAdd } from "react-icons/io";

interface Interest {
  text: string;
}

interface OnboardingInterestCardProps {
  onSelectInterests: (selectedInterests: string[]) => void;
  onSkip?: () => void;
}

export function OnboardingInterestCard({ onSelectInterests, onSkip }: OnboardingInterestCardProps) {
  const [newInterest, setNewInterest] = useState("");
  const [interests, setInterests] = useState<Interest[]>([
    { text: "Music" },
    { text: "Video Games" },
    { text: "Sports" },
    { text: "Technology" },
    { text: "Fitness" },
    { text: "Art" },
    { text: "Pets" },
    { text: "Languages" },
    { text: "Science" },
    { text: "Philosophy" },
  ]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const addInterest = () => {
    if (newInterest.trim()) {
      setInterests((prev) => [...prev, { text: newInterest }]);
      setSelectedInterests((prev) => [...prev, newInterest]);
      setNewInterest("");
    }
  };

  const toggleInterest = (interestText: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestText)
        ? prev.filter((item) => item !== interestText)
        : [...prev, interestText]
    );
  };

  const handleContinue = () => {
    onSelectInterests(selectedInterests);
  };

  return (
    <div className="flex flex-col items-center p-4 sm:p-8 w-full max-w-lg mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-text-primary">Your Interests</h2>
      <p className="text-gray-600 mb-4 sm:mb-6 text-center">
        Choose what you like from the list below or add your own interests.
      </p>

      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
        {interests.map((interest, index) => (
          <div
            key={index}
            onClick={() => toggleInterest(interest.text)}
            className={`px-3 py-1 sm:px-4 sm:py-2 text-sm font-medium rounded-lg cursor-pointer transition 
            ${selectedInterests.includes(interest.text)
              ? "bg-primary text-white border-primary"
              : "bg-transparent text-gray-700 border-gray-400"} // Default state: transparent with gray border`}
          >
            {interest.text}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 mb-4 w-full">
        <input
          type="text"
          value={newInterest}
          onChange={(e) => setNewInterest(e.target.value)}
          placeholder="Add new interest..."
          className="flex-grow px-2 sm:px-3 py-1 sm:py-2 border text-sm rounded-md focus:outline-none focus:ring focus:ring-primary"
          onKeyDown={(e) => {
            if (e.key === "Enter") addInterest();
          }}
        />
        <button
          onClick={addInterest}
          className="p-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition"
        >
          <IoMdAdd size={20} />
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleContinue}
          className="px-4 sm:px-6 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary-dark transition"
        >
          Continue
        </button>
        {onSkip && (
          <button
            onClick={onSkip}
            className="px-4 sm:px-6 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm hover:bg-gray-300 transition"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
