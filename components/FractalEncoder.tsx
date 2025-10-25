
import React from 'react';

interface FractalEncoderProps {
  text: string;
  setText: (text: string) => void;
  onEncode: () => void;
  isLoading: boolean;
}

const FractalEncoder: React.FC<FractalEncoderProps> = ({ text, setText, onEncode, isLoading }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-cyan-300">1. Encoder</h2>
      <div className="flex flex-col gap-4">
        <label htmlFor="text-input" className="text-gray-400">
          Enter text to encode:
        </label>
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-32 p-3 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none transition duration-200 resize-none"
          placeholder="Type something..."
        />
        <button
          onClick={onEncode}
          disabled={isLoading}
          className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          {isLoading ? 'Generating...' : 'Generate Fractal'}
        </button>
      </div>
    </div>
  );
};

export default FractalEncoder;
