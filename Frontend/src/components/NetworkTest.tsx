import React, { useState } from 'react';
import { useSingleRequest } from '../hooks/useSingleRequest';

const NetworkTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { singleRequest } = useSingleRequest();

  const testAPI = async () => {
    try {
      setIsLoading(true);
      const data = await singleRequest(
        'test-api',
        async () => {
          const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
          return response.json();
        }
      );
      console.log('Success:', data);
    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={testAPI} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Test Network'}
      </button>
    </div>
  );
};

export default NetworkTest;
