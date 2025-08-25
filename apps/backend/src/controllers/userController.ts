import { Response } from 'express';
import pool from '../config/database';
import { 
  ProfileUpdateRequest,
  SettingsUpdateRequest,
  ApiResponse,
  User,
  UserSettings
} from '@finance-tracker/shared';
import { AuthRequest } from '../middleware/auth';

// 프로필 업데이트
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
      message: '프로필이 업데이트되었습니다.'
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

// 사용자 삭제 (계정 비활성화)
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
      message: '계정이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('사용자 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '서버 내부 오류가 발생했습니다.'
    });
  }
};

// 사용자 설정 조회
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
      message: '사용자 설정을 조회했습니다.'
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

// 사용자 설정 업데이트
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
      message: '사용자 설정이 업데이트되었습니다.'
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