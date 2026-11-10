import React from 'react';
import { Gamepad2, BarChart3, BookOpen, User, GraduationCap } from 'lucide-react';
import { sounds } from '../utils/audio';

export type TabType = 'CHALLENGE' | 'KNOWLEDGE' | 'WORDBOOK' | 'RECORDS' | 'MYPAGE';

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
      id: 'CHALLENGE' as TabType,
      label: '퍼즐도전',
      subtitle: `Lv.${unlockedLevel} 관문`,
      icon: Gamepad2,
    },
    {
      id: 'KNOWLEDGE' as TabType,
      label: '지식백과',
      subtitle: '8대 영역 칼럼',
      icon: GraduationCap,
    },
    {
      id: 'WORDBOOK' as TabType,
      label: '낱말사전',
      subtitle: '2,480 어휘집',
      icon: BookOpen,
    },
    {
      id: 'RECORDS' as TabType,
      label: '내기록',
      subtitle: '통계·기록',
      icon: BarChart3,
    },
    {
      id: 'MYPAGE' as TabType,
      label: '설정',
      subtitle: '인증서·설정',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around py-1 px-1.5 sm:px-2">
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
              className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 sm:px-1 rounded-xl transition-all duration-150 relative ${
                isActive
                  ? 'text-[#0288d1] font-black'
                  : 'text-slate-400 hover:text-slate-600 font-bold'
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
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>

              <span className="text-[10px] sm:text-[11px] leading-tight mt-0.5 tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
