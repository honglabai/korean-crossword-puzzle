/**
 * storageBackup.ts
 * Export and Import full user gameplay data, progress, certificate status,
 * hints, solved word vocabulary, and personal settings to a secure JSON file.
 * Addresses #1 user pain point: Data loss anxiety and device migration.
 */

export interface BackupData {
  version: string;
  exportedAt: string;
  nickname: string;
  selectedCategory?: string;
  currentLevel: number;
  clearCountInLevel: number;
  levelClears: Record<number, number>;
  maxUnlockedLevel: number;
  isTested: boolean;
  hintBalance: number;
  isLargeFont: boolean;
  boardRecords: unknown[];
  solvedWords: string[];
}

const STORAGE_KEY = 'politics_crossword_progress_v5';
const NICKNAME_KEY = 'politics_crossword_nickname';
const LARGE_FONT_KEY = 'politics_crossword_large_font';
const ATTENDANCE_KEY = 'politics_crossword_last_attendance';

export function exportUserDataJson(): boolean {
  try {
    const rawProgress = localStorage.getItem(STORAGE_KEY);
    const progress = rawProgress ? JSON.parse(rawProgress) : {};

    const backupPayload: BackupData = {
      version: '1.2.0',
      exportedAt: new Date().toISOString(),
      nickname: localStorage.getItem(NICKNAME_KEY) || '대한민국 지식탐구자',
      selectedCategory: progress.selectedCategory || 'POLITICS',
      currentLevel: progress.currentLevel || 1,
      clearCountInLevel: progress.clearCountInLevel || 0,
      levelClears: progress.levelClears || {},
      maxUnlockedLevel: progress.maxUnlockedLevel || 1,
      isTested: progress.isTested ?? false,
      hintBalance: typeof progress.hintBalance === 'number' ? progress.hintBalance : 3,
      isLargeFont: localStorage.getItem(LARGE_FONT_KEY) === 'true',
      boardRecords: progress.boardRecords || [],
      solvedWords: progress.solvedWords || [],
    };

    const jsonStr = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const nowStr = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `정치_낱말퍼즐_백업_${nowStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Export failed:', error);
    return false;
  }
}

export function importUserDataJson(file: File): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    if (!file) {
      resolve({ success: false, message: '파일이 선택되지 않았습니다.' });
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          resolve({ success: false, message: '파일 내용이 비어 있습니다.' });
          return;
        }

        const data = JSON.parse(text) as Partial<BackupData>;

        // Basic validation
        if (typeof data.currentLevel !== 'number' && typeof data.maxUnlockedLevel !== 'number') {
          resolve({ success: false, message: '올바른 정치 낱말 퍼즐 백업 파일 형식이 아닙니다.' });
          return;
        }

        // Restore to localStorage
        const progressToSave = {
          selectedCategory: data.selectedCategory || 'POLITICS',
          currentLevel: Math.max(1, Math.min(10, data.currentLevel || 1)),
          clearCountInLevel: Math.max(0, Math.min(3, data.clearCountInLevel || 0)),
          levelClears: data.levelClears || {},
          maxUnlockedLevel: Math.max(1, Math.min(10, data.maxUnlockedLevel || 1)),
          isTested: data.isTested ?? true,
          hintBalance: typeof data.hintBalance === 'number' ? data.hintBalance : 3,
          boardRecords: Array.isArray(data.boardRecords) ? data.boardRecords : [],
          solvedWords: Array.isArray(data.solvedWords) ? data.solvedWords : [],
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(progressToSave));

        if (data.nickname) {
          localStorage.setItem(NICKNAME_KEY, data.nickname);
        }

        if (typeof data.isLargeFont === 'boolean') {
          localStorage.setItem(LARGE_FONT_KEY, String(data.isLargeFont));
        }

        // Keep attendance intact or refresh
        const todayStr = new Date().toISOString().slice(0, 10);
        localStorage.setItem(ATTENDANCE_KEY, todayStr);

        resolve({
          success: true,
          message: `성공적으로 복원되었습니다! (최고 해금 관문: Lv.${progressToSave.maxUnlockedLevel}, 힌트: ${progressToSave.hintBalance}개)`,
        });
      } catch (err) {
        console.error('Import parse error:', err);
        resolve({ success: false, message: 'JSON 파싱에 실패했습니다. 올바른 파일인지 확인해주세요.' });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, message: '파일을 읽는 도중 오류가 발생했습니다.' });
    };

    reader.readAsText(file);
  });
}
