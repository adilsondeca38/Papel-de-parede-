
import React, { useState, useRef } from 'react';
import { animateWallpaper } from '../services/geminiService';
import Loader from '../components/Loader';
import { VideoCameraIcon, ArrowPathIcon, CheckIcon } from '@heroicons/react/24/solid';

const AnimateView: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const checkAndOpenKey = async () => {
    // Note: window.aistudio.hasSelectedApiKey and openSelectKey are globals from environment
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }
    return true;
  };

  const handleAnimate = async () => {
    if (!image) return;
    setLoading(true);
    try {
      await checkAndOpenKey();
      const result = await animateWallpaper(image, prompt, (msg) => setStatus(msg));
      setVideoUrl(result);
    } catch (error: any) {
      console.error(error);
      if (error.message.includes("Requested entity was not found")) {
        alert("API Key issue. Please re-select your paid API key.");
        await (window as any).aistudio.openSelectKey();
      } else {
        alert("Animation failed. Veo might be busy.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Veo Animator</h2>
      
      <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4 flex items-start space-x-3">
        <div className="p-2 bg-blue-600 rounded-lg">
          <VideoCameraIcon className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm">Cinematic Motion</h4>
          <p className="text-xs text-blue-200/70">Turn any static wallpaper into a breathtaking 720p vertical video.</p>
        </div>
      </div>

      {!image ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="aspect-[9/16] flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-3xl p-10 cursor-pointer bg-gray-900/50"
        >
          <ArrowPathIcon className="w-12 h-12 text-gray-500 mb-4" />
          <p className="text-gray-400 font-medium text-center">Tap to select image to animate</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative aspect-[9/16] rounded-3xl overflow-hidden bg-gray-900 shadow-2xl">
            {videoUrl ? (
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full h-full object-cover" 
              />
            ) : (
              <img src={image} className="w-full h-full object-cover opacity-50 grayscale" />
            )}
            {!videoUrl && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <button 
                        onClick={handleAnimate}
                        className="px-8 py-3 bg-white text-black font-bold rounded-full shadow-xl hover:scale-105 transition-transform"
                    >
                        Animate Now
                    </button>
                </div>
            )}
          </div>

          <div className="glass rounded-2xl p-4 space-y-3">
            <input 
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Animation prompt (optional)..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none"
            />
            {videoUrl && (
                <button 
                    onClick={() => { setImage(null); setVideoUrl(null); }}
                    className="w-full py-3 bg-gray-800 rounded-xl font-bold flex items-center justify-center space-x-2"
                >
                    <ArrowPathIcon className="w-5 h-5" />
                    <span>Try Another</span>
                </button>
            )}
          </div>
        </div>
      )}

      <p className="text-[10px] text-gray-500 text-center px-6">
        Veo generation requires a paid API key and might take up to 2 minutes. 
        <a href="https://ai.google.dev/gemini-api/docs/billing" className="text-blue-500 underline ml-1" target="_blank">Learn more.</a>
      </p>

      {loading && <Loader message={status} />}
    </div>
  );
};

export default AnimateView;
