import React, { useState } from 'react';
import { useTrackerStore } from '../../../store/trackerStore';
import { useTranslation } from '../../../hooks/useTranslation';
import { Heart, Copy, CheckCircle2 } from 'lucide-react';

export const AboutSettings: React.FC = () => {
  const store = useTrackerStore();
  const { t } = useTranslation();
  const [showCrypto, setShowCrypto] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const wallets = [
    { name: 'Abstract Chain', address: '0xeb6C0506F624239dAa704c375d0494B14ea81322' },
    { name: 'Global Wallet (EVM)', address: '0x364aC821eEf0D90678F0B6df44b700d3Df14D89a' },
    { name: 'Solana', address: 'GzRU5v4Tyqx7iGrc7Saed943gMnbMuEDwrpC9vZWyreq' },
  ];

  const handleCopy = (key: string, address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex flex-col gap-4 mt-2">
      {/* Hero / About Banner */}
      <div className="relative p-6 rounded-2xl border border-[var(--border-accent)] overflow-hidden group">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-panel)] z-0" />
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--accent-primary)] via-transparent to-transparent group-hover:opacity-20 transition-opacity duration-700 z-0" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-[var(--accent-primary)]/10 rounded-lg border border-[var(--accent-primary)]/30">
              <Heart size={18} className="text-[var(--accent-primary)] animate-pulse" />
            </div>
            <div>
              <h4 className="text-[14px] font-black text-[var(--text-primary)] tracking-wide uppercase">
                {t('settings.aboutMe')}
              </h4>
              <p className="text-[10px] text-[var(--accent-primary)] font-mono tracking-widest uppercase opacity-80">
                v0.0.1 • Open Source
              </p>
            </div>
          </div>
          
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mb-4 font-medium">
            ROEDEX is a high-performance tracking suite built exclusively for the community. Designed from the ground up to be seamless, beautiful, and completely free. Our mission is to provide you with the most advanced set of tools to optimize your runs, track rare drops, and conquer your adventures.
          </p>

          <button
            onClick={() => store.setIsChangelogOpen(true)}
            className="group/btn flex items-center justify-between w-full p-3 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="text-[var(--accent-primary)] group-hover/btn:scale-110 transition-transform">
                ✨
              </div>
              <span className="text-[11px] font-bold text-[var(--text-primary)] tracking-widest uppercase">
                View Project Changelogs
              </span>
            </div>
            <div className="text-[9px] text-[var(--text-muted)] group-hover/btn:text-[var(--accent-primary)] transition-colors">
              Read More ➔
            </div>
          </button>
        </div>
      </div>

      {/* Support / Donations Section */}
      <div className="p-1">
        <button 
          onClick={() => setShowCrypto(!showCrypto)}
          className={`flex items-center justify-center w-full gap-2 py-3 px-4 rounded-xl border border-[var(--border-accent)] text-[11px] font-black uppercase tracking-widest transition-all duration-500 shadow-lg ${
            showCrypto 
              ? "bg-[var(--accent-primary)] text-black shadow-[0_0_20px_var(--accent-primary)]"
              : "bg-[var(--bg-panel)] text-[var(--accent-primary)] hover:bg-[var(--bg-hover)] hover:shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          }`}
        >
          <Heart size={14} className={showCrypto ? "text-black" : "text-[var(--accent-primary)]"} /> 
          Support Development
        </button>

        {showCrypto && (
          <div className="mt-3 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-3 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-primary)] opacity-50" />
              <p className="text-[10px] text-[var(--text-primary)] leading-relaxed pl-2 font-medium">
                ROEDEX is an open-source project maintained by the community. If you would like to support ongoing development and server costs, you can do so via the addresses below. Contributions are strictly optional but greatly appreciated.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {wallets.map(w => (
                <div key={w.name} className="flex flex-col gap-1.5 bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-subtle)] group/wallet hover:border-[var(--accent-primary)] hover:shadow-md transition-all">
                  <span className="text-[10px] font-bold text-[var(--text-primary)] tracking-wider uppercase opacity-90">
                    {w.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-[11px] text-[var(--text-secondary)] font-mono truncate select-all bg-black/40 p-2 rounded-md border border-white/5">
                      {w.address}
                    </code>
                    <button 
                      onClick={() => handleCopy(w.name, w.address)}
                      className="p-2 rounded-md bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--accent-primary)] transition-all shadow-sm"
                      title="Copy Address"
                    >
                      {copiedKey === w.name ? <CheckCircle2 size={14} className="text-white" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-2">
              <span className="text-[9px] text-[var(--text-muted)] italic">
                (Note: Please verify the network before sending any crypto)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
