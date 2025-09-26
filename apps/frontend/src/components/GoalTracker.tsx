import React, { useState } from 'react';
import { Card, Button, Input, FormField } from './ui';
import { colors } from '../styles/theme';
import { useApp } from '../hooks/useApp';

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
}

const initialGoals: Goal[] = [
  { id: '1', title: '비상금 모으기', targetAmount: 1000000, currentAmount: 250000 },
  { id: '2', title: '여행 자금', targetAmount: 2000000, currentAmount: 800000 },
];

const GoalTracker: React.FC = () => {
  const { darkMode } = useApp();
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [errors, setErrors] = useState<{ title?: string; targetAmount?: string }>({});

  const validateForm = () => {
    const newErrors: { title?: string; targetAmount?: string } = {};
    
    if (!title.trim()) {
      newErrors.title = '목표 이름을 입력해주세요';
    } else if (title.trim().length < 2) {
      newErrors.title = '목표 이름은 최소 2글자 이상이어야 합니다';
    }
    
    if (!targetAmount) {
      newErrors.targetAmount = '목표 금액을 입력해주세요';
    } else if (Number(targetAmount) <= 0) {
      newErrors.targetAmount = '목표 금액은 0보다 커야 합니다';
    } else if (Number(targetAmount) > 1000000000) {
      newErrors.targetAmount = '목표 금액이 너무 큽니다';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddGoal = () => {
    if (!validateForm()) return;
    
    setGoals([
      ...goals,
      {
        id: Date.now().toString(),
        title: title.trim(),
        targetAmount: Number(targetAmount),
        currentAmount: 0,
      },
    ]);
    setTitle('');
    setTargetAmount('');
    setErrors({});
    setShowForm(false);
  };

  const handleCancel = () => {
    setTitle('');
    setTargetAmount('');
    setErrors({});
    setShowForm(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <Card style={{ margin: '24px 0', padding: 24 }}>
      <h2 style={{ 
        fontSize: 20, 
        fontWeight: 700, 
        marginBottom: 16,
        color: darkMode ? colors.dark[100] : colors.gray[900],
        fontFamily: "'Noto Sans KR', sans-serif"
      }}>
        🎯 목표 설정 및 추적
      </h2>
      
      {goals.map((goal) => (
        <div key={goal.id} style={{ 
          marginBottom: 20,
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: darkMode ? colors.dark[700] : colors.primary[50],
          border: `1px solid ${darkMode ? colors.dark[600] : colors.gray[200]}`
        }}>
          <div style={{ 
            fontWeight: 600, 
            fontSize: '16px',
            color: darkMode ? colors.dark[100] : colors.gray[900],
            marginBottom: '8px',
            fontFamily: "'Noto Sans KR', sans-serif"
          }}>
            {goal.title}
          </div>
          <div style={{ 
            fontSize: 14, 
            color: darkMode ? colors.dark[400] : colors.gray[600],
            marginBottom: '12px',
            fontFamily: "'Noto Sans KR', sans-serif"
          }}>
            {formatCurrency(goal.currentAmount)}원 / {formatCurrency(goal.targetAmount)}원
            <span style={{ 
              marginLeft: '8px', 
              fontWeight: '600',
              color: darkMode ? colors.primary[400] : colors.primary[600]
            }}>
              ({Math.round((goal.currentAmount / goal.targetAmount) * 100)}%)
            </span>
          </div>
          <div style={{ 
            background: darkMode ? colors.dark[600] : colors.gray[200], 
            borderRadius: 8, 
            height: 12, 
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)'
          }}>
            <div
              style={{
                width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%`,
                background: `linear-gradient(90deg, ${colors.primary[500]}, ${colors.primary[400]})`,
                height: 12,
                borderRadius: 8,
                transition: 'width 0.5s ease-in-out',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
              }}
            />
          </div>
        </div>
      ))}
      
      {showForm ? (
        <div style={{ 
          marginTop: 24,
          padding: '24px',
          borderRadius: '12px',
          backgroundColor: darkMode ? colors.dark[700] : colors.primary[50],
          border: `2px solid ${darkMode ? colors.primary[600] : colors.primary[200]}`,
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: darkMode ? colors.dark[100] : colors.gray[900],
            marginBottom: '20px',
            fontFamily: "'Noto Sans KR', sans-serif"
          }}>
            ✨ 새로운 목표 추가
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <FormField
              label="목표 이름"
              error={errors.title}
              required
            >
              <Input
                type="text"
                placeholder="예: 비상금 모으기, 여행 자금 등"
                value={title}
                onChange={(value: string) => {
                  setTitle(value);
                  if (errors.title) {
                    setErrors({ ...errors, title: undefined });
                  }
                }}
                style={{
                  fontSize: '16px',
                  fontFamily: "'Noto Sans KR', sans-serif"
                }}
              />
            </FormField>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <FormField
              label="목표 금액"
              error={errors.targetAmount}
              required
            >
              <Input
                type="number"
                placeholder="목표로 하는 금액을 입력하세요"
                value={targetAmount}
                onChange={(value: string) => {
                  setTargetAmount(value);
                  if (errors.targetAmount) {
                    setErrors({ ...errors, targetAmount: undefined });
                  }
                }}
                style={{
                  fontSize: '16px',
                  fontFamily: "'Noto Sans KR', sans-serif"
                }}
              />
            </FormField>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <Button 
              variant="secondary" 
              onClick={handleCancel}
              style={{
                minWidth: '80px',
                fontFamily: "'Noto Sans KR', sans-serif"
              }}
            >
              취소
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddGoal}
              style={{
                minWidth: '80px',
                fontFamily: "'Noto Sans KR', sans-serif"
              }}
            >
              추가
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Button 
            variant="primary" 
            onClick={() => setShowForm(true)}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: darkMode ? 'none' : '0 2px 8px rgba(59, 130, 246, 0.3)',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}
          >
            🎯 목표 추가
          </Button>
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Card>
  );
};

export default GoalTracker;
