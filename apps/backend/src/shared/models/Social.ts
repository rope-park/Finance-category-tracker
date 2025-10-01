// 소셜 기능 관련 타입 정의
export interface Family {
  id: number;
  name: string;
  description?: string;
  currency: string;
  shared_budget?: number;
  owner_id: number;
  status: 'active' | 'inactive' | 'deleted';
  created_at: Date;
  updated_at: Date;
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
  joined_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface SharedGoal {
  id: number;
  family_id: number;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  category: string;
  target_date: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface GoalContribution {
  id: number;
  goal_id: number;
  user_id: number;
  amount: number;
  note?: string;
  created_at: Date;
}

export interface FamilyTransaction {
  id: number;
  family_id: number;
  user_id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: Date;
  split_details?: {
    split_type: 'equal' | 'amount' | 'percentage';
    splits: {
      user_id: number;
      amount: number;
      percentage?: number;
    }[];
  };
  created_at: Date;
  updated_at: Date;
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
  created_at: Date;
  updated_at: Date;
}

export interface PostComment {
  id: number;
  post_id: number;
  author_id: number;
  content: string;
  parent_id?: number;
  likes_count: number;
  is_anonymous: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PostLike {
  id: number;
  post_id?: number;
  comment_id?: number;
  user_id: number;
  created_at: Date;
}