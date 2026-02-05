
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import ExploreView from './views/ExploreView';
import EditorView from './views/EditorView';
import AnimateView from './views/AnimateView';
import VoiceView from './views/VoiceView';
import { 
  HomeIcon, 
  PencilSquareIcon, 
  VideoCameraIcon, 
  MicrophoneIcon 
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-black text-white pb-20 overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-50 glass px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            WallAI
          </h1>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500" />
        </header>

        {/* Main Content */}
        <main className="flex-grow px-4 py-6">
          <Routes>
            <Route path="/" element={<ExploreView />} />
            <Route path="/edit" element={<EditorView />} />
            <Route path="/animate" element={<AnimateView />} />
            <Route path="/voice" element={<VoiceView />} />
          </Routes>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 glass px-6 py-3 flex justify-around items-center z-50">
          <NavItem to="/" icon={<HomeIcon className="w-6 h-6" />} label="Explore" />
          <NavItem to="/edit" icon={<PencilSquareIcon className="w-6 h-6" />} label="Edit" />
          <NavItem to="/animate" icon={<VideoCameraIcon className="w-6 h-6" />} label="Animate" />
          <NavItem to="/voice" icon={<MicrophoneIcon className="w-6 h-6" />} label="Voice" />
        </nav>
      </div>
    </HashRouter>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center space-y-1 transition-colors ${
        isActive ? 'text-blue-400' : 'text-gray-400'
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
};

export default App;
