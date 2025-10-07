/**
 * 자동화 센터 페이지
 * 
 * 주요 기능:
 * - 반복 거래 템플릿 목록/추가/수정/삭제/실행 내역 UI 구현
 * - 스마트 알림/예산 경고 관리
 * - 자동 카테고리 분류 체험
 * - 나이대/직업군별 카테고리 추천
 */
import React, { useContext, useEffect, useState } from 'react';
import { 
  RecurringTemplateModal,
  PageLayout,
  Card,
  Button,
  AppContext,
  NotificationPanel,
  type RecurringTemplate 
} from '../../../index';
import TransactionForm from './TransactionForm';

/**
 * 서버에서 받아온 RecurringTemplate 객체를 로컬에서 사용하는 형식으로 변환
 * @param template - 서버에서 받아온 RecurringTemplate 객체
 * @returns 로컬에서 사용하는 형식으로 변환된 RecurringTemplate 객체
 */
const convertToLocalTemplate = (template: RecurringTemplate) => ({
  ...template,
  type: template.type === 'transfer' ? 'expense' : template.type as 'income' | 'expense'
});


/**
 * 자동화 센터 페이지 컴포넌트
 * @returns 자동화 센터 페이지 JSX
 */
const AutomationCenterPage: React.FC = () => {
  const context = useContext(AppContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<RecurringTemplate | null>(null);

  // 최초 마운트 1회만 fetch (rate limit 방지)
  useEffect(() => {
    if (!context) return;
    if (context.recurringTemplates.length > 0) return;
    context.fetchRecurringTemplates();
    // eslint-disable-next-line
  }, []);

  if (!context) return null;
  const { recurringTemplates, loading, addRecurringTemplate, updateRecurringTemplate, deleteRecurringTemplate } = context;

  // 템플릿 추가/수정 완료 시 모달 닫기
  const handleModalClose = () => {
    setModalOpen(false);
    setEditTemplate(null);
  };

  // 템플릿 저장(추가/수정)
  const handleSave = async (data: Partial<RecurringTemplate>) => {
    if (editTemplate) {
      await updateRecurringTemplate(editTemplate.id, data);
    } else {
      await addRecurringTemplate(data);
    }
    handleModalClose();
  };

  // 템플릿 삭제
  const handleDelete = async (id: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteRecurringTemplate(id);
    }
  };

  return (
    <PageLayout>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">자동화 센터</h1>
        <p className="text-muted-foreground">반복 거래와 스마트 기능을 관리하세요</p>
      </div>

      {/* 반복 거래 템플릿 관리 */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">반복 거래 템플릿 관리</h2>
          <Button 
            onClick={() => { setModalOpen(true); setEditTemplate(null); }}
            className="flex items-center gap-2"
          >
            + 새 템플릿 추가
          </Button>
        </div>

        {/* 템플릿 목록 */}
        {loading ? (
          <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
            <p className="text-sm readable-text" style={{
              color: context?.state.darkMode ? '#9CA3AF' : '#6B7280',
              margin: 0,
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              템플릿을 불러오는 중...
            </p>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontFamily: "'Noto Sans KR', sans-serif"
              }}>
                <thead style={{
                  backgroundColor: context?.state.darkMode ? '#374151' : '#F9FAFB',
                  borderBottom: `1px solid ${context?.state.darkMode ? '#4B5563' : '#E5E7EB'}`
                }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>이름</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>금액</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>카테고리</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>주기</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>상태</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>다음 실행일</th>
                    <th style={{ textAlign: 'left', padding: '12px', fontWeight: '600' }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {recurringTemplates.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ 
                        textAlign: 'center', 
                        padding: '48px 24px',
                        color: context?.state.darkMode ? '#9CA3AF' : '#6B7280'
                      }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📝</div>
                        <p style={{ margin: 0, fontFamily: "'Noto Sans KR', sans-serif" }}>
                          등록된 템플릿이 없습니다.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    recurringTemplates.map(t => (
                      <tr key={t.id} style={{
                        borderBottom: `1px solid ${context?.state.darkMode ? '#374151' : '#E5E7EB'}`
                      }}>
                        <td style={{ padding: '12px', fontWeight: '500' }}>{t.name}</td>
                        <td style={{ padding: '12px' }}>{t.amount.toLocaleString()}원</td>
                        <td style={{ padding: '12px' }}>{t.category}</td>
                        <td style={{ padding: '12px' }}>{t.recurrenceType}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: t.isActive 
                              ? (context?.state.darkMode ? '#065F46' : '#D1FAE5')
                              : (context?.state.darkMode ? '#374151' : '#F3F4F6'),
                            color: t.isActive 
                              ? (context?.state.darkMode ? '#10B981' : '#047857')
                              : (context?.state.darkMode ? '#9CA3AF' : '#6B7280')
                          }}>
                            {t.isActive ? '활성' : '비활성'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>{t.nextDueDate ? t.nextDueDate : '-'}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => { setEditTemplate(t); setModalOpen(true); }}
                            >
                              수정
                            </Button>
                            <Button 
                              variant="error" 
                              size="sm"
                              onClick={() => handleDelete(t.id)}
                            >
                              삭제
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* 템플릿 추가/수정 모달 */}
        <RecurringTemplateModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          template={editTemplate ? convertToLocalTemplate(editTemplate) : undefined}
          onSave={handleSave}
        />
        
        <div className="mt-4 text-sm text-muted-foreground">
          반복 거래 템플릿을 등록하면 자동으로 거래가 생성됩니다.
        </div>

        {/* 실행 내역 */}
        <div className="pt-8 mt-8 border-t border-border">
          <h3 className="mb-2 text-lg font-semibold">자동 실행 내역 (준비중)</h3>
          <div className="text-sm text-muted-foreground">실행 내역은 추후 제공됩니다.</div>
        </div>
      </Card>

      {/* 스마트 알림/예산 경고 */}
      <Card className="mb-8">
        <h2 className="mb-6 text-xl font-semibold">스마트 알림/예산 경고</h2>
        <NotificationPanel />
      </Card>

      {/* 자동 카테고리 분류 체험 */}
      <Card className="mb-8">
        <h2 className="mb-6 text-xl font-semibold">자동 카테고리 분류 체험</h2>
        <TransactionForm />
        <div className="mt-4 text-sm text-muted-foreground">
          설명/상호명을 입력하면 카테고리가 자동 추천됩니다.
        </div>
      </Card>

      {/* 나이대/직업군별 카테고리 추천 */}
      <Card>
        <h2 className="mb-6 text-xl font-semibold">나이대/직업군별 카테고리 추천</h2>
        <div className="text-sm text-muted-foreground">
          프로필에서 나이대/직업군을 설정하면 맞춤 카테고리가 추천됩니다.
        </div>
      </Card>
    </PageLayout>
  );
};

export default AutomationCenterPage;