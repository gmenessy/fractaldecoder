import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { ComplexNumber } from '../types';

interface FractalVisualizerProps {
  complexNumber: ComplexNumber | null;
  isLoading: boolean;
}

const FractalVisualizer = forwardRef<HTMLCanvasElement, FractalVisualizerProps>(({ complexNumber, isLoading }, ref) => {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);

  // Expose the internal canvas ref to the parent component via the forwarded ref
  useImperativeHandle(ref, () => internalCanvasRef.current!, []);

  useEffect(() => {
    if (!complexNumber || isLoading) return;

    const canvas = internalCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const maxIter = 150;
    
    const { cRe, cIm } = complexNumber;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let zx = 1.5 * (x - width / 2) / (0.5 * width);
        let zy = (y - height / 2) / (0.5 * height);

        let i = maxIter;
        while (zx * zx + zy * zy < 4 && i > 0) {
          let tmp = zx * zx - zy * zy + cRe;
          zy = 2.0 * zx * zy + cIm;
          zx = tmp;
          i--;
        }

        const pixelIndex = (y * width + x) * 4;
        
        if (i > 0) {
            const hue = (i / maxIter) * 360;
            const saturation = 1;
            const lightness = 0.5;
            
            // HSL to RGB conversion
            const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
            const x_ = c * (1 - Math.abs(((hue / 60) % 2) - 1));
            const m = lightness - c / 2;
            let r_ = 0, g_ = 0, b_ = 0;

            if (hue >= 0 && hue < 60) { [r_, g_, b_] = [c, x_, 0]; }
            else if (hue >= 60 && hue < 120) { [r_, g_, b_] = [x_, c, 0]; }
            else if (hue >= 120 && hue < 180) { [r_, g_, b_] = [0, c, x_]; }
            else if (hue >= 180 && hue < 240) { [r_, g_, b_] = [0, x_, c]; }
            else if (hue >= 240 && hue < 300) { [r_, g_, b_] = [x_, 0, c]; }
            else if (hue >= 300 && hue < 360) { [r_, g_, b_] = [c, 0, x_]; }

            data[pixelIndex] = (r_ + m) * 255;
            data[pixelIndex + 1] = (g_ + m) * 255;
            data[pixelIndex + 2] = (b_ + m) * 255;
            data[pixelIndex + 3] = 255;
        } else {
            data[pixelIndex] = 0;
            data[pixelIndex + 1] = 0;
            data[pixelIndex + 2] = 0;
            data[pixelIndex + 3] = 255;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);

  }, [complexNumber, isLoading]);

  return (
    <div className="relative w-full h-full bg-gray-800 rounded-lg shadow-lg flex items-center justify-center overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-10">
           <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
           <p className="mt-4 text-lg">Generating Fractal...</p>
        </div>
      )}
      <canvas ref={internalCanvasRef} width="600" height="600" className="w-full h-full object-contain"></canvas>
    </div>
  );
});

FractalVisualizer.displayName = "FractalVisualizer";

export default FractalVisualizer;