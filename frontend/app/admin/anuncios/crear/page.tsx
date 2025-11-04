'use client';

import { useRouter } from 'next/navigation';
import AnunciWizard from '@/components/wizard/AnunciWizard';

export default function CrearAnuncioAdminPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/admin/anuncios/listar');
  };

  const handleClose = () => {
    router.push('/admin/anuncios/listar');
  };

  return (
    <AnunciWizard
      mode="create"
      onSuccess={handleSuccess}
      onClose={handleClose}
    />
  );
}

