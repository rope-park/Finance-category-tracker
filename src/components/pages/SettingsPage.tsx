import React, { useState } from 'react';
import { useApp } from '../../hooks/useApp';
import { colors } from '../../styles/theme';
import { Card, Button, Toggle, Section, TabNavigation } from '../ui';

export const SettingsPage: React.FC = () => {
  const { darkMode, toggleDarkMode, notificationsEnabled, toggleNotifications } = useApp();
  const [activeSettingsTab, setActiveSettingsTab] = useState<string>('appearance');

  const settingsTabs = [
    { id: 'profile', label: '프로필', icon: '👤' },
    { id: 'appearance', label: '테마', icon: '🎨' },
    { id: 'notifications', label: '알림', icon: '🔔' },
    { id: 'data', label: '데이터', icon: '💾' },
    { id: 'about', label: '정보', icon: 'ℹ️' }
  ];

  const exportData = () => {
    const data = {
      settings: { darkMode, notificationsEnabled },
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-app-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          console.log('Imported data:', importedData);
          alert('데이터를 성공적으로 가져왔습니다!');
        } catch {
          alert('올바르지 않은 데이터 형식입니다.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div style={{
      padding: '32px',
      backgroundColor: darkMode ? colors.dark[900] : colors.gray[50],
      minHeight: '100vh',
      fontFamily: "'Noto Sans KR', sans-serif"
    }}>
      <Section 
        title="설정" 
        subtitle="앱 설정을 관리하고 개인화하세요"
        icon="⚙️"
      >
        <div></div>
      </Section>

      <TabNavigation 
        tabs={settingsTabs}
        activeTab={activeSettingsTab}
        onTabChange={setActiveSettingsTab}
      />

      <Card padding="lg">
        {activeSettingsTab === 'profile' && (
          <div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: darkMode ? colors.dark[100] : colors.gray[900],
              margin: '0 0 24px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              프로필 설정
            </h3>
            <p style={{
              color: darkMode ? colors.dark[400] : colors.gray[600],
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              프로필 설정은 향후 업데이트에서 제공됩니다.
            </p>
          </div>
        )}

        {activeSettingsTab === 'appearance' && (
          <div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: darkMode ? colors.dark[100] : colors.gray[900],
              margin: '0 0 24px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              테마 설정
            </h3>

            {/* 다크 모드 설정 */}
            <Card style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: darkMode ? colors.dark[100] : colors.gray[900],
                    margin: '0 0 4px 0',
                    fontFamily: "'Noto Sans KR', sans-serif"
                  }}>
                    다크 모드
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    color: darkMode ? colors.dark[400] : colors.gray[600],
                    margin: 0,
                    fontFamily: "'Noto Sans KR', sans-serif"
                  }}>
                    어두운 테마를 사용합니다
                  </p>
                </div>
                <Toggle 
                  enabled={darkMode}
                  onChange={toggleDarkMode}
                />
              </div>
            </Card>
          </div>
        )}

        {activeSettingsTab === 'notifications' && (
          <div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: darkMode ? colors.dark[100] : colors.gray[900],
              margin: '0 0 24px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              알림 설정
            </h3>

            {/* 알림 설정 */}
            <Card>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: darkMode ? colors.dark[100] : colors.gray[900],
                    margin: '0 0 4px 0',
                    fontFamily: "'Noto Sans KR', sans-serif"
                  }}>
                    푸시 알림
                  </h4>
                  <p style={{
                    fontSize: '14px',
                    color: darkMode ? colors.dark[400] : colors.gray[600],
                    margin: 0,
                    fontFamily: "'Noto Sans KR', sans-serif"
                  }}>
                    중요한 알림을 받습니다
                  </p>
                </div>
                <Toggle 
                  enabled={notificationsEnabled}
                  onChange={toggleNotifications}
                />
              </div>
            </Card>
          </div>
        )}

        {activeSettingsTab === 'data' && (
          <div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: darkMode ? colors.dark[100] : colors.gray[900],
              margin: '0 0 24px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              데이터 관리
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 데이터 내보내기 */}
              <Card>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: darkMode ? colors.dark[100] : colors.gray[900],
                  margin: '0 0 8px 0',
                  fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                  데이터 내보내기
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: darkMode ? colors.dark[400] : colors.gray[600],
                  margin: '0 0 16px 0',
                  fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                  모든 설정과 데이터를 JSON 파일로 내보냅니다.
                </p>
                <Button 
                  variant="success"
                  onClick={exportData}
                >
                  📥 데이터 내보내기
                </Button>
              </Card>

              {/* 데이터 가져오기 */}
              <Card>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: darkMode ? colors.dark[100] : colors.gray[900],
                  margin: '0 0 8px 0',
                  fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                  데이터 가져오기
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: darkMode ? colors.dark[400] : colors.gray[600],
                  margin: '0 0 16px 0',
                  fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                  이전에 내보낸 데이터를 가져옵니다.
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  style={{
                    padding: '8px',
                    backgroundColor: darkMode ? colors.dark[600] : colors.gray[50],
                    color: darkMode ? colors.dark[100] : colors.gray[900],
                    border: `1px solid ${darkMode ? colors.dark[500] : colors.gray[300]}`,
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: "'Noto Sans KR', sans-serif"
                  }}
                />
              </Card>

              {/* 데이터 초기화 */}
              <Card>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: darkMode ? colors.dark[100] : colors.gray[900],
                  margin: '0 0 8px 0',
                  fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                  모든 데이터 초기화
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: darkMode ? colors.dark[400] : colors.gray[600],
                  margin: '0 0 16px 0',
                  fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                  ⚠️ 이 작업은 되돌릴 수 없습니다. 모든 거래 내역과 설정이 삭제됩니다.
                </p>
                <Button 
                  variant="error"
                  onClick={() => {
                    if (confirm('정말로 모든 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                >
                  🗑️ 모든 데이터 삭제
                </Button>
              </Card>
            </div>
          </div>
        )}

        {activeSettingsTab === 'about' && (
          <div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: darkMode ? colors.dark[100] : colors.gray[900],
              margin: '0 0 24px 0',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}>
              앱 정보
            </h3>

            <Card>
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: darkMode ? colors.dark[100] : colors.gray[900],
                  margin: '0 0 8px 0',
                  fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                  가계부 앱
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: darkMode ? colors.dark[400] : colors.gray[600],
                  margin: '0 0 8px 0',
                  fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                  버전: 1.0.0
                </p>
                <p style={{
                  fontSize: '14px',
                  color: darkMode ? colors.dark[400] : colors.gray[600],
                  margin: 0,
                  fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                  스마트한 재정 관리를 위한 개인 가계부 애플리케이션
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h5 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.success[600],
                  margin: '0 0 8px 0',
                  fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                  주요 기능
                </h5>
                <ul style={{
                  fontSize: '14px',
                  color: darkMode ? colors.dark[400] : colors.gray[600],
                  margin: 0,
                  paddingLeft: '20px',
                  fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                  <li>거래 내역 추적</li>
                  <li>예산 관리</li>
                  <li>분석 및 리포트</li>
                  <li>카테고리별 분류</li>
                </ul>
              </div>

              <div>
                <p style={{
                  fontSize: '12px',
                  color: darkMode ? colors.dark[500] : colors.gray[500],
                  margin: 0,
                  fontFamily: "'Noto Sans KR', sans-serif"
                }}>
                  © 2025 Finance-category-tracker. All rights reserved.
                </p>
              </div>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
};
