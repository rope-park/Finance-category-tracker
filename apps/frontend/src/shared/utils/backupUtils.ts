/**
 * 데이터 백업/복원 유틸리티 (Frontend 전용)
 * 
 * 주요 기능:
 * - 브라우저에서 JSON 파일로 데이터 다운로드 (백업)
 * - 업로드된 JSON 파일에서 데이터 복원
 * - 파일 형식 검증 및 오류 처리
 * - 자동 파일명 생성 (날짜 기반)
 *
 * 브라우저 전용 API를 사용하므로 서버 사이드에서는 사용 불가.
 *
 * @author Ju Eul Park (rope-park)
 */

/**
 * 데이터를 JSON 파일로 백업 (브라우저 다운로드)
 * @param data - 백업할 데이터 객체
 * @param filename - 사용자 지정 파일명 (선택사항)
 */
export function backupData(data: unknown, filename?: string): void {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `finance-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('백업 중 오류 발생:', error);
    throw new Error('데이터 백업에 실패했습니다.');
  }
}

/**
 * 업로드된 JSON 파일에서 데이터를 복원
 * @param file - 업로드된 JSON 파일
 * @returns Promise<unknown> - 복원된 데이터 객체
 */
export function restoreData(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('파일이 선택되지 않았습니다.'));
      return;
    }

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      reject(new Error('JSON 파일만 업로드할 수 있습니다.'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        resolve(data);
      } catch {
        reject(new Error('JSON 파일 형식이 올바르지 않습니다.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('파일 읽기 중 오류가 발생했습니다.'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * 데이터 유효성 검사
 * @param data - 검증할 데이터 객체
 * @returns boolean - 유효 여부
 */
export function validateBackupData(data: unknown): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }

  // 기본적인 구조 검사
  const backupData = data as Record<string, unknown>;
  
  // 필수 필드 검사 (예시)
  const requiredFields = ['transactions', 'budgets', 'version'];
  return requiredFields.every(field => field in backupData);
}
