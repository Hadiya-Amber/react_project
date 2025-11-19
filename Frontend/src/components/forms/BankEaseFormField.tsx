import { memo, startTransition } from 'react'
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form'
import { TextField, TextFieldProps } from '@mui/material'

interface BankEaseFormFieldProps<T extends FieldValues> extends Omit<TextFieldProps, 'name'> {
  name: FieldPath<T>
  control: Control<T>
  label: string
}

// BankEase React 19 enhanced form field with concurrent validation
export const BankEaseFormField = memo(<T extends FieldValues>({
  name,
  control,
  label,
  ...textFieldProps
}: BankEaseFormFieldProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error, invalid } }) => (
        <TextField
          {...field}
          {...textFieldProps}
          label={label}
          error={invalid}
          helperText={error?.message}
          fullWidth
          margin="normal"
          onChange={(e) => {
            // Use startTransition for non-urgent validation updates
            startTransition(() => {
              field.onChange(e)
            })
          }}
          onBlur={(e) => {
            // Trigger validation on blur
            startTransition(() => {
              field.onBlur()
            })
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-error': {
                '& fieldset': {
                  borderColor: 'error.main',
                  borderWidth: 2,
                },
              },
              '&:hover.Mui-error fieldset': {
                borderColor: 'error.dark',
              },
              '&.Mui-focused.Mui-error fieldset': {
                borderColor: 'error.main',
                borderWidth: 2,
              },
            },
            '& .MuiFormHelperText-root.Mui-error': {
              color: 'error.main',
              fontWeight: 500,
              fontSize: { xs: '0.75rem', sm: '0.8rem' },
            },
            '& .MuiInputLabel-root': {
              fontSize: { xs: '0.9rem', sm: '1rem' },
            },
            ...textFieldProps.sx,
          }}
        />
      )}
    />
  )
}) as <T extends FieldValues>(props: BankEaseFormFieldProps<T>) => JSX.Element

BankEaseFormField.displayName = 'BankEaseFormField'
