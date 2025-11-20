import React from 'react';
import { useFormValidation } from '@/hooks/useFormValidation';
import { formValidation } from '@/utils/consolidatedValidation';
import { otpService, OtpPurpose } from '@/services/otpService';

interface OtpFormProps {
  email: string;
  purpose: OtpPurpose;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
}

export const OtpForm: React.FC<OtpFormProps> = ({ email, purpose, onSuccess, onError }) => {
  const {
    data,
    errors,
    isSubmitting,
    updateField,
    handleSubmit,
    hasErrors
  } = useFormValidation({
    initialData: { email, otpCode: '' },
    validationRules: {
      email: formValidation.rules.email,
      otpCode: formValidation.rules.otpCode
    },
    onSubmit: async (formData) => {
      try {
        const result = await otpService.verifyOtp({
          email: formData.email,
          otpCode: formData.otpCode,
          purpose
        });
        onSuccess(result);
      } catch (error: any) {
        onError(error.message);
      }
    }
  });

  const handleResendOtp = async () => {
    try {
      await otpService.resendOtp({ email, purpose });
      // Show success message
    } catch (error: any) {
      onError(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => updateField('email', e.target.value)}
          className={`mt-1 block w-full px-3 py-2 border rounded-md ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          OTP Code
        </label>
        <input
          type="text"
          value={data.otpCode}
          onChange={(e) => updateField('otpCode', e.target.value)}
          placeholder="Enter 6-digit OTP"
          maxLength={6}
          className={`mt-1 block w-full px-3 py-2 border rounded-md ${
            errors.otpCode ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.otpCode && (
          <p className="mt-1 text-sm text-red-600">{errors.otpCode}</p>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          disabled={isSubmitting || hasErrors}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Verifying...' : 'Verify OTP'}
        </button>
        
        <button
          type="button"
          onClick={handleResendOtp}
          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
        >
          Resend OTP
        </button>
      </div>
    </form>
  );
};