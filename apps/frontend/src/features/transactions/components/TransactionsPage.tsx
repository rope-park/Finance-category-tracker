/**
 * 거래 내역 페이지 컴포넌트

 * 주요 기능:
 * - 거래 내역 목록 표시 (무한 스크롤 지원)
 * - 고급 필터링 (검색어, 날짜 범위, 카테고리, 거래 유형, 금액 범위, 가맹점)
 * - 거래 추가/수정/삭제 기능
 * - 데이터 내보내기 기능
 * - 실시간 검색 결과 통계 표시
 * - ErrorBoundary로 안정성 보장
 * - 다크모드 지원
 * - 업종별 거래 추적
 */

import React, { useState, useContext, useRef, useCallback, useEffect, useMemo } from 'react';
import { Card, PageLayout, Button, TransactionFilter, ExportModal, AppContext, ErrorBoundary } from '../../../index';
import { TransactionModal } from './TransactionModal';
import type { Transaction, TransactionCategory } from '../../../index';
import { formatCurrency, formatDate, getCategoryName } from '../../../index';
import { colors } from '../../../styles/theme';

/**
 * 거래 내역 페이지 컴포넌트
 */
export const TransactionsPage: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('TransactionsPage must be used within an AppProvider');
  const { state: { transactions, darkMode }, deleteTransaction } = context;
  
  // 모달 표시 상태 관리
  const [showAddModal, setShowAddModal] = useState(false);                    // 거래 추가 모달
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);  // 수정 중인 거래
  const [showExportModal, setShowExportModal] = useState(false);              // 데이터 내보내기 모달

  // 고급 필터링 상태 관리
  const [filters, setFilters] = useState({
    searchText: '',                                        
    dateFrom: '',                                        
    dateTo: '',                                       
    category: '' as TransactionCategory | '',           
    type: 'all' as 'all' | 'income' | 'expense',            
    amountRange: [0, 0] as [number, number],                
    merchant: ''                                          
  });

  // 거래 내역으로부터 금액 범위 자동 계산
  const { minAmount, maxAmount } = useMemo(() => {
    if (transactions.length === 0) return { minAmount: 0, maxAmount: 1000000 };  
    const amounts = transactions.map(t => t.amount);
    return {
      minAmount: Math.min(...amounts),
      maxAmount: Math.max(...amounts)
    };
  }, [transactions]);

  // 필터 초기화 시 금액 범위 리셋
  useEffect(() => {
    if (filters.amountRange[0] === 0 && filters.amountRange[1] === 0) {
      setFilters(prev => ({
        ...prev,
        amountRange: [minAmount, maxAmount]
      }));
    }
  }, [minAmount, maxAmount, filters.amountRange]);

  // 필터링된 거래 내역 계산
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // 검색어 필터: 거래 설명에서 검색
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        if (!transaction.description?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // 날짜 범위 필터
      if (filters.dateFrom && transaction.date < filters.dateFrom) return false;
      if (filters.dateTo && transaction.date > filters.dateTo) return false;

      // 카테고리 필터
      if (filters.category && transaction.category !== filters.category) return false;

      // 거래 유형 필터
      if (filters.type !== 'all' && transaction.transaction_type !== filters.type) return false;

      // 금액 범위 필터
      if (transaction.amount < filters.amountRange[0] || transaction.amount > filters.amountRange[1]) return false;

      // 가맹점 필터
      if (filters.merchant) {
        const merchantLower = filters.merchant.toLowerCase();
        if (!transaction.merchant?.toLowerCase().includes(merchantLower)) {
          return false;
        }
      }

      return true;  // 모든 필터 조건을 통과한 거래
    });
  }, [transactions, filters]);

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setFilters({
      searchText: '',
      dateFrom: '',
      dateTo: '',
      category: '',
      type: 'all',
      amountRange: [minAmount, maxAmount],  // 금액 범위는 전체 범위로 설정
      merchant: ''
    });
  };


  // 무한 스크롤 기능 관련 상태
  const PAGE_SIZE = 20;                                                    // 한 번에 로드할 거래 건수
  const [page, setPage] = useState(1);                                     // 현재 페이지 번호
  const [displayed, setDisplayed] = useState<Transaction[]>([]);           // 현재 화면에 표시된 거래 목록
  const [hasMore, setHasMore] = useState(true);                           // 추가 로드할 데이터 존재 여부
  const loader = useRef<HTMLDivElement | null>(null);                     // 무한스크롤 감지용 DOM 참조

  // 필터 변경 시 페이지 리셋
  useEffect(() => {
    setPage(1); // 필터가 변경되면 페이지 리셋
  }, [filteredTransactions]);

  // 페이지 변경 시 표시할 거래 목록 업데이트
  useEffect(() => {
    const sorted = filteredTransactions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setDisplayed(sorted.slice(0, PAGE_SIZE * page));      // 현재 페이지까지의 데이터
    setHasMore(sorted.length > PAGE_SIZE * page);         // 추가 데이터 존재 여부 확인
  }, [filteredTransactions, page]);

  // 무한스크롤 IntersectionObserver 콜백
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore) {
      setPage((prev) => prev + 1);  // 다음 페이지 트리거
    }
  }, [hasMore]);

  // IntersectionObserver 설정 및 정리
  useEffect(() => {
    const option = { root: null, rootMargin: '20px', threshold: 1.0 };      // Observer 옵션
    const observer = new window.IntersectionObserver(handleObserver, option);
    const currentLoader = loader.current;
    if (currentLoader) observer.observe(currentLoader);                     // 로더 요소 관찰 시작
    return () => { if (currentLoader) observer.unobserve(currentLoader); };  // 정리
  }, [handleObserver]);

  // 전체 수입/지출 계산
  const handleEdit = (transaction: Transaction) => setEditingTransaction(transaction);
  
  // 거래 삭제 핸들러
  const handleDelete = (id: string) => {
    if (window.confirm('이 거래 내역을 삭제하시겠습니까?')) deleteTransaction(id);
  };

  return (
    <PageLayout>
      {/* 페이지 헤더: 제목과 액션 버튼들 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        {/* 페이지 제목 */}
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: darkMode ? colors.dark[100] : colors.gray[900], margin: 0, fontFamily: "'Noto Sans KR', sans-serif" }}>
          거래 내역
        </h1>
        {/* 액션 버튼 그룹: 내보내기와 거래 추가 */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={() => setShowExportModal(true)}>
            📊 내보내기
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            거래 추가
          </Button>
        </div>
      </div>

      {/* 고급 필터링 컴포넌트: 검색, 날짜, 카테고리, 금액 등 모든 필터 옵션 */}
      <TransactionFilter
        filters={filters}             // 현재 필터 상태
        onFiltersChange={setFilters}   // 필터 변경 콜백
        onReset={handleResetFilters}   // 필터 초기화 콜백
        darkMode={darkMode}            // 다크모드 설정
        minAmount={minAmount}          // 최소 금액 (범위 슬라이더용)
        maxAmount={maxAmount}          // 최대 금액 (범위 슬라이더용)
      />

      {/* 검색 결과 통계 표시: 필터가 적용되었을 때만 나타남 */}
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

      {/* 에러 바운드리로 안정성 보장: 거래 목록 렌더링 오류 방지 */}
      <ErrorBoundary>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 거래 내역이 없을 때 또는 검색 결과가 없을 때 빈 상태 표시 */}
          {displayed.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
              {/* 상황에 맞는 아이콘 표시 */}
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                {filteredTransactions.length === 0 && transactions.length > 0 ? '🔍' : '📝'} {/* 검색 또는 빈 상태 */}
              </div>
              {/* 상황에 맞는 제목 */}
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: darkMode ? colors.dark[100] : colors.gray[900], margin: '0 0 8px 0', fontFamily: "'Noto Sans KR', sans-serif" }}>
                {filteredTransactions.length === 0 && transactions.length > 0 
                  ? '검색 결과가 없습니다'      // 필터 적용 후 결과 없음
                  : '거래 내역이 없습니다'}     // 아예 데이터가 없음
              </h3>
              {/* 상황에 맞는 설명 텍스트 */}
              <p style={{ fontSize: '14px', color: darkMode ? colors.dark[400] : colors.gray[600], margin: '0 0 24px 0', fontFamily: "'Noto Sans KR', sans-serif" }}>
                {filteredTransactions.length === 0 && transactions.length > 0 
                  ? '다른 조건으로 검색해보세요'      // 필터 수정 안내
                  : '첫 번째 거래를 추가해보세요'}     // 초기 사용 안내
              </p>
              {/* 상황에 맞는 액션 버튼 */}
              {filteredTransactions.length === 0 && transactions.length > 0 ? (
                <Button variant="secondary" onClick={handleResetFilters}>
                  필터 초기화  {/* 필터 조건 리셋 */}
                </Button>
              ) : (
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                  거래 추가    {/* 첫 번째 거래 추가 */}
                </Button>
              )}
            </Card>
          ) : (
            /* 거래 내역 카드 목록: 각 거래를 개별 카드로 표시 */
            displayed.map((transaction) => (
              <Card key={transaction.id} style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  {/* 거래 정보 메인 영역 */}
                  <div style={{ flex: 1 }}>
                    {/* 거래 설명과 카테고리 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: darkMode ? colors.dark[100] : colors.gray[900], margin: 0, fontFamily: "'Noto Sans KR', sans-serif" }}>
                        {transaction.description}  {/* 거래 설명 */}
                      </h3>
                      {/* 카테고리 배지 */}
                      <span style={{ fontSize: '12px', color: darkMode ? colors.dark[400] : colors.gray[500], backgroundColor: darkMode ? colors.dark[700] : colors.gray[100], padding: '2px 8px', borderRadius: '12px', fontFamily: "'Noto Sans KR', sans-serif" }}>
                        {getCategoryName(transaction.category)}
                      </span>
                    </div>
                    {/* 거래 상세 정보: 금액, 날짜, 가맹점 */}
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {/* 금액 표시 (수입/지출 색상 구분) */}
                      <span style={{ fontSize: '18px', fontWeight: '700', color: transaction.transaction_type === 'income' ? colors.success[600] : colors.error[600], fontFamily: "'Noto Sans KR', sans-serif" }}>
                        {transaction.transaction_type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                      {/* 거래 날짜 */}
                      <span style={{ fontSize: '14px', color: darkMode ? colors.dark[400] : colors.gray[600], fontFamily: "'Noto Sans KR', sans-serif" }}>
                        {formatDate(transaction.date)}
                      </span>
                      {/* 가맹점 정보 (있을 때만 표시) */}
                      {transaction.merchant && (
                        <span style={{ fontSize: '14px', color: darkMode ? colors.dark[400] : colors.gray[600], fontFamily: "'Noto Sans KR', sans-serif" }}>
                          {transaction.merchant}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* 거래 액션 버튼들: 수정과 삭제 */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="secondary" onClick={() => handleEdit(transaction)} style={{ fontSize: '12px', padding: '6px 12px', minWidth: 'auto' }}>
                      수정
                    </Button>
                    <Button variant="error" onClick={() => handleDelete(transaction.id?.toString() || '')} style={{ fontSize: '12px', padding: '6px 12px', minWidth: 'auto' }}>
                      삭제
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
          {/* 무한스크롤 감지용 로더 요소 */}
          <div ref={loader} style={{ height: 32 }} />
          {/* 추가 데이터 로딩 중 표시 */}
          {hasMore && (
            <div style={{ textAlign: 'center', color: colors.gray[500], padding: '8px' }}>
              불러오는 중...
            </div>
          )}
        </div>
      </ErrorBoundary>
      {/* 거래 추가 모달: 새로운 거래 추가 시 사용 */}
      <TransactionModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      
      {/* 거래 수정 모달: 기존 거래 수정 시 사용 */}
      <TransactionModal 
        isOpen={!!editingTransaction} 
        onClose={() => setEditingTransaction(null)} 
        transaction={editingTransaction || undefined} 
      />
      
      {/* 데이터 내보내기 모달: CSV, Excel 등으로 내보내기 */}
      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
    </PageLayout>
  );
};
