import pool from '../../core/config/database';

export interface PostData {
  title: string;
  content: string;
  category: string;
  tags?: string[];
  isAnonymous?: boolean;
  authorId: number;
  status: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
}

export interface CommentData {
  postId: number;
  authorId: number;
  content: string;
  parentCommentId?: number;
  isAnonymous?: boolean;
  likesCount: number;
}

export class CommunityRepository {
  // 포스트 생성
  async createPost(postData: PostData): Promise<any> {
    const query = `
      INSERT INTO community_posts (author_id, title, content, category, tags, likes_count, comments_count, views_count, is_anonymous, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *
    `;
    
    const values = [
      postData.authorId,
      postData.title,
      postData.content,
      postData.category,
      postData.tags ? JSON.stringify(postData.tags) : null,
      postData.likesCount,
      postData.commentsCount,
      postData.viewsCount,
      postData.isAnonymous || false,
      postData.status
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 포스트 목록 조회
  async findPosts(filters: any): Promise<{ posts: any[]; total: number }> {
    let whereClause = 'WHERE p.status = $1';
    const values: any[] = ['published'];
    let paramCount = 1;

    if (filters.category) {
      paramCount++;
      whereClause += ` AND p.category = $${paramCount}`;
      values.push(filters.category);
    }

    if (filters.search) {
      paramCount++;
      whereClause += ` AND (p.title ILIKE $${paramCount} OR p.content ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
    }

    if (filters.tags && filters.tags.length > 0) {
      paramCount++;
      whereClause += ` AND p.tags::jsonb ?| $${paramCount}`;
      values.push(filters.tags);
    }

    // 총 개수 조회
    const countQuery = `
      SELECT COUNT(*) as total
      FROM community_posts p
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // 정렬 조건
    let orderBy = 'ORDER BY p.created_at DESC';
    if (filters.sortBy === 'popular') {
      orderBy = 'ORDER BY p.likes_count DESC';
    } else if (filters.sortBy === 'trending') {
      orderBy = 'ORDER BY (p.likes_count + p.comments_count) DESC';
    }

    // 포스트 목록 조회
    let query = `
      SELECT p.*, 
             CASE WHEN p.is_anonymous THEN '익명' ELSE u.name END as author_name,
             CASE WHEN p.is_anonymous THEN NULL ELSE u.email END as author_email
      FROM community_posts p
      LEFT JOIN users u ON p.author_id = u.id
      ${whereClause}
      ${orderBy}
    `;

    if (filters.page && filters.limit) {
      const offset = (filters.page - 1) * filters.limit;
      query += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      values.push(filters.limit, offset);
    }

    const result = await pool.query(query, values);
    
    return {
      posts: result.rows.map(row => ({
        ...row,
        tags: row.tags ? JSON.parse(row.tags) : []
      })),
      total
    };
  }

  // 포스트 상세 조회
  async findPostById(postId: number): Promise<any> {
    const query = `
      SELECT p.*, 
             CASE WHEN p.is_anonymous THEN '익명' ELSE u.name END as author_name,
             CASE WHEN p.is_anonymous THEN NULL ELSE u.email END as author_email
      FROM community_posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.id = $1 AND p.status = 'published'
    `;
    
    const result = await pool.query(query, [postId]);
    const post = result.rows[0];
    
    if (post && post.tags) {
      post.tags = JSON.parse(post.tags);
    }
    
    return post;
  }

  // 조회수 증가
  async incrementViews(postId: number): Promise<void> {
    const query = `
      UPDATE community_posts 
      SET views_count = views_count + 1, updated_at = NOW()
      WHERE id = $1
    `;
    
    await pool.query(query, [postId]);
  }

  // 댓글 생성
  async createComment(commentData: CommentData): Promise<any> {
    const query = `
      INSERT INTO post_comments (post_id, author_id, content, parent_comment_id, is_anonymous, likes_count, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `;
    
    const values = [
      commentData.postId,
      commentData.authorId,
      commentData.content,
      commentData.parentCommentId,
      commentData.isAnonymous || false,
      commentData.likesCount
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // 댓글 수 증가
  async incrementCommentCount(postId: number): Promise<void> {
    const query = `
      UPDATE community_posts 
      SET comments_count = comments_count + 1, updated_at = NOW()
      WHERE id = $1
    `;
    
    await pool.query(query, [postId]);
  }

  // 좋아요 조회
  async findLike(postId: number, userId: number): Promise<any> {
    const query = `
      SELECT * FROM post_likes 
      WHERE post_id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(query, [postId, userId]);
    return result.rows[0];
  }

  // 좋아요 생성
  async createLike(postId: number, userId: number): Promise<any> {
    const query = `
      INSERT INTO post_likes (post_id, user_id, created_at)
      VALUES ($1, $2, NOW())
      RETURNING *
    `;
    
    const result = await pool.query(query, [postId, userId]);
    return result.rows[0];
  }

  // 좋아요 삭제
  async removeLike(postId: number, userId: number): Promise<void> {
    const query = `
      DELETE FROM post_likes 
      WHERE post_id = $1 AND user_id = $2
    `;
    
    await pool.query(query, [postId, userId]);
  }

  // 좋아요 수 증가
  async incrementLikeCount(postId: number): Promise<any> {
    const query = `
      UPDATE community_posts 
      SET likes_count = likes_count + 1, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [postId]);
    return result.rows[0];
  }

  // 좋아요 수 감소
  async decrementLikeCount(postId: number): Promise<any> {
    const query = `
      UPDATE community_posts 
      SET likes_count = GREATEST(0, likes_count - 1), updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [postId]);
    return result.rows[0];
  }

  // 사용자가 좋아요한 포스트 목록
  async findUserLikedPosts(userId: number, page: number, limit: number): Promise<{ posts: any[]; total: number }> {
    const countQuery = `
      SELECT COUNT(*) as total
      FROM post_likes pl
      JOIN community_posts p ON pl.post_id = p.id
      WHERE pl.user_id = $1 AND p.status = 'published'
    `;
    const countResult = await pool.query(countQuery, [userId]);
    const total = parseInt(countResult.rows[0].total);

    const offset = (page - 1) * limit;
    const query = `
      SELECT p.*, pl.created_at as liked_at,
             CASE WHEN p.is_anonymous THEN '익명' ELSE u.name END as author_name
      FROM post_likes pl
      JOIN community_posts p ON pl.post_id = p.id
      LEFT JOIN users u ON p.author_id = u.id
      WHERE pl.user_id = $1 AND p.status = 'published'
      ORDER BY pl.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, limit, offset]);
    
    return {
      posts: result.rows.map(row => ({
        ...row,
        tags: row.tags ? JSON.parse(row.tags) : []
      })),
      total
    };
  }

  // 사용자 포스트 목록
  async findUserPosts(userId: number, page: number, limit: number): Promise<{ posts: any[]; total: number }> {
    const countQuery = `
      SELECT COUNT(*) as total
      FROM community_posts
      WHERE author_id = $1 AND status = 'published'
    `;
    const countResult = await pool.query(countQuery, [userId]);
    const total = parseInt(countResult.rows[0].total);

    const offset = (page - 1) * limit;
    const query = `
      SELECT p.*, u.name as author_name
      FROM community_posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.author_id = $1 AND p.status = 'published'
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, limit, offset]);
    
    return {
      posts: result.rows.map(row => ({
        ...row,
        tags: row.tags ? JSON.parse(row.tags) : []
      })),
      total
    };
  }

  // 게시글 수정
  static async updatePost(postId: number, userId: number, updateData: {
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];
  }): Promise<any> {
    try {
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (updateData.title !== undefined) {
        updates.push(`title = $${paramIndex++}`);
        values.push(updateData.title);
      }
      if (updateData.content !== undefined) {
        updates.push(`content = $${paramIndex++}`);
        values.push(updateData.content);
      }
      if (updateData.category !== undefined) {
        updates.push(`category = $${paramIndex++}`);
        values.push(updateData.category);
      }
      if (updateData.tags !== undefined) {
        updates.push(`tags = $${paramIndex++}`);
        values.push(JSON.stringify(updateData.tags));
      }

      if (updates.length === 0) {
        throw new Error('수정할 데이터가 없습니다');
      }

      updates.push(`updated_at = $${paramIndex++}`);
      values.push(new Date());
      
      values.push(postId, userId);

      const query = `
        UPDATE community_posts 
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex++} AND author_id = $${paramIndex}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('게시글을 찾을 수 없거나 수정 권한이 없습니다');
      }

      return result.rows[0];
    } catch (error) {
      console.error('게시글 수정 오류:', error);
      throw error;
    }
  }

  // 게시글 삭제
  static async deletePost(postId: number, userId: number): Promise<void> {
    try {
      const result = await pool.query(
        'DELETE FROM community_posts WHERE id = $1 AND author_id = $2',
        [postId, userId]
      );

      if (result.rowCount === 0) {
        throw new Error('게시글을 찾을 수 없거나 삭제 권한이 없습니다');
      }
    } catch (error) {
      console.error('게시글 삭제 오류:', error);
      throw error;
    }
  }

  // 게시글 댓글 목록 조회
  static async getPostComments(postId: number, filters: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  } = {}): Promise<{ comments: any[]; total: number }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 50;
      const offset = (page - 1) * limit;
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'ASC';

      // 전체 댓글 수 조회
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM post_comments WHERE post_id = $1',
        [postId]
      );
      const total = parseInt(countResult.rows[0].count);

      // 댓글 목록 조회 (대댓글 포함)
      const commentsResult = await pool.query(`
        WITH RECURSIVE comment_tree AS (
          -- 최상위 댓글
          SELECT 
            c.*,
            u.name as author_name,
            u.profile_picture as author_avatar,
            0 as depth,
            ARRAY[c.created_at] as path
          FROM post_comments c
          JOIN users u ON c.author_id = u.id
          WHERE c.post_id = $1 AND c.parent_id IS NULL
          
          UNION ALL
          
          -- 대댓글
          SELECT 
            c.*,
            u.name as author_name,
            u.profile_picture as author_avatar,
            ct.depth + 1,
            ct.path || c.created_at
          FROM post_comments c
          JOIN users u ON c.author_id = u.id
          JOIN comment_tree ct ON c.parent_id = ct.id
          WHERE c.post_id = $1
        )
        SELECT * FROM comment_tree
        ORDER BY path, ${sortBy} ${sortOrder}
        LIMIT $2 OFFSET $3
      `, [postId, limit, offset]);

      return {
        comments: commentsResult.rows,
        total
      };
    } catch (error) {
      console.error('댓글 목록 조회 오류:', error);
      throw error;
    }
  }

  // 댓글 수정
  static async updateComment(commentId: number, userId: number, updateData: {
    content: string;
  }): Promise<any> {
    try {
      const result = await pool.query(`
        UPDATE post_comments 
        SET content = $1, updated_at = $2
        WHERE id = $3 AND author_id = $4
        RETURNING *
      `, [updateData.content, new Date(), commentId, userId]);

      if (result.rows.length === 0) {
        throw new Error('댓글을 찾을 수 없거나 수정 권한이 없습니다');
      }

      return result.rows[0];
    } catch (error) {
      console.error('댓글 수정 오류:', error);
      throw error;
    }
  }

  // 댓글 삭제
  static async deleteComment(commentId: number, userId: number): Promise<void> {
    try {
      const result = await pool.query(
        'DELETE FROM post_comments WHERE id = $1 AND author_id = $2',
        [commentId, userId]
      );

      if (result.rowCount === 0) {
        throw new Error('댓글을 찾을 수 없거나 삭제 권한이 없습니다');
      }
    } catch (error) {
      console.error('댓글 삭제 오류:', error);
      throw error;
    }
  }

  // 댓글 좋아요/취소
  static async toggleCommentLike(commentId: number, userId: number): Promise<{ liked: boolean; likeCount: number }> {
    try {
      // 기존 좋아요 확인
      const existingLike = await pool.query(
        'SELECT id FROM post_likes WHERE comment_id = $1 AND user_id = $2',
        [commentId, userId]
      );

      let liked: boolean;

      if (existingLike.rows.length > 0) {
        // 좋아요 취소
        await pool.query(
          'DELETE FROM post_likes WHERE comment_id = $1 AND user_id = $2',
          [commentId, userId]
        );
        liked = false;
      } else {
        // 좋아요 추가
        await pool.query(
          'INSERT INTO post_likes (comment_id, user_id) VALUES ($1, $2)',
          [commentId, userId]
        );
        liked = true;
      }

      // 좋아요 수 조회
      const likeCountResult = await pool.query(
        'SELECT COUNT(*) FROM post_likes WHERE comment_id = $1',
        [commentId]
      );

      return {
        liked,
        likeCount: parseInt(likeCountResult.rows[0].count)
      };
    } catch (error) {
      console.error('댓글 좋아요 토글 오류:', error);
      throw error;
    }
  }

  // 인기 게시글 조회
  static async getPopularPosts(filters: {
    period?: 'day' | 'week' | 'month';
    limit?: number;
    category?: string;
  } = {}): Promise<any[]> {
    try {
      const limit = filters.limit || 10;
      const period = filters.period || 'week';
      
      let dateFilter = '';
      switch (period) {
        case 'day':
          dateFilter = "AND p.created_at >= NOW() - INTERVAL '1 day'";
          break;
        case 'week':
          dateFilter = "AND p.created_at >= NOW() - INTERVAL '1 week'";
          break;
        case 'month':
          dateFilter = "AND p.created_at >= NOW() - INTERVAL '1 month'";
          break;
      }

      let categoryFilter = '';
      const queryParams: any[] = [limit];
      if (filters.category) {
        categoryFilter = 'AND p.category = $2';
        queryParams.splice(1, 0, filters.category);
      }

      const result = await pool.query(`
        SELECT 
          p.*,
          u.name as author_name,
          u.profile_picture as author_avatar,
          COUNT(DISTINCT pl.id) as like_count,
          COUNT(DISTINCT pc.id) as comment_count,
          (COUNT(DISTINCT pl.id) * 2 + COUNT(DISTINCT pc.id) + p.view_count) as popularity_score
        FROM community_posts p
        JOIN users u ON p.author_id = u.id
        LEFT JOIN post_likes pl ON p.id = pl.post_id
        LEFT JOIN post_comments pc ON p.id = pc.post_id
        WHERE 1=1 ${dateFilter} ${categoryFilter}
        GROUP BY p.id, u.name, u.profile_picture
        ORDER BY popularity_score DESC, p.created_at DESC
        LIMIT $1
      `, queryParams);

      return result.rows;
    } catch (error) {
      console.error('인기 게시글 조회 오류:', error);
      throw error;
    }
  }

  // 게시글 통계
  static async getPostStats(postId: number): Promise<{
    viewCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
  }> {
    try {
      const result = await pool.query(`
        SELECT 
          p.view_count,
          COUNT(DISTINCT pl.id) as like_count,
          COUNT(DISTINCT pc.id) as comment_count,
          0 as share_count
        FROM community_posts p
        LEFT JOIN post_likes pl ON p.id = pl.post_id
        LEFT JOIN post_comments pc ON p.id = pc.post_id
        WHERE p.id = $1
        GROUP BY p.id, p.view_count
      `, [postId]);

      if (result.rows.length === 0) {
        throw new Error('게시글을 찾을 수 없습니다');
      }

      const stats = result.rows[0];
      return {
        viewCount: parseInt(stats.view_count),
        likeCount: parseInt(stats.like_count),
        commentCount: parseInt(stats.comment_count),
        shareCount: parseInt(stats.share_count)
      };
    } catch (error) {
      console.error('게시글 통계 조회 오류:', error);
      throw error;
    }
  }

  // 사용자 활동 통계
  static async getUserActivityStats(userId: number): Promise<{
    postCount: number;
    commentCount: number;
    likeCount: number;
    totalViews: number;
  }> {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(DISTINCT p.id) as post_count,
          COUNT(DISTINCT pc.id) as comment_count,
          COUNT(DISTINCT pl.id) as like_count,
          COALESCE(SUM(p.view_count), 0) as total_views
        FROM users u
        LEFT JOIN community_posts p ON u.id = p.author_id
        LEFT JOIN post_comments pc ON u.id = pc.author_id
        LEFT JOIN post_likes pl ON u.id = pl.user_id
        WHERE u.id = $1
        GROUP BY u.id
      `, [userId]);

      if (result.rows.length === 0) {
        return {
          postCount: 0,
          commentCount: 0,
          likeCount: 0,
          totalViews: 0
        };
      }

      const stats = result.rows[0];
      return {
        postCount: parseInt(stats.post_count),
        commentCount: parseInt(stats.comment_count),
        likeCount: parseInt(stats.like_count),
        totalViews: parseInt(stats.total_views)
      };
    } catch (error) {
      console.error('사용자 활동 통계 조회 오류:', error);
      throw error;
    }
  }

  // 인기 태그 조회
  async getPopularTags(limit: number): Promise<Array<{ tag: string; count: number }>> {
    const query = `
      SELECT tag, COUNT(*) as count
      FROM (
        SELECT jsonb_array_elements_text(tags) as tag
        FROM community_posts 
        WHERE status = 'published' AND tags IS NOT NULL
      ) t
      GROUP BY tag
      ORDER BY count DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows.map(row => ({
      tag: row.tag,
      count: parseInt(row.count)
    }));
  }

  // 커뮤니티 통계
  async getCommunityStats(): Promise<any> {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM community_posts WHERE status = 'published') as total_posts,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM community_posts 
         WHERE status = 'published' AND created_at >= NOW() - INTERVAL '7 days') as posts_this_week
    `;
    
    const result = await pool.query(query);
    const stats = result.rows[0];

    // 인기 카테고리
    const categoryQuery = `
      SELECT category, COUNT(*) as count
      FROM community_posts 
      WHERE status = 'published'
      GROUP BY category
      ORDER BY count DESC
      LIMIT 5
    `;
    
    const categoryResult = await pool.query(categoryQuery);
    
    return {
      totalPosts: parseInt(stats.total_posts),
      totalUsers: parseInt(stats.total_users),
      postsThisWeek: parseInt(stats.posts_this_week),
      popularCategories: categoryResult.rows.map(row => ({
        category: row.category,
        count: parseInt(row.count)
      }))
    };
  }

  // 추천 포스트
  async getRecommendedPosts(userId: number, limit: number): Promise<any[]> {
    // 사용자의 최근 좋아요한 포스트의 카테고리 분석
    const userPrefsQuery = `
      SELECT p.category, COUNT(*) as freq
      FROM post_likes pl
      JOIN community_posts p ON pl.post_id = p.id
      WHERE pl.user_id = $1
      GROUP BY p.category
      ORDER BY freq DESC
      LIMIT 2
    `;
    
    const prefsResult = await pool.query(userPrefsQuery, [userId]);
    const preferredCategories = prefsResult.rows.map(row => row.category);

    if (preferredCategories.length === 0) {
      // 관심사 데이터가 없으면 인기 포스트 추천
      const query = `
        SELECT p.*, 
               CASE WHEN p.is_anonymous THEN '익명' ELSE u.name END as author_name
        FROM community_posts p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE p.status = 'published' AND p.author_id != $1
        ORDER BY p.likes_count DESC
        LIMIT $2
      `;
      
      const result = await pool.query(query, [userId, limit]);
      return result.rows.map(row => ({
        ...row,
        tags: row.tags ? JSON.parse(row.tags) : []
      }));
    }

    // 관심 카테고리의 인기 포스트 추천
    const query = `
      SELECT p.*, 
             CASE WHEN p.is_anonymous THEN '익명' ELSE u.name END as author_name
      FROM community_posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.status = 'published' 
        AND p.author_id != $1 
        AND p.category = ANY($2)
      ORDER BY (p.likes_count + p.comments_count) DESC
      LIMIT $3
    `;
    
    const result = await pool.query(query, [userId, preferredCategories, limit]);
    return result.rows.map(row => ({
      ...row,
      tags: row.tags ? JSON.parse(row.tags) : []
    }));
  }
}
