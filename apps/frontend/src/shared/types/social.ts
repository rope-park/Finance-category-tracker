// 소셜 기능 관련 타입 정의
export interface Family {
  id: number;
  name: string;
  description?: string;
  currency: string;
  shared_budget?: number;
  owner_id: number;
  status: 'active' | 'inactive' | 'deleted';
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: number;
  family_id: number;
  user_id: number;
  role: 'owner' | 'admin' | 'member';
  status: 'pending' | 'accepted' | 'declined' | 'removed';
  permissions: {
    can_view_budget?: boolean;
    can_edit_budget?: boolean;
    can_add_transactions?: boolean;
    can_view_reports?: boolean;
    can_invite_members?: boolean;
  };
  joined_at?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface SharedGoal {
  id: number;
  family_id: number;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  category: string;
  target_date: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  created_by: number;
  created_at: string;
  updated_at: string;
  progress_percentage?: number;
}

export interface GoalContribution {
  id: number;
  goal_id: number;
  user_id: number;
  amount: number;
  note?: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
  };
}

export interface FamilyTransaction {
  id: number;
  family_id: number;
  user_id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  split_details?: {
    split_type: 'equal' | 'amount' | 'percentage';
    splits: {
      user_id: number;
      amount: number;
      percentage?: number;
    }[];
  };
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
  };
}

export interface CommunityPost {
  id: number;
  author_id: number;
  title: string;
  content: string;
  category: 'tip' | 'question' | 'achievement' | 'discussion';
  tags: string[];
  likes_count: number;
  comments_count: number;
  view_count: number;
  is_anonymous: boolean;
  status: 'draft' | 'published' | 'hidden' | 'deleted';
  created_at: string;
  updated_at: string;
  author?: {
    id: number;
    name: string;
  };
  is_liked?: boolean;
}

export interface PostComment {
  id: number;
  post_id: number;
  author_id: number;
  content: string;
  parent_id?: number;
  likes_count: number;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  author?: {
    id: number;
    name: string;
  };
  is_liked?: boolean;
  replies?: PostComment[];
}

export interface PostLike {
  id: number;
  post_id?: number;
  comment_id?: number;
  user_id: number;
  created_at: string;
}

// API 요청/응답 타입
export interface CreateFamilyRequest {
  name: string;
  description?: string;
  currency?: string;
  shared_budget?: number;
}

export interface InviteMemberRequest {
  email: string;
  role?: 'admin' | 'member';
  permissions?: FamilyMember['permissions'];
}

export interface CreateGoalRequest {
  title: string;
  description?: string;
  target_amount: number;
  category: string;
  target_date: string;
}

export interface ContributeToGoalRequest {
  amount: number;
  note?: string;
}

export interface CreateFamilyTransactionRequest {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  split_details?: FamilyTransaction['split_details'];
}

export interface CreatePostRequest {
  title: string;
  content: string;
  category: 'tip' | 'question' | 'achievement' | 'discussion';
  tags?: string[];
  is_anonymous?: boolean;
}

export interface CreateCommentRequest {
  content: string;
  parent_id?: number;
  is_anonymous?: boolean;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
