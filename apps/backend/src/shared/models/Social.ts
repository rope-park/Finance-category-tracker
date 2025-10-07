/**
 * 소셜 기능 데이터 모델
 * 
 * 가족 그룹, 공동 목표, 커뮤니티 게시글 등 소셜 기능과 관련된 모든 데이터 모델을 정의.
 * 개인정보 보호와 데이터 무결성을 고려한 안전한 소셜 데이터 구조 제공.
 * 
 * 주요 모델:
 * - Family: 가족 그룹 기본 정보
 * - FamilyMember: 가족 구성원 및 권한 관리
 * - SharedGoal: 공동 재정 목표
 * - CommunityPost: 커뮤니티 게시글
 * - PostComment: 게시글 댓글
 * - PostLike: 게시글 좋아요
 * 
 * @author Ju Eul Park (rope-park)
 */

// 가족 그룹 인터페이스
export interface Family {
  id: number;           // 가족 그룹 고유 ID
  name: string;         // 가족 그룹 이름
  description?: string; // 가족 그룹 설명 (선택적)
  currency: string;     // 기본 통화 단위 (KRW, USD 등)
  shared_budget?: number; // 공동 예산 금액 (선택적)
  owner_id: number;     // 가족 그룹 소유자 사용자 ID
  status: 'active' | 'inactive' | 'deleted'; // 그룹 상태 (active: 활성, inactive: 비활성, deleted: 삭제됨)
  created_at: Date;     // 그룹 생성 일시
  updated_at: Date;     // 그룹 정보 마지막 수정 일시
}

// 가족 구성원 인터페이스
export interface FamilyMember {
  id: number;
  family_id: number;
  user_id: number;
  role: 'owner' | 'admin' | 'member'; // 구성원 역할
  status: 'pending' | 'accepted' | 'declined' | 'removed';  // 초대 상태
  permissions: {  // 구성원별 세부 권한 설정
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

// 공동 목표 인터페이스
export interface SharedGoal {
  id: number;
  family_id: number;
  title: string;
  description?: string;
  target_amount: number;  // 목표 금액
  current_amount: number; // 현재 모인 금액
  category: string;
  target_date: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

// 공동 목표 기여 내역 인터페이스
export interface GoalContribution {
  id: number;
  goal_id: number;
  user_id: number;
  amount: number;
  note?: string;
  created_at: Date;
}

// 가족 거래 내역 인터페이스
export interface FamilyTransaction {
  id: number;
  family_id: number;
  user_id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: Date;
  split_details?: { // 거래 분할 정보
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

// 커뮤니티 게시글 인터페이스
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

// 게시글 댓글 인터페이스
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

// 게시글 좋아요 인터페이스
export interface PostLike {
  id: number;
  post_id?: number;
  comment_id?: number;
  user_id: number;
  created_at: Date;
}