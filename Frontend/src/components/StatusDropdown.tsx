import React from 'react';
import { FormControl, Select, MenuItem, Chip } from '@mui/material';
import { AccountStatus } from '@/types';
import { accountService } from '@/services/accountService';

interface StatusDropdownProps {
  accountId: number;
  value: AccountStatus;
  onStatusChange?: (newStatus: AccountStatus) => void;
  disabled?: boolean;
}

const allStatusLabels = {
  [AccountStatus.Pending]: 'Pending',
  [AccountStatus.UnderReview]: 'Under Review',
  [AccountStatus.Active]: 'Active',
  [AccountStatus.Dormant]: 'Dormant',
  [AccountStatus.Closed]: 'Closed',
  [AccountStatus.Suspended]: 'Suspended'
};

const getStatusColor = (status: AccountStatus) => {
  switch (status) {
    case AccountStatus.Active: return 'success';
    case AccountStatus.Dormant: return 'warning';
    case AccountStatus.Closed: return 'error';
    case AccountStatus.Suspended: return 'error';
    case AccountStatus.Pending: return 'info';
    case AccountStatus.UnderReview: return 'info';
    default: return 'default';
  }
};

const StatusDropdown: React.FC<StatusDropdownProps> = ({ 
  accountId, 
  value, 
  onStatusChange, 
  disabled = false 
}) => {
  const handleStatusChange = async (newStatus: AccountStatus) => {
    try {
      await accountService.updateAccountStatus(accountId, newStatus);
      onStatusChange?.(newStatus);
    } catch (error: any) {
      // Let parent component handle error notification
      throw error;
    }
  };

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <Select
        value={value}
        onChange={(e) => handleStatusChange(Number(e.target.value) as AccountStatus)}
        disabled={disabled}
        displayEmpty
        renderValue={(selected) => (
          <Chip 
            label={allStatusLabels[selected as AccountStatus] || 'Unknown'} 
            size="small" 
            color={getStatusColor(selected as AccountStatus) as any}
          />
        )}
      >
        {/* Current status (disabled) */}
        <MenuItem value={value} disabled>
          <Chip 
            label={`Current: ${allStatusLabels[value]}`} 
            size="small" 
            color={getStatusColor(value) as any}
          />
        </MenuItem>
        
        {/* Only show Dormant and Closed as changeable options */}
        {value !== AccountStatus.Dormant && (
          <MenuItem value={AccountStatus.Dormant}>
            <Chip 
              label="Change to Dormant" 
              size="small" 
              color="warning"
            />
          </MenuItem>
        )}
        
        {value !== AccountStatus.Closed && (
          <MenuItem value={AccountStatus.Closed}>
            <Chip 
              label="Change to Closed" 
              size="small" 
              color="error"
            />
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default StatusDropdown;
