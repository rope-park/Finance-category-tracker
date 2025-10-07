/**
 * 소셜 기능 관련 API 서비스
 * 
 * 주요 기능:
 * - 가족/그룹 관리: 가족 생성, 구성원 초대, 역할 관리
 * - 공유 목표: 목표 생성, 기여, 진행 상황 추적
 * - 가족 거래: 거래 내역 추가, 수정, 삭제
 * - 커뮤니티 게시판: 게시글 작성, 댓글, 좋아요 기능
 */
import axios from 'axios';
import type {
  Family,
  FamilyMember,
  SharedGoal,
  GoalContribution,
  FamilyTransaction,
  CommunityPost,
  PostComment,
  CreateFamilyRequest,
  InviteMemberRequest,
  CreateGoalRequest,
  ContributeToGoalRequest,
  CreateFamilyTransactionRequest,
  CreatePostRequest,
  CreateCommentRequest,
  ApiResponse,
  PaginatedResponse
} from '../../../index';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API 클라이언트 설정
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 인터셉터
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 소셜 API 서비스 클래스
 */
export class SocialApiService {
  /**
   * 가족 목록 조회
   * @returns 가족 목록
   */
  static async getFamilies(): Promise<Family[]> {
    const response = await apiClient.get<ApiResponse<Family[]>>('/social/families');
    return response.data.data || [];
  }

  /**
   * 가족 상세 조회
   * @param familyId 가족 ID
   * @returns 가족 정보
   */
  static async getFamily(familyId: number): Promise<Family> {
    const response = await apiClient.get<ApiResponse<Family>>(`/social/families/${familyId}`);
    if (!response.data.data) throw new Error('Family not found');
    return response.data.data;
  }

  /**
   * 가족 생성
   * @param data 가족 생성 요청 데이터
   * @returns 생성된 가족 정보  
   */
  static async createFamily(data: CreateFamilyRequest): Promise<Family> {
    const response = await apiClient.post<ApiResponse<Family>>('/social/families', data);
    if (!response.data.data) throw new Error('Failed to create family');
    return response.data.data;
  }

  /**
   * 가족 정보 수정
   * @param familyId 가족 ID
   * @param data 수정할 가족 정보
   * @returns 수정된 가족 정보
   */
  static async updateFamily(familyId: number, data: Partial<CreateFamilyRequest>): Promise<Family> {
    const response = await apiClient.put<ApiResponse<Family>>(`/social/families/${familyId}`, data);
    if (!response.data.data) throw new Error('Failed to update family');
    return response.data.data;
  }

  /**
   * 가족 삭제
   * @param familyId 가족 ID
   * @returns void
   */
  static async deleteFamily(familyId: number): Promise<void> {
    await apiClient.delete(`/social/families/${familyId}`);
  }

  /**
   * 가족 구성원 목록 조회
   * @param familyId 가족 ID
   * @returns 가족 구성원 목록
   */
  static async getFamilyMembers(familyId: number): Promise<FamilyMember[]> {
    const response = await apiClient.get<ApiResponse<FamilyMember[]>>(`/social/families/${familyId}/members`);
    return response.data.data || [];
  }

  /**
   * 가족 구성원 초대
   * @param familyId 가족 ID
   * @param data 초대 요청 데이터
   * @returns 초대된 가족 구성원 정보
   */
  static async inviteMember(familyId: number, data: InviteMemberRequest): Promise<FamilyMember> {
    const response = await apiClient.post<ApiResponse<FamilyMember>>(`/social/families/${familyId}/invite`, data);
    if (!response.data.data) throw new Error('Failed to invite member');
    return response.data.data;
  }

  /**
   * 가족 구성원 역할 및 권한 수정
   * @param familyId 가족 ID
   * @param memberId 구성원 ID
   * @param role 수정할 역할
   * @param permissions 수정할 권한
   * @returns 수정된 가족 구성원 정보
   */
  static async updateMemberRole(familyId: number, memberId: number, role: string, permissions?: FamilyMember['permissions']): Promise<FamilyMember> {
    const response = await apiClient.put<ApiResponse<FamilyMember>>(`/social/families/${familyId}/members/${memberId}`, {
      role,
      permissions
    });
    if (!response.data.data) throw new Error('Failed to update member role');
    return response.data.data;
  }

  /**
   * 가족 구성원 제거
   * @param familyId 가족 ID
   * @param memberId 구성원 ID
   * @returns void
   */
  static async removeMember(familyId: number, memberId: number): Promise<void> {
    await apiClient.delete(`/social/families/${familyId}/members/${memberId}`);
  }

  /**
   * 가족 초대 응답 (수락/거절)
   * @param familyId 가족 ID
   * @param action 'accept' | 'decline'
   * @returns void
   */
  static async respondToInvitation(familyId: number, action: 'accept' | 'decline'): Promise<void> {
    await apiClient.post(`/social/families/${familyId}/invitation/${action}`);
  }

  /**
   * 가족 공유 목표 조회
   * @param familyId 가족 ID
   * @returns 가족 공유 목표 목록
   */
  static async getSharedGoals(familyId: number): Promise<SharedGoal[]> {
    const response = await apiClient.get<ApiResponse<SharedGoal[]>>(`/social/families/${familyId}/goals`);
    return response.data.data || [];
  }

  /** 목표 상세 조회
   * @param familyId 가족 ID
   * @param goalId 목표 ID
   * @returns 목표 정보
   */
  static async getSharedGoal(familyId: number, goalId: number): Promise<SharedGoal> {
    const response = await apiClient.get<ApiResponse<SharedGoal>>(`/social/families/${familyId}/goals/${goalId}`);
    if (!response.data.data) throw new Error('Goal not found');
    return response.data.data;
  }

  /** 목표 생성
   * @param familyId 가족 ID
   * @param data 목표 생성 요청 데이터
   * @returns 생성된 목표 정보
   */
  static async createSharedGoal(familyId: number, data: CreateGoalRequest): Promise<SharedGoal> {
    const response = await apiClient.post<ApiResponse<SharedGoal>>(`/social/families/${familyId}/goals`, data);
    if (!response.data.data) throw new Error('Failed to create goal');
    return response.data.data;
  }

  /** 목표 수정
   * @param familyId 가족 ID
   * @param goalId 목표 ID
   * @param data 수정할 목표 데이터
   * @returns 수정된 목표 정보
   */
  static async updateSharedGoal(familyId: number, goalId: number, data: Partial<CreateGoalRequest>): Promise<SharedGoal> {
    const response = await apiClient.put<ApiResponse<SharedGoal>>(`/social/families/${familyId}/goals/${goalId}`, data);
    if (!response.data.data) throw new Error('Failed to update goal');
    return response.data.data;
  }

  /** 목표 삭제
   * @param familyId 가족 ID
   * @param goalId 목표 ID
   * @returns void
   */
  static async deleteSharedGoal(familyId: number, goalId: number): Promise<void> {
    await apiClient.delete(`/social/families/${familyId}/goals/${goalId}`);
  }

  /** 목표 기여 내역 조회
   * @param familyId 가족 ID
   * @param goalId 목표 ID
   * @returns 목표 기여 내역 목록
   */
  static async getGoalContributions(familyId: number, goalId: number): Promise<GoalContribution[]> {
    const response = await apiClient.get<ApiResponse<GoalContribution[]>>(`/social/families/${familyId}/goals/${goalId}/contributions`);
    return response.data.data || [];
  }

  /** 목표 기여
   * @param familyId 가족 ID
   * @param goalId 목표 ID
   * @param data 기여 요청 데이터
   * @returns 생성된 기여 정보
   */
  static async contributeToGoal(familyId: number, goalId: number, data: ContributeToGoalRequest): Promise<GoalContribution> {
    const response = await apiClient.post<ApiResponse<GoalContribution>>(`/social/families/${familyId}/goals/${goalId}/contribute`, data);
    if (!response.data.data) throw new Error('Failed to contribute to goal');
    return response.data.data;
  }

  /**
   * 가족 거래 내역 조회
   * @param familyId 가족 ID
   * @param page 페이지 번호
   * @param limit 페이지당 개수
   * @returns 가족 거래 내역 목록 (페이징 포함)
   */
  static async getFamilyTransactions(familyId: number, page = 1, limit = 20): Promise<PaginatedResponse<FamilyTransaction>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<FamilyTransaction>>>(`/social/families/${familyId}/transactions?page=${page}&limit=${limit}`);
    if (!response.data.data) throw new Error('Failed to fetch transactions');
    return response.data.data;
  }

  /** 가족 거래 내역 생성
   * @param familyId 가족 ID
   * @param data 거래 생성 요청 데이터
   * @returns 생성된 거래 정보
   */
  static async createFamilyTransaction(familyId: number, data: CreateFamilyTransactionRequest): Promise<FamilyTransaction> {
    const response = await apiClient.post<ApiResponse<FamilyTransaction>>(`/social/families/${familyId}/transactions`, data);
    if (!response.data.data) throw new Error('Failed to create transaction');
    return response.data.data;
  }

  /** 가족 거래 내역 수정
   * @param familyId 가족 ID
   * @param transactionId 거래 ID
   * @param data 수정할 거래 데이터
   * @returns 수정된 거래 정보
   */
  static async updateFamilyTransaction(familyId: number, transactionId: number, data: Partial<CreateFamilyTransactionRequest>): Promise<FamilyTransaction> {
    const response = await apiClient.put<ApiResponse<FamilyTransaction>>(`/social/families/${familyId}/transactions/${transactionId}`, data);
    if (!response.data.data) throw new Error('Failed to update transaction');
    return response.data.data;
  }

  /** 가족 거래 내역 삭제
   * @param familyId 가족 ID
   * @param transactionId 거래 ID
   * @returns void
   */
  static async deleteFamilyTransaction(familyId: number, transactionId: number): Promise<void> {
    await apiClient.delete(`/social/families/${familyId}/transactions/${transactionId}`);
  }

  /**
   * 커뮤니티 게시글 목록 조회
   * @param category 카테고리 (선택 사항)
   * @param page 페이지 번호
   * @param limit 페이지당 개수
   * @returns 커뮤니티 게시글 목록 (페이징 포함)
   */
  static async getCommunityPosts(category?: string, page = 1, limit = 20): Promise<PaginatedResponse<CommunityPost>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (category) params.append('category', category);
    
    const response = await apiClient.get<ApiResponse<PaginatedResponse<CommunityPost>>>(`/social/community/posts?${params}`);
    if (!response.data.data) throw new Error('Failed to fetch posts');
    return response.data.data;
  }

  /** 게시글 상세 조회
   * @param postId 게시글 ID
   * @returns 게시글 정보
   */
  static async getCommunityPost(postId: number): Promise<CommunityPost> {
    const response = await apiClient.get<ApiResponse<CommunityPost>>(`/social/community/posts/${postId}`);
    if (!response.data.data) throw new Error('Post not found');
    return response.data.data;
  }

  /** 게시글 생성
   * @param data 게시글 생성 요청 데이터
   * @returns 생성된 게시글 정보
   */
  static async createCommunityPost(data: CreatePostRequest): Promise<CommunityPost> {
    const response = await apiClient.post<ApiResponse<CommunityPost>>('/social/community/posts', data);
    if (!response.data.data) throw new Error('Failed to create post');
    return response.data.data;
  }

  /** 게시글 수정
   * @param postId 게시글 ID
   * @param data 수정할 게시글 데이터
   * @returns 수정된 게시글 정보
   */
  static async updateCommunityPost(postId: number, data: Partial<CreatePostRequest>): Promise<CommunityPost> {
    const response = await apiClient.put<ApiResponse<CommunityPost>>(`/social/community/posts/${postId}`, data);
    if (!response.data.data) throw new Error('Failed to update post');
    return response.data.data;
  }

  /** 게시글 삭제
   * @param postId 게시글 ID
   * @returns void
   */
  static async deleteCommunityPost(postId: number): Promise<void> {
    await apiClient.delete(`/social/community/posts/${postId}`);
  }

  /** 게시글 좋아요
   * @param postId 게시글 ID
   */
  static async likeCommunityPost(postId: number): Promise<void> {
    await apiClient.post(`/social/community/posts/${postId}/like`);
  }

  /** 게시글 좋아요 취소
   * @param postId 게시글 ID
   */
  static async unlikeCommunityPost(postId: number): Promise<void> {
    await apiClient.delete(`/social/community/posts/${postId}/like`);
  }

  /**
   * 게시글 댓글 목록 조회
   * @param postId 게시글 ID
   * @returns 댓글 목록
   */
  static async getPostComments(postId: number): Promise<PostComment[]> {
    const response = await apiClient.get<ApiResponse<PostComment[]>>(`/social/community/posts/${postId}/comments`);
    return response.data.data || [];
  }

  /** 게시글 댓글 생성
   * @param postId 게시글 ID
   * @param data 댓글 생성 요청 데이터
   * @returns 생성된 댓글 정보
   */
  static async createComment(postId: number, data: CreateCommentRequest): Promise<PostComment> {
    const response = await apiClient.post<ApiResponse<PostComment>>(`/social/community/posts/${postId}/comments`, data);
    if (!response.data.data) throw new Error('Failed to create comment');
    return response.data.data;
  }

  /** 게시글 댓글 수정
   * @param postId 게시글 ID
   * @param commentId 댓글 ID
   * @param data 수정할 댓글 내용
   * @returns 수정된 댓글 정보
   */
  static async updateComment(postId: number, commentId: number, data: Partial<CreateCommentRequest>): Promise<PostComment> {
    const response = await apiClient.put<ApiResponse<PostComment>>(`/social/community/posts/${postId}/comments/${commentId}`, data);
    if (!response.data.data) throw new Error('Failed to update comment');
    return response.data.data;
  }

  /** 게시글 댓글 삭제
   * @param postId 게시글 ID
   * @param commentId 댓글 ID
   */
  static async deleteComment(postId: number, commentId: number): Promise<void> {
    await apiClient.delete(`/social/community/posts/${postId}/comments/${commentId}`);
  }

  /** 게시글 댓글 좋아요
   * @param postId 게시글 ID
   * @param commentId 댓글 ID
   */
  static async likeComment(postId: number, commentId: number): Promise<void> {
    await apiClient.post(`/social/community/posts/${postId}/comments/${commentId}/like`);
  }

  /** 게시글 댓글 좋아요 취소
   * @param postId 게시글 ID
   * @param commentId 댓글 ID
   */
  static async unlikeComment(postId: number, commentId: number): Promise<void> {
    await apiClient.delete(`/social/community/posts/${postId}/comments/${commentId}/like`);
  }
}
