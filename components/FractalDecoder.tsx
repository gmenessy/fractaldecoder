
import React, { useState, useEffect } from 'react';

interface FractalDecoderProps {
  originalText: string;
}

const FractalDecoder: React.FC<FractalDecoderProps> = ({ originalText }) => {
  const [showDecoded, setShowDecoded] = useState(false);
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    // Reset the decoder state when a new text is encoded
    setShowDecoded(false);
    setDisplayedText('');
  }, [originalText]);
  
  const handleDecode = () => {
    setShowDecoded(true);
    setDisplayedText(originalText);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-cyan-300">2. Decoder</h2>
      <div className="flex flex-col gap-4">
        <div className="w-full min-h-[8rem] p-3 bg-gray-900 border border-gray-700 rounded-md">
          {showDecoded ? (
            <p className="whitespace-pre-wrap break-words">{displayedText}</p>
          ) : (
            <p className="text-gray-500">Click the button to reveal the decoded text.</p>
          )}
        </div>
        <button
          onClick={handleDecode}
          disabled={!originalText || showDecoded}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          {showDecoded ? 'Decoded!' : 'Decode Fractal'}
        </button>
      </div>
    </div>
  );
};

export default FractalDecoder;
