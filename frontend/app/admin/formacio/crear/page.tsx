'use client';

import { useRouter } from 'next/navigation';
import FormacioWizard from './FormacioWizard';

export default function CrearFormacioPage() {
  const router = useRouter();

  const handleClose = () => {
    router.push('/admin/formacio/listar');
  };

  return (
    <FormacioWizard onClose={handleClose} />
  );
}