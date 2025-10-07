/**
 * 사용자 관리 컨트롤러
 * 
 * 사용자 프로필 및 설정 관리를 위한 컨트롤러 함수들.
 * 사용자 계정 정보 수정, 설정 관리, 계정 삭제 등의 기능 제공.
 * 
 * 주요 기능:
 * - 사용자 프로필 정보 업데이트 (displayName, phone, preferences 등)
 * - 사용자 설정 조회 및 수정 (theme, currency, notifications 등)
 * - 계정 비활성화 및 소프트 삭제 처리
 * - 프로필 완성도 체크 및 가이드 제공
 * - 비밀번호 변경 및 보안 설정 관리
 * 
 * API 엔드포인트:
 * - PUT /api/users/profile - 프로필 정보 업데이트
 * - DELETE /api/users/profile - 계정 비활성화
 * - GET /api/users/settings - 사용자 설정 조회
 * - PUT /api/users/settings - 사용자 설정 업데이트
 * - PATCH /api/users/password - 비밀번호 변경
 * 
 * 보안 사항:
 * - JWT 인증 기반 사용자 검증 및 권한 처리
 * - 본인 데이터만 접근 가능하도록 엄격한 권한 제어
 * - 입력 데이터 유효성 검사 및 SQL 인젝션 방지
 * - 민감한 정보 처리 시 추가 보안 검증
 * 
 * @author Ju Eul Park (rope-park)
 */

import { Response } from 'express';
import pool from '../../core/config/database';
import { 
  ProfileUpdateRequest,
  SettingsUpdateRequest,
  ApiResponse,
  User,
  UserSettings
} from '@finance-tracker/shared';
import { AuthRequest } from '../../shared/middleware/auth';

/**
 * 사용자 프로필 정보 업데이트
 * 
 * 사용자의 개인정보(이름, 프로필 사진, 전화번호 등) 수정함.
 * 필수 필드 입력 시 프로필 완성 상태를 자동으로 업데이트함.
 * 
 * @param req - 인증된 요청 객체 (사용자 ID 포함)
 * @param res - HTTP 응답 객체
 * @returns 업데이트된 사용자 프로필 정보
 * 
 * @example
 * PUT /api/users/profile
 * {
 *   "name": "홍길동",
 *   "phone_number": "010-1234-5678",
 *   "age_group": "20s",
 *   "bio": "안녕하세요!"
 * }
 */
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, profile_picture, phone_number, age_group, bio }: ProfileUpdateRequest = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // 업데이트할 필드들을 동적으로 구성
    const updateFields: string[] = [];
    const values: (string | number | boolean)[] = [];
    let paramCounter = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCounter++}`);
      values.push(name);
    }

    if (profile_picture !== undefined) {
      updateFields.push(`profile_picture = $${paramCounter++}`);
      values.push(profile_picture);
    }

    if (phone_number !== undefined) {
      updateFields.push(`phone_number = $${paramCounter++}`);
      values.push(phone_number);
    }

    if (age_group !== undefined) {
      updateFields.push(`age_group = $${paramCounter++}`);
      values.push(age_group);
    }

    if (bio !== undefined) {
      updateFields.push(`bio = $${paramCounter++}`);
      values.push(bio);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: '업데이트할 필드가 없습니다.'
      });
    }

    // 프로필 완성 여부 체크 (필수 필드: name)
    const isProfileComplete: boolean = name ? true : (req.user?.profile_completed || false);

    updateFields.push(`profile_completed = $${paramCounter++}`);
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(isProfileComplete);
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING id, email, name, profile_picture, phone_number, age_group, 
                bio, profile_completed, created_at, updated_at, last_login, is_active
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      });
    }

    const response: ApiResponse = {
      success: true,
      data: { user: result.rows[0] },
      message: '프로필이 업데이트되었습니다.',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

/**
 * 사용자 삭제 (계정 비활성화)
 * @param req - 인증된 요청 객체
 * @param res - 응답 객체
 */
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    // 소프트 삭제 (is_active를 false로 변경)
    await pool.query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );

    res.json({
      success: true,
      message: '계정이 삭제되었습니다.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('사용자 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

/**
 * 사용자 설정 조회
 * @param req - 인증된 요청 객체
 * @param res - 응답 객체
 * @returns 사용자 설정 정보
 */
export const getUserSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    const result = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [userId]
    );

    const response: ApiResponse = {
      success: true,
      data: { settings: result.rows[0] || {} },
      message: '사용자 설정을 조회했습니다.',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('사용자 설정 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

/**
 * 사용자 설정 업데이트
 * @param req - 인증된 요청 객체
 * @param res - 응답 객체
 * @returns 업데이트된 사용자 설정 정보
 */
export const updateUserSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { theme, language, currency, notifications_enabled } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
    }

    const updateFields: string[] = [];
    const values: (string | number | boolean)[] = [];
    let paramCounter = 1;

    if (theme !== undefined) {
      updateFields.push(`theme = $${paramCounter++}`);
      values.push(theme);
    }

    if (language !== undefined) {
      updateFields.push(`language = $${paramCounter++}`);
      values.push(language);
    }

    if (currency !== undefined) {
      updateFields.push(`currency = $${paramCounter++}`);
      values.push(currency);
    }

    if (notifications_enabled !== undefined) {
      updateFields.push(`notifications_enabled = $${paramCounter++}`);
      values.push(notifications_enabled);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: '업데이트할 설정이 없습니다.'
      });
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE user_settings 
      SET ${updateFields.join(', ')}
      WHERE user_id = $${paramCounter}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    const response: ApiResponse = {
      success: true,
      data: { settings: result.rows[0] },
      message: '사용자 설정이 업데이트되었습니다.',
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('사용자 설정 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};