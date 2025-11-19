import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Avatar, IconButton, alpha } from '@mui/material';
import { Star, ArrowBack, ArrowForward } from '@mui/icons-material';
import { designTokens } from '@/theme/designTokens';
import ProfessionalCard from './ProfessionalCard';

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar?: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoPlay?: boolean;
  interval?: number;
}

export const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
  testimonials,
  autoPlay = true,
  interval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, testimonials.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <Box sx={{ position: 'relative', maxWidth: 800, mx: 'auto' }}>
      {/* Main Testimonial */}
      <Box
        sx={{
          overflow: 'hidden',
          borderRadius: designTokens.borderRadius.xl,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: `transform ${designTokens.animation.duration.slow} ${designTokens.animation.easing.easeInOut}`,
          }}
        >
          {testimonials.map((testimonial, index) => (
            <Box key={index} sx={{ minWidth: '100%', px: 2 }}>
              <ProfessionalCard
                variant="glass"
                sx={{
                  p: 4,
                  textAlign: 'center',
                  background: `linear-gradient(145deg, ${alpha('#FFFFFF', 0.9)} 0%, ${alpha('#FFFFFF', 0.7)} 100%)`,
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${alpha(designTokens.colors.primary[300], 0.3)}`,
                }}
              >
                <CardContent>
                  {/* Rating Stars */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        sx={{
                          color: designTokens.colors.accent[500],
                          fontSize: 28,
                          filter: 'drop-shadow(0 2px 4px rgba(255, 178, 92, 0.3))',
                        }}
                      />
                    ))}
                  </Box>

                  {/* Testimonial Content */}
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 4,
                      fontStyle: 'italic',
                      color: designTokens.colors.neutral[700],
                      fontFamily: designTokens.typography.fontFamily.primary,
                      lineHeight: 1.6,
                      fontSize: { xs: '1.1rem', md: '1.25rem' },
                      '&::before': { content: '"\\201C"', fontSize: '2rem', color: designTokens.colors.primary[400] },
                      '&::after': { content: '"\\201D"', fontSize: '2rem', color: designTokens.colors.primary[400] },
                    }}
                  >
                    {testimonial.content}
                  </Typography>

                  {/* Author Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <Avatar
                      src={testimonial.avatar}
                      sx={{
                        width: 60,
                        height: 60,
                        backgroundColor: designTokens.colors.primary[500],
                        fontSize: '1.5rem',
                        fontWeight: designTokens.typography.fontWeight.bold,
                        boxShadow: designTokens.shadows.md,
                      }}
                    >
                      {testimonial.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: designTokens.typography.fontWeight.semibold,
                          color: designTokens.colors.neutral[800],
                          fontFamily: designTokens.typography.fontFamily.primary,
                        }}
                      >
                        {testimonial.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: designTokens.colors.neutral[600],
                          fontFamily: designTokens.typography.fontFamily.primary,
                        }}
                      >
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </ProfessionalCard>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Navigation Arrows */}
      <IconButton
        onClick={goToPrev}
        sx={{
          position: 'absolute',
          left: -20,
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: alpha('#FFFFFF', 0.9),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(designTokens.colors.primary[300], 0.3)}`,
          color: designTokens.colors.primary[600],
          '&:hover': {
            backgroundColor: designTokens.colors.primary[50],
            transform: 'translateY(-50%) scale(1.1)',
          },
          transition: `all ${designTokens.animation.duration.normal} ${designTokens.animation.easing.easeInOut}`,
        }}
      >
        <ArrowBack />
      </IconButton>

      <IconButton
        onClick={goToNext}
        sx={{
          position: 'absolute',
          right: -20,
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: alpha('#FFFFFF', 0.9),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(designTokens.colors.primary[300], 0.3)}`,
          color: designTokens.colors.primary[600],
          '&:hover': {
            backgroundColor: designTokens.colors.primary[50],
            transform: 'translateY(-50%) scale(1.1)',
          },
          transition: `all ${designTokens.animation.duration.normal} ${designTokens.animation.easing.easeInOut}`,
        }}
      >
        <ArrowForward />
      </IconButton>

      {/* Dots Indicator */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}>
        {testimonials.map((_, index) => (
          <Box
            key={index}
            onClick={() => goToSlide(index)}
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: index === currentIndex 
                ? designTokens.colors.primary[500] 
                : alpha(designTokens.colors.neutral[400], 0.5),
              cursor: 'pointer',
              transition: `all ${designTokens.animation.duration.normal} ${designTokens.animation.easing.easeInOut}`,
              '&:hover': {
                backgroundColor: designTokens.colors.primary[400],
                transform: 'scale(1.2)',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default TestimonialCarousel;