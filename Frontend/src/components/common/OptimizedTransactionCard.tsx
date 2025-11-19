import React, { memo } from 'react';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import { colors } from '@/theme';

interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
}

interface TransactionCardProps {
  transaction: Transaction;
  onClick?: (id: number) => void;
}

export const OptimizedTransactionCard = memo<TransactionCardProps>(({ 
  transaction, 
  onClick 
}) => {
  const isPositive = transaction.type === 'deposit';
  
  return (
    <Card 
      sx={{ 
        mb: 1, 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 2 } : {}
      }}
      onClick={() => onClick?.(transaction.id)}
    >
      <CardContent sx={{ py: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body1" fontWeight={500}>
              {transaction.description}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {transaction.date}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography 
              variant="h6" 
              color={isPositive ? colors.secondary : colors.error}
              fontWeight={600}
            >
              {isPositive ? '+' : '-'}${Math.abs(transaction.amount)}
            </Typography>
            <Chip 
              label={transaction.type} 
              size="small"
              color={isPositive ? 'success' : 'error'}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});
