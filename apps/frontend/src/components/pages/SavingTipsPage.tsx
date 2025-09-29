import React, { useState } from 'react';
import { 
  LightBulbIcon,
  BanknotesIcon,
  TagIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useSavingTips } from '../../hooks/useEducation';
import { PageLayout } from '../ui/PageLayout';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Grid } from '../ui/Grid';

export const SavingTipsPage: React.FC = () => {
  const [filter, setFilter] = useState({ personalized: true });
  const [showFeedbackModal, setShowFeedbackModal] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  
  const { tips, loading, error, rateTip } = useSavingTips(filter);

  const handleRating = async (tipId: number, isHelpful: boolean, feedbackText?: string) => {
    try {
      await rateTip(tipId, isHelpful, feedbackText);
      if (isHelpful) {
        alert('도움이 된다고 평가해주셔서 감사합니다!');
      } else {
        setShowFeedbackModal(null);
        setFeedback('');
        alert('피드백 감사합니다. 더 나은 팁을 제공하겠습니다.');
      }
    } catch {
      alert('평가 저장에 실패했습니다.');
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    const badges = {
      beginner: { label: '쉬움', color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' },
      intermediate: { label: '보통', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' },
      advanced: { label: '어려움', color: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' }
    };
    return badges[difficulty as keyof typeof badges] || { label: difficulty, color: 'bg-gray-100 text-gray-800' };
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
          <Grid columns={3} gap="24px">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </Card>
            ))}
          </Grid>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <Card variant="default">
          <p>오류가 발생했습니다: {error}</p>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">절약 팁</h1>
        <p className="text-muted-foreground">
          개인 맞춤형 절약 팁으로 더 효과적인 재정 관리를 시작하세요
        </p>
      </div>

      {/* 필터 토글 */}
      <Card className="mb-8">
        <div className="flex items-center gap-4">
          <span className="font-medium">팁 유형:</span>
          <Button
            variant={filter.personalized ? "primary" : "secondary"}
            onClick={() => setFilter({ personalized: true })}
          >
            맞춤형 팁
          </Button>
          <Button
            variant={!filter.personalized ? "primary" : "secondary"}
            onClick={() => setFilter({ personalized: false })}
          >
            일반 팁
          </Button>
        </div>
      </Card>

      {/* 팁 목록 */}
      {tips.length > 0 ? (
        <Grid columns={3} gap="md">
          {tips.map((tip) => {
            const difficultyBadge = getDifficultyBadge(tip.difficulty);
            
            return (
              <Card key={tip.id} className="h-full flex flex-col">
                {/* 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      {tip.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyBadge.color}`}>
                        {difficultyBadge.label}
                      </span>
                      {tip.isPersonalized && (
                        <span className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 px-2 py-1 rounded-full text-xs font-medium">
                          맞춤형
                        </span>
                      )}
                    </div>
                  </div>
                  <LightBulbIcon className="h-6 w-6 text-yellow-500 flex-shrink-0" />
                </div>

                {/* 설명 */}
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
                  {tip.description}
                </p>

                {/* 절약 금액 */}
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <BanknotesIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-green-800 dark:text-green-200 font-medium text-sm">
                      월 최대 {tip.potentialSavings.toLocaleString()}원 절약
                    </span>
                  </div>
                </div>

                {/* 실행 단계 */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">실행 방법:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1">
                    {tip.implementationSteps.slice(0, 3).map((step, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="line-clamp-2">{step}</span>
                      </li>
                    ))}
                    {tip.implementationSteps.length > 3 && (
                      <li className="text-primary text-xs">
                        +{tip.implementationSteps.length - 3}개 단계 더...
                      </li>
                    )}
                  </ol>
                </div>

                {/* 태그 */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {tip.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded flex items-center gap-1"
                    >
                      <TagIcon className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 카테고리 */}
                <div className="text-sm text-muted-foreground mb-4">
                  카테고리: {tip.category}
                </div>

                {/* 평가 버튼 */}
                <div className="bg-muted/50 px-4 py-3 -mx-6 -mb-6 mt-auto rounded-b-lg">
                  <p className="text-sm text-muted-foreground mb-3">이 팁이 도움이 되었나요?</p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleRating(tip.id, true)}
                      className="flex items-center gap-2 text-green-700 border-green-200 hover:bg-green-50"
                    >
                      <HandThumbUpIcon className="h-4 w-4" />
                      도움됨
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowFeedbackModal(tip.id)}
                      className="flex items-center gap-2"
                    >
                      <HandThumbDownIcon className="h-4 w-4" />
                      개선 필요
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </Grid>
      ) : (
        <Card className="text-center py-12">
          <LightBulbIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            절약 팁이 없습니다
          </h3>
          <p className="text-muted-foreground">
            {filter.personalized 
              ? '개인 맞춤형 팁을 생성하기 위해 더 많은 거래 데이터가 필요합니다.' 
              : '곧 새로운 절약 팁이 추가될 예정입니다.'
            }
          </p>
        </Card>
      )}

      {/* 피드백 모달 */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">피드백을 남겨주세요</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowFeedbackModal(null);
                  setFeedback('');
                }}
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-muted-foreground mb-4">
              이 팁을 어떻게 개선할 수 있을지 알려주세요.
            </p>
            
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="개선 사항을 입력해주세요..."
              className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-background"
            />
            
            <div className="flex items-center gap-3 mt-4">
              <Button
                onClick={() => handleRating(showFeedbackModal, false, feedback)}
                className="flex-1"
              >
                피드백 제출
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowFeedbackModal(null);
                  setFeedback('');
                }}
              >
                취소
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 하단 액션 */}
      <Card className="mt-12 bg-gradient-to-r from-green-500 to-blue-600 text-white border-none">
        <h3 className="text-xl font-bold mb-2">더 많은 절약 팁이 필요하세요?</h3>
        <p className="mb-4 opacity-90">
          교육 콘텐츠를 통해 체계적인 절약 방법을 배워보세요.
        </p>
        <Button
          variant="secondary"
          onClick={() => setFilter({ personalized: !filter.personalized })}
          className="bg-white text-blue-600 hover:bg-gray-50"
        >
          {filter.personalized ? '일반 팁' : '맞춤형 팁'} 보기
        </Button>
      </Card>
    </PageLayout>
  );
};
