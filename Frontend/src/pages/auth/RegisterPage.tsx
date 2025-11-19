import { useState, startTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Alert,
  Typography,
  Link,
  Container,
  TextField,
  InputAdornment,
  alpha,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Email, PersonAdd, Shield } from '@mui/icons-material'
import { otpService } from '@/services/otpService'
import { OtpRequestDto, OtpPurpose } from '@/types'
import { designTokens } from '@/theme/designTokens'
import ProfessionalCard from '@/components/ui/ProfessionalCard'
import ProfessionalButton from '@/components/ui/ProfessionalButton'
import { z } from 'zod'

const emailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address')
})

type EmailFormData = z.infer<typeof emailSchema>

const RegisterPage = () => {
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    mode: 'onBlur',
    defaultValues: { email: '' }
  })

  const onSubmit = async (data: EmailFormData) => {
    startTransition(() => {
      setIsLoading(true)
      setError('')
    })

    try {
      // Check if email is already registered
      if (otpService.isEmailRegistered(data.email)) {
        throw new Error('This email is already registered. Please login instead or use a different email.')
      }

      // Check if email is already verified - allow proceeding to registration
      if (otpService.isEmailVerified(data.email)) {
        navigate('/register/complete', { state: { email: data.email, verified: true } })
        return
      }

      const otpRequest: OtpRequestDto = {
        email: data.email,
        purpose: OtpPurpose.Registration,
      }

      await otpService.sendOtp(otpRequest)
      navigate('/register/verify', { state: { email: data.email } })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP'
      
      // Check if backend says email is already verified
      if (errorMessage.includes('already verified for registration')) {
        // Show message and redirect after delay
        setError('This email is already verified for registration. Please proceed with registration or use a different email.')
        otpService.markEmailAsVerified(data.email)
        
        setTimeout(() => {
          navigate('/register/complete', { state: { email: data.email, verified: true } })
        }, 2000)
        return
      }
      
      setError(errorMessage)
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
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(100, 116, 139, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(148, 163, 184, 0.15) 0%, transparent 50%)
          `,
        },
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
              <PersonAdd
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
              Create Your Account
            </Typography>
            <Typography variant="body1" sx={{ color: designTokens.colors.neutral[600] }}>
              Enter your email to get started
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mb: 4 }}>
            <TextField
              {...control.register('email')}
              fullWidth
              label="Email Address *"
              type="email"
              autoComplete="email"
              autoFocus
              disabled={isLoading}
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: designTokens.colors.primary[400] }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': {
                  borderRadius: designTokens.borderRadius.md,
                  backgroundColor: alpha(designTokens.colors.neutral[50], 0.5),
                  '&.Mui-error': {
                    '& fieldset': {
                      borderColor: designTokens.colors.error[500],
                      borderWidth: '2px',
                    },
                  },
                },
                '& .MuiFormHelperText-root.Mui-error': {
                  color: designTokens.colors.error[600],
                  fontWeight: designTokens.typography.fontWeight.medium,
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
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </ProfessionalButton>
          </Box>

          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="body2" sx={{ color: designTokens.colors.neutral[600] }}>
              Already have an account?{' '}
              <Link
                component="button"
                type="button"
                onClick={() => navigate('/login')}
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
                Sign In
              </Link>
            </Typography>
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

export default RegisterPage;
