/**
 * 맞춤 조언 페이지 컴포넌트
 * 
 * 주요 기능:
 * - 사용자 맞춤 재정 조언 표시
 * - 조언 생성, 읽음 처리, 해제 기능
 * - 우선순위에 따른 시각적 구분
 */
import React, { useState } from 'react';
import { 
  LightBulbIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { usePersonalizedAdvice } from '../hooks/useEducation';
import { PageLayout, Card, Button, Grid } from '../../../index';

// 맞춤 조언 페이지 컴포넌트
const PersonalizedAdvicePage: React.FC = () => {
  const { 
    advice, 
    loading, 
    error, 
    generateNewAdvice, 
    markAsRead, 
    dismissAdvice 
  } = usePersonalizedAdvice();
  
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAdvice = async () => {
    try {
      setIsGenerating(true);
      await generateNewAdvice();
      alert('새로운 맞춤 조언이 생성되었습니다!');
    } catch {
      alert('조언 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMarkAsRead = async (adviceId: number) => {
    try {
      await markAsRead(adviceId);
    } catch {
      alert('읽음 처리에 실패했습니다.');
    }
  };

  const handleDismissAdvice = async (adviceId: number) => {
    try {
      await dismissAdvice(adviceId);
    } catch {
      alert('조언 해제에 실패했습니다.');
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return { icon: ExclamationTriangleIcon, color: 'text-red-500' };
      case 'medium':
        return { icon: InformationCircleIcon, color: 'text-yellow-500' };
      case 'low':
        return { icon: CheckCircleIcon, color: 'text-green-500' };
      default:
        return { icon: InformationCircleIcon, color: 'text-gray-500' };
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    const labels = {
      high: '높음',
      medium: '보통',
      low: '낮음'
    };
    return {
      color: colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800',
      label: labels[priority as keyof typeof labels] || priority
    };
  };

  // 읽지 않은 조언과 읽은 조언을 분리
  const unreadAdvice = advice.filter(item => !item.isRead && !item.isDismissed);
  const readAdvice = advice.filter(item => item.isRead && !item.isDismissed);

  if (loading) {
    return (
      <PageLayout>
        <div className="space-y-4 animate-pulse">
          <div className="w-1/3 h-8 mb-6 rounded bg-muted"></div>
          <Grid columns={1} gap="24px">
            {[...Array(3)].map((_, i) => (
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
        <Card className="text-red-700 border-red-200 bg-red-50">
          <p>오류가 발생했습니다: {error}</p>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">맞춤 조언</h1>
        <p className="text-muted-foreground">
          개인의 재정 상황에 맞는 전문적인 조언을 확인하세요
        </p>
      </div>

      {/* 새 조언 생성 버튼 */}
      <Card className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="mb-2 text-lg font-semibold">최신 조언 받기</h3>
            <p className="text-muted-foreground">
              현재 재정 상황을 분석하여 새로운 맞춤 조언을 생성합니다
            </p>
          </div>
          <Button
            onClick={handleGenerateAdvice}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <SparklesIcon className="w-5 h-5" />
            {isGenerating ? '생성 중...' : '새 조언 생성'}
          </Button>
        </div>
      </Card>

      {/* 읽지 않은 조언 */}
      {unreadAdvice.length > 0 && (
        <div className="mb-8">
          <h2 className="flex items-center gap-2 mb-4 text-xl font-semibold">
            <LightBulbIcon className="w-6 h-6 text-primary" />
            새로운 조언 ({unreadAdvice.length})
          </h2>
          
          <Grid columns={1} gap="24px">
            {unreadAdvice.map((item) => {
              const priorityIcon = getPriorityIcon(item.priority);
              const priorityBadge = getPriorityBadge(item.priority);
              const PriorityIcon = priorityIcon.icon;
              
              return (
                <Card 
                  key={item.id} 
                  className="border-l-4 border-primary"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {item.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityBadge.color}`}>
                          {priorityBadge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                        <PriorityIcon className={`h-4 w-4 ${priorityIcon.color}`} />
                        <span>{item.adviceType}</span>
                        <span>•</span>
                        <ClockIcon className="w-4 h-4" />
                        <span>{new Date(item.createdAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(item.id)}
                        className="text-green-600 hover:bg-green-50"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismissAdvice(item.id)}
                        className="text-muted-foreground hover:bg-muted"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="prose max-w-none">
                    <p className="leading-relaxed">{item.content}</p>
                  </div>

                  {/* 만료일 표시 */}
                  {item.expiresAt && (
                    <div className="p-3 mt-4 border border-yellow-200 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⏰ 이 조언은 {new Date(item.expiresAt).toLocaleDateString('ko-KR')}까지 유효합니다
                      </p>
                    </div>
                  )}
                </Card>
              );
            })}
          </Grid>
        </div>
      )}

      {/* 읽은 조언 */}
      {readAdvice.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">
            읽은 조언 ({readAdvice.length})
          </h2>
          
          <Grid columns={1} gap="24px">
            {readAdvice.map((item) => {
              const priorityBadge = getPriorityBadge(item.priority);
              
              return (
                <Card 
                  key={item.id} 
                  className="transition-opacity opacity-75 hover:opacity-100 bg-muted/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-muted-foreground">
                          {item.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityBadge.color} opacity-75`}>
                          {priorityBadge.label}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-800 dark:text-green-100">
                          읽음
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                        <span>{item.adviceType}</span>
                        <span>•</span>
                        <span>{new Date(item.updatedAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismissAdvice(item.id)}
                      className="text-muted-foreground hover:bg-muted"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <p className="leading-relaxed text-muted-foreground line-clamp-3">{item.content}</p>
                </Card>
              );
            })}
          </Grid>
        </div>
      )}

      {/* 조언이 없는 경우 */}
      {advice.length === 0 && (
        <Card className="py-12 text-center">
          <LightBulbIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">
            아직 맞춤 조언이 없습니다
          </h3>
          <p className="mb-6 text-muted-foreground">
            거래 데이터를 바탕으로 개인화된 조언을 생성해보세요
          </p>
          <Button
            onClick={handleGenerateAdvice}
            disabled={isGenerating}
            className="inline-flex items-center gap-2"
          >
            <SparklesIcon className="w-5 h-5" />
            {isGenerating ? '생성 중...' : '첫 조언 생성하기'}
          </Button>
        </Card>
      )}

      {/* 도움말 */}
      <Card className="mt-12 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
        <h3 className="mb-2 text-lg font-semibold text-blue-900 dark:text-blue-100">💡 조언 활용 팁</h3>
        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>• 조언은 최근 거래 패턴과 재정 상황을 분석하여 생성됩니다</li>
          <li>• 우선순위가 높은 조언부터 확인하시는 것을 권장합니다</li>
          <li>• 조언을 실행한 후 재정 상황이 개선되는지 모니터링하세요</li>
          <li>• 정기적으로 새로운 조언을 생성하여 최신 상황을 반영하세요</li>
        </ul>
      </Card>
    </PageLayout>
  );
};

export default PersonalizedAdvicePage;
