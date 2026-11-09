import React from 'react';
import { Trophy, Clock, Award } from 'lucide-react';
import { BoardRecord } from '../types/puzzle';
import { getCategoryMeta } from '../data/categoryRegistry';
import { sounds } from '../utils/audio';

interface RecordsViewProps {
  levelClears: Record<number, number>;
  boardRecords: BoardRecord[];
  maxUnlockedLevel: number;
  currentLevel: number;
  onGoToPlay: () => void;
}

export const RecordsView: React.FC<RecordsViewProps> = ({
  levelClears,
  boardRecords,
  maxUnlockedLevel,
  currentLevel,
  onGoToPlay,
}) => {
  const levelNames: Record<number, { name: string; words: number }> = {
    1: { name: '기초 민주', words: 10 },
    2: { name: '의회 기본', words: 10 },
    3: { name: '정부 형태', words: 10 },
    4: { name: '선거 실무', words: 15 },
    5: { name: '비교 정치', words: 15 },
    6: { name: '입법 통제', words: 15 },
    7: { name: '외교 안보', words: 15 },
    8: { name: '정치 사상', words: 20 },
    9: { name: '제도 분석', words: 20 },
    10: { name: '정치 마스터', words: 20 },
  };

  // Calculate total cleared words across all levels
  let totalSolvedWords = 0;
  for (let l = 1; l <= 10; l++) {
    const clears = levelClears[l] || 0;
    totalSolvedWords += clears * (levelNames[l]?.words || 10);
  }

  // Calculate fastest clear record
  const bestRecord = boardRecords.length > 0
    ? [...boardRecords].sort((a, b) => a.timeSeconds - b.timeSeconds)[0]
    : null;

  const formatTime = (sec: number = 0) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}분 ${String(s).padStart(2, '0')}초`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 pb-28 animate-in fade-in duration-200">
      {/* 1. Header Overview Cards */}
      <div className="text-center mb-5">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-amber-500" />
          <span>내 낱말퍼즐 기록실</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          완성한 지식 어휘와 분야별 관문 돌파 기록을 한눈에 확인하세요.
        </p>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
          <span className="text-[11px] font-bold text-slate-500">총 완성 단어</span>
          <span className="text-2xl font-black text-[#0288d1] mt-1">
            {totalSolvedWords}
            <span className="text-xs font-bold text-slate-500 ml-1">개</span>
          </span>
        </div>

        <div className="p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
          <span className="text-[11px] font-bold text-slate-500">돌파한 관문</span>
          <span className="text-2xl font-black text-emerald-600 mt-1">
            {maxUnlockedLevel}
            <span className="text-xs font-bold text-slate-500 ml-1">/ 10</span>
          </span>
        </div>

        <div className="p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
          <span className="text-[11px] font-bold text-slate-500">클리어한 판 수</span>
          <span className="text-2xl font-black text-amber-500 mt-1">
            {boardRecords.length}
            <span className="text-xs font-bold text-slate-500 ml-1">판</span>
          </span>
        </div>

        <div className="p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
          <span className="text-[11px] font-bold text-slate-500">최단 기록 (타임어택)</span>
          <span className="text-lg font-black text-purple-600 mt-1 font-mono">
            {bestRecord ? formatTime(bestRecord.timeSeconds) : '-'}
          </span>
        </div>
      </div>

      {/* 2. Gate Progress Grid (Lv.1 ~ Lv.10) */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#0288d1]" />
            <span>레벨별 관문 돌파 현황 (3판 클리어 승급)</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">
            현재 도전: Lv.{currentLevel}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => {
            const clears = levelClears[lvl] || 0;
            const isCompleted = clears >= 3;
            const isUnlocked = lvl <= maxUnlockedLevel;
            const detail = levelNames[lvl];

            return (
              <div
                key={lvl}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  isCompleted
                    ? 'bg-emerald-50/80 border-emerald-300'
                    : isUnlocked
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-50/80 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isUnlocked
                        ? 'bg-[#0288d1] text-white'
                        : 'bg-slate-300 text-slate-500'
                    }`}
                  >
                    {isCompleted ? '✓' : `L${lvl}`}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-800">
                        Lv.{lvl} {detail.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 rounded-md text-slate-500 font-bold">
                        {detail.words}단어
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {isCompleted
                        ? '관문 완전 돌파 (3/3판 완료)'
                        : isUnlocked
                        ? `도전 중 (${clears}/3판 완료)`
                        : '이전 관문 클리어 필요 (잠김)'}
                    </span>
                  </div>
                </div>

                {/* Progress 3 Dots */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`w-2.5 h-2.5 rounded-full ${
                        clears >= step
                          ? 'bg-emerald-500 ring-2 ring-emerald-200'
                          : isUnlocked
                          ? 'bg-slate-200'
                          : 'bg-slate-200 opacity-40'
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Recent Clears Timeline */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-base font-black text-slate-800 flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-amber-500" />
          <span>최근 클리어 히스토리</span>
        </h3>

        {boardRecords.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <p className="text-sm font-bold">아직 클리어한 퍼즐 기록이 없습니다.</p>
            <p className="text-xs mt-1">지금 바로 첫 번째 낱말 퍼즐을 완성해보세요!</p>
            <button
              onClick={() => {
                sounds.playKey();
                onGoToPlay();
              }}
              className="mt-4 px-5 py-2.5 bg-[#0288d1] hover:bg-[#0277bd] text-white font-black text-xs rounded-xl shadow-md transition"
            >
              퍼즐 도전하러 가기 ➔
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {boardRecords.slice(0, 10).map((rec, idx) => {
              const catMeta = rec.category ? getCategoryMeta(rec.category) : null;
              return (
                <div
                  key={rec.id || idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-sky-100 text-[#0288d1] font-black flex items-center justify-center text-[11px]">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        {catMeta && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-white border border-slate-200 text-slate-700">
                            {catMeta.icon} {catMeta.name}
                          </span>
                        )}
                        <span className="font-bold text-slate-800">
                          Lv.{rec.level} {levelNames[rec.level]?.name || ''} 제{rec.boardNumber}판
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        ({rec.wordCount}단어)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      ⏱️ {formatTime(rec.timeSeconds)}
                    </span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      {new Date(rec.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
