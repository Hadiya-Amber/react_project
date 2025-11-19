import React, { memo, useMemo, useCallback, useState, Suspense, forwardRef, useImperativeHandle } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, TextField, Button, CircularProgress } from '@mui/material';
import { RootState, AppDispatch } from '@/store';
import { fetchTransactions } from '@/store/slices/transactionSlice';
import { DataFetcher } from '@/components/patterns/DataFetcher';
import { Modal } from '@/components/patterns/Modal';
import { Portal } from '@/components/patterns/Portal';
import { withAuth } from '@/components/hoc/withAuth';
import { AsyncBoundary } from '@/components/boundaries/AsyncBoundary';
import { useCounter, useDebounce } from '@/hooks/useAdvancedPatterns';

const AuthenticatedTransactionList = withAuth(() => {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, isLoading } = useSelector((state: RootState) => state.transactions);
  const [filter, setFilter] = useState('');
  const debouncedFilter = useDebounce(filter, 300);
  const { count, increment, reset } = useCounter(0);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.description?.toLowerCase().includes(debouncedFilter.toLowerCase())
    );
  }, [transactions, debouncedFilter]);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  }, []);

  const handleRefresh = useCallback(() => {
    dispatch(fetchTransactions());
    increment();
  }, [dispatch, increment]);

  const TransactionRow = memo(({ transaction }: any) => (
    <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
      <div>#{transaction.id} - ${transaction.amount}</div>
      <div>{transaction.description}</div>
    </Box>
  ));

  return (
    <Box>
      <DataFetcher url="/api/transactions/summary">
        {({ data, loading, error }: { data: any; loading: boolean; error: string | null }) => (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            {loading && <CircularProgress size={20} />}
            {error && <div>Error: {error}</div>}
            {data && <div>Total: ${data?.total || 0}</div>}
          </Box>
        )}
      </DataFetcher>

      <TextField
        fullWidth
        placeholder="Filter transactions..."
        value={filter}
        onChange={handleFilterChange}
        sx={{ mb: 2 }}
      />

      <Box sx={{ mb: 2 }}>
        <Button onClick={handleRefresh}>Refresh (Count: {count})</Button>
        <Button onClick={reset}>Reset Counter</Button>
      </Box>

      <Modal>
        <Modal.Trigger>
          <Button variant="contained">Open Transaction Details</Button>
        </Modal.Trigger>
        <Modal.Content>
          <Modal.Header>Transaction Details</Modal.Header>
          <Modal.Body>
            <Suspense fallback={<CircularProgress />}>
              <div>Transaction Details Loaded</div>
            </Suspense>
          </Modal.Body>
          <Modal.Footer>
            <Button>Close</Button>
          </Modal.Footer>
        </Modal.Content>
      </Modal>

      {filteredTransactions.map(transaction => (
        <TransactionRow key={transaction.id} transaction={transaction} />
      ))}

      <Portal>
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#333',
          color: 'white',
          padding: '10px',
          borderRadius: '4px'
        }}>
          Transactions: {filteredTransactions.length}
        </div>
      </Portal>
    </Box>
  );
});

export interface TransactionListRef {
  refresh: () => void;
  clearFilter: () => void;
}

export const TransactionListWithAllPatterns = forwardRef<TransactionListRef>((props, ref) => {
  const [filter, setFilter] = useState('');

  useImperativeHandle(ref, () => ({
    refresh: () => {
      console.log('Refreshing...');
    },
    clearFilter: () => {
      setFilter('');
    }
  }));

  return (
    <AsyncBoundary>
      <AuthenticatedTransactionList />
    </AsyncBoundary>
  );
});
