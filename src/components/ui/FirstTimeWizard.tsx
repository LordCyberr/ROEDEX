import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../../store/settingsStore';

import { useShallow } from 'zustand/react/shallow';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Globe, Check, ChevronRight, Activity, Sparkles, Wand2 } from 'lucide-react';
import { CompanionId } from '../../data/companions';
import { useTranslation } from '../../hooks/useTranslation';

export const FirstTimeWizard: React.FC = () => {
  const { 
    setFirstTimeWizardCompleted, 
    setLanguage, 
    language,
    setActiveCompanion,
    activeCompanion,
    setTutorialStep
  } = useSettingsStore(useShallow(state => ({
    setFirstTimeWizardCompleted: state.setFirstTimeWizardCompleted, 
    setLanguage: state.setLanguage, 
    language: state.language,
    setActiveCompanion: state.setActiveCompanion,
    activeCompanion: state.activeCompanion,
    setTutorialStep: state.setTutorialStep
  })));

  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [hoverProgress, setHoverProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [testPassed, setTestPassed] = useState(false);

  // Hover test logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isHovering && !testPassed) {
      interval = setInterval(() => {
        setHoverProgress(prev => {
          if (prev >= 100) {
            setTestPassed(true);
            setIsHovering(false);
            return 100;
          }
          return prev + 2; // 50 ticks = 100% (at 100ms per tick = 5 seconds)
        });
      }, 100);
    } else if (!isHovering && !testPassed) {
      setHoverProgress(0); // Reset if they leave early
    }
    return () => clearInterval(interval);
  }, [isHovering, testPassed]);

  const handleFinish = () => {
    setFirstTimeWizardCompleted(true);
    setTutorialStep(1); // Kick off the Bob tutorial after this
  };

  const companions: { id: CompanionId; name: string; desc: string }[] = [
    { id: 'bob', name: 'Bob', desc: 'The default, friendly, and slightly unhinged assistant.' },
    { id: 'kaya', name: 'Kaya', desc: 'Strict, precise, and obsessed with efficiency.' },
    { id: 'lia', name: 'Lia', desc: 'Curious, cheerful, and loves exploration.' },
    { id: 'crash', name: 'Crash', desc: 'Loud, chaotic, and completely unpredictable.' }
  ];

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0F141E]/90 backdrop-blur-xl flex flex-col items-center justify-center font-[var(--font-body)] text-[var(--text-primary)]">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/10 to-transparent pointer-events-none" />
      
      <div className="max-w-xl w-full bg-[var(--bg-panel)]/80 border border-[var(--border-accent)] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-subtle)] bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] rounded-lg">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-mono tracking-tight text-white">{t('wizard.init')}</h2>
              <p className="text-sm text-[var(--text-muted)]">{t('wizard.step')} {step} {t('wizard.of')} 3</p>
            </div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`w-2 h-2 rounded-full ${step >= s ? 'bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 min-h-[300px] relative">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Globe size={18} className="text-[var(--accent-primary)]" />
                    System Language & Latency Test
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    Select your preferred language. Before proceeding, please hover the test block below for 5 seconds to calibrate the overlay response time.
                  </p>
                </div>

                <div className="flex gap-4">
                  {(['en', 'es', 'ru', 'ko'] as const).map(l => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      className={`px-4 py-2 rounded-lg font-bold uppercase transition-all ${language === l ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/50' : 'bg-white/5 text-[var(--text-muted)] hover:bg-white/10 border border-transparent'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>

                <div 
                  className={`mt-4 p-6 rounded-xl border-2 border-dashed transition-all duration-300 relative overflow-hidden ${testPassed ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-[var(--border-subtle)] bg-white/5 hover:border-[var(--accent-primary)]/50'}`}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <div 
                    className="absolute inset-y-0 left-0 bg-[var(--accent-primary)]/20 transition-all duration-100 ease-linear"
                    style={{ width: `${hoverProgress}%` }}
                  />
                  <div className="relative z-10 flex flex-col items-center justify-center gap-2 text-center pointer-events-none">
                    {testPassed ? (
                      <>
                        <Check size={24} className="text-emerald-400" />
                        <span className="font-bold text-emerald-400">{t('wizard.calibrationComplete')}</span>
                      </>
                    ) : (
                      <>
                        <Activity size={24} className={isHovering ? 'text-[var(--accent-primary)] animate-pulse' : 'text-[var(--text-muted)]'} />
                        <span className={`font-bold ${isHovering ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`}>
                          {isHovering ? 'Calibrating... Hold steady.' : 'Hover here for 5 seconds to test response time'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button 
                    disabled={!testPassed}
                    onClick={() => setStep(2)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${testPassed ? 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary)]/80 shadow-[0_0_15px_var(--accent-primary)]' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
                  >
                    Continue <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Bot size={18} className="text-[var(--accent-primary)]" />
                    Select AI Companion
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    Choose the AI persona that will assist you. You can change this later in settings.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {companions.map(comp => (
                    <button
                      key={comp.id}
                      onClick={() => setActiveCompanion(comp.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${activeCompanion === comp.id ? 'bg-[var(--accent-primary)]/20 border-[var(--accent-primary)]/50 shadow-[0_0_15px_var(--accent-primary)]/20' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                    >
                      <div className="font-bold text-white mb-1 flex items-center justify-between">
                        {comp.name}
                        {activeCompanion === comp.id && <Check size={14} className="text-[var(--accent-primary)]" />}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] leading-relaxed">
                        {comp.desc}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end mt-4">
                  <button 
                    onClick={() => setStep(3)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-primary)]/80 shadow-[0_0_15px_var(--accent-primary)] transition-all"
                  >
                    Continue <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Wand2 size={18} className="text-[var(--accent-primary)]" />
                    Ready to Explore
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    ROEDEX is now fully configured for your environment. 
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
                  <h4 className="font-bold text-white text-sm">{t('wizard.quickGuide')}</h4>
                  <ul className="text-sm text-[var(--text-muted)] space-y-2 list-disc pl-4">
                    <li>{t('wizard.useThe')} <strong>{t('wizard.guide1_mid')}</strong> {t('wizard.toNavigate')}</li>
                    <li>{t('wizard.toggleThe')} <strong>{t('wizard.guide2_mid')}</strong> {t('wizard.toEnable')}</li>
                    <li>{t('wizard.your')} <strong>{t('wizard.guide3_mid')}</strong> {t('wizard.willPopUp')}</li>
                    <li>{t('wizard.guide4')}</li>
                  </ul>
                </div>

                <div className="flex justify-end mt-4">
                  <button 
                    onClick={handleFinish}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                  >
                    Finish Setup <Check size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
