
import React, { useState } from 'react';
import { Wallpaper } from '../types';

const MOCK_WALLPAPERS: Wallpaper[] = [
  { id: '1', url: 'https://picsum.photos/seed/cyberpunk/1080/1920', title: 'Neon Night', category: 'Cyberpunk' },
  { id: '2', url: 'https://picsum.photos/seed/nature/1080/1920', title: 'Verdent Valley', category: 'Nature' },
  { id: '3', url: 'https://picsum.photos/seed/abstract/1080/1920', title: 'Liquid Flow', category: 'Abstract' },
  { id: '4', url: 'https://picsum.photos/seed/space/1080/1920', title: 'Stellar Drift', category: 'Space' },
  { id: '5', url: 'https://picsum.photos/seed/minimal/1080/1920', title: 'Quiet Sands', category: 'Minimal' },
  { id: '6', url: 'https://picsum.photos/seed/arch/1080/1920', title: 'Urban Geometry', category: 'Architecture' },
];

const ExploreView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Nature', 'Cyberpunk', 'Space', 'Abstract', 'Minimal'];

  const filteredWallpapers = selectedCategory === 'All' 
    ? MOCK_WALLPAPERS 
    : MOCK_WALLPAPERS.filter(w => w.category === selectedCategory);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold mb-4">Discover</h2>
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        {filteredWallpapers.map(wall => (
          <div key={wall.id} className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-gray-900 shadow-lg cursor-pointer">
            <img 
              src={wall.url} 
              alt={wall.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
              <p className="text-sm font-semibold">{wall.title}</p>
              <p className="text-xs text-gray-300">{wall.category}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="glass rounded-2xl p-6 mt-4">
        <h3 className="text-lg font-bold mb-2">Create New?</h3>
        <p className="text-sm text-gray-400 mb-4">Use our AI tools to generate or edit your own custom wallpapers.</p>
        <div className="flex space-x-3">
          <div className="flex-1 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-sm">
            AI Generator
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExploreView;
