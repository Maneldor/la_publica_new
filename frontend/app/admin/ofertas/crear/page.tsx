'use client';

import { useRouter } from 'next/navigation';
import OfferWizard from './OfferWizard';

export default function CrearOfertaPage() {
  const router = useRouter();

  const handleClose = () => {
    router.push('/admin/ofertas/listar');
  };

  return <OfferWizard onClose={handleClose} />;
}