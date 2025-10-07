/**
 * 소셜 기능 서비스
 * 
 * 가족 그룹 관리, 공동 예산 설정, 멤버 간 재정 데이터 공유 등
 * 소셜 예산 관리와 관련된 모든 기능을 제공하는 서비스.
 * 
 * 주요 기능:
 * - 가족/그룹 생성 및 관리
 * - 멤버 초대 및 권한 관리
 * - 공동 예산 설정 및 모니터링
 * - 그룹 내 재정 데이터 공유 및 비교
 * 
 * @author Ju Eul Park (rope-park)
 */

import { SocialRepository } from './social.repository';

/**
 * 소셜 기능 비즈니스 로직 클래스
 * 
 * Repository 패턴을 사용하여 데이터 접근과 비즈니스 로직을 분리.
 * 가족 그룹과 공동 예산 관리를 담당하는 서비스 레이어.
 */
export class SocialService {
  /** 소셜 데이터 접근을 위한 리포지토리 인스턴스 */
  private static repo = new SocialRepository();

  /**
   * 새로운 가족/그룹을 생성하는 메서드
   * 
   * 가족 또는 공동 예산 그룹을 생성하고 소유자를 첫 번째 멤버로 등록.
   * 그룹 내에서 공동 예산을 설정하고 비용을 공유할 수 있음.
   * 
   * @param ownerId - 그룹을 생성하는 사용자 ID (소유자)
   * @param familyData - 그룹 생성에 필요한 정보 (이름, 설명, 통화, 예산)
   * @returns 생성된 그룹 정보
   */
  static async createFamily(ownerId: number, familyData: {
    name: string;
    description?: string;
    currency?: string;
    sharedBudget?: number;
  }): Promise<any> {
    try {
      // 가족/그룹 생성
      const family = await this.repo.createFamily({
        ...familyData,
        ownerId,
        status: 'active'
      });

      // 소유자를 그룹의 첫 번째 멤버로 자동 추가
      await this.repo.createFamilyMember({
        familyId: family.id,
        userId: ownerId,
        role: 'owner',
        status: 'accepted',
        permissions: {
          canViewBudget: true,
          canEditBudget: true,
          canAddTransactions: true,
          canViewReports: true,
          canInviteMembers: true
        },
        joinedAt: new Date()
      });

      return await this.getFamilyById(family.id);
    } catch (error) {
      throw new Error('가족 그룹 생성에 실패했습니다');
    }
  }

  /**
   * 가족 그룹 정보를 조회하는 메서드
   * @param familyId 가족 ID
   * @returns 가족 그룹 정보
   */
  static async getFamilyById(familyId: number): Promise<any> {
    const family = await this.repo.findFamilyById(familyId);
    if (!family) {
      throw new Error('가족 그룹을 찾을 수 없습니다');
    }
    return family;
  }

  /**
   * 사용자 가족 목록 조회
   * @param userId 사용자 ID
   * @returns 가족 목록
   */
  static async getUserFamilies(userId: number): Promise<any[]> {
    return await this.repo.findUserFamilies(userId);
  }

  /**
   * 가족 구성원을 초대하는 메서드
   * @param familyId 가족 ID
   * @param inviterId 초대하는 사용자 ID
   * @param inviteData 초대할 사용자 정보
   * @returns 생성된 초대 정보
   */
  static async inviteFamilyMember(familyId: number, inviterId: number, inviteData: {
    email: string;
    role?: 'admin' | 'member';
    permissions?: any;
  }): Promise<any> {
    // 초대 권한 확인
    const inviter = await this.repo.findFamilyMember(familyId, inviterId);
    if (!inviter || !inviter.permissions?.canInviteMembers) {
      throw new Error('구성원 초대 권한이 없습니다');
    }

    // 초대할 사용자 찾기
    const invitee = await this.repo.findUserByEmail(inviteData.email);
    if (!invitee) {
      throw new Error('해당 이메일의 사용자를 찾을 수 없습니다');
    }

    // 이미 멤버인지 확인
    const existingMember = await this.repo.findFamilyMember(familyId, invitee.id);
    if (existingMember) {
      throw new Error('이미 가족 구성원입니다');
    }

    // 초대 생성
    return await this.repo.createFamilyMember({
      familyId,
      userId: invitee.id,
      role: inviteData.role || 'member',
      status: 'pending',
      permissions: inviteData.permissions || {
        canViewBudget: true,
        canEditBudget: false,
        canAddTransactions: true,
        canViewReports: true,
        canInviteMembers: false
      }
    });
  }

  /**
   * 초대 응답 (수락/거절) 메서드
   * @param memberId 초대된 구성원 ID
   * @param userId 사용자 ID
   * @param response 응답 (accepted | declined)
   * @returns 업데이트된 초대 정보
   */
  static async respondToInvitation(memberId: number, userId: number, response: 'accepted' | 'declined'): Promise<any> {
    const member = await this.repo.findPendingInvitation(memberId, userId);
    if (!member) {
      throw new Error('초대를 찾을 수 없습니다');
    }

    const updateData: any = { status: response };
    if (response === 'accepted') {
      updateData.joinedAt = new Date();
    }

    return await this.repo.updateFamilyMember(memberId, updateData);
  }

  /**
   * 공동 목표 생성
   * @param goalData 공동 목표 데이터
   * @returns 생성된 공동 목표 정보
   */
  static async createSharedGoal(goalData: {
    familyId: number;
    createdBy: number;
    title: string;
    description?: string;
    targetAmount: number;
    category: string;
    targetDate: Date;
  }): Promise<any> {
    // 가족 구성원 확인
    const member = await this.repo.findAcceptedFamilyMember(goalData.familyId, goalData.createdBy);
    if (!member) {
      throw new Error('가족 구성원만 목표를 생성할 수 있습니다');
    }

    return await this.repo.createSharedGoal({
      ...goalData,
      status: 'active',
      currentAmount: 0
    });
  }

  /**
   * 목표에 기여하기
   * @param goalId 목표 ID
   * @param userId 사용자 ID
   * @param contributionData 기여 데이터
   * @returns 생성된 기여 정보
   */
  static async contributeToGoal(goalId: number, userId: number, contributionData: {
    amount: number;
    note?: string;
  }): Promise<any> {
    const goal = await this.repo.findSharedGoalById(goalId);
    if (!goal) {
      throw new Error('목표를 찾을 수 없습니다');
    }

    // 가족 구성원 확인
    const member = await this.repo.findAcceptedFamilyMember(goal.familyId, userId);
    if (!member) {
      throw new Error('가족 구성원만 기여할 수 있습니다');
    }

    // 기여금 생성
    const contribution = await this.repo.createGoalContribution({
      goalId,
      userId,
      amount: contributionData.amount,
      note: contributionData.note
    });

    // 목표의 현재 금액 업데이트
    const newCurrentAmount = Number(goal.currentAmount) + Number(contributionData.amount);
    const updateData: any = { currentAmount: newCurrentAmount };
    
    // 목표 달성 확인
    if (newCurrentAmount >= goal.targetAmount) {
      updateData.status = 'completed';
    }

    await this.repo.updateSharedGoal(goalId, updateData);

    return contribution;
  }

  /**
   * 가족 목표 목록 조회
   * @param familyId 가족 ID
   * @param userId 사용자 ID
   * @returns 가족 목표 목록
   */
  static async getFamilyGoals(familyId: number, userId: number): Promise<any[]> {
    // 가족 구성원 확인
    const member = await this.repo.findAcceptedFamilyMember(familyId, userId);
    if (!member) {
      throw new Error('가족 구성원만 목표를 볼 수 있습니다');
    }

    return await this.repo.findFamilyGoals(familyId);
  }

  /**
   * 가족 거래 생성
   * @param transactionData 거래 데이터
   * @returns 생성된 거래 정보
   */
  static async createFamilyTransaction(transactionData: {
    familyId: number;
    userId: number;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    category: string;
    date: Date;
    splitDetails?: any;
  }): Promise<any> {
    // 가족 구성원 확인
    const member = await this.repo.findFamilyMember(transactionData.familyId, transactionData.userId);
    if (!member || !member.permissions?.canAddTransactions) {
      throw new Error('거래 추가 권한이 없습니다');
    }

    return await this.repo.createFamilyTransaction(transactionData);
  }

  /**
   * 가족 거래 목록 조회
   * @param familyId 가족 ID
   * @param userId 사용자 ID
   * @param filters 필터링 옵션
   * @returns 거래 목록 및 총 수
   */
  static async getFamilyTransactions(familyId: number, userId: number, filters?: {
    startDate?: Date;
    endDate?: Date;
    category?: string;
    type?: 'income' | 'expense';
    page?: number;
    limit?: number;
  }): Promise<{ transactions: any[]; total: number }> {
    // 가족 구성원 확인
    const member = await this.repo.findFamilyMember(familyId, userId);
    if (!member || !member.permissions?.canViewBudget) {
      throw new Error('거래 조회 권한이 없습니다');
    }

    return await this.repo.findFamilyTransactions(familyId, filters || {});
  }

  /**
   * 가족 대시보드 데이터 조회
   * @param familyId 가족 ID
   * @param userId 사용자 ID
   * @returns 가족 대시보드 데이터
   */
  static async getFamilyDashboard(familyId: number, userId: number): Promise<{
    family: any;
    summary: {
      totalMembers: number;
      activeGoals: number;
      completedGoals: number;
      monthlyIncome: number;
      monthlyExpenses: number;
      budgetUtilization: number;
    };
    recentTransactions: any[];
    activeGoals: any[];
  }> {
    // 가족 구성원 확인
    const member = await this.repo.findAcceptedFamilyMember(familyId, userId);
    if (!member) {
      throw new Error('가족 구성원만 대시보드를 볼 수 있습니다');
    }

    return await this.repo.getFamilyDashboardData(familyId);
  }
}
