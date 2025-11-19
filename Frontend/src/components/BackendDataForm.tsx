import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Autocomplete,
  CircularProgress,
  Box,
  Typography,
  Alert
} from '@mui/material';
import { useBackendDataContext } from '@/context/BackendDataContext';

interface BackendDataFormProps {
  selectedBranch?: number;
  selectedAccountType?: number;
  selectedGender?: number;
  selectedState?: number;
  onBranchChange?: (branchId: number) => void;
  onAccountTypeChange?: (accountType: number) => void;
  onGenderChange?: (gender: number) => void;
  onStateChange?: (state: number) => void;
  showBranch?: boolean;
  showAccountType?: boolean;
  showGender?: boolean;
  showState?: boolean;
}

const BackendDataForm: React.FC<BackendDataFormProps> = ({
  selectedBranch,
  selectedAccountType,
  selectedGender,
  selectedState,
  onBranchChange,
  onAccountTypeChange,
  onGenderChange,
  onStateChange,
  showBranch = true,
  showAccountType = true,
  showGender = true,
  showState = true
}) => {
  const {
    activeBranches,
    accountTypes,
    genders,
    states,
    isLoading,
    hasErrors,
    refreshBranches
  } = useBackendDataContext();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading form data...
        </Typography>
      </Box>
    );
  }

  if (hasErrors) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        Some form data could not be loaded. Please refresh the page.
      </Alert>
    );
  }

  return (
    <Box>
      {showBranch && (
        <FormControl fullWidth margin="normal">
          <InputLabel>Branch</InputLabel>
          <Select
            value={selectedBranch || ''}
            onChange={(e) => onBranchChange?.(Number(e.target.value))}
            label="Branch"
          >
            {activeBranches.map((branch) => (
              <MenuItem key={branch.id} value={branch.id}>
                {branch.branchName} ({branch.branchCode}) - {branch.city}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {showAccountType && (
        <FormControl fullWidth margin="normal">
          <InputLabel>Account Type</InputLabel>
          <Select
            value={selectedAccountType ?? ''}
            onChange={(e) => onAccountTypeChange?.(Number(e.target.value))}
            label="Account Type"
          >
            {accountTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {showGender && (
        <FormControl fullWidth margin="normal">
          <InputLabel>Gender</InputLabel>
          <Select
            value={selectedGender ?? ''}
            onChange={(e) => onGenderChange?.(Number(e.target.value))}
            label="Gender"
          >
            {genders.map((gender) => (
              <MenuItem key={gender.value} value={gender.value}>
                {gender.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {showState && (
        <Autocomplete
          options={states}
          getOptionLabel={(option) => option.label}
          value={states.find(state => state.value === selectedState) || null}
          onChange={(_, newValue) => onStateChange?.(newValue?.value || 0)}
          renderInput={(params) => (
            <TextField {...params} label="State" margin="normal" fullWidth />
          )}
        />
      )}
    </Box>
  );
};

export default BackendDataForm;
