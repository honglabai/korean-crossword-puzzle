/**
 * storageBackup.ts
 * Export and Import full user gameplay data, progress, certificate status,
 * hints, solved word vocabulary, and personal settings to a secure JSON file.
 * Compatible with both modern UserSaveData and legacy BackupData formats.
 */

import { UserSaveData } from '../types/progress';
import {
  loadUserSaveData,
  saveUserSaveData,
  createDefaultUserSaveData,
  ALL_CATEGORIES,
} from '../services/storageService';
import { CategoryId } from '../types/puzzle';

export interface ModernBackupPayload {
  format: 'knowledge_crossword_backup';
  version: '2.0.0';
  exportedAt: string;
  data: UserSaveData;
}

export function exportUserDataJson(): boolean {
  try {
    const currentData = loadUserSaveData();

    const payload: ModernBackupPayload = {
      format: 'knowledge_crossword_backup',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      data: currentData,
    };

    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const nowStr = new Date().toISOString().slice(0, 10);
    const a = document.createElement('a');
    a.href = url;
    a.download = `지식탐구_낱말퍼즐_전체백업_${nowStr}.json`;
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

        const parsed = JSON.parse(text);

        // Case 1: Modern Backup Format (v2.0.0)
        if (parsed.format === 'knowledge_crossword_backup' && parsed.data) {
          const incoming = parsed.data as UserSaveData;
          if (!incoming.categoryProgress) {
            resolve({ success: false, message: '백업 파일의 진행 데이터가 손상되었습니다.' });
            return;
          }
          saveUserSaveData(incoming);
          resolve({ success: true, message: '전체 게임 및 학습 데이터가 성공적으로 복원되었습니다!' });
          return;
        }

        // Case 2: Direct UserSaveData structure
        if (parsed.categoryProgress && typeof parsed.schemaVersion === 'number') {
          saveUserSaveData(parsed as UserSaveData);
          resolve({ success: true, message: '게임 데이터가 정상 복원되었습니다.' });
          return;
        }

        // Case 3: Legacy v1.2.0 Backup Format
        if (typeof parsed.currentLevel === 'number' || typeof parsed.maxUnlockedLevel === 'number') {
          const defaultData = createDefaultUserSaveData();
          const targetCat: CategoryId = ALL_CATEGORIES.includes(parsed.selectedCategory)
            ? parsed.selectedCategory
            : 'POLITICS';

          defaultData.selectedCategory = targetCat;
          defaultData.nickname = parsed.nickname || defaultData.nickname;
          defaultData.hintBalance = typeof parsed.hintBalance === 'number' ? parsed.hintBalance : 3;
          if (parsed.isLargeFont) defaultData.settings.fontSize = 'large';

          const catProg = defaultData.categoryProgress[targetCat];
          catProg.currentLevel = Math.max(1, Math.min(10, parsed.currentLevel || 1));
          catProg.clearCountInLevel = Math.max(0, Math.min(3, parsed.clearCountInLevel || 0));
          catProg.maxUnlockedLevel = Math.max(1, Math.min(10, parsed.maxUnlockedLevel || 1));
          catProg.levelClears = parsed.levelClears || {};
          catProg.isTested = Boolean(parsed.isTested);

          if (Array.isArray(parsed.boardRecords)) defaultData.records = parsed.boardRecords;
          if (Array.isArray(parsed.solvedWords)) defaultData.solvedWordTerms = parsed.solvedWords;

          saveUserSaveData(defaultData);
          resolve({ success: true, message: '이전 버전 백업 데이터가 성공적으로 마이그레이션 및 복원되었습니다.' });
          return;
        }

        resolve({ success: false, message: '올바른 낱말퍼즐 백업 파일 형식이 아닙니다.' });
      } catch (err) {
        console.error('Import parse error:', err);
        resolve({ success: false, message: 'JSON 파싱 중 오류가 발생했습니다. 정상적인 백업 파일인지 확인해주세요.' });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, message: '파일을 읽는 중 오류가 발생했습니다.' });
    };

    reader.readAsText(file);
  });
}
