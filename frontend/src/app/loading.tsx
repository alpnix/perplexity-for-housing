import React from "react";

const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-300">
      <div className="relative flex flex-col items-center">
        {/* Rotating Circle */}
        <div
          className="w-16 h-16 border-4 border-[#9b775c] border-t-transparent border-solid rounded-full animate-spin"
          aria-label="Loading spinner"
        ></div>

        {/* GrotN Text */}
        <div className="mt-4 text-center">
          <h1 className="text-[#9b775c] text-lg font-semibold">Loading...</h1>
          <p className="text-gray-600 text-sm">Please wait while we search for the perfect rental for you..</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;