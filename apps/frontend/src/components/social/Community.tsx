import React, { useState, useEffect } from 'react';
import { useSocialHooks } from '../../hooks/useSocial';
import type { CreatePostRequest, CreateCommentRequest, CommunityPost, PostComment } from '../../types/social';

const Community: React.FC = () => {
  const {
    communityPosts,
    currentPost,
    postComments,
    communityPagination,
    loading,
    error,
    fetchCommunityPosts,
    fetchCommunityPost,
    createCommunityPost,
    togglePostLike,
    fetchPostComments,
    createComment,
  } = useSocialHooks();

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCommunityPosts(selectedCategory, currentPage);
  }, [selectedCategory, currentPage, fetchCommunityPosts]);

  const handleCreatePost = async (data: CreatePostRequest) => {
    const newPost = await createCommunityPost(data);
    if (newPost) {
      setShowCreateModal(false);
      fetchCommunityPosts(selectedCategory, 1);
      setCurrentPage(1);
    }
  };

  const handlePostClick = async (post: CommunityPost) => {
    await fetchCommunityPost(post.id);
    await fetchPostComments(post.id);
    setShowPostDetail(true);
  };

  const handleCreateComment = async (data: CreateCommentRequest) => {
    if (currentPost) {
      await createComment(currentPost.id, data);
    }
  };

  const handleToggleLike = (postId: number, isLiked: boolean) => {
    togglePostLike(postId, isLiked);
  };

  const categories = [
    { value: '', label: '전체' },
    { value: 'tip', label: '팁 공유' },
    { value: 'question', label: '질문' },
    { value: 'achievement', label: '성과 공유' },
    { value: 'discussion', label: '토론' },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tip': return 'bg-green-100 text-green-800';
      case 'question': return 'bg-blue-100 text-blue-800';
      case 'achievement': return 'bg-purple-100 text-purple-800';
      case 'discussion': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            커뮤니티
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            다른 사용자들과 금융 경험과 팁을 공유하세요
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          + 새 글 작성
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* 카테고리 필터 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => {
                setSelectedCategory(category.value);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* 게시글 목록 */}
      {loading.communityPosts ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {communityPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handlePostClick(post)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        {post.is_anonymous ? '익' : (post.author?.name?.charAt(0) || '?')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {post.is_anonymous ? '익명' : (post.author?.name || '알 수 없음')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                    {categories.find(c => c.value === post.category)?.label || post.category}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {post.content}
                </p>

                {/* 태그 */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 상호작용 버튼 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLike(post.id, post.is_liked || false);
                      }}
                      className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                        post.is_liked ? 'text-red-500' : ''
                      }`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      <span>{post.likes_count}</span>
                    </button>
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                      <span>{post.comments_count}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      <span>{post.view_count}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {communityPagination && communityPagination.total_pages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 disabled:opacity-50"
                >
                  이전
                </button>
                {Array.from({ length: communityPagination.total_pages }, (_, i) => i + 1)
                  .filter(page => Math.abs(page - currentPage) <= 2)
                  .map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm rounded ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                <button
                  onClick={() => setCurrentPage(Math.min(communityPagination.total_pages, currentPage + 1))}
                  disabled={currentPage === communityPagination.total_pages}
                  className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 disabled:opacity-50"
                >
                  다음
                </button>
              </div>
            </div>
          )}

          {communityPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                아직 게시글이 없습니다
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                첫 번째 게시글을 작성해보세요
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                글 작성하기
              </button>
            </div>
          )}
        </>
      )}

      {/* 게시글 작성 모달 */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePost}
        />
      )}

      {/* 게시글 상세 모달 */}
      {showPostDetail && currentPost && (
        <PostDetailModal
          post={currentPost}
          comments={postComments}
          onClose={() => setShowPostDetail(false)}
          onCreateComment={handleCreateComment}
          onToggleLike={handleToggleLike}
        />
      )}
    </div>
  );
};

// 게시글 작성 모달
const CreatePostModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: CreatePostRequest) => void;
}> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreatePostRequest>({
    title: '',
    content: '',
    category: 'discussion',
    tags: [],
    is_anonymous: false,
  });

  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || [],
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          새 게시글 작성
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              제목 *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="게시글 제목을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              카테고리 *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as CreatePostRequest['category'] })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="tip">팁 공유</option>
              <option value="question">질문</option>
              <option value="achievement">성과 공유</option>
              <option value="discussion">토론</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              내용 *
            </label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={10}
              placeholder="게시글 내용을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              태그
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="태그를 입력하세요"
              />
              <button
                type="button"
                onClick={addTag}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                추가
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_anonymous}
                onChange={(e) => setFormData({ ...formData, is_anonymous: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">익명으로 게시</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              취소
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              게시하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 게시글 상세 모달
const PostDetailModal: React.FC<{
  post: CommunityPost;
  comments: PostComment[];
  onClose: () => void;
  onCreateComment: (data: CreateCommentRequest) => void;
  onToggleLike: (postId: number, isLiked: boolean) => void;
}> = ({ post, comments, onClose, onCreateComment, onToggleLike }) => {
  const [commentContent, setCommentContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentContent.trim()) {
      onCreateComment({
        content: commentContent,
        is_anonymous: isAnonymous,
      });
      setCommentContent('');
      setIsAnonymous(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            게시글 상세
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* 게시글 내용 */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {post.is_anonymous ? '익' : (post.author?.name?.charAt(0) || '?')}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {post.is_anonymous ? '익명' : (post.author?.name || '알 수 없음')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h2>

          <div className="prose dark:prose-invert max-w-none mb-4">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-4">
            <button
              onClick={() => onToggleLike(post.id, post.is_liked || false)}
              className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                post.is_liked ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span>{post.likes_count}</span>
            </button>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            댓글 ({comments.length})
          </h4>

          {/* 댓글 작성 */}
          <form onSubmit={handleSubmitComment} className="mb-6">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              placeholder="댓글을 입력하세요"
              required
            />
            <div className="flex justify-between items-center mt-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">익명으로 댓글 작성</span>
              </label>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                댓글 작성
              </button>
            </div>
          </form>

          {/* 댓글 목록 */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-start space-x-3 mb-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                      {comment.is_anonymous ? '익' : (comment.author?.name?.charAt(0) || '?')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {comment.is_anonymous ? '익명' : (comment.author?.name || '알 수 없음')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
