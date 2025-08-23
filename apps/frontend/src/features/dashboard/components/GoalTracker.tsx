import React, { useState } from 'react';
import { Card, Button } from './ui';

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
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const handleAddGoal = () => {
    if (!title || !targetAmount) return;
    setGoals([
      ...goals,
      {
        id: Date.now().toString(),
        title,
        targetAmount: Number(targetAmount),
        currentAmount: 0,
      },
    ]);
    setTitle('');
    setTargetAmount('');
    setShowForm(false);
  };

  return (
    <Card style={{ margin: '24px 0', padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>🎯 목표 설정 및 추적</h2>
      {goals.map((goal) => (
        <div key={goal.id} style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600 }}>{goal.title}</div>
          <div style={{ fontSize: 14, color: '#888' }}>
            {goal.currentAmount.toLocaleString()}원 / {goal.targetAmount.toLocaleString()}원
          </div>
          <div style={{ background: '#eee', borderRadius: 8, height: 8, margin: '8px 0' }}>
            <div
              style={{
                width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%`,
                background: '#34d399',
                height: 8,
                borderRadius: 8,
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
      ))}
      {showForm ? (
        <div style={{ marginTop: 16 }}>
          <input
            type="text"
            placeholder="목표 이름"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ marginRight: 8, padding: 4 }}
          />
          <input
            type="number"
            placeholder="목표 금액"
            value={targetAmount}
            onChange={e => setTargetAmount(e.target.value)}
            style={{ marginRight: 8, padding: 4 }}
          />
          <Button variant="primary" onClick={handleAddGoal}>추가</Button>
          <Button variant="secondary" onClick={() => setShowForm(false)} style={{ marginLeft: 8 }}>취소</Button>
        </div>
      ) : (
        <Button variant="primary" onClick={() => setShowForm(true)} style={{ marginTop: 16 }}>목표 추가</Button>
      )}
    </Card>
  );
};

export default GoalTracker;
