'use client';

import { useRouter } from 'next/navigation';
import AssessoramentWizard from './AssessoramentWizard';

export default function CrearAssessoramentPage() {
  const router = useRouter();

  const handleClose = () => {
    router.push('/admin/assessoraments/listar');
  };

  return <AssessoramentWizard onClose={handleClose} />;
}