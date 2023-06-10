import {
  createContext,
  FC,
  PropsWithChildren,
  ReactNode,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import * as RadixToast from '@radix-ui/react-toast';

import { Toast } from '../components';
import { v4 as uuid } from 'uuid'

export type ToastType = {
  type: 'info' | 'success' | 'error' | 'warning';
  title: string;
  message: ReactNode;
};

type ToastTypeWithId = ToastType & { id: string };

const id: string = uuid();

type ToastContextType = {
  open: (toast: ToastType) => void;
};

export const ToastContext = createContext<ToastContextType>(null!);

export const ToastProvider: FC<PropsWithChildren> = ({children}) => {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState<ToastTypeWithId[]>([]);
  const open = (content: ToastType) => {
    setToasts((prevState) => [
      ...prevState,
      { id: id, ...content },
    ]);
  };
  const close = (id: string) => {
    setToasts((prevState) => prevState.filter((toast) => toast.id === id));
  };

  const contextValue = useMemo(() => ({ open }), []);

  return (
    <ToastContext.Provider value={contextValue}>
      <RadixToast.Provider
        swipeDirection='right'
        label={t('global.notification') || 'Notification'}
      >
        {children}
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} close={() => close(toast.id)} />
        ))}
        <RadixToast.Viewport className='toast__list' />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
};