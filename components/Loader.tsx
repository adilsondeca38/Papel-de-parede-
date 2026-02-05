
import React from 'react';

interface LoaderProps {
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message = "Thinking..." }) => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center glass bg-black/60">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin" />
        <div className="absolute inset-4 rounded-full border-b-2 border-purple-500 animate-spin-slow" />
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-white animate-pulse" />
        </div>
      </div>
      <p className="text-lg font-medium text-white/80 animate-pulse text-center px-6">
        {message}
      </p>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;
