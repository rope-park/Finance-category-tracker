import React, { useState, useRef } from 'react'
import type { Transaction } from '@finance-tracker/shared'

interface TransactionFormProps {
  onSubmit?: (transaction: Partial<Transaction>) => void
  initialData?: Partial<Transaction>
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  initialData = {}
}) => {
  const [formData, setFormData] = useState({
    amount: initialData.amount || 0,
    description: initialData.description || '',
    category_key: initialData.category_key || 'food',
    transaction_type: initialData.transaction_type || 'expense' as const,
    transaction_date: initialData.transaction_date || new Date().toISOString().split('T')[0]
  })
  const [recommendedCategory, setRecommendedCategory] = useState<string | null>(null);
  const [recommendConfidence, setRecommendConfidence] = useState<number | null>(null);
  const recommendTimeout = useRef<NodeJS.Timeout | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = '금액은 필수입니다'
    }

    if (!formData.description.trim()) {
      newErrors.description = '설명은 필수입니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const token = localStorage.getItem('authToken')
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('API Error')
      }

      const result = await response.json()
      
      if (onSubmit) {
        onSubmit(result.data)
      }

      // 성공 시 폼 초기화
      setFormData({
        amount: 0,
        description: '',
        category_key: 'food',
        transaction_type: 'expense',
        transaction_date: new Date().toISOString().split('T')[0]
      })
    } catch {
      setSubmitError('오류가 발생했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

    // description 입력 시 실시간 카테고리 추천
  const handleChange = (key: string, value: string | number) => {
      setFormData((prev) => ({ ...prev, [key]: value }))
      if (key === 'description') {
        if (recommendTimeout.current) clearTimeout(recommendTimeout.current);
        // debounce 400ms
        recommendTimeout.current = setTimeout(async () => {
          if (typeof value === 'string' && value.trim().length > 1) {
            try {
              // 백엔드 자동 분류 API 호출
              const res = await fetch('http://localhost:3001/api/transactions/auto-category-predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}` },
                body: JSON.stringify({ description: value })
              });
              const data = await res.json();
              if (data.success && data.data && data.data.category) {
                setRecommendedCategory(data.data.category);
                setRecommendConfidence(data.data.confidence);
                // 자동 선택 UX: select 값도 추천값으로 변경
                setFormData((prev) => ({ ...prev, category_key: data.data.category }));
              } else {
                setRecommendedCategory(null);
                setRecommendConfidence(null);
              }
            } catch {
              setRecommendedCategory(null);
              setRecommendConfidence(null);
            }
          } else {
            setRecommendedCategory(null);
            setRecommendConfidence(null);
          }
        }, 400);
      }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          금액
        </label>
        <input
          type="number"
          id="amount"
          value={formData.amount}
          onChange={(e) => handleChange('amount', Number(e.target.value))}
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          설명
        </label>
        <input
          type="text"
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
          {recommendedCategory && (
            <div className="mt-1 text-xs text-blue-600">
              추천 카테고리: <b>{recommendedCategory}</b>
              {recommendConfidence !== null && ` (신뢰도: ${Math.round(recommendConfidence * 100)}%)`}
            </div>
          )}
        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
      </div>

      <div>
        <label htmlFor="category_key" className="block text-sm font-medium text-gray-700">
          카테고리
        </label>
        <select
          id="category_key"
          value={formData.category_key}
          onChange={(e) => handleChange('category_key', e.target.value)}
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="food">식비</option>
          <option value="transport">교통비</option>
          <option value="entertainment">오락비</option>
          <option value="salary">급여</option>
          <option value="investment">투자</option>
        </select>
      </div>

      <div>
        <label htmlFor="transaction_type" className="block text-sm font-medium text-gray-700">
          거래 유형
        </label>
        <select
          id="transaction_type"
          value={formData.transaction_type}
          onChange={(e) => handleChange('transaction_type', e.target.value)}
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="expense">지출</option>
          <option value="income">수입</option>
        </select>
      </div>

      <div>
        <label htmlFor="transaction_date" className="block text-sm font-medium text-gray-700">
          거래 날짜
        </label>
        <input
          type="date"
          id="transaction_date"
          value={formData.transaction_date}
          onChange={(e) => handleChange('transaction_date', e.target.value)}
          className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {submitError && (
        <div className="text-sm text-red-600">{submitError}</div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isSubmitting ? '저장 중...' : '저장'}
      </button>
    </form>
  )
}

export default TransactionForm