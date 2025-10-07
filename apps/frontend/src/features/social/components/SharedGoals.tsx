/**
 * 공유 목표 컴포넌트
 * 
 * 주요 기능:
 * - 가족 단위 공유 목표 목록 표시
 * - 목표 생성 및 기여 기능
 * - 목표 진행률, 남은 기간 등 시각적 표시
 */
import React, { useState, useEffect } from 'react';
import { useSocialHooks } from '../../../features/social/hooks/useSocial';
import type { CreateGoalRequest, ContributeToGoalRequest, SharedGoal } from '../../../shared/types/social';

// 공유 목표 컴포넌트
const SharedGoals: React.FC<{ familyId: number }> = ({ familyId }) => {
  const {
    sharedGoals,
    loading,
    error,
    fetchSharedGoals,
    createSharedGoal,
    contributeToGoal,
  } = useSocialHooks();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SharedGoal | null>(null);

  // 공유 목표 목록 가져오기
  useEffect(() => {
    if (familyId) {
      fetchSharedGoals(familyId);
    }
  }, [familyId, fetchSharedGoals]);

  const handleCreateGoal = async (data: CreateGoalRequest) => {
    const newGoal = await createSharedGoal(familyId, data);
    if (newGoal) {
      setShowCreateModal(false);
    }
  };

  const handleContribute = async (data: ContributeToGoalRequest) => {
    if (selectedGoal) {
      const contribution = await contributeToGoal(familyId, selectedGoal.id, data);
      if (contribution) {
        setShowContributeModal(false);
        setSelectedGoal(null);
      }
    }
  };

  const getProgressPercentage = (goal: SharedGoal) => {
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  };

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading.sharedGoals) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl p-6 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            공유 목표
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            가족과 함께 달성할 금융 목표를 설정하고 관리하세요
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          + 새 목표 추가
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 mb-6 text-red-700 border border-red-200 rounded-lg bg-red-50">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sharedGoals.map((goal) => {
          const progress = getProgressPercentage(goal);
          const daysRemaining = getDaysRemaining(goal.target_date);
          const isCompleted = goal.status === 'completed';
          const isOverdue = daysRemaining < 0 && !isCompleted;

          return (
            <div
              key={goal.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 ${
                isCompleted
                  ? 'border-green-500'
                  : isOverdue
                  ? 'border-red-500'
                  : 'border-blue-500'
              }`}
            >
              {/* 목표 상태 배지 */}
              <div className="flex items-start justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  goal.status === 'active'
                    ? 'bg-blue-100 text-blue-800'
                    : goal.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : goal.status === 'paused'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {goal.status}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {goal.category}
                </span>
              </div>

              {/* 목표 제목 및 설명 */}
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                {goal.title}
              </h3>
              {goal.description && (
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  {goal.description}
                </p>
              )}

              {/* 진행률 */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    진행률
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {progress.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      isCompleted
                        ? 'bg-green-500'
                        : progress >= 75
                        ? 'bg-blue-500'
                        : progress >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* 금액 정보 */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">현재 금액:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {goal.current_amount.toLocaleString()}원
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">목표 금액:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {goal.target_amount.toLocaleString()}원
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">남은 금액:</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {(goal.target_amount - goal.current_amount).toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* 날짜 정보 */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">목표 날짜:</span>
                  <span className="font-medium">
                    {new Date(goal.target_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">남은 기간:</span>
                  <span className={`font-medium ${
                    isOverdue ? 'text-red-600' : daysRemaining <= 7 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {isOverdue
                      ? `${Math.abs(daysRemaining)}일 지남`
                      : daysRemaining === 0
                      ? '오늘'
                      : `${daysRemaining}일 남음`
                    }
                  </span>
                </div>
              </div>

              {/* 액션 버튼 */}
              {goal.status === 'active' && (
                <button
                  onClick={() => {
                    setSelectedGoal(goal);
                    setShowContributeModal(true);
                  }}
                  className="w-full px-4 py-2 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                >
                  기여하기
                </button>
              )}

              {isCompleted && (
                <div className="py-2 text-center">
                  <span className="font-medium text-green-600">🎉 목표 달성!</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {sharedGoals.length === 0 && (
        <div className="py-12 text-center">
          <div className="mb-4 text-gray-400">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1h-6a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1h-6a1 1 0 01-1-1v-2z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            아직 공유 목표가 없습니다
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            가족과 함께 달성할 첫 번째 목표를 만들어보세요
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            목표 만들기
          </button>
        </div>
      )}

      {/* 목표 생성 모달 */}
      {showCreateModal && (
        <CreateGoalModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGoal}
        />
      )}

      {/* 기여 모달 */}
      {showContributeModal && selectedGoal && (
        <ContributeModal
          goal={selectedGoal}
          onClose={() => {
            setShowContributeModal(false);
            setSelectedGoal(null);
          }}
          onSubmit={handleContribute}
        />
      )}
    </div>
  );
};

// 목표 생성 모달
const CreateGoalModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: CreateGoalRequest) => void;
}> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateGoalRequest>({
    title: '',
    description: '',
    target_amount: 0,
    category: '',
    target_date: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const categories = [
    '비상 자금',
    '휴가/여행',
    '주택 구매',
    '자동차 구매',
    '교육비',
    '투자',
    '기타',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          새 공유 목표 만들기
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              목표 제목 *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="새 차 구매하기"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="목표에 대한 상세 설명을 입력하세요"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              목표 금액 *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.target_amount}
              onChange={(e) => setFormData({ ...formData, target_amount: Number(e.target.value) })}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="1000000"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              카테고리 *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">카테고리를 선택하세요</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              목표 날짜 *
            </label>
            <input
              type="date"
              required
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="flex justify-end pt-4 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              만들기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 기여 모달
const ContributeModal: React.FC<{
  goal: SharedGoal;
  onClose: () => void;
  onSubmit: (data: ContributeToGoalRequest) => void;
}> = ({ goal, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<ContributeToGoalRequest>({
    amount: 0,
    note: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const remainingAmount = goal.target_amount - goal.current_amount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          목표에 기여하기
        </h3>

        <div className="p-4 mb-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <h4 className="mb-2 font-medium text-blue-900 dark:text-blue-100">{goal.title}</h4>
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p>목표 금액: {goal.target_amount.toLocaleString()}원</p>
            <p>현재 금액: {goal.current_amount.toLocaleString()}원</p>
            <p>남은 금액: {remainingAmount.toLocaleString()}원</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              기여 금액 *
            </label>
            <input
              type="number"
              required
              min="1"
              max={remainingAmount}
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="50000"
            />
            <p className="mt-1 text-xs text-gray-500">
              최대 {remainingAmount.toLocaleString()}원까지 기여할 수 있습니다
            </p>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              메모
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="기여에 대한 메모를 남겨보세요"
            />
          </div>

          <div className="flex justify-end pt-4 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              기여하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SharedGoals;
