/**
 * 거래 내역 관리 컨트롤러
 * 
 * 주요 기능:
 * - 거래 내역 CRUD 작업
 * - 다양한 필터링 및 정렬 옵션
 * - 월별/카테고리별 통계 제공
 * - 검색 및 페이지네이션 지원
 * - 데이터 유효성 검사
 * - 인증된 사용자만 접근 가능
 * 
 * @author Finance Category Tracker Team
 * @version 1.0.0
 */

import { Response } from 'express';
import pool from '../../core/config/database';
import { 
  CreateTransactionRequest, 
  UpdateTransactionRequest,
  ApiResponse,
  Transaction,
  MonthlyStats,
  CategoryStats
} from '@finance-tracker/shared';
import { AuthRequest } from '../../shared/middleware/auth';
import { TransactionRepository } from './transaction.repository';

const transactionRepository = new TransactionRepository();


/**
 * 새로운 거래 내역 생성
 * @param req - 인증된 요청 객체
 * @param res - 응답 객체
 * @returns 생성된 거래 내역 정보
 */
export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    // ==================================================
    // 요청 데이터 추출 및 검증
    // ==================================================
    
    /** 인증된 사용자 ID */
    const userId = req.user?.id;
    
    /** 요청 본문에서 거래 데이터 추출 */
    const { 
      category_key,       // 카테고리 키
      transaction_type,   // 거래 유형 (income/expense)
      amount,            // 거래 금액
      description,       // 거래 설명
      merchant,          // 가맹점/업체명
      transaction_date   // 거래 날짜
    }: CreateTransactionRequest = req.body;

    // 인증 상태 확인
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // 필수 필드 검증
    if (!category_key || !transaction_type || !amount || !transaction_date) {
      return res.status(400).json({
        success: false,
        error: '카테고리, 거래 유형, 금액, 거래 날짜는 필수입니다.'
      });
    }

    // ==================================================
    // 비즈니스 로직 검증
    // ==================================================
    
    /** 카테고리 유효성 확인 */
    const categoryCheck = await pool.query(
      'SELECT id FROM categories WHERE category_key = $1 AND transaction_type = $2',
      [category_key, transaction_type]
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 카테고리입니다.'
      });
    }

    // Repository를 사용하여 거래 내역 생성
    const transactionData = {
      user_id: userId.toString(),
      account_id: '1', // 기본 계정 ID (향후 다중 계정 지원 시 수정)
      category_id: category_key,
      amount: parseFloat(amount.toString()),
      description: description || '',
      transaction_date: new Date(transaction_date),
      type: transaction_type as 'income' | 'expense'
    };

    const transaction = await transactionRepository.createTransaction(transactionData);

    const response: ApiResponse = {
      success: true,
      data: { transaction },
      message: '거래 내역이 생성되었습니다.',
      timestamp: new Date().toISOString()
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('거래 내역 생성 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 거래 내역 조회 (필터링 가능)
export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { 
      category_key, 
      transaction_type, 
      start_date, 
      end_date, 
      limit = '50', 
      offset = '0' 
    } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // Repository 필터 구성
    const filters: any = {
      user_id: userId
    };

    if (category_key) filters.category_key = category_key as string;
    if (transaction_type) filters.transaction_type = transaction_type as 'income' | 'expense';
    if (start_date) filters.start_date = new Date(start_date as string);
    if (end_date) filters.end_date = new Date(end_date as string);

    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    // Repository를 사용하여 거래 조회
    const { transactions, total } = await transactionRepository.findWithFilters(
      filters,
      limitNum,
      offsetNum
    );

    // 카테고리 정보 추가를 위한 조인 쿼리 (필요시)
    // 현재는 transactions 테이블에서 기본 정보만 조회
    let enhancedTransactions = transactions;

    // 카테고리 정보가 필요한 경우 별도 쿼리로 조회하여 조인
    if (transactions.length > 0) {
      const categoryKeys = [...new Set(transactions.map(t => t.category_id).filter(Boolean))];
      const categoryResult = await pool.query(
        'SELECT category_key, label_ko as category_name, primary_category, secondary_category, icon, color FROM categories WHERE category_key = ANY($1)',
        [categoryKeys]
      );

      const categoryMap = new Map(
        categoryResult.rows.map(cat => [cat.category_key, cat])
      );

      enhancedTransactions = transactions.map(transaction => ({
        ...transaction,
        category_name: categoryMap.get(transaction.category_id || '')?.category_name || transaction.category_id,
        primary_category: categoryMap.get(transaction.category_id || '')?.primary_category,
        secondary_category: categoryMap.get(transaction.category_id || '')?.secondary_category,
        icon: categoryMap.get(transaction.category_id || '')?.icon,
        color: categoryMap.get(transaction.category_id || '')?.color
      }));
    }

    const response: ApiResponse = {
      timestamp: new Date().toISOString(),
      success: true,
      data: {
        transactions: enhancedTransactions,
        total,
        page: Math.floor(offsetNum / limitNum) + 1,
        totalPages: Math.ceil(total / limitNum)
      }
    };

    res.json(response);
  } catch (error) {
    console.error('거래 내역 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 특정 거래 내역 조회
// (중복된 에러 핸들러 및 잘못된 위치의 코드 삭제)

// 단일 거래 내역 조회
export const getTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // Repository를 사용하여 거래 조회
    const transaction = await transactionRepository.findById(id, userId.toString());

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: '거래 내역을 찾을 수 없습니다.'
      });
    }

    // 카테고리 정보 추가
    const categoryResult = await pool.query(
      'SELECT label_ko as category_name, primary_category, secondary_category, icon, color FROM categories WHERE category_key = $1',
      [transaction.category_id]
    );

    const enhancedTransaction = {
      ...transaction,
      category_name: categoryResult.rows[0]?.category_name || transaction.category_id,
      primary_category: categoryResult.rows[0]?.primary_category,
      secondary_category: categoryResult.rows[0]?.secondary_category,
      icon: categoryResult.rows[0]?.icon,
      color: categoryResult.rows[0]?.color
    };

    const response: ApiResponse = {
      success: true,
      data: { transaction: enhancedTransaction },
      message: '거래 내역을 조회했습니다.',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('거래 내역 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 거래 내역 수정
export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { 
      category_key, 
      transaction_type, 
      amount, 
      description, 
      transaction_date 
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // Repository를 사용하여 업데이트할 데이터 구성
    const updateData: any = {};
    if (category_key !== undefined) updateData.category_id = category_key;
    if (transaction_type !== undefined) updateData.type = transaction_type;
    if (amount !== undefined) updateData.amount = parseFloat(amount.toString());
    if (description !== undefined) updateData.description = description;
    if (transaction_date !== undefined) updateData.transaction_date = new Date(transaction_date);

    // Repository를 사용하여 거래 업데이트
    const updatedTransaction = await transactionRepository.updateTransaction(id, userId.toString(), updateData);

    if (!updatedTransaction) {
      return res.status(404).json({
        success: false,
        error: '거래 내역을 찾을 수 없습니다.'
      });
    }

    const response: ApiResponse = {
      success: true,
      data: { transaction: updatedTransaction },
      message: '거래 내역이 수정되었습니다.',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('거래 내역 수정 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 거래 내역 삭제
export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // Repository를 사용하여 거래 삭제
    const deleted = await transactionRepository.deleteTransaction(id, userId.toString());

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: '거래 내역을 찾을 수 없습니다.'
      });
    }

    const response: ApiResponse = {
      success: true,
      message: '거래 내역이 삭제되었습니다.',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('거래 내역 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 거래 통계 조회
export const getTransactionStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { start_date, end_date } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // Repository를 사용하여 통계 조회
    const startDate = start_date ? new Date(start_date as string) : undefined;
    const endDate = end_date ? new Date(end_date as string) : undefined;

    const statistics = await transactionRepository.getStatistics(userId.toString(), startDate, endDate);

    const response: ApiResponse = {
      success: true,
      data: { statistics },
      message: '거래 통계를 조회했습니다.',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('거래 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 카테고리별 요약 조회
export const getCategorySummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { start_date, end_date } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // Repository를 사용하여 카테고리별 요약 조회
    const startDate = start_date ? new Date(start_date as string) : undefined;
    const endDate = end_date ? new Date(end_date as string) : undefined;

    const summary = await transactionRepository.getCategorySummary(userId, startDate, endDate);

    const response: ApiResponse = {
      success: true,
      data: { summary },
      message: '카테고리별 요약을 조회했습니다.',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('카테고리 요약 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 월별 트렌드 조회
export const getMonthlyTrend = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { months = '12' } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // Repository를 사용하여 월별 트렌드 조회
    const monthsNum = parseInt(months as string);
    const trends = await transactionRepository.getMonthlyTrend(userId, monthsNum);

    const response: ApiResponse = {
      success: true,
      data: { trends },
      message: '월별 트렌드를 조회했습니다.',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('월별 트렌드 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 월별 통계
export const getMonthlyStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { year, month } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    if (!year || !month) {
      return res.status(400).json({
        success: false,
        error: '년도와 월이 필요합니다.'
      });
    }

    // 해당 월의 시작일과 마지막일 계산
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(parseInt(year as string), parseInt(month as string), 0).toISOString().split('T')[0];

    const result = await pool.query(
      `SELECT 
         transaction_type,
         SUM(amount) as total_amount,
         COUNT(*) as transaction_count,
         c.primary_category,
         SUM(amount) as category_total
       FROM transactions t
       LEFT JOIN categories c ON t.category_key = c.category_key
       WHERE t.user_id = $1 
         AND t.transaction_date >= $2 
         AND t.transaction_date <= $3
       GROUP BY transaction_type, c.primary_category
       ORDER BY transaction_type, category_total DESC`,
      [userId, startDate, endDate]
    );

    // 데이터 정리
    const stats = {
      income: { total: 0, categories: [] as any[] },
      expense: { total: 0, categories: [] as any[] }
    };

    result.rows.forEach(row => {
      const type = row.transaction_type;
      stats[type as keyof typeof stats].total += parseFloat(row.total_amount);
      
      if (row.primary_category) {
        stats[type as keyof typeof stats].categories.push({
          category: row.primary_category,
          amount: parseFloat(row.category_total),
          count: parseInt(row.transaction_count)
        });
      }
    });

    const response: ApiResponse = {
      success: true,
      data: { 
        stats,
        period: { year: parseInt(year as string), month: parseInt(month as string) }
      },
      message: '월별 통계를 조회했습니다.',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('월별 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};