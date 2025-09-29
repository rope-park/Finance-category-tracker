import React, { useState } from 'react';
import { useEducationContent, useEducationSearch } from '../../hooks/useEducation';
import { useApp } from '../../hooks/useApp';
import { 
  Section, 
  Card, 
  Grid,
  Button,
  Input,
  Select
} from '../ui';
import { colors } from '../../styles/theme';
import type { EducationContentFilter } from '../../types/education';

interface EducationContentListProps {
  onContentSelect: (contentId: number) => void;
}

const EducationContentList: React.FC<EducationContentListProps> = ({ onContentSelect }) => {
  const [filter, setFilter] = useState<EducationContentFilter>({
    page: 1,
    limit: 12
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { darkMode } = useApp();

  const { content, loading, error } = useEducationContent(filter);
  const { searchResults, loading: searchLoading, searchContent, clearSearch } = useEducationSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchContent(searchTerm);
    } else {
      clearSearch();
    }
  };

  const handleFilterChange = (newFilter: Partial<EducationContentFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter, page: 1 }));
    clearSearch();
    setSearchTerm('');
  };

  const displayContent = searchTerm ? searchResults : content;
  const isLoading = searchTerm ? searchLoading : loading;

  const getDifficultyInfo = (difficulty: string) => {
    const difficultyMap = {
      beginner: { label: '초급', color: colors.success[600], bg: colors.success[100] },
      intermediate: { label: '중급', color: colors.warning[600], bg: colors.warning[100] },
      advanced: { label: '고급', color: colors.error[600], bg: colors.error[100] }
    };
    return difficultyMap[difficulty as keyof typeof difficultyMap] || { 
      label: difficulty, 
      color: colors.gray[600], 
      bg: colors.gray[100] 
    };
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <Section title="교육 콘텐츠" subtitle="체계적인 금융 교육으로 재정 관리 실력을 키워보세요" icon="📚">
        <Grid columns={3}>
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <div style={{ padding: '24px' }}>
                <div style={{ 
                  height: '20px', 
                  backgroundColor: darkMode ? colors.dark[600] : colors.gray[200], 
                  borderRadius: '4px',
                  marginBottom: '16px'
                }}></div>
                <div style={{ 
                  height: '60px', 
                  backgroundColor: darkMode ? colors.dark[600] : colors.gray[200], 
                  borderRadius: '4px',
                  marginBottom: '16px'
                }}></div>
                <div style={{ 
                  height: '16px', 
                  backgroundColor: darkMode ? colors.dark[600] : colors.gray[200], 
                  borderRadius: '4px'
                }}></div>
              </div>
            </Card>
          ))}
        </Grid>
      </Section>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Section title="교육 콘텐츠" subtitle="체계적인 금융 교육으로 재정 관리 실력을 키워보세요" icon="📚">
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
    );
  }

  return (
    <div>
      <Section title="교육 콘텐츠" subtitle="체계적인 금융 교육으로 재정 관리 실력을 키워보세요" icon="📚">
        {/* 검색 및 필터 */}
        <Card style={{ marginBottom: '32px' }}>
          <div style={{ padding: '24px' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <Input
                  type="text"
                  placeholder="콘텐츠 제목이나 내용으로 검색..."
                  value={searchTerm}
                  onChange={(value: string) => setSearchTerm(value)}
                />
              </div>
              <Button type="submit" variant="primary">
                검색
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
              >
                🔍 필터
              </Button>
            </form>

            {/* 필터 옵션 */}
            {showFilters && (
              <div style={{ 
                borderTop: `1px solid ${darkMode ? colors.dark[600] : colors.gray[200]}`, 
                paddingTop: '16px' 
              }}>
                <Grid columns={3} style={{ marginBottom: '16px' }}>
                  <div>
                    <label className="text-sm readable-text" style={{
                      color: darkMode ? colors.dark[300] : colors.gray[700],
                      fontFamily: "'Noto Sans KR', sans-serif",
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      카테고리
                    </label>
                    <Select
                      value={filter.category || ''}
                      onChange={(value: string) => handleFilterChange({ category: value || undefined })}
                      options={[
                        { value: '', label: '전체' },
                        { value: 'budgeting', label: '예산 관리' },
                        { value: 'saving', label: '저축' },
                        { value: 'investment', label: '투자' },
                        { value: 'debt', label: '부채 관리' },
                        { value: 'insurance', label: '보험' },
                        { value: 'tax', label: '세금' }
                      ]}
                    />
                  </div>

                  <div>
                    <label className="text-sm readable-text" style={{
                      color: darkMode ? colors.dark[300] : colors.gray[700],
                      fontFamily: "'Noto Sans KR', sans-serif",
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      난이도
                    </label>
                    <Select
                      value={filter.difficulty || ''}
                      onChange={(value: string) => handleFilterChange({ difficulty: (value || undefined) as 'beginner' | 'intermediate' | 'advanced' | undefined })}
                      options={[
                        { value: '', label: '전체' },
                        { value: 'beginner', label: '초급' },
                        { value: 'intermediate', label: '중급' },
                        { value: 'advanced', label: '고급' }
                      ]}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'end' }}>
                    <Button
                      variant="secondary"
                      style={{ width: '100%' }}
                      onClick={() => {
                        setFilter({ page: 1, limit: 12 });
                        clearSearch();
                        setSearchTerm('');
                      }}
                    >
                      필터 초기화
                    </Button>
                  </div>
                </Grid>
              </div>
            )}
          </div>
        </Card>

        {/* 검색 결과 메시지 */}
        {searchTerm && (
          <div style={{ marginBottom: '24px' }}>
            <p className="text-sm readable-text" style={{
              color: darkMode ? colors.dark[400] : colors.gray[600],
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              "{searchTerm}"에 대한 검색 결과: {searchResults.length}개
            </p>
          </div>
        )}

        {/* 콘텐츠 그리드 */}
        {displayContent.length > 0 ? (
          <Grid columns={3}>
            {displayContent.map((item) => {
              const difficultyInfo = getDifficultyInfo(item.difficulty);
              
              return (
                <Card key={item.id} interactive={true}>
                  <div 
                    style={{ padding: '24px', cursor: 'pointer' }}
                    onClick={() => onContentSelect(item.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <h3 className="heading-4 high-contrast" style={{
                        color: darkMode ? colors.dark[100] : colors.gray[900],
                        margin: 0,
                        fontFamily: "'Noto Sans KR', sans-serif",
                        lineHeight: '1.4',
                        flex: 1
                      }}>
                        {item.title}
                      </h3>
                      {item.isFeatured && (
                        <span style={{
                          fontSize: '16px',
                          marginLeft: '8px'
                        }}>
                          ⭐
                        </span>
                      )}
                    </div>

                    <p className="text-sm readable-text" style={{
                      color: darkMode ? colors.dark[400] : colors.gray[600],
                      margin: '0 0 16px 0',
                      lineHeight: '1.5',
                      fontFamily: "'Noto Sans KR', sans-serif",
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {item.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: difficultyInfo.bg,
                        color: difficultyInfo.color,
                        fontFamily: "'Noto Sans KR', sans-serif"
                      }}>
                        {difficultyInfo.label}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '14px' }}>⏰</span>
                          <span className="text-xs readable-text" style={{
                            color: darkMode ? colors.dark[400] : colors.gray[600],
                            fontFamily: "'Noto Sans KR', sans-serif"
                          }}>
                            {item.estimatedDuration}분
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '14px' }}>👁️</span>
                          <span className="text-xs readable-text" style={{
                            color: darkMode ? colors.dark[400] : colors.gray[600],
                            fontFamily: "'Noto Sans KR', sans-serif"
                          }}>
                            {item.viewCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </Grid>
        ) : (
          <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
            <h3 className="heading-3 high-contrast" style={{
              color: darkMode ? colors.dark[100] : colors.gray[900],
              margin: '0 0 8px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              {searchTerm ? '검색 결과가 없습니다' : '교육 콘텐츠가 없습니다'}
            </h3>
            <p className="text-sm readable-text" style={{
              color: darkMode ? colors.dark[400] : colors.gray[600],
              margin: '0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              {searchTerm ? '다른 검색어로 시도해보세요' : '곧 다양한 교육 콘텐츠가 업데이트될 예정입니다'}
            </p>
          </Card>
        )}

        {/* 페이지네이션 */}
        {!searchTerm && displayContent.length > 0 && (
          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant="secondary"
                disabled={filter.page === 1}
                onClick={() => setFilter(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                style={{ opacity: filter.page === 1 ? 0.5 : 1 }}
              >
                이전
              </Button>
              <span className="text-sm readable-text" style={{
                color: darkMode ? colors.dark[300] : colors.gray[700],
                fontFamily: "'Noto Sans KR', sans-serif",
                padding: '0 16px'
              }}>
                페이지 {filter.page}
              </span>
              <Button
                variant="secondary"
                onClick={() => setFilter(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
              >
                다음
              </Button>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
};

export default EducationContentList;
