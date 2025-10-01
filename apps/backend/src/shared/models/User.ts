import express from 'express';
import pool from '../../core/config/database';
import { authenticateToken } from '../middleware/auth';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation';

const router = express.Router();

// 프로필 조회
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    console.log('👤 프로필 조회 요청 - User ID:', userId);
    
    const result = await pool.query(
      'SELECT id, email, name, profile_picture, phone_number, age_group, bio, created_at FROM users WHERE id = $1',
      [userId]
    );

    console.log('👤 DB 조회 결과:', result.rows.length, '개');

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '프로필 조회 중 오류가 발생했습니다.'
    });
  }
});

// 프로필 업데이트
router.put('/profile', authenticateToken, async (req, res) => {
  console.log('📝 프로필 업데이트 요청:', req.body);
  
  try {
    const userId = (req as any).user.userId;
    const { name, profile_picture, phone_number, age_group, bio } = req.body;

    // 업데이트할 필드들 구성
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramCount = 0;

    if (name !== undefined) {
      paramCount++;
      updateFields.push(`name = $${paramCount}`);
      updateValues.push(name);
    }

    if (profile_picture !== undefined) {
      paramCount++;
      updateFields.push(`profile_picture = $${paramCount}`);
      updateValues.push(profile_picture);
    }

    if (phone_number !== undefined) {
      paramCount++;
      updateFields.push(`phone_number = $${paramCount}`);
      updateValues.push(phone_number);
    }

    if (age_group !== undefined) {
      paramCount++;
      updateFields.push(`age_group = $${paramCount}`);
      updateValues.push(age_group);
    }

    if (bio !== undefined) {
      paramCount++;
      updateFields.push(`bio = $${paramCount}`);
      updateValues.push(bio);
    }

    // profile_completed와 updated_at은 항상 업데이트
    paramCount++;
    updateFields.push(`profile_completed = $${paramCount}`);
    updateValues.push(true);

    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    updateValues.push(new Date());

    // WHERE 절을 위한 userId 추가
    paramCount++;
    updateValues.push(userId);

    if (updateFields.length === 2) { // profile_completed와 updated_at만 있는 경우
      return res.status(400).json({
        success: false,
        error: '업데이트할 정보가 없습니다.'
      });
    }

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramCount} 
      RETURNING id, email, name, profile_picture, phone_number, age_group, bio, profile_completed, is_active, created_at, updated_at
    `;

    const result = await pool.query(query, updateValues);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      });
    }

    const user = result.rows[0];

    console.log('✅ 프로필 업데이트 성공:', { userId: user.id });

    res.json({
      success: true,
      message: '프로필이 성공적으로 업데이트되었습니다.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profile_picture: user.profile_picture,
          phone_number: user.phone_number,
          age_group: user.age_group,
          bio: user.bio,
          profile_completed: user.profile_completed,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      }
    });

  } catch (error) {
    console.error('❌ 프로필 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      error: '프로필 업데이트 중 오류가 발생했습니다.',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// 사용자 계정 삭제 (프로필 경로)
router.delete('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    // 관련 데이터들을 먼저 삭제 (외래키 제약조건 때문)
    await pool.query('DELETE FROM transactions WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM budgets WHERE user_id = $1', [userId]);
    
    // 사용자 삭제
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      message: '계정이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('계정 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '계정 삭제 중 오류가 발생했습니다.'
    });
  }
});

// 사용자 계정 삭제
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    // 관련 데이터들을 먼저 삭제 (외래키 제약조건 때문)
    await pool.query('DELETE FROM transactions WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM budgets WHERE user_id = $1', [userId]);
    
    // 사용자 계정 삭제
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      });
    }

    console.log('✅ 계정 삭제 성공:', { userId });

    res.json({
      success: true,
      message: '계정이 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('❌ 계정 삭제 오류:', error);
    res.status(500).json({
      success: false,
      error: '계정 삭제 중 오류가 발생했습니다.'
    });
  }
});

// 비밀번호 변경
router.patch(
  '/password',
  authenticateToken,
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be 8-128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain uppercase, lowercase, number and special character'),
  handleValidationErrors,
  async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: '현재 비밀번호와 새 비밀번호를 모두 입력해주세요.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: '새 비밀번호는 최소 6자 이상이어야 합니다.'
      });
    }

    // 현재 사용자 정보 조회
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '사용자를 찾을 수 없습니다.'
      });
    }

    const user = userResult.rows[0];

    // 현재 비밀번호 확인
    const bcrypt = require('bcryptjs');
    const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: '현재 비밀번호가 일치하지 않습니다.'
      });
    }

    // 새 비밀번호 해시화
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // 비밀번호 업데이트
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [newPasswordHash, userId]
    );

    console.log('✅ 비밀번호 변경 성공:', { userId });

    res.json({
      success: true,
      message: '비밀번호가 성공적으로 변경되었습니다.'
    });

  } catch (error) {
    console.error('❌ 비밀번호 변경 오류:', error);
    res.status(500).json({
      success: false,
      error: '비밀번호 변경 중 오류가 발생했습니다.'
    });
  }
});

export default router;