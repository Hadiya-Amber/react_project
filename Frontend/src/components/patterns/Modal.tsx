import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

interface ModalContextType {
  isOpen: boolean;
  toggle: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

interface ModalProps {
  children: ReactNode;
  defaultOpen?: boolean;
}

export function Modal({ children, defaultOpen = false }: ModalProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const toggle = () => setIsOpen(!isOpen);

  return (
    <ModalContext.Provider value={{ isOpen, toggle }}>
      {children}
    </ModalContext.Provider>
  );
}

Modal.Trigger = function ModalTrigger({ children }: { children: ReactNode }) {
  const context = useContext(ModalContext);
  if (!context) throw new Error('Modal.Trigger must be used within Modal');
  
  return (
    <div onClick={context.toggle}>
      {children}
    </div>
  );
};

Modal.Content = function ModalContent({ children }: { children: ReactNode }) {
  const context = useContext(ModalContext);
  if (!context) throw new Error('Modal.Content must be used within Modal');
  
  return (
    <Dialog open={context.isOpen} onClose={context.toggle}>
      {children}
    </Dialog>
  );
};

Modal.Header = function ModalHeader({ children }: { children: ReactNode }) {
  return <DialogTitle>{children}</DialogTitle>;
};

Modal.Body = function ModalBody({ children }: { children: ReactNode }) {
  return <DialogContent>{children}</DialogContent>;
};

Modal.Footer = function ModalFooter({ children }: { children: ReactNode }) {
  return <DialogActions>{children}</DialogActions>;
};
