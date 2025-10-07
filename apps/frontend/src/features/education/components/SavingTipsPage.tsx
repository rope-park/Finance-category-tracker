/**
 * 절약 팁 페이지 컴포넌트
 * 
 * 주요 기능:
 * - 맞춤형 및 일반 절약 팁 필터링
 * - 팁 카드에 난이도, 절약 금액, 실행 단계, 태그 표시
 * - 팁에 대한 사용자 평가 및 피드백 수집
 */
import React, { useState } from 'react';
import { 
  LightBulbIcon,
  BanknotesIcon,
  TagIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useSavingTips } from '../hooks/useEducation';
import { PageLayout, Card, Button, Grid } from '../../../index';

/**
 * SavingTipsPage 컴포넌트
 * @returns {JSX.Element} 절약 팁 페이지
 */
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
        <div className="space-y-4 animate-pulse">
          <div className="w-1/3 h-8 mb-6 rounded bg-muted"></div>
          <Grid columns={3} gap="24px">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <div className="w-3/4 h-6 mb-4 rounded bg-muted"></div>
                <div className="w-full h-4 mb-2 rounded bg-muted"></div>
                <div className="w-2/3 h-4 rounded bg-muted"></div>
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
        <h1 className="mb-2 text-3xl font-bold">절약 팁</h1>
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
              <Card key={tip.id} className="flex flex-col h-full">
                {/* 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-semibold">
                      {tip.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyBadge.color}`}>
                        {difficultyBadge.label}
                      </span>
                      {tip.isPersonalized && (
                        <span className="px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full dark:bg-purple-800 dark:text-purple-100">
                          맞춤형
                        </span>
                      )}
                    </div>
                  </div>
                  <LightBulbIcon className="flex-shrink-0 w-6 h-6 text-yellow-500" />
                </div>

                {/* 설명 */}
                <p className="flex-1 mb-4 text-sm text-muted-foreground line-clamp-3">
                  {tip.description}
                </p>

                {/* 절약 금액 */}
                <div className="p-3 mb-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <BanknotesIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      월 최대 {tip.potentialSavings.toLocaleString()}원 절약
                    </span>
                  </div>
                </div>

                {/* 실행 단계 */}
                <div className="mb-4">
                  <h4 className="mb-2 font-medium">실행 방법:</h4>
                  <ol className="space-y-1 text-sm text-muted-foreground">
                    {tip.implementationSteps.slice(0, 3).map((step, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="line-clamp-2">{step}</span>
                      </li>
                    ))}
                    {tip.implementationSteps.length > 3 && (
                      <li className="text-xs text-primary">
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
                      className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-muted text-muted-foreground"
                    >
                      <TagIcon className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 카테고리 */}
                <div className="mb-4 text-sm text-muted-foreground">
                  카테고리: {tip.category}
                </div>

                {/* 평가 버튼 */}
                <div className="px-4 py-3 mt-auto -mx-6 -mb-6 rounded-b-lg bg-muted/50">
                  <p className="mb-3 text-sm text-muted-foreground">이 팁이 도움이 되었나요?</p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleRating(tip.id, true)}
                      className="flex items-center gap-2 text-green-700 border-green-200 hover:bg-green-50"
                    >
                      <HandThumbUpIcon className="w-4 h-4" />
                      도움됨
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowFeedbackModal(tip.id)}
                      className="flex items-center gap-2"
                    >
                      <HandThumbDownIcon className="w-4 h-4" />
                      개선 필요
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </Grid>
      ) : (
        <Card className="py-12 text-center">
          <LightBulbIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
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
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>
            
            <p className="mb-4 text-muted-foreground">
              이 팁을 어떻게 개선할 수 있을지 알려주세요.
            </p>
            
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="개선 사항을 입력해주세요..."
              className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
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
      <Card className="mt-12 text-white border-none bg-gradient-to-r from-green-500 to-blue-600">
        <h3 className="mb-2 text-xl font-bold">더 많은 절약 팁이 필요하세요?</h3>
        <p className="mb-4 opacity-90">
          교육 콘텐츠를 통해 체계적인 절약 방법을 배워보세요.
        </p>
        <Button
          variant="secondary"
          onClick={() => setFilter({ personalized: !filter.personalized })}
          className="text-blue-600 bg-white hover:bg-gray-50"
        >
          {filter.personalized ? '일반 팁' : '맞춤형 팁'} 보기
        </Button>
      </Card>
    </PageLayout>
  );
};
