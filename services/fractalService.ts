import type { ComplexNumber } from '../types';

/**
 * Maps a value from one range to another.
 * @param value The input value to map.
 * @param inMin The lower bound of the input range.
 * @param inMax The upper bound of the input range.
 * @param outMin The lower bound of the output range.
 * @param outMax The upper bound of the output range.
 * @returns The mapped value.
 */
const mapRange = (value: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
  // Handle division by zero if inMin equals inMax
  if (inMin === inMax) {
    return (outMin + outMax) / 2;
  }
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

/**
 * Encodes a string into a complex number for Julia set generation.
 * The string is split in half, and the sum of character codes for each half
 * is mapped to the real and imaginary parts of the complex number.
 * @param text The input string to encode.
 * @returns A ComplexNumber object with `cRe` (real) and `cIm` (imaginary) parts.
 */
export const encodeText = (text: string): ComplexNumber => {
  if (!text) {
    // A default visually interesting Julia set
    return { cRe: -0.7, cIm: 0.27015 };
  }

  const mid = Math.ceil(text.length / 2);
  const firstHalf = text.substring(0, mid);
  const secondHalf = text.substring(mid);

  let sum1 = 0;
  for (let i = 0; i < firstHalf.length; i++) {
    sum1 += firstHalf.charCodeAt(i);
  }

  let sum2 = 0;
  for (let i = 0; i < secondHalf.length; i++) {
    sum2 += secondHalf.charCodeAt(i);
  }
  
  // Define a reasonable max sum based on average character codes and string length
  // to create a stable mapping range. Max ASCII is ~255, let's assume max half-length of 100.
  const maxPossibleSum = 255 * 100;

  // Map sums to a range known for producing interesting Julia sets [-2, 2]
  const cRe = mapRange(sum1, 0, maxPossibleSum, -1.5, 1.5);
  const cIm = mapRange(sum2, 0, maxPossibleSum, -1.5, 1.5);

  return { cRe, cIm };
};

/**
 * Embeds text into the alpha channel of the last row of a canvas's pixel data.
 * @param canvas The source canvas element.
 * @param text The text to embed.
 * @returns A data URL of the new image with the embedded text.
 * @throws An error if the text is too long to be embedded in the canvas width.
 */
export const embedTextInCanvas = (canvas: HTMLCanvasElement, text: string): string => {
  const width = canvas.width;
  const height = canvas.height;

  if (text.length + 1 > width) { // +1 for null terminator
    throw new Error('Text is too long to be embedded in the image.');
  }

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Could not get canvas context.');
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Clear the last row's alpha channel to avoid artifacts from previous embeds
  for (let x = 0; x < width; x++) {
      const pixelIndex = ((height - 1) * width + x) * 4;
      data[pixelIndex + 3] = 255; // Reset to opaque
  }

  // Embed the text character codes into the alpha channel of the last row
  for (let i = 0; i < text.length; i++) {
    const pixelIndex = ((height - 1) * width + i) * 4;
    data[pixelIndex + 3] = text.charCodeAt(i);
  }

  // Add a null terminator to signify the end of the string
  const terminatorIndex = ((height - 1) * width + text.length) * 4;
  data[terminatorIndex + 3] = 0;

  // Create a temporary canvas to put the modified image data
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) {
    throw new Error('Could not create temporary canvas context.');
  }
  tempCtx.putImageData(imageData, 0, 0);

  return tempCanvas.toDataURL('image/png');
};

/**
 * Extracts text embedded in the alpha channel of an image file's last row.
 * @param file The image file (PNG).
 * @returns A promise that resolves with the extracted text.
 */
export const extractTextFromImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          return reject(new Error('Could not get canvas context for image processing.'));
        }
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;

        let charCodes: number[] = [];
        for (let x = 0; x < width; x++) {
          const pixelIndex = ((height - 1) * width + x) * 4;
          const charCode = data[pixelIndex + 3];

          if (charCode === 0) { // Null terminator found
            break;
          }
          if (charCode < 255) { // Only consider non-default alpha values
             charCodes.push(charCode);
          }
        }

        const decodedText = String.fromCharCode(...charCodes);
        if(!decodedText) {
          return reject(new Error('No embedded text found.'));
        }
        resolve(decodedText);
      };
      img.onerror = () => reject(new Error('Failed to load image.'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
};