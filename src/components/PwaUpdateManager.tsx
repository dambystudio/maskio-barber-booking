'use client';

import { usePWA } from '../hooks/usePWA';
import UpdateNotification from './UpdateNotification';

export default function PwaUpdateManager() {
  const { isUpdateAvailable, handleUpdate } = usePWA();

  return (
    <>
      {isUpdateAvailable && <UpdateNotification onUpdate={handleUpdate} />}
    </>
  );
} 