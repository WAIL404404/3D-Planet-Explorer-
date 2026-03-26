
import React, { useState, useCallback } from 'react';
import Globe from './components/Globe';
import InfoPanel from './components/InfoPanel';
import { getCountryInfo } from './services/geminiService';
import type { Country } from './types';

const App: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countryInfo, setCountryInfo] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCountryClick = useCallback(async (country: Country | null) => {
    if (country && country.properties.name === selectedCountry?.properties.name) {
      // Clicking the same country again, do nothing or reset
      return;
    }
    
    setSelectedCountry(country);
    setCountryInfo('');
    setError(null);

    if (country) {
      setIsLoading(true);
      try {
        const info = await getCountryInfo(country.properties.name);
        setCountryInfo(info);
      } catch (err) {
        console.error("Failed to get country info:", err);
        setError('Could not retrieve information for this country.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [selectedCountry]);

  const handleReset = () => {
    setSelectedCountry(null);
    setCountryInfo('');
    setError(null);
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden font-sans text-white">
      <div className="absolute inset-0 flex items-center justify-center">
        <Globe onCountryClick={handleCountryClick} selectedCountry={selectedCountry} />
      </div>
      <header className="absolute top-0 left-0 p-4 md:p-8 w-full text-center md:text-left">
        <h1 className="text-3xl md:text-5xl font-bold text-shadow-lg" style={{textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>
          3D Planet Explorer
        </h1>
        <p className="text-sm md:text-base text-gray-300" style={{textShadow: '0 1px 5px rgba(0,0,0,0.5)'}}>
          Rotate the globe and click on a country to learn more.
        </p>
      </header>
      
      <InfoPanel
        country={selectedCountry}
        info={countryInfo}
        isLoading={isLoading}
        error={error}
        onClose={handleReset}
      />

       {selectedCountry && (
         <button 
          onClick={handleReset}
          className="absolute bottom-4 right-4 bg-blue-500/50 backdrop-blur-sm text-white font-bold py-2 px-4 rounded-full hover:bg-blue-500/80 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
         >
           Reset View
         </button>
       )}
    </div>
  );
};

export default App;
