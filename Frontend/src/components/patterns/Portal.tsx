import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: ReactNode;
  containerId?: string;
}

export const Portal: React.FC<PortalProps> = ({ 
  children, 
  containerId = 'portal-root' 
}) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let element = document.getElementById(containerId);
    
    if (!element) {
      element = document.createElement('div');
      element.id = containerId;
      document.body.appendChild(element);
    }
    
    setContainer(element);

    return () => {
      if (element && element.childNodes.length === 0) {
        document.body.removeChild(element);
      }
    };
  }, [containerId]);

  return container ? createPortal(children, container) : null;
};

// Toast notification using Portal
export const Toast: React.FC<{ message: string; onClose: () => void }> = ({ 
  message, 
  onClose 
}) => (
  <Portal>
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: '#333',
      color: 'white',
      padding: '12px 20px',
      borderRadius: '4px',
      zIndex: 9999,
    }}>
      {message}
      <button onClick={onClose} style={{ marginLeft: '10px' }}>×</button>
    </div>
  </Portal>
);
