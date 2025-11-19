import { useState, useEffect, startTransition } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Alert,
  Typography,
  Link,
  Container,
  TextField,
  alpha,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AccountBalanceWallet, Shield, VerifiedUser } from '@mui/icons-material'
import { otpService, OtpPurpose } from '@/services/otpService'
import { designTokens } from '@/theme/designTokens'
import ProfessionalCard from '@/components/ui/ProfessionalCard'
import ProfessionalButton from '@/components/ui/ProfessionalButton'

const otpSchema = z.object({
  otpCode: z.string()
    .min(1, 'OTP is required')
    .regex(/^\d{6}$/, 'OTP must be exactly 6 digits')
})

type OtpFormData = z.infer<typeof otpSchema>

const OtpVerificationPage = () => {
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  const email = location.state?.email || ''

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    mode: 'onChange',
    defaultValues: { otpCode: '' }
  })

  useEffect(() => {
    if (!email) {
      navigate('/register')
      return
    }

    // Check if email is already registered
    if (otpService.isEmailRegistered(email)) {
      setError('This email is already registered. Please login instead.')
      setTimeout(() => navigate('/login'), 3000)
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [email, navigate])

  const onSubmit = async (data: OtpFormData) => {
    startTransition(() => {
      setIsLoading(true)
      setError('')
    })

    try {
      // Check if email is already registered before verification
      if (otpService.isEmailRegistered(email)) {
        throw new Error('This email is already registered. Please login instead.')
      }

      const verifyData = {
        email,
        otpCode: data.otpCode,
        purpose: OtpPurpose.Registration,
      }

      const result = await otpService.verifyOtp(verifyData)
      
      if (result.canProceedToRegistration) {
        navigate('/register/complete', { state: { email, verified: true } })
      } else {
        throw new Error('Email verification failed. Please try again.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    startTransition(() => {
      setIsLoading(true)
      setError('')
    })

    try {
      // Check if email is already registered
      if (otpService.isEmailRegistered(email)) {
        throw new Error('This email is already registered. Please login instead.')
      }

      await otpService.resendOtp({
        email,
        purpose: OtpPurpose.Registration,
      })
      setCountdown(60)
      setCanResend(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
      }}
    >
      {/* Left Column - Image */}
      <Box
        sx={{
          flex: 1,
          background: 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
            `,
          },
        }}
      >
        <Box sx={{ textAlign: 'center', zIndex: 1 }}>
          <VerifiedUser
            sx={{
              fontSize: 80,
              color: '#FFFFFF',
              mb: 2,
              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
            }}
          />
          <Typography
            variant="h1"
            sx={{
              color: '#FFFFFF',
              fontWeight: 800,
              mb: 0.5,
              fontSize: { xs: '2rem', md: '2.5rem' },
              textShadow: '0 4px 8px rgba(0,0,0,0.3)',
              letterSpacing: '-0.02em',
            }}
          >
            Perfect
          </Typography>
          <Typography
            variant="h1"
            sx={{
              color: '#10b981',
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' },
              textShadow: '0 4px 8px rgba(0,0,0,0.3)',
              letterSpacing: '-0.02em',
            }}
          >
            Bank
          </Typography>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: '#FFFFFF',
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              ✅ Email Verification
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Right Column - Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          backgroundColor: '#64748b',
        }}
      >
        <ProfessionalCard
          variant="elevated"
          sx={{
            p: 6,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(designTokens.colors.neutral[300], 0.3)}`,
            maxWidth: 480,
            width: '100%',
          }}
        >
          {/* Mobile Logo - Only show on small screens */}
          <Box sx={{ textAlign: 'center', mb: 4, display: { xs: 'block', md: 'none' } }}>
            <VerifiedUser
              sx={{
                fontSize: 48,
                color: designTokens.colors.primary[600],
                mb: 2,
              }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: designTokens.typography.fontWeight.bold,
                color: designTokens.colors.primary[700],
                mb: 1,
              }}
            >
              Perfect Bank
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: designTokens.typography.fontWeight.semibold,
                color: designTokens.colors.neutral[800],
                mb: 2,
              }}
            >
              Verify Your Email
            </Typography>
            <Typography variant="body1" sx={{ color: designTokens.colors.neutral[600], mb: 1 }}>
              We've sent a 6-digit OTP to {email}
            </Typography>
            <Typography variant="caption" sx={{ color: designTokens.colors.accent[600], fontWeight: 'bold' }}>
              Demo: Use OTP 123456
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mb: 4 }}>
            <TextField
              {...control.register('otpCode')}
              fullWidth
              label="Enter 6-digit OTP *"
              type="text"
              inputProps={{ maxLength: 6 }}
              disabled={isLoading}
              autoFocus
              placeholder="123456"
              error={!!errors.otpCode}
              helperText={errors.otpCode?.message}
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: designTokens.borderRadius.md,
                  backgroundColor: alpha(designTokens.colors.neutral[50], 0.5),
                  fontSize: '1.2rem',
                  textAlign: 'center',
                  letterSpacing: '0.5rem',
                },
              }}
            />

            <ProfessionalButton
              type="submit"
              variant="primary"
              fullWidth
              loading={isLoading}
              disabled={!isValid}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: designTokens.typography.fontWeight.semibold,
              }}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </ProfessionalButton>
          </Box>

          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {canResend ? (
              <Link
                component="button"
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                sx={{
                  color: designTokens.colors.primary[600],
                  cursor: 'pointer',
                  textDecoration: 'none',
                  fontWeight: designTokens.typography.fontWeight.semibold,
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Resend OTP
              </Link>
            ) : (
              <Typography variant="body2" sx={{ color: designTokens.colors.neutral[600] }}>
                Resend OTP in {countdown}s
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              textAlign: 'center',
              pt: 3,
              borderTop: `1px solid ${designTokens.colors.neutral[200]}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Shield sx={{ fontSize: 16, color: designTokens.colors.accent[600], mr: 1 }} />
              <Typography
                variant="caption"
                sx={{
                  color: designTokens.colors.neutral[600],
                  fontWeight: designTokens.typography.fontWeight.medium,
                }}
              >
                Secured with industry-standard encryption
              </Typography>
            </Box>
          </Box>
        </ProfessionalCard>
      </Box>
    </Box>
  )
}

export default OtpVerificationPage;
