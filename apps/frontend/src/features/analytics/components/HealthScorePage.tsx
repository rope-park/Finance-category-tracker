import React from 'react';
import { useHealthScore } from '../../education/hooks/useEducation';
import { useApp } from '../../../app/hooks/useApp';
import { 
  Section, 
  Card, 
  Grid,
  Button,
  ProgressBar,
  StatsCard
} from '../../../index';
import { colors } from '../../../styles/theme';

type EducationPage = 'dashboard' | 'content' | 'content-detail' | 'health-score' | 'tips' | 'advice';

interface HealthScorePageProps {
  onNavigate?: (page: EducationPage, contentId?: number) => void;
}

const HealthScorePage: React.FC<HealthScorePageProps> = ({ onNavigate }) => {
  const { healthScore, loading, error } = useHealthScore();
  const { darkMode } = useApp();

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.success[600];
    if (score >= 60) return colors.warning[500];
    return colors.error[600];
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return { label: '우수', icon: '🎉', bg: colors.success[100] };
    if (score >= 60) return { label: '보통', icon: '👍', bg: colors.warning[100] };
    return { label: '개선 필요', icon: '⚠️', bg: colors.error[100] };
  };

  // 로딩 상태
  if (loading) {
    return (
      <div>
        <Section title="재정 건강도 점수" subtitle="당신의 재정 상황을 종합적으로 분석한 결과입니다" icon="📊">
          <Grid columns={2}>
            <Card>
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%',
                  backgroundColor: darkMode ? colors.dark[600] : colors.gray[200],
                  margin: '0 auto 24px'
                }}></div>
                <div style={{ 
                  height: '20px', 
                  backgroundColor: darkMode ? colors.dark[600] : colors.gray[200], 
                  borderRadius: '4px',
                  width: '60%',
                  margin: '0 auto'
                }}></div>
              </div>
            </Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <div style={{ padding: '16px' }}>
                    <div style={{ 
                      height: '16px', 
                      backgroundColor: darkMode ? colors.dark[600] : colors.gray[200], 
                      borderRadius: '4px',
                      marginBottom: '8px',
                      width: '70%'
                    }}></div>
                    <div style={{ 
                      height: '20px', 
                      backgroundColor: darkMode ? colors.dark[600] : colors.gray[200], 
                      borderRadius: '4px',
                      width: '40%'
                    }}></div>
                  </div>
                </Card>
              ))}
            </div>
          </Grid>
        </Section>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div>
        <Section title="재정 건강도 점수" subtitle="당신의 재정 상황을 종합적으로 분석한 결과입니다" icon="📊">
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
      </div>
    );
  }
  if (!healthScore) return null;

  const overallStatus = getScoreStatus(healthScore.overallScore);
  
  const scoreItems = [
    { label: '예산 관리', score: healthScore.budgetingScore, key: 'budgeting' },
    { label: '저축', score: healthScore.savingScore, key: 'saving' },
    { label: '부채 관리', score: healthScore.debtScore, key: 'debt' },
    { label: '투자', score: healthScore.investmentScore || 0, key: 'investment' },
    { label: '비상금', score: healthScore.emergencyFundScore, key: 'emergency' }
  ];

  return (
    <div>
      <Section 
        title="재정 건강도 점수" 
        subtitle="당신의 재정 상황을 종합적으로 분석한 결과입니다" 
        icon="📊"
      >
        {/* 종합 점수와 세부 점수 */}
        <Grid columns={2} style={{ marginBottom: '32px' }}>
          {/* 종합 점수 */}
          <Card>
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                backgroundColor: overallStatus.bg,
                marginBottom: '24px'
              }}>
                <span style={{ 
                  fontSize: '42px', 
                  fontWeight: 'bold',
                  color: getScoreColor(healthScore.overallScore),
                  fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                  {healthScore.overallScore}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '24px' }}>{overallStatus.icon}</span>
                <h2 className="heading-2 high-contrast" style={{
                  color: getScoreColor(healthScore.overallScore),
                  margin: 0,
                  fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                  {overallStatus.label}
                </h2>
              </div>

              <p className="text-sm readable-text" style={{
                color: darkMode ? colors.dark[400] : colors.gray[600],
                fontFamily: "'Noto Sans KR', sans-serif"
              }}>
                마지막 업데이트: {new Date(healthScore.calculationDate).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </Card>

          {/* 세부 점수 */}
          <div>
            <h3 className="heading-3 high-contrast" style={{
              color: darkMode ? colors.dark[100] : colors.gray[900],
              margin: '0 0 24px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              세부 점수
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {scoreItems.map((item) => (
                <Card key={item.key}>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 className="text-sm high-contrast" style={{
                        color: darkMode ? colors.dark[200] : colors.gray[800],
                        margin: 0,
                        fontFamily: "'Noto Sans KR', sans-serif"
                      }}>
                        {item.label}
                      </h4>
                      <span style={{ 
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: getScoreColor(item.score),
                        fontFamily: "'Noto Sans KR', sans-serif"
                      }}>
                        {item.score}점
                      </span>
                    </div>
                    
                    <ProgressBar 
                      percentage={item.score} 
                      size="sm"
                      color={item.score >= 80 ? 'success' : item.score >= 60 ? 'warning' : 'error'}
                    />

                    <div style={{ marginTop: '8px', textAlign: 'right' }}>
                      <span className="text-xs readable-text" style={{
                        color: getScoreColor(item.score),
                        fontFamily: "'Noto Sans KR', sans-serif"
                      }}>
                        {item.score >= 80 ? '우수' : item.score >= 60 ? '보통' : '개선 필요'}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Grid>

        {/* 통계 카드 */}
        <Grid columns={4} style={{ marginBottom: '32px' }}>
          <StatsCard
            title="예산 관리"
            value={`${healthScore.budgetingScore}점`}
            icon="💰"
            color={healthScore.budgetingScore >= 80 ? 'green' : healthScore.budgetingScore >= 60 ? 'orange' : 'red'}
          />
          
          <StatsCard
            title="저축"
            value={`${healthScore.savingScore}점`}
            icon="🏦"
            color={healthScore.savingScore >= 80 ? 'green' : healthScore.savingScore >= 60 ? 'orange' : 'red'}
          />
          
          <StatsCard
            title="부채 관리"
            value={`${healthScore.debtScore}점`}
            icon="📋"
            color={healthScore.debtScore >= 80 ? 'green' : healthScore.debtScore >= 60 ? 'orange' : 'red'}
          />
          
          <StatsCard
            title="비상금"
            value={`${healthScore.emergencyFundScore}점`}
            icon="🛡️"
            color={healthScore.emergencyFundScore >= 80 ? 'green' : healthScore.emergencyFundScore >= 60 ? 'orange' : 'red'}
          />
        </Grid>
      </Section>

      {/* 개선 추천사항 */}
      {healthScore.recommendations && healthScore.recommendations.length > 0 && (
        <Section title="개선 추천사항" subtitle="점수 향상을 위한 맞춤 조언">
          <Grid columns={2}>
            {healthScore.recommendations.map((recommendation, index) => (
              <Card key={index} style={{ 
                borderLeft: `4px solid ${colors.primary[500]}`,
                backgroundColor: darkMode ? colors.primary[900] : colors.primary[50]
              }}>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <span style={{ fontSize: '20px', marginTop: '2px' }}>💡</span>
                    <p className="text-sm readable-text" style={{
                      color: darkMode ? colors.primary[100] : colors.primary[800],
                      margin: 0,
                      lineHeight: '1.5',
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                      {recommendation}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </Grid>
        </Section>
      )}

      {/* 분석 결과 */}
      {healthScore.factorsAnalysis && (
        <Section title="세부 분석" subtitle="각 영역별 상세 분석 결과">
          <Grid columns={2}>
            {Object.entries(healthScore.factorsAnalysis).map(([key, analysis]) => {
              const scoreItem = scoreItems.find(item => item.key === key);
              return (
                <Card key={key}>
                  <div style={{ padding: '20px' }}>
                    <h4 className="text-sm high-contrast" style={{
                      color: darkMode ? colors.dark[100] : colors.gray[900],
                      margin: '0 0 12px 0',
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                      {scoreItem?.label || key}
                    </h4>
                    <p className="text-sm readable-text" style={{
                      color: darkMode ? colors.dark[300] : colors.gray[700],
                      margin: 0,
                      lineHeight: '1.5',
                      fontFamily: "'Noto Sans KR', sans-serif"
                    }}>
                      {String(analysis)}
                    </p>
                  </div>
                </Card>
              );
            })}
          </Grid>
        </Section>
      )}

      {/* 빠른 액션 */}
      <Section title="빠른 액션" subtitle="건강도 점수 개선을 위한 다음 단계">
        <Grid columns={2}>
          <Card interactive={true} style={{ textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📈</div>
            <h3 className="heading-4 high-contrast" style={{
              color: darkMode ? colors.dark[100] : colors.gray[900],
              margin: '0 0 8px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              점수 개선 가이드
            </h3>
            <p className="text-sm readable-text" style={{
              color: darkMode ? colors.dark[400] : colors.gray[600],
              margin: '0 0 16px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              단계별 개선 방법을 확인하세요
            </p>
            <Button 
              variant="primary" 
              style={{ width: '100%' }} 
              onClick={() => onNavigate && onNavigate('advice')}
            >
              가이드 보기
            </Button>
          </Card>

          <Card interactive={true} style={{ textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📚</div>
            <h3 className="heading-4 high-contrast" style={{
              color: darkMode ? colors.dark[100] : colors.gray[900],
              margin: '0 0 8px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              관련 교육 콘텐츠
            </h3>
            <p className="text-sm readable-text" style={{
              color: darkMode ? colors.dark[400] : colors.gray[600],
              margin: '0 0 16px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              재정 관리 실력을 키워보세요
            </p>
            <Button 
              variant="secondary" 
              style={{ width: '100%' }} 
              onClick={() => onNavigate && onNavigate('content')}
            >
              학습하기
            </Button>
          </Card>
        </Grid>
      </Section>
    </div>
  );
};

export default HealthScorePage;
