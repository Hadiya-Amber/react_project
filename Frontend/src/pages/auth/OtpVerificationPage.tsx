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
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f0fdf4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <ProfessionalCard
          variant="elevated"
          sx={{
            p: 6,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(designTokens.colors.neutral[300], 0.3)}`,
            maxWidth: 480,
            mx: 'auto',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <VerifiedUser
                sx={{
                  fontSize: 64,
                  color: designTokens.colors.accent[600],
                  filter: `drop-shadow(0 4px 8px ${alpha(designTokens.colors.accent[500], 0.3)})`,
                }}
              />
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: designTokens.typography.fontWeight.bold,
                color: designTokens.colors.primary[700],
                mb: 1,
              }}
            >
              Perfect Bank
            </Typography>
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
      </Container>
    </Box>
  )
}

export default OtpVerificationPage;
