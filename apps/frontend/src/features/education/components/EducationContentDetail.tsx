/**
 * 교육 콘텐츠 상세 페이지 컴포넌트
 * 
 * 주요 기능:
 * - 콘텐츠 메타 정보 표시 (예상 학습 시간, 조회수, 완료율 등)
 * - 학습 진행 상황 표시 및 업데이트
 * - 학습 노트 작성 및 저장
 */
import React, { useState, useEffect } from 'react';
import { 
  ClockIcon,
  EyeIcon,
  CheckCircleIcon,
  PlayIcon,
  BookmarkIcon,
  ArrowLeftIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useEducationContentDetail } from '../hooks/useEducation';
import { PageLayout, Card, Button, Grid } from '../../../index';

// 컴포넌트 Props 인터페이스
interface EducationContentDetailProps {
  contentId: number;
  onBack: () => void;
}

/**
 * 교육 콘텐츠 상세 페이지 컴포넌트
 * @param param0 EducationContentDetailProps
 * @returns JSX.Element
 */
const EducationContentDetail: React.FC<EducationContentDetailProps> = ({ contentId, onBack }) => {
  
  const { content, loading, error, updateProgress } = useEducationContentDetail(contentId);
  const [timeSpent, setTimeSpent] = useState(0);
  const [notes, setNotes] = useState('');
  const [quizScore, setQuizScore] = useState<number | undefined>();

  // 학습 시간 추적
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 60000); // 1분마다 업데이트

    return () => {
      clearInterval(interval);
      // 페이지를 떠날 때 진행 상황 저장
      if (content && timeSpent > 0) {
        updateProgress({
          completionRate: 100,
          timeSpentMinutes: timeSpent,
          notes,
          quizScore
        }).catch(console.error);
      }
    };
  }, [content, timeSpent, notes, quizScore, updateProgress]);

  const handleCompleteContent = async () => {
    if (!content) return;

    try {
      await updateProgress({
        completionRate: 100,
        timeSpentMinutes: timeSpent,
        isCompleted: true,
        notes,
        quizScore
      });
      alert('콘텐츠를 완료했습니다!');
    } catch (err) {
      console.error('Progress update failed:', err);
      alert('진행 상황 저장에 실패했습니다.');
    }
  };

  const handleSaveProgress = async () => {
    if (!content) return;

    try {
      await updateProgress({
        completionRate: 75, // 임시로 75%로 설정
        timeSpentMinutes: timeSpent,
        notes,
        quizScore
      });
      alert('진행 상황이 저장되었습니다.');
    } catch (err) {
      console.error('Progress save failed:', err);
      alert('진행 상황 저장에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="space-y-4 animate-pulse">
          <div className="w-1/3 h-8 mb-6 rounded bg-muted"></div>
          <Card>
            <div className="w-3/4 h-6 mb-4 rounded bg-muted"></div>
            <div className="w-full h-4 mb-2 rounded bg-muted"></div>
            <div className="w-2/3 h-4 mb-8 rounded bg-muted"></div>
            <div className="h-64 rounded bg-muted"></div>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <Card variant="default">
          <p className="mb-4">{error}</p>
          <Button onClick={onBack}>
            목록으로 돌아가기
          </Button>
        </Card>
      </PageLayout>
    );
  }

  if (!content) return null;

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    const labels = {
      beginner: '초급',
      intermediate: '중급',
      advanced: '고급'
    };
    return {
      color: colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800',
      label: labels[difficulty as keyof typeof labels] || difficulty
    };
  };

  const difficultyBadge = getDifficultyBadge(content.difficulty);
  const progress = content.userProgress;

  return (
    <PageLayout>
      {/* 헤더 */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          목록으로 돌아가기
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyBadge.color}`}>
            {difficultyBadge.label}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">{content.category}</span>
          {content.isFeatured && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="px-2 py-1 text-sm text-yellow-800 bg-yellow-100 rounded-full dark:bg-yellow-800 dark:text-yellow-100">
                추천 콘텐츠
              </span>
            </>
          )}
        </div>
        <h1 className="mb-2 text-3xl font-bold">{content.title}</h1>
        <p className="text-lg text-muted-foreground">{content.description}</p>
      </div>

      {/* 메타 정보 */}
      <Card className="mb-6">
        <Grid columns={4} gap="24px">
          <div className="flex items-center gap-3">
            <ClockIcon className="w-6 h-6 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">예상 학습 시간</p>
              <p className="font-medium">{content.estimatedDuration}분</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <EyeIcon className="w-6 h-6 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">조회수</p>
              <p className="font-medium">{content.viewCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ChartBarIcon className="w-6 h-6 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">완료율</p>
              <p className="font-medium">{progress?.completionRate || 0}%</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ClockIcon className="w-6 h-6 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">학습 시간</p>
              <p className="font-medium">{(progress?.timeSpentMinutes || 0) + timeSpent}분</p>
            </div>
          </div>
        </Grid>
      </Card>

      {/* 진행 상황 표시 */}
      {progress && (
        <Card className="mb-6">
          <h3 className="mb-4 text-lg font-semibold">학습 진행 상황</h3>
          <div className="w-full h-3 mb-4 rounded-full bg-muted">
            <div 
              className="h-3 transition-all duration-300 rounded-full bg-primary"
              style={{ width: `${progress.completionRate}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>진행률: {progress.completionRate}%</span>
            <span>
              {progress.isCompleted ? (
                <span className="flex items-center text-green-600">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  완료됨
                </span>
              ) : (
                '진행 중'
              )}
            </span>
          </div>
        </Card>
      )}

      {/* 학습 콘텐츠 */}
      <Card className="mb-6">
        <div className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content.content }} />
        </div>
      </Card>

      {/* 태그 */}
      {content.tags.length > 0 && (
        <Card className="mb-6">
          <h3 className="mb-4 text-lg font-semibold">관련 태그</h3>
          <div className="flex flex-wrap gap-2">
            {content.tags.map((tag: string) => (
              <span
              key={tag}
              className="px-3 py-1 text-sm text-blue-700 rounded-full bg-blue-50 dark:bg-blue-800 dark:text-blue-100"
              >
              #{tag}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* 학습 노트 */}
      <Card className="mb-6">
        <h3 className="mb-4 text-lg font-semibold">학습 노트</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="이 콘텐츠에서 배운 점이나 중요한 내용을 기록해보세요..."
          className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
        />
      </Card>

      {/* 퀴즈 점수 입력 (선택사항) */}
      <Card className="mb-6">
        <h3 className="mb-4 text-lg font-semibold">퀴즈 점수 (선택사항)</h3>
        <div className="flex items-center gap-4">
          <input
            type="number"
            min="0"
            max="100"
            value={quizScore || ''}
            onChange={(e) => setQuizScore(e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="점수 입력 (0-100)"
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
          />
          <span className="text-muted-foreground">점</span>
        </div>
      </Card>

      {/* 액션 버튼 */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button
          variant="secondary"
          onClick={handleSaveProgress}
          className="flex items-center gap-2"
        >
          <BookmarkIcon className="w-5 h-5" />
          진행 상황 저장
        </Button>
        
        {!progress?.isCompleted && (
          <Button
            variant="success"
            onClick={handleCompleteContent}
            className="flex items-center gap-2"
          >
            <CheckCircleIcon className="w-5 h-5" />
            학습 완료
          </Button>
        )}

        <Button
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <PlayIcon className="w-5 h-5" />
          다른 콘텐츠 보기
        </Button>
      </div>
    </PageLayout>
  );
};

export default EducationContentDetail;
