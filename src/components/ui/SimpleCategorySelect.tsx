import React from 'react';

interface SimpleCategorySelectProps {
  value?: string;
  onChange: (category: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  darkMode?: boolean;
}

export const SimpleCategorySelect: React.FC<SimpleCategorySelectProps> = ({
  value,
  onChange,
  placeholder = "카테고리를 선택하세요",
  className = "",
  error,
  darkMode = false
}) => {
  const categories = [
    { value: 'restaurant_fast_food', label: '패스트푸드' },
    { value: 'cafe_coffee', label: '커피' },
    { value: 'bus_subway', label: '버스/지하철' },
    { value: 'taxi', label: '택시' },
    { value: 'fashion_clothing', label: '의류' },
    { value: 'electronics_mobile', label: '모바일/폰' },
    { value: 'beauty_cosmetics', label: '화장품' },
    { value: 'hospital', label: '병원' },
    { value: 'movie', label: '영화' },
    { value: 'rent', label: '월세/전세' },
    { value: 'base_salary', label: '기본급' },
    { value: 'bonus', label: '보너스' }
  ];

  const baseSelectStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: `2px solid ${error ? '#ef4444' : (darkMode ? '#374151' : '#d1d5db')}`,
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    color: darkMode ? '#f9fafb' : '#1f2937',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 12px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px',
    paddingRight: '48px'
  };

  const focusStyle = {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  };

  return (
    <div className={className}>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={baseSelectStyle}
        onFocus={(e) => Object.assign(e.target.style, focusStyle)}
        onBlur={(e) => Object.assign(e.target.style, { 
          borderColor: error ? '#ef4444' : (darkMode ? '#374151' : '#d1d5db'), 
          boxShadow: 'none' 
        })}
      >
        <option value="">{placeholder}</option>
        {categories.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};
