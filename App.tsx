import React, { useState, useCallback, useEffect, useRef } from 'react';
import FractalEncoder from './components/FractalEncoder';
import FractalVisualizer from './components/FractalVisualizer';
import FractalDecoder from './components/FractalDecoder';
import IOControls from './components/IOControls';
import { encodeText, embedTextInCanvas, extractTextFromImage } from './services/fractalService';
import type { ComplexNumber } from './types';

const App: React.FC = () => {
  const [text, setText] = useState<string>('Hello Fractal World!');
  const [encodedComplex, setEncodedComplex] = useState<ComplexNumber | null>(null);
  const [decodedText, setDecodedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleEncode = useCallback(() => {
    setIsLoading(true);
    setDecodedText(''); // Clear previous decoded text for the decoder component
    
    setTimeout(() => {
        const complexNumber = encodeText(text);
        setEncodedComplex(complexNumber);
        setDecodedText(text); // Store the original text for decoding
        setIsLoading(false);
    }, 100); // Short delay to allow UI to update to loading state

  }, [text]);

  const handleExport = useCallback(() => {
    if (!canvasRef.current || !text) {
      alert('Cannot export. No fractal has been generated yet.');
      return;
    }
    try {
      const dataUrl = embedTextInCanvas(canvasRef.current, text);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'fractal-export.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [text]);

  const handleImport = useCallback(async (file: File) => {
    setIsLoading(true);
    setDecodedText('');
    try {
      const extractedText = await extractTextFromImage(file);
      setText(extractedText); // Update the textarea
      
      // Manually trigger the encoding logic for the imported text
      setTimeout(() => {
        const complexNumber = encodeText(extractedText);
        setEncodedComplex(complexNumber);
        setDecodedText(extractedText);
        setIsLoading(false);
      }, 100);
      
    } catch (error) {
      console.error('Import failed:', error);
      alert(`Import failed: Could not decode text from the image. Please ensure it's a valid fractal export PNG.`);
      setIsLoading(false);
    }
  }, []);

  // Generate initial fractal on mount
  useEffect(() => {
    handleEncode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-7xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400 tracking-tight">
            Fractal Text Encoder
          </h1>
          <p className="mt-2 text-lg text-gray-400">
            Visualize your text as a unique Julia Set fractal.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-8">
            <FractalEncoder text={text} setText={setText} onEncode={handleEncode} isLoading={isLoading} />
            <FractalDecoder originalText={decodedText} />
            <IOControls onExport={handleExport} onImport={handleImport} isExportDisabled={isLoading} />
          </div>
          
          <div className="w-full aspect-square">
            <FractalVisualizer ref={canvasRef} complexNumber={encodedComplex} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;