import React from 'react';
import { Home, Gamepad2, BarChart3, BookOpen, Settings } from 'lucide-react';
import { sounds } from '../utils/audio';

export type TabType = 'HOME' | 'CHALLENGE' | 'KNOWLEDGE' | 'RECORDS' | 'SETTINGS';

interface BottomNavBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  unlockedLevel: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  unlockedLevel,
}) => {
  const tabs = [
    {
      id: 'HOME' as TabType,
      label: '홈',
      subtitle: '오늘의 퍼즐',
      icon: Home,
    },
    {
      id: 'CHALLENGE' as TabType,
      label: '도전',
      subtitle: `Lv.${unlockedLevel} 관문`,
      icon: Gamepad2,
    },
    {
      id: 'KNOWLEDGE' as TabType,
      label: '지식',
      subtitle: '사전·오답노트',
      icon: BookOpen,
    },
    {
      id: 'RECORDS' as TabType,
      label: '기록',
      subtitle: '통계·인증서',
      icon: BarChart3,
    },
    {
      id: 'SETTINGS' as TabType,
      label: '설정',
      subtitle: '글씨·환경설정',
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around py-1 px-1 sm:px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playKey();
                onTabChange(tab.id);
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 sm:px-1 rounded-xl transition-all duration-150 relative cursor-pointer ${
                isActive
                  ? 'text-[#0288d1] font-black'
                  : 'text-slate-600 hover:text-slate-800 font-bold'
              }`}
            >
              {/* Active Pill Indicator */}
              {isActive && (
                <span className="absolute -top-1 w-6 sm:w-8 h-1 bg-[#0288d1] rounded-full animate-in fade-in" />
              )}

              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-sky-50 scale-105 shadow-2xs' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#0288d1]' : 'text-slate-500'}`} />
              </div>

              <span className="text-[11px] leading-tight mt-0.5 tracking-tight font-black">
                {tab.label}
              </span>
              <span className="text-[9px] text-slate-500 leading-none hidden sm:block mt-0.5 font-bold">
                {tab.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
