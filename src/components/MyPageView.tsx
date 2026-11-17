import React, { useState, useRef } from 'react';
import {
  Award,
  Lightbulb,
  Sparkles,
  Volume2,
  VolumeX,
  Palette,
  Check,
  Edit2,
  Trophy,
  Video,
  Download,
  Upload,
  Type,
  Shield,
  FileText,
  Info,
  Mail,
} from 'lucide-react';
import { ColorTheme, ThemeId, THEMES } from '../types/theme';
import { CategoryId } from '../types/puzzle';
import { CATEGORIES_META, getCategoryMeta } from '../data/categoryRegistry';
import { sounds } from '../utils/audio';
import { exportUserDataJson, importUserDataJson } from '../utils/storageBackup';
import { PolicyTab } from './LegalPolicyModal';
import { FontSizeSetting } from '../types/progress';
import { isCategoryMasterEligible } from '../services/storageService';

interface MyPageViewProps {
  currentLevel: number;
  maxUnlockedLevel: number;
  hintBalance: number;
  currentTheme: ColorTheme;
  isMuted: boolean;
  fontSize: FontSizeSetting;
  highContrast?: boolean;
  selectedCategory?: CategoryId;
  categoryClears?: Record<number, number>;
  totalClearedBoards?: number;
  unlockedAchievementsCount?: number;
  totalAchievementsCount?: number;
  onSelectCategory?: (category: CategoryId) => void;
  onSelectTheme: (themeId: ThemeId) => void;
  onToggleSound: () => void;
  onChangeFontSize: (size: FontSizeSetting) => void;
  onToggleHighContrast?: () => void;
  onOpenTest: () => void;
  onOpenAdModal: () => void;
  onOpenCertificate: () => void;
  onOpenAchievements?: () => void;
  onOpenInstallModal?: () => void;
  onOpenPolicy?: (tab: PolicyTab) => void;
  onResetProgress: () => void;
  onDataRestored?: () => void;
}

export const MyPageView: React.FC<MyPageViewProps> = ({
  currentLevel: _currentLevel,
  maxUnlockedLevel,
  hintBalance,
  currentTheme,
  isMuted,
  fontSize,
  highContrast = false,
  selectedCategory = 'POLITICS',
  categoryClears = {},
  totalClearedBoards = 0,
  unlockedAchievementsCount = 0,
  totalAchievementsCount = 11,
  onSelectCategory,
  onSelectTheme,
  onToggleSound,
  onChangeFontSize,
  onToggleHighContrast,
  onOpenTest,
  onOpenAdModal,
  onOpenCertificate,
  onOpenAchievements,
  onOpenInstallModal,
  onOpenPolicy,
  onResetProgress,
  onDataRestored,
}) => {
  const [nickname, setNickname] = useState<string>(() => {
    return localStorage.getItem('politics_crossword_nickname') || '대한민국 지식탐구자';
  });
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [editInput, setEditInput] = useState(nickname);

  // Backup/Restore status toast
  const [backupStatus, setBackupStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentCatMeta = getCategoryMeta(selectedCategory);

  // Verify master certificate eligibility
  const masterEligibility = isCategoryMasterEligible(selectedCategory, {
    currentLevel: maxUnlockedLevel,
    clearCountInLevel: 0,
    levelClears: categoryClears,
    maxUnlockedLevel,
    isTested: true,
    totalClearedBoards,
  });

  const getDomainRank = (lvl: number, cat: CategoryId) => {
    const meta = getCategoryMeta(cat);
    if (lvl >= 10 && masterEligibility.eligible) {
      return { title: `최고 ${meta.name} 마스터`, grade: '특급 (국가 최고 권위)', icon: meta.icon, color: 'text-purple-600 bg-purple-50 border-purple-200' };
    }
    if (lvl >= 8) return { title: `수석 ${meta.name} 연구위원`, grade: '고급 (전문 사상가)', icon: '⚖️', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
    if (lvl >= 5) return { title: `${meta.name} 전문 분석관`, grade: '중급 (정책 전문가)', icon: '🌐', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (lvl >= 3) return { title: `${meta.name} 실무 연구원`, grade: '초급 2 (입법·실무)', icon: '📜', color: 'text-sky-700 bg-sky-50 border-sky-200' };
    return { title: `${meta.name} 입문 탐구자`, grade: '초급 1 (시민사회)', icon: '🌱', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  const rank = getDomainRank(maxUnlockedLevel, selectedCategory);

  const handleSaveNickname = () => {
    const trimmed = editInput.trim() || '대한민국 지식탐구자';
    setNickname(trimmed);
    localStorage.setItem('politics_crossword_nickname', trimmed);
    setIsEditingNickname(false);
    sounds.playWordComplete();
  };

  const handleExportBackup = () => {
    sounds.playKey();
    const ok = exportUserDataJson();
    if (ok) {
      setBackupStatus({
        type: 'success',
        text: '내 게임 기록 백업 파일(JSON)이 안전하게 다운로드되었습니다.',
      });
      setTimeout(() => setBackupStatus(null), 4000);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sounds.playKey();
    const result = await importUserDataJson(file);
    if (result.success) {
      setBackupStatus({ type: 'success', text: result.message });
      if (onDataRestored) onDataRestored();
    } else {
      setBackupStatus({ type: 'error', text: result.message });
    }
    setTimeout(() => setBackupStatus(null), 5000);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 pb-28 animate-in fade-in duration-200">
      {/* Backup notification banner */}
      {backupStatus && (
        <div
          className={`p-3.5 mb-4 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 ${
            backupStatus.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <span>{backupStatus.type === 'success' ? '✅' : '⚠️'}</span>
          <span>{backupStatus.text}</span>
        </div>
      )}

      {/* 1. User Profile Header Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-5 shadow-sm mb-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0288d1] to-sky-400 flex items-center justify-center text-white shadow-md text-3xl shrink-0">
              {currentCatMeta.icon}
            </div>

            <div className="text-center sm:text-left">
              {isEditingNickname ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <input
                    type="text"
                    value={editInput}
                    onChange={(e) => setEditInput(e.target.value)}
                    maxLength={15}
                    className="border-b-2 border-[#0288d1] px-2 py-0.5 text-base font-black text-slate-800 focus:outline-hidden"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveNickname}
                    className="p-1 bg-[#0288d1] text-white rounded-lg hover:bg-[#0277bd]"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => {
                    setEditInput(nickname);
                    setIsEditingNickname(true);
                  }}
                  className="flex items-center justify-center sm:justify-start gap-1.5 cursor-pointer group"
                >
                  <h2 className="text-lg font-black text-slate-800 tracking-tight group-hover:text-[#0288d1] transition">
                    {nickname}
                  </h2>
                  <Edit2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0288d1]" />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-1.5">
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${rank.color}`}>
                  {rank.title}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">
                  {rank.grade}
                </span>
              </div>
            </div>
          </div>

          {/* Achievements pill */}
          {onOpenAchievements && (
            <button
              onClick={() => {
                sounds.playKey();
                onOpenAchievements();
              }}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-2xl text-xs font-black transition flex items-center gap-1.5 shrink-0"
            >
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>업적 ({unlockedAchievementsCount}/{totalAchievementsCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Knowledge Category Switcher */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-5 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#0288d1]" />
            <span>선택된 지식 분야</span>
          </h3>
          <span className="text-xs text-[#0288d1] font-bold">
            현재: {currentCatMeta.name}({currentCatMeta.fullName})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CATEGORIES_META.map((meta) => {
            const isSelected = selectedCategory === meta.id;
            return (
              <button
                key={meta.id}
                onClick={() => {
                  sounds.playKey();
                  if (onSelectCategory) onSelectCategory(meta.id);
                }}
                className={`p-2.5 rounded-2xl border text-xs font-bold transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-sky-50 text-[#0288d1] border-sky-300 shadow-2xs ring-1 ring-sky-300'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-[#0288d1]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Certificate & Hints Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Certificate Card */}
        <div className="p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                {currentCatMeta.name} 마스터 인증서
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  masterEligibility.eligible
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {masterEligibility.eligible
                  ? '발급 완료'
                  : `${masterEligibility.clearedBoards} / 30 관문 완료`}
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              {currentCatMeta.name} 10개 레벨 30개 모든 관문을 통과하면 공식 대한민국 마스터 인증서가 수여됩니다.
            </p>
          </div>

          <button
            onClick={() => {
              sounds.playKey();
              onOpenCertificate();
            }}
            className={`w-full py-2.5 font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 ${
              masterEligibility.eligible
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-slate-800 hover:bg-slate-900 text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{masterEligibility.eligible ? '인증서 열람 / 인쇄' : '인증서 도전 현황 보기'}</span>
          </button>
        </div>

        {/* Hint Refill Card */}
        <div className="p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                초성 힌트 보유량
              </span>
              <span className="text-base font-black text-amber-600 font-mono">
                {hintBalance}개 남음
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              매일 첫 접속 시 출석 보너스로 힌트가 자동 충전되며, 광고 시청을 통해 추가로 무료 충전할 수 있습니다.
            </p>
          </div>

          <button
            onClick={() => {
              sounds.playKey();
              onOpenAdModal();
            }}
            className="w-full py-2.5 bg-[#0288d1] hover:bg-[#0277bd] text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
          >
            <Video className="w-4 h-4" />
            <span>광고 보고 힌트 +2개 충전</span>
          </button>
        </div>
      </div>

      {/* 4. Accessibility & Senior Friendly Settings */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-5 shadow-sm mb-4 space-y-4">
        <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
          <Type className="w-5 h-5 text-[#0288d1]" />
          <span>시각 편의 및 접근성 설정 (시니어 특화)</span>
        </h3>

        {/* 3-Step Font Size Selector */}
        <div className="py-2 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-sm font-bold text-slate-800 block">글씨 크기 조절</span>
            <span className="text-[11px] text-slate-500">
              퍼즐 판과 힌트 글자의 가독성을 키울 수 있습니다.
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(
              [
                { id: 'normal', label: '보통 (100%)' },
                { id: 'large', label: '크게 (115%)' },
                { id: 'huge', label: '아주 크게 (130%)' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  sounds.playKey();
                  onChangeFontSize(opt.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  fontSize === opt.id
                    ? 'bg-white text-[#0288d1] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* High Contrast Mode */}
        {onToggleHighContrast && (
          <div className="py-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-slate-800 block">고대비 색상 모드</span>
              <span className="text-[11px] text-slate-500">
                격자 테두리와 글자의 명도 대비를 극대화합니다.
              </span>
            </div>
            <button
              onClick={() => {
                sounds.playKey();
                onToggleHighContrast();
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition ${
                highContrast
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              {highContrast ? '고대비 ON' : '고대비 OFF'}
            </button>
          </div>
        )}

        {/* Sound Effects Toggle */}
        <div className="py-2 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-slate-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-[#0288d1]" />
            )}
            <div>
              <span className="text-sm font-bold text-slate-800 block">효과음 사운드</span>
              <span className="text-[11px] text-slate-500">
                {isMuted ? '음소거 상태입니다.' : '정답 및 조작 효과음이 켜져 있습니다.'}
              </span>
            </div>
          </div>
          <button
            onClick={onToggleSound}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition ${
              isMuted
                ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                : 'bg-[#0288d1] text-white shadow-xs'
            }`}
          >
            {isMuted ? '소리 켜기' : '소리 끄기'}
          </button>
        </div>

        {/* Theme Palette Selection */}
        <div className="py-2">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-bold text-slate-800">퍼즐 컬러 테마</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(THEMES) as ThemeId[]).map((tId) => {
              const theme = THEMES[tId];
              const isSelected = currentTheme.id === tId;

              return (
                <button
                  key={tId}
                  onClick={() => {
                    sounds.playKey();
                    onSelectTheme(tId);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{theme.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-300" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Data Backup & Restore Feature */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-5 shadow-sm mb-4">
        <h3 className="text-base font-black text-slate-800 mb-2 flex items-center gap-2">
          <Download className="w-4 h-4 text-[#0288d1]" />
          <span>데이터 안전 백업 및 복원</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          기기를 변경하거나 브라우저 캐시 삭제 시에도 안심하세요! 게임 진행도와 인증서를 파일로 저장하고 언제든 복원할 수 있습니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={handleExportBackup}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black shadow-xs transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-sky-300" />
            <span>내 기록 백업 파일 저장 (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-black shadow-2xs transition flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4 text-[#0288d1]" />
            <span>백업 파일 불러오기 및 복원</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* 6. Diagnostic Placement Test & PWA App Install */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="bg-white/95 rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>실력 진단 주관식 테스트</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">시작 레벨 재배정</p>
          </div>
          <button
            onClick={() => {
              sounds.playKey();
              onOpenTest();
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition"
          >
            응시
          </button>
        </div>

        {onOpenInstallModal && (
          <div className="bg-white/95 rounded-2xl border border-sky-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1">
                <Download className="w-3.5 h-3.5 text-[#0288d1]" />
                <span>홈 화면에 앱 설치 (PWA)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">오프라인 실행 지원</p>
            </div>
            <button
              onClick={() => {
                sounds.playKey();
                onOpenInstallModal();
              }}
              className="px-3 py-1.5 bg-[#0288d1] hover:bg-[#0277bd] text-white font-bold text-xs rounded-xl shadow-2xs transition"
            >
              설치
            </button>
          </div>
        )}
      </div>

      {/* 7. Legal Policies & Service Information (Google AdSense Compliance) */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-[#0288d1]" />
          <h3 className="text-sm font-black text-slate-800">서비스 정책 및 이용 안내</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onOpenPolicy?.('PRIVACY')}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition flex items-center justify-between cursor-pointer"
          >
            <div>
              <div className="text-xs font-black text-slate-800">개인정보처리방침</div>
              <div className="text-[10px] text-slate-400">Google AdSense 및 쿠키 정책 준수</div>
            </div>
            <Shield className="w-4 h-4 text-blue-500 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => onOpenPolicy?.('TERMS')}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition flex items-center justify-between cursor-pointer"
          >
            <div>
              <div className="text-xs font-black text-slate-800">이용약관</div>
              <div className="text-[10px] text-slate-400">서비스 이용 규정 및 권리 의무</div>
            </div>
            <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => onOpenPolicy?.('ABOUT')}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition flex items-center justify-between cursor-pointer"
          >
            <div>
              <div className="text-xs font-black text-slate-800">서비스 소개</div>
              <div className="text-[10px] text-slate-400">8대 지식 영역 및 교육적 지향점</div>
            </div>
            <Info className="w-4 h-4 text-purple-500 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => onOpenPolicy?.('CONTACT')}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition flex items-center justify-between cursor-pointer"
          >
            <div>
              <div className="text-xs font-black text-slate-800">문의하기</div>
              <div className="text-[10px] text-slate-400">honglabai@gmail.com 및 제휴 문의</div>
            </div>
            <Mail className="w-4 h-4 text-amber-500 shrink-0" />
          </button>
        </div>
      </div>

      {/* 8. Reset Game Data */}
      <div className="bg-red-50/50 rounded-2xl border border-red-200 p-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-black text-red-800 block">데이터 초기화</span>
          <span className="text-[11px] text-red-600">진행도 및 풀이 기록을 처음 상태로 되돌립니다.</span>
        </div>
        <button
          onClick={onResetProgress}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-2xs transition"
        >
          초기화
        </button>
      </div>
    </div>
  );
};
