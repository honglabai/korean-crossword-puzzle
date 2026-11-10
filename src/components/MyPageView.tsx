import React, { useState, useRef } from 'react';
import {
  User,
  Award,
  Lightbulb,
  Sparkles,
  Volume2,
  VolumeX,
  Palette,
  RotateCcw,
  Check,
  Edit2,
  Trophy,
  Video,
  Download,
  Upload,
  Type,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { ColorTheme, ThemeId, THEMES } from '../types/theme';
import { CategoryId } from '../types/puzzle';
import { CATEGORIES_META, getCategoryMeta } from '../data/categoryRegistry';
import { sounds } from '../utils/audio';
import { exportUserDataJson, importUserDataJson } from '../utils/storageBackup';
import { PolicyTab } from './LegalPolicyModal';
import { Shield, FileText, Info, Mail } from 'lucide-react';

interface MyPageViewProps {
  currentLevel: number;
  maxUnlockedLevel: number;
  hintBalance: number;
  currentTheme: ColorTheme;
  isMuted: boolean;
  isLargeFont: boolean;
  selectedCategory?: CategoryId;
  onSelectCategory?: (category: CategoryId) => void;
  onSelectTheme: (themeId: ThemeId) => void;
  onToggleSound: () => void;
  onToggleLargeFont: () => void;
  onOpenTest: () => void;
  onOpenAdModal: () => void;
  onOpenCertificate: () => void;
  onOpenInstallModal?: () => void;
  onOpenPolicy?: (tab: PolicyTab) => void;
  onResetProgress: () => void;
  onDataRestored?: () => void;
}

export const MyPageView: React.FC<MyPageViewProps> = ({
  currentLevel,
  maxUnlockedLevel,
  hintBalance,
  currentTheme,
  isMuted,
  isLargeFont,
  selectedCategory = 'POLITICS',
  onSelectCategory,
  onSelectTheme,
  onToggleSound,
  onToggleLargeFont,
  onOpenTest,
  onOpenAdModal,
  onOpenCertificate,
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

  // Domain titles by unlocked level and active category
  const getDomainRank = (lvl: number, cat: CategoryId) => {
    const meta = getCategoryMeta(cat);
    if (lvl >= 10) return { title: `최고 ${meta.name} 마스터`, grade: '특급 (국가 최고 권위)', icon: meta.icon, color: 'text-purple-600 bg-purple-50 border-purple-200' };
    if (lvl >= 8) return { title: `수석 ${meta.name} 연구위원`, grade: '고급 (전문 사상가)', icon: '⚖️', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
    if (lvl >= 5) return { title: `${meta.name} 전문 정책분석관`, grade: '중급 (정책 전문가)', icon: '🌐', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (lvl >= 3) return { title: `${meta.name} 실무 연구원`, grade: '초급 2 (입법·실무)', icon: '📜', color: 'text-sky-700 bg-sky-50 border-sky-200' };
    return { title: `${meta.name} 입문 탐구자`, grade: '초급 1 (시민사회)', icon: '🌱', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  const rank = getDomainRank(maxUnlockedLevel, selectedCategory);

  const handleSaveNickname = () => {
    const trimmed = editInput.trim() || '대한민국 헌법학도';
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
        text: '모든 게임 기록과 인증서가 백업 JSON 파일로 다운로드되었습니다.',
      });
      sounds.playWordComplete();
    } else {
      setBackupStatus({
        type: 'error',
        text: '백업 파일 생성에 실패했습니다.',
      });
    }
    setTimeout(() => setBackupStatus(null), 4000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sounds.playKey();
    const result = await importUserDataJson(file);

    if (result.success) {
      setBackupStatus({ type: 'success', text: result.message });
      sounds.playVictory();
      if (onDataRestored) {
        onDataRestored();
      } else {
        setTimeout(() => window.location.reload(), 1200);
      }
    } else {
      setBackupStatus({ type: 'error', text: result.message });
      sounds.playError();
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setTimeout(() => setBackupStatus(null), 5000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 pb-28 animate-in fade-in duration-200">
      {/* 1. Header */}
      <div className="text-center mb-5">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-2">
          <User className="w-6 h-6 text-[#0288d1]" />
          <span>마이페이지 & 설정</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          나의 분야별 직급, 인증서, 힌트 보유량, 데이터 백업 및 게임 환경을 관리하세요.
        </p>
      </div>

      {/* Backup Notification Toast */}
      {backupStatus && (
        <div
          className={`mb-4 p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 shadow-sm ${
            backupStatus.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}
        >
          {backupStatus.type === 'success' ? (
            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{backupStatus.text}</span>
        </div>
      )}

      {/* 2. User Profile Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-5 shadow-sm mb-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0288d1] to-sky-400 flex items-center justify-center text-3xl shadow-md shrink-0">
            {rank.icon}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              {isEditingNickname ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={editInput}
                    onChange={(e) => setEditInput(e.target.value)}
                    maxLength={15}
                    style={{ fontSize: '16px' }}
                    className="px-2.5 py-1 text-base font-black border border-[#0288d1] rounded-lg focus:outline-hidden"
                  />
                  <button
                    onClick={handleSaveNickname}
                    className="p-1.5 bg-[#0288d1] text-white rounded-lg text-xs font-bold"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-800">{nickname}</h3>
                  <button
                    onClick={() => {
                      setEditInput(nickname);
                      setIsEditingNickname(true);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                    title="닉네임 수정"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${rank.color}`}>
                {rank.grade}
              </span>
            </div>

            <p className="text-sm font-bold text-slate-700 mt-1">
              현재 관문 등급: <span className="text-[#0288d1]">{rank.title}</span> (Lv.{maxUnlockedLevel} 해금)
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                도전 진행도: Lv.{currentLevel}
              </span>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                최고 관문: Lv.{maxUnlockedLevel}
              </span>
              <span className="text-xs font-bold text-[#0288d1] bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg">
                {currentCatMeta.icon} {currentCatMeta.name} 분야
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 Active Category Selection & Progress */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-sm mb-4">
        <h3 className="text-sm font-black text-slate-800 mb-1 flex items-center gap-2">
          <span className="text-lg">{currentCatMeta.icon}</span>
          <span>도전 지식 분야 선택:</span>
          <span className="text-[#0288d1]">{currentCatMeta.fullName}</span>
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          원하는 분야를 누르면 해당 분야의 전용 낱말퍼즐로 즉시 변경됩니다.
        </p>

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
                className={`p-2.5 rounded-xl border text-xs font-black transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-1 ring-blue-400'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 ml-auto text-amber-300" />}
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
                정치학 마스터 인증서
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                {maxUnlockedLevel >= 10 ? '발급 완료' : '진행 중'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              10개 레벨의 모든 관문을 돌파하면 공식 대한민국 정치학 마스터 인증서가 수여됩니다.
            </p>
          </div>

          <button
            onClick={() => {
              sounds.playKey();
              onOpenCertificate();
            }}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
          >
            <Award className="w-4 h-4" />
            <span>인증서 열람 / 확인</span>
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
              매일 첫 접속 시 무료 힌트 +3개가 충전되며, 광고 시청을 통해 추가로 무료 충전할 수 있습니다.
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

      {/* 4. Data Backup & Restore Feature (Resolves #1 User Pain Point: Data Loss) */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-5 shadow-sm mb-4">
        <h3 className="text-base font-black text-slate-800 mb-2 flex items-center gap-2">
          <Download className="w-4 h-4 text-[#0288d1]" />
          <span>데이터 안전 백업 및 복원</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          기기를 변경하거나 브라우저 캐시 삭제 시에도 안심하세요! 게임 진행도와 인증서를 파일로 저장하고 언제든 복원할 수 있습니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Export JSON Button */}
          <button
            onClick={handleExportBackup}
            className="py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black shadow-xs transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-sky-300" />
            <span>내 기록 백업 파일 저장 (JSON)</span>
          </button>

          {/* Import JSON Button */}
          <button
            onClick={() => {
              sounds.playKey();
              fileInputRef.current?.click();
            }}
            className="py-2.5 px-3 bg-sky-50 hover:bg-sky-100 text-[#0288d1] border border-sky-200 rounded-xl text-xs font-black shadow-xs transition flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4 text-[#0288d1]" />
            <span>백업 파일 불러오기 및 복원</span>
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* 5. Diagnostic Placement Test Retake */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-4 shadow-xs mb-4 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>정치 실력 진단 주관식 테스트</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            5개 주관식 문항을 다시 풀고 맞춤 시작 레벨을 재배정받을 수 있습니다.
          </p>
        </div>

        <button
          onClick={() => {
            sounds.playKey();
            onOpenTest();
          }}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition shrink-0 ml-3"
        >
          테스트 응시
        </button>
      </div>

      {/* 5-B. App Installation & Home Screen Icon */}
      {onOpenInstallModal && (
        <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-3xl border border-sky-200 p-5 shadow-xs mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <img
              src="/icon-192.png"
              alt="앱 아이콘"
              className="w-14 h-14 rounded-2xl shadow-md border border-white shrink-0 object-cover"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-slate-900">홈 화면에 낱말퍼즐 앱 설치</span>
                <span className="text-[10px] font-black px-2 py-0.5 bg-[#0288d1] text-white rounded-full">PWA</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                스마트폰 및 PC 홈 화면에 전용 앱 아이콘을 추가하여 언제든 바로 실행하세요.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playKey();
              onOpenInstallModal();
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#0288d1] hover:bg-[#0277bd] text-white font-black text-xs rounded-xl shadow-xs transition shrink-0 cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>앱 설치</span>
          </button>
        </div>
      )}

      {/* 6. Game Preferences & Accessibility */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-5 shadow-sm mb-4">
        <h3 className="text-base font-black text-slate-800 mb-4 flex items-center gap-2">
          <span>게임 환경 및 시각 편의 설정</span>
        </h3>

        {/* Large Font Mode Toggle (Resolves Feedback #3: Seniors / Mobile Screen Font Size) */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Type className="w-5 h-5 text-indigo-600" />
            <div>
              <span className="text-sm font-bold text-slate-800 block">큰 글씨 모드 (시니어 / 시각 편의)</span>
              <span className="text-[11px] text-slate-500">
                {isLargeFont ? '퍼즐 칸 및 설명 글씨가 크게 확대되어 있습니다.' : '표준 글씨 크기가 적용되어 있습니다.'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playKey();
              onToggleLargeFont();
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition ${
              isLargeFont
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
          >
            {isLargeFont ? '큰 글씨 ON' : '큰 글씨 OFF'}
          </button>
        </div>

        {/* Sound Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-slate-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-[#0288d1]" />
            )}
            <div>
              <span className="text-sm font-bold text-slate-800 block">효과음 사운드</span>
              <span className="text-[11px] text-slate-500">
                {isMuted ? '음소거 상태입니다.' : '정답·클리어 효과음이 켜져 있습니다.'}
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
        <div className="py-3">
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

      {/* 7. Legal Policies & Service Information (Google AdSense Compliance) */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
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
              <div className="text-xs font-black text-slate-800">서비스 이용약관</div>
              <div className="text-[10px] text-slate-400">이용 권리 및 책임 안내</div>
            </div>
            <FileText className="w-4 h-4 text-slate-500 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => onOpenPolicy?.('ABOUT')}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition flex items-center justify-between cursor-pointer"
          >
            <div>
              <div className="text-xs font-black text-slate-800">서비스 및 팀 소개</div>
              <div className="text-[10px] text-slate-400">8대 지식 영역 교육 비전</div>
            </div>
            <Info className="w-4 h-4 text-emerald-500 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => onOpenPolicy?.('CONTACT')}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-left transition flex items-center justify-between cursor-pointer"
          >
            <div>
              <div className="text-xs font-black text-slate-800">문의 및 피드백</div>
              <div className="text-[10px] text-slate-400">오류 제보 및 제휴 문의</div>
            </div>
            <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
          </button>
        </div>
      </div>

      {/* 8. Danger Zone: Reset Progress */}
      <div className="bg-rose-50/80 rounded-2xl border border-rose-200 p-4 flex items-center justify-between">
        <div>
          <span className="text-xs font-black text-rose-800 block">진행 데이터 초기화</span>
          <span className="text-[11px] text-rose-600">
            모든 관문 기록과 클리어 판 수를 처음(Lv.1)으로 되돌립니다.
          </span>
        </div>

        <button
          onClick={() => {
            if (window.confirm('정말로 모든 진행 기록을 초기화하시겠습니까? 돌파한 관문과 기록이 삭제됩니다.')) {
              onResetProgress();
            }
          }}
          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0 ml-3 flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>초기화</span>
        </button>
      </div>
    </div>
  );
};
