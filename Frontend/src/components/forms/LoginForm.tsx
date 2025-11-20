import React, { useState } from 'react';
import { useFormValidation } from '@/hooks/useFormValidation';
import { formValidation } from '@/utils/consolidatedValidation';
import { authService } from '@/services/authService';

interface LoginFormProps {
  onSuccess: (user: any) => void;
  onError?: (error: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onError }) => {
  const [serverError, setServerError] = useState<string>('');

  const {
    data,
    errors,
    isSubmitting,
    updateField,
    handleSubmit,
    hasErrors
  } = useFormValidation({
    initialData: { email: '', password: '' },
    validationRules: {
      email: formValidation.rules.email,
      password: { required: true, message: 'Password is required' }
    },
    onSubmit: async (formData) => {
      try {
        setServerError('');
        const result = await authService.login(formData);
        onSuccess(result);
      } catch (error: any) {
        const errorMessage = error.message || 'Login failed';
        setServerError(errorMessage);
        if (onError) onError(errorMessage);
        throw error; // Re-throw to prevent form reset
      }
    }
  });

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Server Error Display */}
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {serverError}
          </div>
        )}

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => updateField('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your email"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={data.password}
            onChange={(e) => updateField('password', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your password"
            disabled={isSubmitting}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || hasErrors}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>

        {/* Validation Status */}
        <div className="text-xs text-gray-500">
          {hasErrors && (
            <p className="text-red-500">Please fix the errors above before submitting</p>
          )}
        </div>
      </form>
    </div>
  );
};