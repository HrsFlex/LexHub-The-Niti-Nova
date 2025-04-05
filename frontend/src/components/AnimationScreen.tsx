import React from "react";
import example from "./pages/example.jpg"

interface AnimationScreenProps {
  showAnimation: boolean;
}

const AnimationScreen: React.FC<AnimationScreenProps> = ({ showAnimation }) => {
  if (!showAnimation) return null;

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <div className="flex items-center justify-center w-full h-full bg-gray-800 text-gray-200">
        <div className="text-center animate-fade-in">
          <img
            src={example}
            alt="Program Logo"
            className="w-60 h-60 mx-auto mb-4"
          />
          <h1 className="text-5xl font-bold mb-2 text-white animate-highlight">
            Lex-Hub
          </h1>
          <h2 className="text-2xl font-semibold text-green-300 animate-slide-in-delay">
           Your Ultimate Legal Research Engine...
          </h2>
        </div>
      </div>
    </div>
  );
};

export default AnimationScreen;
