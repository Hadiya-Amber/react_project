import { useState, useCallback } from 'react';
import { formValidation, ValidationRule } from '@/utils/formValidation';

export interface UseFormValidationProps {
  initialData: Record<string, any>;
  validationRules: Record<string, ValidationRule>;
  onSubmit?: (data: Record<string, any>) => Promise<void> | void;
}

export const useFormValidation = ({ initialData, validationRules, onSubmit }: UseFormValidationProps) => {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((field: string, value: any) => {
    const rule = validationRules[field];
    if (!rule) return null;

    return formValidation.validateField(value, rule);
  }, [validationRules]);

  const updateField = useCallback((field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const validation = formValidation.validateForm(data, validationRules);
    setErrors(validation.errors);
    return validation.isValid;
  }, [data, validationRules]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!validateForm()) {
      return false;
    }

    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(data);
        return true;
      } catch (error: any) {
        // Don't log to console, let the component handle the error
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    }
    
    return true;
  }, [data, validateForm, onSubmit]);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  return {
    data,
    errors,
    isSubmitting,
    updateField,
    validateField,
    validateForm,
    handleSubmit,
    reset,
    hasErrors: Object.keys(errors).length > 0
  };
};