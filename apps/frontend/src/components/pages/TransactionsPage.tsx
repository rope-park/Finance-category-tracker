import React, { useState, useContext, useRef, useCallback, useEffect } from 'react';
import { Card, PageLayout, Button } from '../ui';
import { TransactionModal, ExportModal } from '../modals';
import { AppContext } from '../../context/AppContext';
import type { Transaction } from '../../types';
import { formatCurrency, formatDate, getCategoryName } from '../../utils';
import { colors } from '../../styles/theme';
import { ErrorBoundary } from '../ui/ErrorBoundary';

export const TransactionsPage: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('TransactionsPage must be used within an AppProvider');
  const { state: { transactions, darkMode }, deleteTransaction } = context;
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);


  // 무한스크롤 상태
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);
  const [displayed, setDisplayed] = useState<Transaction[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sorted = transactions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setDisplayed(sorted.slice(0, PAGE_SIZE * page));
    setHasMore(sorted.length > PAGE_SIZE * page);
  }, [transactions, page]);

  // IntersectionObserver로 무한스크롤 구현
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore]);

  useEffect(() => {
    const option = { root: null, rootMargin: '20px', threshold: 1.0 };
    const observer = new window.IntersectionObserver(handleObserver, option);
    const currentLoader = loader.current;
    if (currentLoader) observer.observe(currentLoader);
    return () => { if (currentLoader) observer.unobserve(currentLoader); };
  }, [handleObserver]);

  const handleEdit = (transaction: Transaction) => setEditingTransaction(transaction);
  const handleDelete = (id: string) => {
    if (window.confirm('이 거래 내역을 삭제하시겠습니까?')) deleteTransaction(id);
  };

  return (
    <PageLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: darkMode ? colors.dark[100] : colors.gray[900], margin: 0, fontFamily: "'Noto Sans KR', sans-serif" }}>
          거래 내역
        </h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={() => setShowExportModal(true)}>
            📊 내보내기
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            거래 추가
          </Button>
        </div>
      </div>
      <ErrorBoundary>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayed.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: darkMode ? colors.dark[100] : colors.gray[900], margin: '0 0 8px 0', fontFamily: "'Noto Sans KR', sans-serif" }}>
                거래 내역이 없습니다
              </h3>
              <p style={{ fontSize: '14px', color: darkMode ? colors.dark[400] : colors.gray[600], margin: '0 0 24px 0', fontFamily: "'Noto Sans KR', sans-serif" }}>
                첫 번째 거래를 추가해보세요
              </p>
              <Button variant="primary" onClick={() => setShowAddModal(true)}>
                거래 추가
              </Button>
            </Card>
          ) : (
            displayed.map((transaction) => (
              <Card key={transaction.id} style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: darkMode ? colors.dark[100] : colors.gray[900], margin: 0, fontFamily: "'Noto Sans KR', sans-serif" }}>
                        {transaction.description}
                      </h3>
                      <span style={{ fontSize: '12px', color: darkMode ? colors.dark[400] : colors.gray[500], backgroundColor: darkMode ? colors.dark[700] : colors.gray[100], padding: '2px 8px', borderRadius: '12px', fontFamily: "'Noto Sans KR', sans-serif" }}>
                        {getCategoryName(transaction.category)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '18px', fontWeight: '700', color: transaction.type === 'income' ? colors.success[600] : colors.error[600], fontFamily: "'Noto Sans KR', sans-serif" }}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                      <span style={{ fontSize: '14px', color: darkMode ? colors.dark[400] : colors.gray[600], fontFamily: "'Noto Sans KR', sans-serif" }}>
                        {formatDate(transaction.date)}
                      </span>
                      {transaction.merchant && (
                        <span style={{ fontSize: '14px', color: darkMode ? colors.dark[400] : colors.gray[600], fontFamily: "'Noto Sans KR', sans-serif" }}>
                          {transaction.merchant}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="secondary" onClick={() => handleEdit(transaction)} style={{ fontSize: '12px', padding: '6px 12px', minWidth: 'auto' }}>
                      수정
                    </Button>
                    <Button variant="error" onClick={() => handleDelete(transaction.id || '')} style={{ fontSize: '12px', padding: '6px 12px', minWidth: 'auto' }}>
                      삭제
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
          <div ref={loader} style={{ height: 32 }} />
          {hasMore && (
            <div style={{ textAlign: 'center', color: colors.gray[500], padding: '8px' }}>
              불러오는 중...
            </div>
          )}
        </div>
      </ErrorBoundary>
      <TransactionModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <TransactionModal isOpen={!!editingTransaction} onClose={() => setEditingTransaction(null)} transaction={editingTransaction || undefined} />
      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
    </PageLayout>
  );
};
      {/* 거래 내역 목록 (ErrorBoundary로 감싸기) */}
