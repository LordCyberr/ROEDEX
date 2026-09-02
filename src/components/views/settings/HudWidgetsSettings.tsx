import React, { useState } from 'react';
import { Sword, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { WeaponSettings } from './WeaponSettings';
import { ArmorSettings } from './ArmorSettings';


export const HudWidgetsSettings: React.FC = () => {
  const [activeSubSection, setActiveSubSection] = useState<string | null>(null);


  const subCards = [
    { id: 'weapon', title: 'WEAPON OVERLAY', desc: 'Durability tracking, style, alerts & positioning', icon: <Sword size={14} className="text-purple-400" /> },
    { id: 'armor', title: 'ARMOR OVERLAY', desc: 'Slot durability, warnings, style & scale', icon: <Shield size={14} className="text-emerald-400" /> }
  ];

  // If a sub-card is active, show detail page with a Back button
  if (activeSubSection) {
    const currentCard = subCards.find(c => c.id === activeSubSection);
    return (
      <div className="flex flex-col gap-3.5 pb-4 select-none animate-in fade-in slide-in-from-right-2 duration-150">
        {/* Back Header */}
        <button
          onClick={() => setActiveSubSection(null)}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-wider text-cyan-300 transition-all cursor-pointer w-max"
        >
          <ChevronLeft size={14} />
          <span>Back to HUD Widgets</span>
        </button>

        <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-1">
          {currentCard?.icon}
          <h4 className="text-[11px] font-black uppercase tracking-wider text-white">
            {currentCard?.title}
          </h4>
        </div>

        {/* ── Sub-Page: Weapon Settings ── */}
        {activeSubSection === 'weapon' && <WeaponSettings />}

        {/* ── Sub-Page: Armor Settings ── */}
        {activeSubSection === 'armor' && <ArmorSettings />}




      </div>
    );
  }

  // Sub-Menu Cards List View (Matches main Settings menu list style!)
  return (
    <div className="flex flex-col gap-2 pb-4 select-none">
      {subCards.map(card => (
        <button
          key={card.id}
          onClick={() => setActiveSubSection(card.id)}
          className="flex items-center justify-between p-3 rounded-2xl bg-black/40 hover:bg-white/5 border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/5 group-hover:bg-cyan-500/10 border border-white/10 group-hover:border-cyan-500/30 transition-all">
              {card.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                {card.title}
              </span>
              <span className="text-[8.5px] text-white/40 font-medium">
                {card.desc}
              </span>
            </div>
          </div>
          <ChevronRight size={14} className="text-white/30 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
        </button>
      ))}
    </div>
  );
};

