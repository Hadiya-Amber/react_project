import React, { useEffect, useState } from 'react';
import { Typography, Box } from '@mui/material';
import { designTokens } from '@/theme/designTokens';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  end,
  duration = 2000,
  suffix = '',
  prefix = '',
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return (
    <Typography
      variant="h3"
      sx={{
        fontWeight: designTokens.typography.fontWeight.bold,
        color: designTokens.colors.primary[600],
        fontFamily: designTokens.typography.fontFamily.primary,
        background: designTokens.gradients.primary,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </Typography>
  );
};

export default AnimatedCounter;