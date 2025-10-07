/**
 * 소셜 관련 타입 정의
 */

// 가족 정보
export interface Family {
  id: number;             // 가족 고유 ID
  name: string;           // 가족 이름
  description?: string;   // 가족 설명 (선택적) 
  currency: string;       // 가족 기본 통화
  shared_budget?: number; // 가족 공유 예산 (선택적)
  owner_id: number;       // 가족 소유자(생성자) 사용자 ID
  status: 'active' | 'inactive' | 'deleted'; // 가족 상태 
  created_at: string;     // 생성 일시
  updated_at: string;     // 수정 일시
}

// 가족 구성원 정보
export interface FamilyMember {
  id: number;                                          // 고유 ID
  family_id: number;                                   // 가족 ID
  user_id: number;                                     // 사용자 ID
  role: 'owner' | 'admin' | 'member';                  // 가족 내 역할
  status: 'pending' | 'accepted' | 'declined' | 'removed'; // 가입 상태
  permissions: {                                       // 가족 내 권한 설정
    can_view_budget?: boolean;                         // 예산 조회 권한
    can_edit_budget?: boolean;                         // 예산 수정 권한
    can_add_transactions?: boolean;                    // 거래 추가 권한
    can_view_reports?: boolean;                        // 보고서 조회 권한
    can_invite_members?: boolean;                      // 구성원 초대 권한
  };
  joined_at?: string;                                  // 가입 일시 (수락된 경우)
  invited_at: string;                                  // 초대 일시
  responded_at?: string;                               // 응답 일시 (수락/거절된 경우)
  user?: {                                             // 선택적 사용자 정보
    id: number;                                        // 사용자 ID
    name: string;                                      // 사용자 이름
    email: string;                                     // 이메일
  };
}

// 가족 목표 정보
export interface SharedGoal {
  id: number;                                          // 고유 ID
  family_id: number;                                   // 가족 ID
  title: string;                                       // 목표 제목
  description?: string;                                // 목표 설명
  target_amount: number;                               // 목표 금액
  current_amount: number;                              // 현재 달성 금액
  category: string;                                    // 목표 카테고리
  target_date: string;                                 // 목표 달성 희망 날짜
  status: 'active' | 'completed' | 'paused' | 'cancelled'; // 목표 상태
  created_by: number;                                  // 목표 생성자 ID
  created_at: string;                                  // 생성 일시
  updated_at: string;                                  // 수정 일시
  progress_percentage?: number;                        // 목표 진행률 (선택적)
}

// 가족 목표에 대한 기여 내역
export interface GoalContribution {
  id: number;          // 고유 ID
  goal_id: number;     // 목표 ID
  user_id: number;     // 기여자 ID
  amount: number;      // 기여 금액
  note?: string;       // 기여 메모
  created_at: string;  // 기여 일시
  user?: {             // 기여자 정보
    id: number;        // 사용자 ID
    name: string;      // 사용자 이름
  };
}

// 가족 거래 내역
export interface FamilyTransaction {
  id: number;                    // 고유 ID
  family_id: number;             // 가족 ID
  user_id: number;               // 거래 등록자 ID
  type: 'income' | 'expense';    // 거래 유형 (수입/지출)
  amount: number;                // 거래 금액
  description: string;           // 거래 설명
  category: string;              // 거래 카테고리
  date: string;                  // 거래 날짜
  split_details?: {              // 분할 정보 (선택적)
    split_type: 'equal' | 'amount' | 'percentage'; // 분할 방식
    splits: {                    // 분할 상세
      user_id: number;           // 분할 대상자 ID
      amount: number;            // 분할 금액
      percentage?: number;       // 분할 비율
    }[];
  };
  created_at: string;            // 생성 일시
  updated_at: string;            // 수정 일시
  user?: {                       // 거래 등록자 정보
    id: number;                  // 사용자 ID
    name: string;                // 사용자 이름
  };
}

// 커뮤니티 게시물
export interface CommunityPost {
  id: number;
  author_id: number;
  title: string;
  content: string;
  category: 'tip' | 'question' | 'achievement' | 'discussion';  // 게시물 유형
  tags: string[]; // 태그 목록
  likes_count: number;  // 좋아요 수
  comments_count: number; // 댓글 수
  view_count: number; // 조회 수
  is_anonymous: boolean; // 익명 여부
  status: 'draft' | 'published' | 'hidden' | 'deleted'; // 게시물 상태
  created_at: string; // 생성 일시
  updated_at: string; // 수정 일시
  author?: {
    id: number;
    name: string;
  };
  is_liked?: boolean; // 현재 사용자가 좋아요를 눌렀는지 여부 (선택적)
}

// 커뮤니티 댓글
export interface PostComment {
  id: number;
  post_id: number;  // 게시물 ID
  author_id: number;
  content: string;  // 댓글 내용
  parent_id?: number; // 부모 댓글 ID (대댓글인 경우)
  likes_count: number;  // 좋아요 수
  is_anonymous: boolean; // 익명 여부
  created_at: string; // 생성 일시
  updated_at: string; // 수정 일시
  author?: {
    id: number;
    name: string;
  };
  is_liked?: boolean; // 현재 사용자가 좋아요를 눌렀는지 여부 (선택적)
  replies?: PostComment[]; // 대댓글 목록 (선택적)
}

// 게시물 및 댓글 좋아요
export interface PostLike {
  id: number;
  post_id?: number;
  comment_id?: number;
  user_id: number;
  created_at: string;
}

// 가족 생성 및 관리
export interface CreateFamilyRequest {
  name: string;            // 가족 이름
  description?: string;    // 가족 설명 (선택적)
  currency?: string;       // 기본 통화 (선택적)
  shared_budget?: number;  // 공유 예산 (선택적)
}

// 가족 구성원 초대
export interface InviteMemberRequest {
  email: string;                           // 초대할 이메일
  role?: 'admin' | 'member';               // 부여할 역할
  permissions?: FamilyMember['permissions']; // 세부 권한 설정
}

// 가족 목표 생성
export interface CreateGoalRequest {
  title: string;         // 목표 제목
  description?: string;  // 목표 설명
  target_amount: number; // 목표 금액
  category: string;      // 목표 카테고리
  target_date: string;   // 목표 달성 날짜
}

// 가족 목표 기여
export interface ContributeToGoalRequest {
  amount: number; // 기여 금액
  note?: string;  // 기여 메모
}

// 가족 거래 내역 생성
export interface CreateFamilyTransactionRequest {
  type: 'income' | 'expense';                   // 거래 유형
  amount: number;                               // 거래 금액
  description: string;                          // 거래 설명
  category: string;                             // 거래 카테고리
  date: string;                                 // 거래 날짜
  split_details?: FamilyTransaction['split_details']; // 분할 정보
}

// 커뮤니티 게시물 및 댓글 작성
export interface CreatePostRequest {
  title: string;
  content: string;
  category: 'tip' | 'question' | 'achievement' | 'discussion';
  tags?: string[];
  is_anonymous?: boolean;
}

// 커뮤니티 댓글 작성
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

// 목록형 API 응답 타입
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
