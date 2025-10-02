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

export class SocialApiService {
  // 가족/그룹 관련 API
  static async getFamilies(): Promise<Family[]> {
    const response = await apiClient.get<ApiResponse<Family[]>>('/social/families');
    return response.data.data || [];
  }

  static async getFamily(familyId: number): Promise<Family> {
    const response = await apiClient.get<ApiResponse<Family>>(`/social/families/${familyId}`);
    if (!response.data.data) throw new Error('Family not found');
    return response.data.data;
  }

  static async createFamily(data: CreateFamilyRequest): Promise<Family> {
    const response = await apiClient.post<ApiResponse<Family>>('/social/families', data);
    if (!response.data.data) throw new Error('Failed to create family');
    return response.data.data;
  }

  static async updateFamily(familyId: number, data: Partial<CreateFamilyRequest>): Promise<Family> {
    const response = await apiClient.put<ApiResponse<Family>>(`/social/families/${familyId}`, data);
    if (!response.data.data) throw new Error('Failed to update family');
    return response.data.data;
  }

  static async deleteFamily(familyId: number): Promise<void> {
    await apiClient.delete(`/social/families/${familyId}`);
  }

  // 가족 구성원 관련 API
  static async getFamilyMembers(familyId: number): Promise<FamilyMember[]> {
    const response = await apiClient.get<ApiResponse<FamilyMember[]>>(`/social/families/${familyId}/members`);
    return response.data.data || [];
  }

  static async inviteMember(familyId: number, data: InviteMemberRequest): Promise<FamilyMember> {
    const response = await apiClient.post<ApiResponse<FamilyMember>>(`/social/families/${familyId}/invite`, data);
    if (!response.data.data) throw new Error('Failed to invite member');
    return response.data.data;
  }

  static async updateMemberRole(familyId: number, memberId: number, role: string, permissions?: FamilyMember['permissions']): Promise<FamilyMember> {
    const response = await apiClient.put<ApiResponse<FamilyMember>>(`/social/families/${familyId}/members/${memberId}`, {
      role,
      permissions
    });
    if (!response.data.data) throw new Error('Failed to update member role');
    return response.data.data;
  }

  static async removeMember(familyId: number, memberId: number): Promise<void> {
    await apiClient.delete(`/social/families/${familyId}/members/${memberId}`);
  }

  static async respondToInvitation(familyId: number, action: 'accept' | 'decline'): Promise<void> {
    await apiClient.post(`/social/families/${familyId}/invitation/${action}`);
  }

  // 공유 목표 관련 API
  static async getSharedGoals(familyId: number): Promise<SharedGoal[]> {
    const response = await apiClient.get<ApiResponse<SharedGoal[]>>(`/social/families/${familyId}/goals`);
    return response.data.data || [];
  }

  static async getSharedGoal(familyId: number, goalId: number): Promise<SharedGoal> {
    const response = await apiClient.get<ApiResponse<SharedGoal>>(`/social/families/${familyId}/goals/${goalId}`);
    if (!response.data.data) throw new Error('Goal not found');
    return response.data.data;
  }

  static async createSharedGoal(familyId: number, data: CreateGoalRequest): Promise<SharedGoal> {
    const response = await apiClient.post<ApiResponse<SharedGoal>>(`/social/families/${familyId}/goals`, data);
    if (!response.data.data) throw new Error('Failed to create goal');
    return response.data.data;
  }

  static async updateSharedGoal(familyId: number, goalId: number, data: Partial<CreateGoalRequest>): Promise<SharedGoal> {
    const response = await apiClient.put<ApiResponse<SharedGoal>>(`/social/families/${familyId}/goals/${goalId}`, data);
    if (!response.data.data) throw new Error('Failed to update goal');
    return response.data.data;
  }

  static async deleteSharedGoal(familyId: number, goalId: number): Promise<void> {
    await apiClient.delete(`/social/families/${familyId}/goals/${goalId}`);
  }

  // 목표 기여 관련 API
  static async getGoalContributions(familyId: number, goalId: number): Promise<GoalContribution[]> {
    const response = await apiClient.get<ApiResponse<GoalContribution[]>>(`/social/families/${familyId}/goals/${goalId}/contributions`);
    return response.data.data || [];
  }

  static async contributeToGoal(familyId: number, goalId: number, data: ContributeToGoalRequest): Promise<GoalContribution> {
    const response = await apiClient.post<ApiResponse<GoalContribution>>(`/social/families/${familyId}/goals/${goalId}/contribute`, data);
    if (!response.data.data) throw new Error('Failed to contribute to goal');
    return response.data.data;
  }

  // 가족 거래 관련 API
  static async getFamilyTransactions(familyId: number, page = 1, limit = 20): Promise<PaginatedResponse<FamilyTransaction>> {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<FamilyTransaction>>>(`/social/families/${familyId}/transactions?page=${page}&limit=${limit}`);
    if (!response.data.data) throw new Error('Failed to fetch transactions');
    return response.data.data;
  }

  static async createFamilyTransaction(familyId: number, data: CreateFamilyTransactionRequest): Promise<FamilyTransaction> {
    const response = await apiClient.post<ApiResponse<FamilyTransaction>>(`/social/families/${familyId}/transactions`, data);
    if (!response.data.data) throw new Error('Failed to create transaction');
    return response.data.data;
  }

  static async updateFamilyTransaction(familyId: number, transactionId: number, data: Partial<CreateFamilyTransactionRequest>): Promise<FamilyTransaction> {
    const response = await apiClient.put<ApiResponse<FamilyTransaction>>(`/social/families/${familyId}/transactions/${transactionId}`, data);
    if (!response.data.data) throw new Error('Failed to update transaction');
    return response.data.data;
  }

  static async deleteFamilyTransaction(familyId: number, transactionId: number): Promise<void> {
    await apiClient.delete(`/social/families/${familyId}/transactions/${transactionId}`);
  }

  // 커뮤니티 게시글 관련 API
  static async getCommunityPosts(category?: string, page = 1, limit = 20): Promise<PaginatedResponse<CommunityPost>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (category) params.append('category', category);
    
    const response = await apiClient.get<ApiResponse<PaginatedResponse<CommunityPost>>>(`/social/community/posts?${params}`);
    if (!response.data.data) throw new Error('Failed to fetch posts');
    return response.data.data;
  }

  static async getCommunityPost(postId: number): Promise<CommunityPost> {
    const response = await apiClient.get<ApiResponse<CommunityPost>>(`/social/community/posts/${postId}`);
    if (!response.data.data) throw new Error('Post not found');
    return response.data.data;
  }

  static async createCommunityPost(data: CreatePostRequest): Promise<CommunityPost> {
    const response = await apiClient.post<ApiResponse<CommunityPost>>('/social/community/posts', data);
    if (!response.data.data) throw new Error('Failed to create post');
    return response.data.data;
  }

  static async updateCommunityPost(postId: number, data: Partial<CreatePostRequest>): Promise<CommunityPost> {
    const response = await apiClient.put<ApiResponse<CommunityPost>>(`/social/community/posts/${postId}`, data);
    if (!response.data.data) throw new Error('Failed to update post');
    return response.data.data;
  }

  static async deleteCommunityPost(postId: number): Promise<void> {
    await apiClient.delete(`/social/community/posts/${postId}`);
  }

  static async likeCommunityPost(postId: number): Promise<void> {
    await apiClient.post(`/social/community/posts/${postId}/like`);
  }

  static async unlikeCommunityPost(postId: number): Promise<void> {
    await apiClient.delete(`/social/community/posts/${postId}/like`);
  }

  // 댓글 관련 API
  static async getPostComments(postId: number): Promise<PostComment[]> {
    const response = await apiClient.get<ApiResponse<PostComment[]>>(`/social/community/posts/${postId}/comments`);
    return response.data.data || [];
  }

  static async createComment(postId: number, data: CreateCommentRequest): Promise<PostComment> {
    const response = await apiClient.post<ApiResponse<PostComment>>(`/social/community/posts/${postId}/comments`, data);
    if (!response.data.data) throw new Error('Failed to create comment');
    return response.data.data;
  }

  static async updateComment(postId: number, commentId: number, data: Partial<CreateCommentRequest>): Promise<PostComment> {
    const response = await apiClient.put<ApiResponse<PostComment>>(`/social/community/posts/${postId}/comments/${commentId}`, data);
    if (!response.data.data) throw new Error('Failed to update comment');
    return response.data.data;
  }

  static async deleteComment(postId: number, commentId: number): Promise<void> {
    await apiClient.delete(`/social/community/posts/${postId}/comments/${commentId}`);
  }

  static async likeComment(postId: number, commentId: number): Promise<void> {
    await apiClient.post(`/social/community/posts/${postId}/comments/${commentId}/like`);
  }

  static async unlikeComment(postId: number, commentId: number): Promise<void> {
    await apiClient.delete(`/social/community/posts/${postId}/comments/${commentId}/like`);
  }
}
