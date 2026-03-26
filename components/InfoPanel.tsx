
import React from 'react';
import type { Country } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface InfoPanelProps {
  country: Country | null;
  info: string;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ country, info, isLoading, error, onClose }) => {
  if (!country) {
    return null;
  }

  return (
    <div className={`absolute top-0 right-0 h-full w-full max-w-sm p-4 transform transition-transform duration-500 ease-in-out ${country ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="relative h-full bg-slate-800/50 backdrop-blur-md rounded-lg shadow-2xl p-6 text-gray-200 flex flex-col">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-3xl font-bold text-sky-300 mb-4 pr-6">{country.properties.name}</h2>
        <div className="flex-grow overflow-y-auto pr-2">
          {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
          {error && <p className="text-red-400">{error}</p>}
          {!isLoading && !error && (
            <p className="text-base leading-relaxed whitespace-pre-wrap">{info}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
