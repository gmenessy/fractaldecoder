import React, { useRef } from 'react';

interface IOControlsProps {
    onExport: () => void;
    onImport: (file: File) => void;
    isExportDisabled: boolean;
}

const IOControls: React.FC<IOControlsProps> = ({ onExport, onImport, isExportDisabled }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImport(file);
        }
        // Reset the input value to allow importing the same file again
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
             <h2 className="text-2xl font-bold mb-4 text-cyan-300">3. Import / Export</h2>
            <div className="flex flex-col sm:flex-row gap-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png"
                    className="hidden"
                    aria-hidden="true"
                />
                <button
                    onClick={handleImportClick}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
                >
                    Import Image
                </button>
                <button
                    onClick={onExport}
                    disabled={isExportDisabled}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
                >
                    {isExportDisabled ? 'Generating...' : 'Export Image'}
                </button>
            </div>
        </div>
    );
};

export default IOControls;
