import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { otpService, OtpPurpose } from '@/services/otpService';
import { registrationService } from '@/services/registrationService';
import { useNotification } from '@/context/NotificationContext';
import { NotificationType } from '@/types/notification';

const steps = ['Email Verification', 'Complete Registration', 'Account Setup'];

interface EmailForm {
  email: string;
}

interface OtpForm {
  otpCode: string;
}

const CustomerRegistrationFlow: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const emailForm = useForm<EmailForm>();
  const otpForm = useForm<OtpForm>();

  const handleSendOtp = async (data: EmailForm) => {
    setLoading(true);
    try {
      await otpService.sendOtp({
        email: data.email,
        purpose: OtpPurpose.Registration
      });
      setEmail(data.email);
      setActiveStep(1);
      showNotification('OTP sent to your email', NotificationType.SUCCESS);
    } catch (error) {
      showNotification('Failed to send OTP', NotificationType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (data: OtpForm) => {
    setLoading(true);
    try {
      await otpService.verifyOtp({
        email,
        otpCode: data.otpCode,
        purpose: OtpPurpose.Registration
      });
      showNotification('Email verified successfully', NotificationType.SUCCESS);
      // Navigate to complete registration with verified email
      navigate('/auth/complete-registration', { state: { verifiedEmail: email } });
    } catch (error) {
      showNotification('Invalid OTP', NotificationType.ERROR);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box component="form" onSubmit={emailForm.handleSubmit(handleSendOtp)}>
            <Typography variant="h6" gutterBottom>
              Enter your email address
            </Typography>
            <TextField
              {...emailForm.register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email format'
                }
              })}
              fullWidth
              label="Email Address"
              type="email"
              margin="normal"
              error={!!emailForm.formState.errors.email}
              helperText={emailForm.formState.errors.email?.message}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Send OTP'}
            </Button>
          </Box>
        );

      case 1:
        return (
          <Box component="form" onSubmit={otpForm.handleSubmit(handleVerifyOtp)}>
            <Typography variant="h6" gutterBottom>
              Enter OTP sent to {email}
            </Typography>
            <TextField
              {...otpForm.register('otpCode', {
                required: 'OTP is required',
                pattern: {
                  value: /^\d{6}$/,
                  message: 'OTP must be 6 digits'
                }
              })}
              fullWidth
              label="OTP Code"
              margin="normal"
              error={!!otpForm.formState.errors.otpCode}
              helperText={otpForm.formState.errors.otpCode?.message}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Verify OTP'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 1 }}
              onClick={() => setActiveStep(0)}
            >
              Back
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.100">
      <Card sx={{ maxWidth: 500, width: '100%', mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Customer Registration
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CustomerRegistrationFlow;
