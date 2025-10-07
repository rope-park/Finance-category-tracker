/**
 * 소셜 기능 관련 훅
 * 
 * 가족/그룹 관리, 가족 구성원 관리, 공유 목표, 가족 거래, 커뮤니티 게시물 및 댓글 관리 등을 포함
 * 
 * 주요 기능:
 * - 가족/그룹 생성, 조회, 수정, 삭제
 * - 가족 구성원 초대, 역할 변경, 삭제
 * - 공유 목표 생성, 조회, 기여
 */
import { useCallback } from 'react';
import { useSocialStore } from '../../../app/store/socialStore';
import { SocialApiService } from '../../../features/social/services/socialApi';
import type {
  CreateFamilyRequest,
  InviteMemberRequest,
  CreateGoalRequest,
  ContributeToGoalRequest,
  CreateFamilyTransactionRequest,
  CreatePostRequest,
  CreateCommentRequest,
  FamilyMember
} from '../../../shared/types/social';

/**
 * 소셜 훅 모음
 * 
 * useSocialStore를 사용하여 상태 관리
 */
export const useSocialHooks = () => {
  const store = useSocialStore();

  // 가족/그룹 관련 훅
  const fetchFamilies = useCallback(async () => {
    try {
      store.setLoading('families', true);
      store.setError(null);
      const families = await SocialApiService.getFamilies();
      store.setFamilies(families);
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to fetch families');
    } finally {
      store.setLoading('families', false);
    }
  }, [store]);

  const fetchFamily = useCallback(async (familyId: number) => {
    try {
      store.setLoading('families', true);
      store.setError(null);
      const family = await SocialApiService.getFamily(familyId);
      store.setCurrentFamily(family);
      return family;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to fetch family');
      return null;
    } finally {
      store.setLoading('families', false);
    }
  }, [store]);

  const createFamily = useCallback(async (data: CreateFamilyRequest) => {
    try {
      store.setLoading('families', true);
      store.setError(null);
      const family = await SocialApiService.createFamily(data);
      store.addFamily(family);
      return family;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to create family');
      return null;
    } finally {
      store.setLoading('families', false);
    }
  }, [store]);

  const updateFamily = useCallback(async (familyId: number, data: Partial<CreateFamilyRequest>) => {
    try {
      store.setLoading('families', true);
      store.setError(null);
      const family = await SocialApiService.updateFamily(familyId, data);
      store.updateFamily(family);
      return family;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to update family');
      return null;
    } finally {
      store.setLoading('families', false);
    }
  }, [store]);

  const deleteFamily = useCallback(async (familyId: number) => {
    try {
      store.setLoading('families', true);
      store.setError(null);
      await SocialApiService.deleteFamily(familyId);
      store.removeFamily(familyId);
      return true;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to delete family');
      return false;
    } finally {
      store.setLoading('families', false);
    }
  }, [store]);

  // 가족 구성원 관련 훅
  const fetchFamilyMembers = useCallback(async (familyId: number) => {
    try {
      store.setLoading('familyMembers', true);
      store.setError(null);
      const members = await SocialApiService.getFamilyMembers(familyId);
      store.setFamilyMembers(members);
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to fetch family members');
    } finally {
      store.setLoading('familyMembers', false);
    }
  }, [store]);

  const inviteMember = useCallback(async (familyId: number, data: InviteMemberRequest) => {
    try {
      store.setLoading('familyMembers', true);
      store.setError(null);
      const member = await SocialApiService.inviteMember(familyId, data);
      store.addFamilyMember(member);
      return member;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to invite member');
      return null;
    } finally {
      store.setLoading('familyMembers', false);
    }
  }, [store]);

  const updateMemberRole = useCallback(async (familyId: number, memberId: number, role: string, permissions?: FamilyMember['permissions']) => {
    try {
      store.setLoading('familyMembers', true);
      store.setError(null);
      const member = await SocialApiService.updateMemberRole(familyId, memberId, role, permissions);
      store.updateFamilyMember(member);
      return member;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to update member role');
      return null;
    } finally {
      store.setLoading('familyMembers', false);
    }
  }, [store]);

  const removeMember = useCallback(async (familyId: number, memberId: number) => {
    try {
      store.setLoading('familyMembers', true);
      store.setError(null);
      await SocialApiService.removeMember(familyId, memberId);
      store.removeFamilyMember(memberId);
      return true;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to remove member');
      return false;
    } finally {
      store.setLoading('familyMembers', false);
    }
  }, [store]);

  // 공유 목표 관련 훅
  const fetchSharedGoals = useCallback(async (familyId: number) => {
    try {
      store.setLoading('sharedGoals', true);
      store.setError(null);
      const goals = await SocialApiService.getSharedGoals(familyId);
      store.setSharedGoals(goals);
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to fetch shared goals');
    } finally {
      store.setLoading('sharedGoals', false);
    }
  }, [store]);

  const createSharedGoal = useCallback(async (familyId: number, data: CreateGoalRequest) => {
    try {
      store.setLoading('sharedGoals', true);
      store.setError(null);
      const goal = await SocialApiService.createSharedGoal(familyId, data);
      store.addSharedGoal(goal);
      return goal;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to create shared goal');
      return null;
    } finally {
      store.setLoading('sharedGoals', false);
    }
  }, [store]);

  const contributeToGoal = useCallback(async (familyId: number, goalId: number, data: ContributeToGoalRequest) => {
    try {
      store.setLoading('sharedGoals', true);
      store.setError(null);
      const contribution = await SocialApiService.contributeToGoal(familyId, goalId, data);
      store.addGoalContribution(contribution);
      
      // 목표 업데이트
      const updatedGoal = await SocialApiService.getSharedGoal(familyId, goalId);
      store.updateSharedGoal(updatedGoal);
      
      return contribution;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to contribute to goal');
      return null;
    } finally {
      store.setLoading('sharedGoals', false);
    }
  }, [store]);

  // 가족 거래 관련 훅
  const fetchFamilyTransactions = useCallback(async (familyId: number, page = 1, limit = 20) => {
    try {
      store.setLoading('familyTransactions', true);
      store.setError(null);
      const response = await SocialApiService.getFamilyTransactions(familyId, page, limit);
      store.setFamilyTransactions(response.data, response.pagination);
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to fetch family transactions');
    } finally {
      store.setLoading('familyTransactions', false);
    }
  }, [store]);

  const createFamilyTransaction = useCallback(async (familyId: number, data: CreateFamilyTransactionRequest) => {
    try {
      store.setLoading('familyTransactions', true);
      store.setError(null);
      const transaction = await SocialApiService.createFamilyTransaction(familyId, data);
      store.addFamilyTransaction(transaction);
      return transaction;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to create family transaction');
      return null;
    } finally {
      store.setLoading('familyTransactions', false);
    }
  }, [store]);

  // 커뮤니티 관련 훅
  const fetchCommunityPosts = useCallback(async (category?: string, page = 1, limit = 20) => {
    try {
      store.setLoading('communityPosts', true);
      store.setError(null);
      const response = await SocialApiService.getCommunityPosts(category, page, limit);
      store.setCommunityPosts(response.data, response.pagination);
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to fetch community posts');
    } finally {
      store.setLoading('communityPosts', false);
    }
  }, [store]);

  const fetchCommunityPost = useCallback(async (postId: number) => {
    try {
      store.setLoading('communityPosts', true);
      store.setError(null);
      const post = await SocialApiService.getCommunityPost(postId);
      store.setCurrentPost(post);
      return post;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to fetch community post');
      return null;
    } finally {
      store.setLoading('communityPosts', false);
    }
  }, [store]);

  const createCommunityPost = useCallback(async (data: CreatePostRequest) => {
    try {
      store.setLoading('communityPosts', true);
      store.setError(null);
      const post = await SocialApiService.createCommunityPost(data);
      store.addCommunityPost(post);
      return post;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to create community post');
      return null;
    } finally {
      store.setLoading('communityPosts', false);
    }
  }, [store]);

  const togglePostLike = useCallback(async (postId: number, isLiked: boolean) => {
    try {
      store.togglePostLike(postId); // 낙관적 업데이트
      
      if (isLiked) {
        await SocialApiService.unlikeCommunityPost(postId);
      } else {
        await SocialApiService.likeCommunityPost(postId);
      }
    } catch (error) {
      store.togglePostLike(postId); // 실패시 롤백
      store.setError(error instanceof Error ? error.message : 'Failed to toggle post like');
    }
  }, [store]);

  // 댓글 관련 훅
  const fetchPostComments = useCallback(async (postId: number) => {
    try {
      store.setLoading('postComments', true);
      store.setError(null);
      const comments = await SocialApiService.getPostComments(postId);
      store.setPostComments(comments);
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to fetch post comments');
    } finally {
      store.setLoading('postComments', false);
    }
  }, [store]);

  const createComment = useCallback(async (postId: number, data: CreateCommentRequest) => {
    try {
      store.setLoading('postComments', true);
      store.setError(null);
      const comment = await SocialApiService.createComment(postId, data);
      store.addPostComment(comment);
      return comment;
    } catch (error) {
      store.setError(error instanceof Error ? error.message : 'Failed to create comment');
      return null;
    } finally {
      store.setLoading('postComments', false);
    }
  }, [store]);

  return {
    // State
    ...store,
    
    // Actions
    fetchFamilies,
    fetchFamily,
    createFamily,
    updateFamily,
    deleteFamily,
    fetchFamilyMembers,
    inviteMember,
    updateMemberRole,
    removeMember,
    fetchSharedGoals,
    createSharedGoal,
    contributeToGoal,
    fetchFamilyTransactions,
    createFamilyTransaction,
    fetchCommunityPosts,
    fetchCommunityPost,
    createCommunityPost,
    togglePostLike,
    fetchPostComments,
    createComment,
  };
};
