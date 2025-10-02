import { useState } from 'react';
import { useEducationDashboard } from '../hooks/useEducation';
import { useApp } from '../../../app/hooks/useApp';

import { 
  PageLayout, 
  Section, 
  Card, 
  Grid,
  Button,
  StatsCard,
  TabNavigation
} from '../../../index';
import { colors } from '../../../styles/theme';

// 교육 페이지들
import EducationContentList from './EducationContentList';
import EducationContentDetail from './EducationContentDetail';
import HealthScorePage from '../../analytics/components/HealthScorePage';
import { SavingTipsPage } from '../components/SavingTipsPage';
import PersonalizedAdvicePage from '../components/PersonalizedAdvicePage';

type EducationPage = 'dashboard' | 'content' | 'content-detail' | 'health-score' | 'tips' | 'advice';

const EducationDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<EducationPage>('dashboard');
  const [selectedContentId, setSelectedContentId] = useState<string | number | undefined>();
  const { dashboard, loading, error } = useEducationDashboard();
  const { darkMode } = useApp();

  // 탭 네비게이션 설정
  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: '🏠' },
    { id: 'content', label: '교육 콘텐츠', icon: '📚' },
    { id: 'health-score', label: '건강도 점수', icon: '📊' },
    { id: 'tips', label: '절약 팁', icon: '💡' },
    { id: 'advice', label: '맞춤 조언', icon: '🎯' }
  ];

  const handleTabChange = (tabId: string) => {
    setCurrentPage(tabId as EducationPage);
  };

  const handleContentSelect = (contentId: string | number) => {
    setSelectedContentId(contentId);
    setCurrentPage('content-detail');
  };

  // 대시보드가 아닌 페이지에서는 TabNavigation을 사용
  if (currentPage !== 'dashboard') {
    return (
      <PageLayout>
        <TabNavigation 
          tabs={tabs}
          activeTab={currentPage}
          onTabChange={handleTabChange}
        />
        
        {currentPage === 'content' && (
          <EducationContentList onContentSelect={handleContentSelect} />
        )}
        
        {currentPage === 'content-detail' && selectedContentId && (
          <EducationContentDetail 
            contentId={typeof selectedContentId === 'string' ? parseInt(selectedContentId) : selectedContentId} 
            onBack={() => setCurrentPage('content')}
          />
        )}
        
        {currentPage === 'health-score' && (
          <HealthScorePage onNavigate={(page) => setCurrentPage(page)} />
        )}
        
        {currentPage === 'tips' && (
          <SavingTipsPage />
        )}
        
        {currentPage === 'advice' && (
          <PersonalizedAdvicePage />
        )}
      </PageLayout>
    );
  }

  // 로딩 상태
  if (loading) {
    return (
      <PageLayout>
        <Section title="교육 센터" subtitle="재정 관리 실력을 향상시키고 건강한 금융 습관을 기르세요" icon="🎓">
          <Grid columns={4}>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <div style={{ padding: '24px' }}>
                  <div style={{ 
                    height: '20px', 
                    backgroundColor: darkMode ? colors.dark[600] : colors.gray[200], 
                    borderRadius: '4px',
                    marginBottom: '16px'
                  }}></div>
                  <div style={{ 
                    height: '40px', 
                    backgroundColor: darkMode ? colors.dark[600] : colors.gray[200], 
                    borderRadius: '4px'
                  }}></div>
                </div>
              </Card>
            ))}
          </Grid>
        </Section>
      </PageLayout>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <PageLayout>
        <Section title="교육 센터" subtitle="재정 관리 실력을 향상시키고 건강한 금융 습관을 기르세요" icon="🎓">
          <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h3 className="heading-3 high-contrast" style={{
              color: darkMode ? colors.dark[100] : colors.gray[900],
              margin: '0 0 8px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              오류가 발생했습니다
            </h3>
            <p className="text-sm readable-text" style={{
              color: darkMode ? colors.dark[400] : colors.gray[600],
              margin: '0 0 24px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              {error}
            </p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              다시 시도
            </Button>
          </Card>
        </Section>
      </PageLayout>
    );
  }

  if (!dashboard) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.success[600];
    if (score >= 60) return colors.warning[500];
    return colors.error[600];
  };

  return (
    <PageLayout>
      <TabNavigation 
        tabs={tabs}
        activeTab={currentPage}
        onTabChange={handleTabChange}
      />

      <Section 
        title="교육 센터" 
        subtitle="재정 관리 실력을 향상시키고 건강한 금융 습관을 기르세요" 
        icon="🎓"
      >
        {/* 주요 지표 - StatsCard 사용 */}
        <Grid columns={4} style={{ marginBottom: '32px' }}>
          <StatsCard
            title="완료한 콘텐츠"
            value={`${dashboard?.summary?.totalContentCompleted || 0}개`}
            icon="🏆"
            color="orange"
            change={{
              value: '+5개',
              trend: 'up'
            }}
          />
          
          <StatsCard
            title="총 학습 시간"
            value={`${Math.floor((dashboard?.summary?.totalTimeSpent || 0) / 60)}시간 ${(dashboard?.summary?.totalTimeSpent || 0) % 60}분`}
            icon="⏰"
            color="blue"
            change={{
              value: '+2.5시간',
              trend: 'up'
            }}
          />
          
          <StatsCard
            title="평균 퀴즈 점수"
            value={`${dashboard?.summary?.averageQuizScore || 0}점`}
            icon="📚"
            color="green"
            change={{
              value: '+5점',
              trend: 'up'
            }}
          />
          
          <StatsCard
            title="연속 학습일"
            value={`${dashboard?.summary?.currentStreak || 0}일`}
            icon="📊"
            color="purple"
            change={{
              value: `+${dashboard?.summary?.currentStreak || 0}일`,
              trend: 'up'
            }}
          />
        </Grid>
      </Section>

      {/* 재정 건강도 점수 */}
      <Section title="재정 건강도 점수" subtitle="현재 재정 상황을 종합적으로 평가한 점수입니다">
        <Grid columns={3}>
          <div style={{ gridColumn: 'span 2' }}>
            <Card>
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: (dashboard?.healthScore?.overallScore || 0) >= 80 ? colors.success[100] : 
                                   (dashboard?.healthScore?.overallScore || 0) >= 60 ? colors.warning[100] : colors.error[100],
                  marginBottom: '24px'
                }}>
                  <span style={{ 
                    fontSize: '32px', 
                    fontWeight: 'bold',
                    color: getScoreColor(dashboard?.healthScore?.overallScore || 0),
                    fontFamily: "'Noto Sans KR', sans-serif"
                  }}>
                    {dashboard?.healthScore?.overallScore || 0}
                  </span>
                </div>
                
                <h3 className="heading-3 high-contrast" style={{
                  color: darkMode ? colors.dark[100] : colors.gray[900],
                  margin: '0 0 8px 0',
                  fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                  전체 점수
                </h3>
                
                <p className="text-sm readable-text" style={{
                  color: darkMode ? colors.dark[400] : colors.gray[600],
                  fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                  {(dashboard?.healthScore?.overallScore || 0) >= 80 ? '우수한 재정 관리' : 
                   (dashboard?.healthScore?.overallScore || 0) >= 60 ? '보통 수준' : '개선이 필요합니다'}
                </p>
              </div>
            </Card>
          </div>
          
          <div>
            <Card>
              <div style={{ padding: '24px' }}>
                <h4 className="heading-4 high-contrast" style={{
                  color: darkMode ? colors.dark[100] : colors.gray[900],
                  margin: '0 0 16px 0',
                  fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                  세부 점수
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="text-sm readable-text" style={{
                      color: darkMode ? colors.dark[400] : colors.gray[600],
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                      예산 관리
                    </span>
                    <span style={{ 
                      color: getScoreColor(dashboard?.healthScore?.budgetingScore || 0),
                      fontWeight: '600',
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                      {dashboard?.healthScore?.budgetingScore || 0}점
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="text-sm readable-text" style={{
                      color: darkMode ? colors.dark[400] : colors.gray[600],
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                      저축
                    </span>
                    <span style={{ 
                      color: getScoreColor(dashboard?.healthScore?.savingScore || 0),
                      fontWeight: '600',
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                      {dashboard?.healthScore?.savingScore || 0}점
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="text-sm readable-text" style={{
                      color: darkMode ? colors.dark[400] : colors.gray[600],
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                      부채 관리
                    </span>
                    <span style={{ 
                      color: getScoreColor(dashboard?.healthScore?.debtScore || 0),
                      fontWeight: '600',
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                      {dashboard?.healthScore?.debtScore || 0}점
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="text-sm readable-text" style={{
                      color: darkMode ? colors.dark[400] : colors.gray[600],
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                      비상금
                    </span>
                    <span style={{ 
                      color: getScoreColor(dashboard?.healthScore?.emergencyFundScore || 0),
                      fontWeight: '600',
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                      {dashboard?.healthScore?.emergencyFundScore || 0}점
                    </span>
                  </div>
                </div>
                
                <div style={{ marginTop: '16px' }}>
                  <Button 
                    variant="secondary" 
                    style={{ width: '100%' }}
                    onClick={() => setCurrentPage('health-score')}
                  >
                    자세히 보기
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </Grid>
      </Section>

      {/* 맞춤 조언 */}
      <Section title="맞춤 조언" subtitle="현재 재정 상황에 맞는 개인화된 조언을 확인하세요">
        <Card>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 className="heading-3 high-contrast" style={{
                color: darkMode ? colors.dark[100] : colors.gray[900],
                margin: 0,
                fontFamily: "'Noto Sans KR', sans-serif"
              }}>
                최근 조언
              </h3>
              <Button 
                variant="secondary"
                onClick={() => setCurrentPage('advice')}
              >
                전체 보기
              </Button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(dashboard?.recentAdvice || []).slice(0, 3).map((advice) => (
                <Card key={advice.id} style={{ 
                  borderLeft: `4px solid ${colors.primary[500]}`,
                  backgroundColor: darkMode ? colors.dark[700] : colors.gray[50]
                }}>
                  <div style={{ padding: '16px' }}>
                    <h4 className="text-sm high-contrast" style={{
                      color: darkMode ? colors.dark[100] : colors.gray[900],
                      margin: '0 0 8px 0',
                      fontWeight: '600',
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                      {advice.title}
                    </h4>
                    <p className="text-xs readable-text" style={{
                      color: darkMode ? colors.dark[400] : colors.gray[600],
                      margin: '0 0 12px 0',
                      lineHeight: '1.4',
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                      {advice.content}
                    </p>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '4px 8px',
                      fontSize: '10px',
                      borderRadius: '12px',
                      backgroundColor: colors.primary[100],
                      color: colors.primary[800],
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                      맞춤 조언
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      </Section>

      {/* 추천 콘텐츠 & 절약 팁 */}
      <Grid columns={2}>
        {/* 추천 콘텐츠 */}
        <Section title="추천 콘텐츠" subtitle="당신을 위한 맞춤 교육 자료">
          <Card>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>📚</span>
                  <h3 className="heading-4 high-contrast" style={{
                    color: darkMode ? colors.dark[100] : colors.gray[900],
                    margin: 0,
                    fontFamily: "'Noto Sans KR', sans-serif"
                  }}>
                    오늘의 추천
                  </h3>
                </div>
                <Button 
                  variant="secondary"
                  onClick={() => setCurrentPage('content')}
                >
                  전체 보기
                </Button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(dashboard?.featuredContent || []).map((content) => (
                  <Card key={content.id} interactive={true}>
                    <div 
                      style={{ padding: '16px', cursor: 'pointer' }}
                      onClick={() => handleContentSelect(content.id)}
                    >
                      <h4 className="text-sm high-contrast" style={{
                        color: darkMode ? colors.dark[100] : colors.gray[900],
                        margin: '0 0 8px 0',
                        fontWeight: '600',
                        fontFamily: "'Noto Sans KR', sans-serif"
                      }}>
                        {content.title}
                      </h4>
                      <p className="text-xs readable-text" style={{
                        color: darkMode ? colors.dark[400] : colors.gray[600],
                        margin: '0 0 12px 0',
                        lineHeight: '1.4',
                        fontFamily: "'Noto Sans KR', sans-serif"
                      }}>
                        {content.description}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ 
                          padding: '2px 8px',
                          fontSize: '10px',
                          borderRadius: '12px',
                          backgroundColor: darkMode ? colors.primary[100] : colors.primary[100],
                          color: colors.primary[800],
                          fontFamily: "'Noto Sans KR', sans-serif"
                        }}>
                          {content.difficulty === 'beginner' ? '초급' :
                           content.difficulty === 'intermediate' ? '중급' : '고급'}
                        </span>
                        <span className="text-xs readable-text" style={{
                          color: darkMode ? colors.dark[400] : colors.gray[600],
                          fontFamily: "'Noto Sans KR', sans-serif"
                        }}>
                          {content.estimatedDuration}분
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </Section>

        {/* 맞춤 절약 팁 */}
        <Section title="맞춤 절약 팁" subtitle="개인화된 절약 방법을 확인하세요">
          <Card>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>💡</span>
                  <h3 className="heading-4 high-contrast" style={{
                    color: darkMode ? colors.dark[100] : colors.gray[900],
                    margin: 0,
                    fontFamily: "'Noto Sans KR', sans-serif"
                  }}>
                    이번 주 팁
                  </h3>
                </div>
                <Button 
                  variant="secondary"
                  onClick={() => setCurrentPage('tips')}
                >
                  전체 보기
                </Button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(dashboard?.personalizedTips || []).map((tip) => (
                  <Card key={tip.id} style={{ 
                    backgroundColor: darkMode ? colors.warning[900] : colors.warning[50],
                    border: `1px solid ${darkMode ? colors.warning[700] : colors.warning[200]}`
                  }}>
                    <div style={{ padding: '16px' }}>
                      <h4 className="text-sm high-contrast" style={{
                        color: darkMode ? colors.warning[100] : colors.warning[900],
                        margin: '0 0 8px 0',
                        fontWeight: '600',
                        fontFamily: "'Noto Sans KR', sans-serif"
                      }}>
                        {tip.title}
                      </h4>
                      <p className="text-xs readable-text" style={{
                        color: darkMode ? colors.warning[300] : colors.warning[700],
                        margin: '0 0 12px 0',
                        lineHeight: '1.4',
                        fontFamily: "'Noto Sans KR', sans-serif"
                      }}>
                        {tip.description}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ 
                          color: colors.success[600],
                          fontWeight: '600',
                          fontSize: '10px',
                          fontFamily: "'Noto Sans KR', sans-serif"
                        }}>
                          월 최대 {tip.potentialSavings.toLocaleString()}원 절약
                        </span>
                        <span className="text-xs readable-text" style={{
                          color: darkMode ? colors.warning[400] : colors.warning[600],
                          fontFamily: "'Noto Sans KR', sans-serif"
                        }}>
                          {tip.category}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </Section>
      </Grid>

      {/* 빠른 액션 */}
      <Section title="빠른 액션" subtitle="자주 사용하는 교육 기능들을 빠르게 실행하세요">
        <Grid columns={3}>
          <Card interactive={true} style={{ textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📚</div>
            <h3 className="heading-4 high-contrast" style={{
              color: darkMode ? colors.dark[100] : colors.gray[900],
              margin: '0 0 8px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              교육 콘텐츠
            </h3>
            <p className="text-sm readable-text" style={{
              color: darkMode ? colors.dark[400] : colors.gray[600],
              margin: '0 0 16px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              새로운 금융 지식을 학습하세요
            </p>
            <Button 
              variant="primary" 
              style={{ width: '100%' }} 
              onClick={() => setCurrentPage('content')}
            >
              콘텐츠 보기
            </Button>
          </Card>

          <Card interactive={true} style={{ textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
            <h3 className="heading-4 high-contrast" style={{
              color: darkMode ? colors.dark[100] : colors.gray[900],
              margin: '0 0 8px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              건강도 점수
            </h3>
            <p className="text-sm readable-text" style={{
              color: darkMode ? colors.dark[400] : colors.gray[600],
              margin: '0 0 16px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              재정 상황을 종합적으로 확인하세요
            </p>
            <Button 
              variant="primary" 
              style={{ width: '100%' }} 
              onClick={() => setCurrentPage('health-score')}
            >
              점수 확인
            </Button>
          </Card>

          <Card interactive={true} style={{ textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>💡</div>
            <h3 className="heading-4 high-contrast" style={{
              color: darkMode ? colors.dark[100] : colors.gray[900],
              margin: '0 0 8px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              절약 팁
            </h3>
            <p className="text-sm readable-text" style={{
              color: darkMode ? colors.dark[400] : colors.gray[600],
              margin: '0 0 16px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              맞춤형 절약 방법을 알아보세요
            </p>
            <Button 
              variant="secondary" 
              style={{ width: '100%' }} 
              onClick={() => setCurrentPage('tips')}
            >
              팁 보기
            </Button>
          </Card>
        </Grid>
      </Section>
    </PageLayout>
  );
};

export default EducationDashboard;