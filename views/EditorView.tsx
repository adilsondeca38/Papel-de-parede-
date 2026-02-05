
import React, { useState, useRef } from 'react';
import { editWallpaper } from '../services/geminiService';
import Loader from '../components/Loader';
import { ArrowUpTrayIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/solid';

const EditorView: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!image || !prompt) return;
    setLoading(true);
    try {
      const result = await editWallpaper(image, prompt);
      setEditedImage(result);
    } catch (error) {
      console.error(error);
      alert("Editing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setEditedImage(null);
    setPrompt('');
  };

  return (
    <div className="flex flex-col space-y-6 h-full">
      <h2 className="text-2xl font-bold">AI Editor</h2>
      
      {!image ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-3xl p-10 cursor-pointer hover:border-blue-500 transition-colors bg-gray-900/50"
        >
          <ArrowUpTrayIcon className="w-12 h-12 text-gray-500 mb-4" />
          <p className="text-gray-400 font-medium">Upload a wallpaper to edit</p>
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
          <div className="relative aspect-[9/16] rounded-3xl overflow-hidden bg-gray-900">
            <img 
              src={editedImage || image} 
              alt="Preview" 
              className="w-full h-full object-cover" 
            />
            <button 
              onClick={reset}
              className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur rounded-full text-white"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="glass rounded-2xl p-4 space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">What should we change?</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Add a retro filter, remove the clouds, or make it sunset style..."
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            />
            <button
              onClick={handleEdit}
              disabled={!prompt || loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>Magic Edit</span>
            </button>
          </div>
        </div>
      )}

      {loading && <Loader message="Reimagining your wallpaper..." />}
    </div>
  );
};

export default EditorView;
