import React, { useState } from 'react'
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

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // 에러 초기화
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {submitError && (
        <div className="text-red-600 text-sm">{submitError}</div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isSubmitting ? '저장 중...' : '저장'}
      </button>
    </form>
  )
}

export default TransactionForm
