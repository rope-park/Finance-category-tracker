/**
 * 가족 그룹 관리 컴포넌트
 * 
 * 주요 기능:
 * - 가족 그룹 생성, 삭제
 * - 구성원 초대, 역할 변경, 제거
 * - 가족 그룹 및 구성원 목록 표시
 */
import React, { useState, useEffect } from 'react';
import { useSocialHooks } from '../../../features/social/hooks/useSocial';
import type { CreateFamilyRequest, InviteMemberRequest } from '../../../shared/types/social';

/**
 * 가족 그룹 관리 컴포넌트
 * @returns 가족 그룹 관리 컴포넌트
 */
const FamilyManagement: React.FC = () => {
  const {
    families,
    currentFamily,
    familyMembers,
    loading,
    error,
    fetchFamilies,
    fetchFamily,
    createFamily,
    deleteFamily,
    fetchFamilyMembers,
    inviteMember,
    updateMemberRole,
    removeMember,
    setCurrentFamily,
  } = useSocialHooks();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null);

  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);

  useEffect(() => {
    if (selectedFamilyId) {
      fetchFamily(selectedFamilyId);
      fetchFamilyMembers(selectedFamilyId);
    }
  }, [selectedFamilyId, fetchFamily, fetchFamilyMembers]);

  const handleCreateFamily = async (data: CreateFamilyRequest) => {
    const newFamily = await createFamily(data);
    if (newFamily) {
      setShowCreateModal(false);
      setSelectedFamilyId(newFamily.id);
    }
  };

  const handleInviteMember = async (data: InviteMemberRequest) => {
    if (selectedFamilyId) {
      const newMember = await inviteMember(selectedFamilyId, data);
      if (newMember) {
        setShowInviteModal(false);
      }
    }
  };

  const handleDeleteFamily = async (familyId: number) => {
    if (window.confirm('정말로 이 가족 그룹을 삭제하시겠습니까?')) {
      const success = await deleteFamily(familyId);
      if (success && selectedFamilyId === familyId) {
        setSelectedFamilyId(null);
        setCurrentFamily(null);
      }
    }
  };

  const handleUpdateMemberRole = async (memberId: number, role: string) => {
    if (selectedFamilyId) {
      await updateMemberRole(selectedFamilyId, memberId, role);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (selectedFamilyId && window.confirm('정말로 이 구성원을 제거하시겠습니까?')) {
      await removeMember(selectedFamilyId, memberId);
    }
  };

  if (loading.families) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl p-6 mx-auto">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          가족 그룹 관리
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          가족과 함께 예산을 관리하고 금융 목표를 공유하세요
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 mb-6 text-red-700 border border-red-200 rounded-lg bg-red-50">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 가족 목록 */}
        <div className="lg:col-span-1">
          <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                내 가족 그룹
              </h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                + 새 그룹
              </button>
            </div>

            <div className="space-y-3">
              {families.map((family) => (
                <div
                  key={family.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedFamilyId === family.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedFamilyId(family.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {family.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {family.description || '설명 없음'}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <span className="mr-3">통화: {family.currency}</span>
                        <span className={`px-2 py-1 rounded-full ${
                          family.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {family.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFamily(family.id);
                      }}
                      className="text-sm text-red-500 hover:text-red-700"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}

              {families.length === 0 && (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  <p>아직 가족 그룹이 없습니다.</p>
                  <p className="mt-1 text-sm">새 그룹을 만들어보세요!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 가족 상세 정보 */}
        <div className="lg:col-span-2">
          {currentFamily ? (
            <div className="space-y-6">
              {/* 가족 정보 */}
              <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {currentFamily.name}
                    </h2>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                      {currentFamily.description}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
                  >
                    구성원 초대
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">통화:</span>
                    <span className="ml-2 font-medium">{currentFamily.currency}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">공유 예산:</span>
                    <span className="ml-2 font-medium">
                      {currentFamily.shared_budget 
                        ? `${currentFamily.shared_budget.toLocaleString()} ${currentFamily.currency}`
                        : '설정되지 않음'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">상태:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      currentFamily.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {currentFamily.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">생성일:</span>
                    <span className="ml-2 font-medium">
                      {new Date(currentFamily.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* 구성원 목록 */}
              <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  구성원 ({familyMembers.length}명)
                </h3>

                {loading.familyMembers ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {familyMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg dark:border-gray-700"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full dark:bg-blue-900">
                            <span className="font-medium text-blue-600 dark:text-blue-400">
                              {member.user?.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {member.user?.name || '알 수 없음'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {member.user?.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            member.role === 'owner'
                              ? 'bg-purple-100 text-purple-800'
                              : member.role === 'admin'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {member.role}
                          </span>

                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            member.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : member.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {member.status}
                          </span>

                          {member.role !== 'owner' && (
                            <div className="flex space-x-2">
                              <select
                                value={member.role}
                                onChange={(e) => handleUpdateMemberRole(member.id, e.target.value)}
                                className="px-2 py-1 text-xs border border-gray-300 rounded"
                              >
                                <option value="member">구성원</option>
                                <option value="admin">관리자</option>
                              </select>
                              <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="text-sm text-red-500 hover:text-red-700"
                              >
                                제거
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-lg shadow-md dark:bg-gray-800">
              <div className="mb-4 text-gray-400">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                가족 그룹을 선택하세요
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                왼쪽에서 가족 그룹을 선택하거나 새로운 그룹을 만들어보세요
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 가족 생성 모달 */}
      {showCreateModal && (
        <CreateFamilyModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateFamily}
        />
      )}

      {/* 구성원 초대 모달 */}
      {showInviteModal && (
        <InviteMemberModal
          onClose={() => setShowInviteModal(false)}
          onSubmit={handleInviteMember}
        />
      )}
    </div>
  );
};

/**
 * 가족 생성 모달 컴포넌트
 * @param onClose 모달 닫기 핸들러
 * @param onSubmit 가족 생성 핸들러
 * @returns 가족 생성 모달 컴포넌트
 */
const CreateFamilyModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: CreateFamilyRequest) => void;
}> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateFamilyRequest>({
    name: '',
    description: '',
    currency: 'KRW',
    shared_budget: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          새 가족 그룹 만들기
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              그룹 이름 *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="우리 가족"
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
              placeholder="가족 그룹에 대한 설명을 입력하세요"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              통화
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="KRW">KRW (원)</option>
              <option value="USD">USD (달러)</option>
              <option value="EUR">EUR (유로)</option>
              <option value="JPY">JPY (엔)</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              공유 예산
            </label>
            <input
              type="number"
              value={formData.shared_budget}
              onChange={(e) => setFormData({ ...formData, shared_budget: Number(e.target.value) })}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="0"
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

/**
 * 구성원 초대 모달 컴포넌트  
 * @param param0  onClose 모달 닫기 핸들러
 * @param param1 onSubmit 구성원 초대 핸들러
 * @returns 구성원 초대 모달 컴포넌트
 */
const InviteMemberModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: InviteMemberRequest) => void;
}> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<InviteMemberRequest>({
    email: '',
    role: 'member',
    permissions: {
      can_view_budget: true,
      can_edit_budget: false,
      can_add_transactions: true,
      can_view_reports: true,
      can_invite_members: false,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          구성원 초대
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              이메일 주소 *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              역할
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'member' })}
              className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="member">구성원</option>
              <option value="admin">관리자</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              권한 설정
            </label>
            <div className="space-y-2">
              {Object.entries({
                can_view_budget: '예산 보기',
                can_edit_budget: '예산 편집',
                can_add_transactions: '거래 추가',
                can_view_reports: '리포트 보기',
                can_invite_members: '구성원 초대',
              }).map(([key, label]) => (
                <label key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.permissions?.[key as keyof typeof formData.permissions] || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      permissions: {
                        ...formData.permissions,
                        [key]: e.target.checked,
                      },
                    })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>
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
              초대하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FamilyManagement;
