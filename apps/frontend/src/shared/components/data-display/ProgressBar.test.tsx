import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressBar } from '../../../shared/components/data-display/ProgressBar';

describe('ProgressBar', () => {
  it('renders progress bar with percentage', () => {
    render(<ProgressBar percentage={50} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  it('displays label when showLabel is true', () => {
    render(<ProgressBar percentage={75} showLabel />);
    
    expect(screen.getByText('75.0%')).toBeInTheDocument();
  });

  it('handles different sizes', () => {
    const { rerender } = render(
      <ProgressBar percentage={50} size="sm" />
    );

    let progressBar = screen.getByRole('progressbar');
    expect(progressBar.style.height).toBe('4px');

    rerender(<ProgressBar percentage={50} size="lg" />);
    progressBar = screen.getByRole('progressbar');
    expect(progressBar.style.height).toBe('12px');
  });

  it('applies different colors', () => {
    const { rerender } = render(
      <ProgressBar percentage={50} color="success" />
    );

    let progressBar = screen.getByRole('progressbar');
    expect(progressBar.querySelector('div')).toBeInTheDocument();

    rerender(<ProgressBar percentage={50} color="error" />);
    progressBar = screen.getByRole('progressbar');
    expect(progressBar.querySelector('div')).toBeInTheDocument();
  });

  it('shows animated progress when animated is true', () => {
    render(<ProgressBar percentage={50} animated />);
    
    const progressBar = screen.getByRole('progressbar');
    const innerDiv = progressBar.querySelector('div');
    expect(innerDiv?.style.transition).toContain('0.5s');
  });

  it('handles edge percentage values', () => {
    const { rerender } = render(
      <ProgressBar percentage={0} showLabel />
    );
    
    expect(screen.getByText('0.0%')).toBeInTheDocument();

    rerender(<ProgressBar percentage={100} showLabel />);
    expect(screen.getByText('100.0%')).toBeInTheDocument();
  });

  it('clamps percentage values', () => {
    const { rerender } = render(
      <ProgressBar percentage={150} showLabel />
    );
    
    // Should be clamped to 100%
    expect(screen.getByText('100.0%')).toBeInTheDocument();

    rerender(<ProgressBar percentage={-10} showLabel />);
    // Should be clamped to 0%
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('renders with warning color', () => {
    render(<ProgressBar percentage={75} color="warning" />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar.querySelector('div')).toBeInTheDocument();
  });

  it('renders with primary color by default', () => {
    render(<ProgressBar percentage={50} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('renders medium size by default', () => {
    render(<ProgressBar percentage={50} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar.style.height).toBe('8px');
  });
});
