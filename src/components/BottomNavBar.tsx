import React from 'react';
import { Gamepad2, BarChart3, BookOpen, User } from 'lucide-react';
import { sounds } from '../utils/audio';

export type TabType = 'CHALLENGE' | 'RECORDS' | 'WORDBOOK' | 'MYPAGE';

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
      label: '도전',
      subtitle: `Lv.${unlockedLevel} 관문`,
      icon: Gamepad2,
    },
    {
      id: 'RECORDS' as TabType,
      label: '내기록',
      subtitle: '통계·기록',
      icon: BarChart3,
    },
    {
      id: 'WORDBOOK' as TabType,
      label: '낱말사전',
      subtitle: '정치 용어집',
      icon: BookOpen,
    },
    {
      id: 'MYPAGE' as TabType,
      label: '마이페이지',
      subtitle: '인증서·설정',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around py-1.5 px-2">
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
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 relative ${
                isActive
                  ? 'text-[#0288d1] font-black'
                  : 'text-slate-400 hover:text-slate-600 font-bold'
              }`}
            >
              {/* Active Pill Indicator */}
              {isActive && (
                <span className="absolute -top-1.5 w-8 h-1 bg-[#0288d1] rounded-full animate-in fade-in" />
              )}

              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-sky-50 scale-110 shadow-xs' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>

              <span className="text-[11px] leading-tight mt-0.5 tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
