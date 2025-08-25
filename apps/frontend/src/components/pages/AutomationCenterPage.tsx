import React, { useContext, useEffect, useState } from 'react';
import RecurringTemplateModal from '../modals/RecurringTemplateModal';
import NotificationPanel from '../NotificationPanel';
import TransactionForm from '../TransactionForm';
import { AppContext } from '../../context/AppContext';
import type { RecurringTemplate } from '../../types';


// 반복 거래 템플릿 목록/추가/수정/삭제/실행 내역 UI 구현
const AutomationCenterPage: React.FC = () => {
  const context = useContext(AppContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<RecurringTemplate | null>(null);

  // 최초 진입 시 템플릿 목록 불러오기
  useEffect(() => {
    if (context) context.fetchRecurringTemplates();
  }, [context]);

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
    <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>자동화 센터</h1>
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>반복 거래 템플릿 관리</h2>
        <button
          style={{ marginBottom: 16, padding: '8px 16px', fontWeight: 600, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4 }}
          onClick={() => { setModalOpen(true); setEditTemplate(null); }}
        >
          + 새 템플릿 추가
        </button>
        {/* 템플릿 목록 */}
        {loading ? (
          <div>불러오는 중...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
            <thead style={{ background: '#f3f4f6' }}>
              <tr>
                <th style={{ padding: 8 }}>이름</th>
                <th>금액</th>
                <th>카테고리</th>
                <th>주기</th>
                <th>상태</th>
                <th>다음 실행일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {recurringTemplates.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: '#888', padding: 24 }}>등록된 템플릿이 없습니다.</td></tr>
              ) : (
                recurringTemplates.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: 8, fontWeight: 500 }}>{t.name}</td>
                    <td>{t.amount.toLocaleString()}원</td>
                    <td>{t.category}</td>
                    <td>{t.recurrenceType}</td>
                    <td>{t.isActive ? '활성' : '비활성'}</td>
                    <td>{t.nextDueDate ? t.nextDueDate : '-'}</td>
                    <td>
                      <button style={{ marginRight: 8 }} onClick={() => { setEditTemplate(t); setModalOpen(true); }}>수정</button>
                      <button style={{ color: 'red' }} onClick={() => handleDelete(t.id)}>삭제</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
        {/* 템플릿 추가/수정 모달 */}
        <RecurringTemplateModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          template={editTemplate || undefined}
          onSave={handleSave}
        />
        <div style={{ color: '#888', fontSize: 14, marginTop: 8 }}>
          반복 거래 템플릿을 등록하면 자동으로 거래가 생성됩니다.
        </div>
        {/* (옵션) 실행 내역 UI 뼈대 */}
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>자동 실행 내역 (준비중)</h3>
          <div style={{ color: '#aaa', fontSize: 13 }}>실행 내역은 추후 제공됩니다.</div>
        </div>
      </section>
      {/* ...기존 코드(알림/자동 분류/추천) 그대로 유지... */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>스마트 알림/예산 경고</h2>
        <NotificationPanel />
      </section>
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>자동 카테고리 분류 체험</h2>
        <TransactionForm />
        <div style={{ color: '#888', fontSize: 14, marginTop: 8 }}>
          설명/상호명을 입력하면 카테고리가 자동 추천됩니다.
        </div>
      </section>
      <section>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>나이대/직업군별 카테고리 추천</h2>
        <div style={{ color: '#888', fontSize: 14, marginTop: 8 }}>
          프로필에서 나이대/직업군을 설정하면 맞춤 카테고리가 추천됩니다.
        </div>
      </section>
    </div>
  );
};

export default AutomationCenterPage;