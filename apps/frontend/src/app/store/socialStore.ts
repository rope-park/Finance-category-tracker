/**
 * 소셜 스토어 (가족/그룹, 공유 목표, 가족 거래, 커뮤니티)
 * 
 * Zustand를 사용하여 소셜 관련 상태를 관리.
 * 가족/그룹, 공유 목표, 가족 거래, 커뮤니티 게시물 및 댓글에 대한 상태와 액션을 포함.
 * 비동기 작업 없이 동기적으로 상태를 업데이트하는 간단한 구조.
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Family,
  FamilyMember,
  SharedGoal,
  GoalContribution,
  FamilyTransaction,
  CommunityPost,
  PostComment
} from '../../shared/types/social';

// 상태 인터페이스
interface SocialState {
  // 가족/그룹 상태
  families: Family[];
  currentFamily: Family | null;
  familyMembers: FamilyMember[];
  
  // 공유 목표 상태
  sharedGoals: SharedGoal[];
  currentGoal: SharedGoal | null;
  goalContributions: GoalContribution[];
  
  // 가족 거래 상태
  familyTransactions: FamilyTransaction[];
  familyTransactionsPagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  } | null;
  
  // 커뮤니티 상태
  communityPosts: CommunityPost[];
  currentPost: CommunityPost | null;
  postComments: PostComment[];
  communityPagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  } | null;
  
  // 로딩 및 에러 상태
  loading: {
    families: boolean;
    familyMembers: boolean;
    sharedGoals: boolean;
    familyTransactions: boolean;
    communityPosts: boolean;
    postComments: boolean;
  };
  
  error: string | null;
}

// 액션 인터페이스
interface SocialActions {
  // 가족/그룹 액션
  setFamilies: (families: Family[]) => void;
  setCurrentFamily: (family: Family | null) => void;
  addFamily: (family: Family) => void;
  updateFamily: (family: Family) => void;
  removeFamily: (familyId: number) => void;
  
  // 가족 구성원 액션
  setFamilyMembers: (members: FamilyMember[]) => void;
  addFamilyMember: (member: FamilyMember) => void;
  updateFamilyMember: (member: FamilyMember) => void;
  removeFamilyMember: (memberId: number) => void;
  
  // 공유 목표 액션
  setSharedGoals: (goals: SharedGoal[]) => void;
  setCurrentGoal: (goal: SharedGoal | null) => void;
  addSharedGoal: (goal: SharedGoal) => void;
  updateSharedGoal: (goal: SharedGoal) => void;
  removeSharedGoal: (goalId: number) => void;
  
  // 목표 기여 액션
  setGoalContributions: (contributions: GoalContribution[]) => void;
  addGoalContribution: (contribution: GoalContribution) => void;
  
  // 가족 거래 액션
  setFamilyTransactions: (transactions: FamilyTransaction[], pagination?: SocialState['familyTransactionsPagination']) => void;
  addFamilyTransaction: (transaction: FamilyTransaction) => void;
  updateFamilyTransaction: (transaction: FamilyTransaction) => void;
  removeFamilyTransaction: (transactionId: number) => void;
  
  // 커뮤니티 액션
  setCommunityPosts: (posts: CommunityPost[], pagination?: SocialState['communityPagination']) => void;
  setCurrentPost: (post: CommunityPost | null) => void;
  addCommunityPost: (post: CommunityPost) => void;
  updateCommunityPost: (post: CommunityPost) => void;
  removeCommunityPost: (postId: number) => void;
  togglePostLike: (postId: number) => void;
  
  // 댓글 액션
  setPostComments: (comments: PostComment[]) => void;
  addPostComment: (comment: PostComment) => void;
  updatePostComment: (comment: PostComment) => void;
  removePostComment: (commentId: number) => void;
  toggleCommentLike: (commentId: number) => void;
  
  // 로딩 상태 액션
  setLoading: (key: keyof SocialState['loading'], value: boolean) => void;
  setError: (error: string | null) => void;
  
  // 리셋 액션
  reset: () => void;
}

// 초기 상태
const initialState: SocialState = {
  families: [],
  currentFamily: null,
  familyMembers: [],
  sharedGoals: [],
  currentGoal: null,
  goalContributions: [],
  familyTransactions: [],
  familyTransactionsPagination: null,
  communityPosts: [],
  currentPost: null,
  postComments: [],
  communityPagination: null,
  loading: {
    families: false,
    familyMembers: false,
    sharedGoals: false,
    familyTransactions: false,
    communityPosts: false,
    postComments: false,
  },
  error: null,
};

/**
 * 소셜 스토어 훅
 */
export const useSocialStore = create<SocialState & SocialActions>()(
  devtools(
    (set) => ({
      ...initialState,
      
      // 가족/그룹 액션
      setFamilies: (families) => set({ families }),
      setCurrentFamily: (currentFamily) => set({ currentFamily }),
      addFamily: (family) => set((state) => ({ families: [...state.families, family] })),
      updateFamily: (updatedFamily) => set((state) => ({
        families: state.families.map(family => 
          family.id === updatedFamily.id ? updatedFamily : family
        ),
        currentFamily: state.currentFamily?.id === updatedFamily.id ? updatedFamily : state.currentFamily,
      })),
      removeFamily: (familyId) => set((state) => ({
        families: state.families.filter(family => family.id !== familyId),
        currentFamily: state.currentFamily?.id === familyId ? null : state.currentFamily,
      })),
      
      // 가족 구성원 액션
      setFamilyMembers: (familyMembers) => set({ familyMembers }),
      addFamilyMember: (member) => set((state) => ({ familyMembers: [...state.familyMembers, member] })),
      updateFamilyMember: (updatedMember) => set((state) => ({
        familyMembers: state.familyMembers.map(member => 
          member.id === updatedMember.id ? updatedMember : member
        ),
      })),
      removeFamilyMember: (memberId) => set((state) => ({
        familyMembers: state.familyMembers.filter(member => member.id !== memberId),
      })),
      
      // 공유 목표 액션
      setSharedGoals: (sharedGoals) => set({ sharedGoals }),
      setCurrentGoal: (currentGoal) => set({ currentGoal }),
      addSharedGoal: (goal) => set((state) => ({ sharedGoals: [...state.sharedGoals, goal] })),
      updateSharedGoal: (updatedGoal) => set((state) => ({
        sharedGoals: state.sharedGoals.map(goal => 
          goal.id === updatedGoal.id ? updatedGoal : goal
        ),
        currentGoal: state.currentGoal?.id === updatedGoal.id ? updatedGoal : state.currentGoal,
      })),
      removeSharedGoal: (goalId) => set((state) => ({
        sharedGoals: state.sharedGoals.filter(goal => goal.id !== goalId),
        currentGoal: state.currentGoal?.id === goalId ? null : state.currentGoal,
      })),
      
      // 목표 기여 액션
      setGoalContributions: (goalContributions) => set({ goalContributions }),
      addGoalContribution: (contribution) => set((state) => ({ 
        goalContributions: [...state.goalContributions, contribution] 
      })),
      
      // 가족 거래 액션
      setFamilyTransactions: (familyTransactions, pagination) => set({ 
        familyTransactions, 
        familyTransactionsPagination: pagination 
      }),
      addFamilyTransaction: (transaction) => set((state) => ({ 
        familyTransactions: [transaction, ...state.familyTransactions] 
      })),
      updateFamilyTransaction: (updatedTransaction) => set((state) => ({
        familyTransactions: state.familyTransactions.map(transaction => 
          transaction.id === updatedTransaction.id ? updatedTransaction : transaction
        ),
      })),
      removeFamilyTransaction: (transactionId) => set((state) => ({
        familyTransactions: state.familyTransactions.filter(transaction => transaction.id !== transactionId),
      })),
      
      // 커뮤니티 액션
      setCommunityPosts: (communityPosts, pagination) => set({ 
        communityPosts, 
        communityPagination: pagination 
      }),
      setCurrentPost: (currentPost) => set({ currentPost }),
      addCommunityPost: (post) => set((state) => ({ 
        communityPosts: [post, ...state.communityPosts] 
      })),
      updateCommunityPost: (updatedPost) => set((state) => ({
        communityPosts: state.communityPosts.map(post => 
          post.id === updatedPost.id ? updatedPost : post
        ),
        currentPost: state.currentPost?.id === updatedPost.id ? updatedPost : state.currentPost,
      })),
      removeCommunityPost: (postId) => set((state) => ({
        communityPosts: state.communityPosts.filter(post => post.id !== postId),
        currentPost: state.currentPost?.id === postId ? null : state.currentPost,
      })),
      togglePostLike: (postId) => set((state) => ({
        communityPosts: state.communityPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                is_liked: !post.is_liked,
                likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1
              }
            : post
        ),
        currentPost: state.currentPost?.id === postId 
          ? {
              ...state.currentPost,
              is_liked: !state.currentPost.is_liked,
              likes_count: state.currentPost.is_liked 
                ? state.currentPost.likes_count - 1 
                : state.currentPost.likes_count + 1
            }
          : state.currentPost,
      })),
      
      // 댓글 액션
      setPostComments: (postComments) => set({ postComments }),
      addPostComment: (comment) => set((state) => ({ 
        postComments: [...state.postComments, comment] 
      })),
      updatePostComment: (updatedComment) => set((state) => ({
        postComments: state.postComments.map(comment => 
          comment.id === updatedComment.id ? updatedComment : comment
        ),
      })),
      removePostComment: (commentId) => set((state) => ({
        postComments: state.postComments.filter(comment => comment.id !== commentId),
      })),
      toggleCommentLike: (commentId) => set((state) => ({
        postComments: state.postComments.map(comment => 
          comment.id === commentId 
            ? { 
                ...comment, 
                is_liked: !comment.is_liked,
                likes_count: comment.is_liked ? comment.likes_count - 1 : comment.likes_count + 1
              }
            : comment
        ),
      })),
      
      // 로딩 상태 액션
      setLoading: (key, value) => set((state) => ({
        loading: { ...state.loading, [key]: value }
      })),
      setError: (error) => set({ error }),
      
      // 리셋 액션
      reset: () => set(initialState),
    }),
    {
      name: 'social-store',
    }
  )
);
