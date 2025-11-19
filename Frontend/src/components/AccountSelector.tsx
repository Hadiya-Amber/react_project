import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Alert, Box, Typography } from '@mui/material';
import { accountService, AccountReadDto } from '@/services/accountService';
import { AccountType } from '@/types';

interface AccountSelectorProps {
  value: string;
  onChange: (accountNumber: string, accountId: number) => void;
  label?: string;
  userAge?: number | null;
  excludeMinorIfOver18?: boolean;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  value,
  onChange,
  label = "Select Account",
  userAge,
  excludeMinorIfOver18 = true
}) => {
  const [accounts, setAccounts] = useState<AccountReadDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountService.getMyAccounts();
        const activeAccounts = data.filter(acc => acc.status === 2); // Active accounts only
        
        // Don't filter accounts, just set all active accounts
        setAccounts(activeAccounts);
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [userAge, excludeMinorIfOver18]);

  const getAccountTypeLabel = (accountType: AccountType) => {
    switch (accountType) {
      case AccountType.Minor: return 'Minor Account';
      case AccountType.Major: return 'Major Account';
      case AccountType.Savings: return 'Savings Account';
      case AccountType.Current: return 'Current Account';
      default: return 'Unknown';
    }
  };

  const isMinorAccount = (accountType: AccountType) => accountType === AccountType.Minor;

  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel>{label}</InputLabel>
        <Select
          value={value}
          label={label}
          onChange={(e) => {
            const selectedAccount = accounts.find(acc => acc.accountNumber === e.target.value);
            if (selectedAccount) {
              onChange(selectedAccount.accountNumber, selectedAccount.id);
            }
          }}
          disabled={loading}
        >
          {accounts.map((account) => (
            <MenuItem 
              key={account.id} 
              value={account.accountNumber}
              disabled={!!(excludeMinorIfOver18 && userAge && userAge >= 18 && isMinorAccount(account.accountType))}
            >
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {account.accountNumber} - {getAccountTypeLabel(account.accountType)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Balance: ₹{account.balance.toLocaleString()}
                  {excludeMinorIfOver18 && userAge && userAge >= 18 && isMinorAccount(account.accountType) && 
                    " (Restricted - Upgrade Required)"
                  }
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {excludeMinorIfOver18 && userAge && userAge >= 18 && accounts.some(acc => isMinorAccount(acc.accountType)) && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          Minor accounts are restricted for users 18+. Please use other account types or upgrade your Minor account.
        </Alert>
      )}
    </Box>
  );
};

export default AccountSelector;
