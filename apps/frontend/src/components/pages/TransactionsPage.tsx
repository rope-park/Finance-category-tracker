import React, { useState, useContext, useRef, useCallback, useEffect, useMemo } from 'react';
import { Card, PageLayout, Button, TransactionFilter } from '../ui';
import { TransactionModal, ExportModal } from '../modals';
import { AppContext } from '../../context/AppContext';
import type { Transaction, TransactionCategory } from '../../types';
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

  // 필터 상태
  const [filters, setFilters] = useState({
    searchText: '',
    dateFrom: '',
    dateTo: '',
    category: '' as TransactionCategory | '',
    type: 'all' as 'all' | 'income' | 'expense',
    amountRange: [0, 0] as [number, number],
    merchant: ''
  });

  // 금액 범위 계산
  const { minAmount, maxAmount } = useMemo(() => {
    if (transactions.length === 0) return { minAmount: 0, maxAmount: 1000000 };
    const amounts = transactions.map(t => t.amount);
    return {
      minAmount: Math.min(...amounts),
      maxAmount: Math.max(...amounts)
    };
  }, [transactions]);

  // 필터 초기화
  useEffect(() => {
    if (filters.amountRange[0] === 0 && filters.amountRange[1] === 0) {
      setFilters(prev => ({
        ...prev,
        amountRange: [minAmount, maxAmount]
      }));
    }
  }, [minAmount, maxAmount, filters.amountRange]);

  // 필터링된 거래 내역
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // 검색어 필터
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        if (!transaction.description.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // 날짜 범위 필터
      if (filters.dateFrom && transaction.date < filters.dateFrom) return false;
      if (filters.dateTo && transaction.date > filters.dateTo) return false;

      // 카테고리 필터
      if (filters.category && transaction.category !== filters.category) return false;

      // 거래 유형 필터
      if (filters.type !== 'all' && transaction.type !== filters.type) return false;

      // 금액 범위 필터
      if (transaction.amount < filters.amountRange[0] || transaction.amount > filters.amountRange[1]) return false;

      // 가맹점 필터
      if (filters.merchant) {
        const merchantLower = filters.merchant.toLowerCase();
        if (!transaction.merchant?.toLowerCase().includes(merchantLower)) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, filters]);

  const handleResetFilters = () => {
    setFilters({
      searchText: '',
      dateFrom: '',
      dateTo: '',
      category: '',
      type: 'all',
      amountRange: [minAmount, maxAmount],
      merchant: ''
    });
  };


  // 무한스크롤 상태
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);
  const [displayed, setDisplayed] = useState<Transaction[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPage(1); // 필터가 변경되면 페이지 리셋
  }, [filteredTransactions]);

  useEffect(() => {
    const sorted = filteredTransactions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setDisplayed(sorted.slice(0, PAGE_SIZE * page));
    setHasMore(sorted.length > PAGE_SIZE * page);
  }, [filteredTransactions, page]);

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

      {/* 필터 컴포넌트 */}
      <TransactionFilter
        filters={filters}
        onFiltersChange={setFilters}
        onReset={handleResetFilters}
        darkMode={darkMode}
        minAmount={minAmount}
        maxAmount={maxAmount}
      />

      {/* 결과 통계 */}
      {filteredTransactions.length !== transactions.length && (
        <div style={{
          marginBottom: '16px',
          padding: '12px 16px',
          backgroundColor: darkMode ? colors.dark[700] : colors.primary[50],
          border: `1px solid ${darkMode ? colors.dark[600] : colors.primary[200]}`,
          borderRadius: '8px',
          fontSize: '14px',
          color: darkMode ? colors.dark[200] : colors.primary[700],
          fontFamily: "'Noto Sans KR', sans-serif"
        }}>
          📊 전체 {transactions.length}건 중 {filteredTransactions.length}건의 거래가 검색되었습니다.
        </div>
      )}

      <ErrorBoundary>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayed.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                {filteredTransactions.length === 0 && transactions.length > 0 ? '🔍' : '📝'}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: darkMode ? colors.dark[100] : colors.gray[900], margin: '0 0 8px 0', fontFamily: "'Noto Sans KR', sans-serif" }}>
                {filteredTransactions.length === 0 && transactions.length > 0 
                  ? '검색 결과가 없습니다' 
                  : '거래 내역이 없습니다'}
              </h3>
              <p style={{ fontSize: '14px', color: darkMode ? colors.dark[400] : colors.gray[600], margin: '0 0 24px 0', fontFamily: "'Noto Sans KR', sans-serif" }}>
                {filteredTransactions.length === 0 && transactions.length > 0 
                  ? '다른 조건으로 검색해보세요' 
                  : '첫 번째 거래를 추가해보세요'}
              </p>
              {filteredTransactions.length === 0 && transactions.length > 0 ? (
                <Button variant="secondary" onClick={handleResetFilters}>
                  필터 초기화
                </Button>
              ) : (
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                  거래 추가
                </Button>
              )}
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
