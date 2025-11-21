'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Download, QrCode, ExternalLink, CreditCard, MessageSquare } from 'lucide-react';

interface RedeemButtonProps {
  offer: {
    id: string;
    title: string;
    redemptionType: 'COUPON' | 'ONLINE' | 'VIP_ACCOUNT' | 'CONTACT_FORM';
    externalUrl?: string | null;
    discountPercentage?: number;
    originalPrice?: number;
    price: number;
    company: {
      id: string;
      name: string;
      logo?: string | null;
    };
  };
  onRedeemSuccess?: () => void;
}

// Importem els components modals
import ContactFormModal from './ContactFormModal';

const RedeemButton: React.FC<RedeemButtonProps> = ({ offer, onRedeemSuccess }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [activeCoupon, setActiveCoupon] = useState<any>(null);

  // Handler para tipo COUPON (mantener funcionalidad existente)
  const handleCouponRedeem = () => {
    // Aquest handler serà cridat des del component pare que ja té la lògica
    // No fem res aquí perquè el botó original ja gestiona això
    return;
  };

  // Handler para tipo ONLINE
  const handleOnlineRedeem = async () => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/ofertas/${offer.id}/redeem/online`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAgent: navigator.userAgent,
          referrer: window.location.href
        })
      });

      const data = await response.json();

      if (data.success) {
        // Redirigir a URL externa
        window.open(data.data.redirectUrl, '_blank');
        onRedeemSuccess?.();

        // Mostrar missatge d'èxit
        alert(`✅ Redempció exitosa! S'ha obert ${offer.company.name} en una nova pestanya.`);
      } else {
        alert(data.error || 'Error processant la redempció');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de connexió');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para tipo VIP_ACCOUNT
  const handleWalletRedeem = async () => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }

    const discountAmount = offer.originalPrice ? offer.originalPrice - offer.price : 0;
    const confirmText = discountAmount > 0
      ? `S'afegiran ${discountAmount.toFixed(2)}€ al teu moneder`
      : `S'afegirà un ${offer.discountPercentage || 0}% de descompte al teu moneder`;

    if (!confirm(`${confirmText}. Continuar?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/ofertas/${offer.id}/redeem/wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAgent: navigator.userAgent,
          referrer: window.location.href
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ ${data.data.transaction.amount}€ afegits al teu moneder!\nNou saldo: ${data.data.wallet.balance}€`);
        onRedeemSuccess?.();
      } else {
        alert(data.error || 'Error afegint al moneder');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de connexió');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler para tipo CONTACT_FORM
  const handleContactRedeem = () => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }

    setShowContactModal(true);
  };

  // Renderizado condicional del botón según redemptionType
  if (offer.redemptionType === 'COUPON') {
    // No renderitzem res aquí - el component pare manté el botó original
    return null;
  }

  if (offer.redemptionType === 'ONLINE') {
    return (
      <button
        onClick={handleOnlineRedeem}
        disabled={isLoading || !offer.externalUrl}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Processant...
          </>
        ) : (
          <>
            <ExternalLink className="w-5 h-5" />
            Comprar ara amb descompte
          </>
        )}
      </button>
    );
  }

  if (offer.redemptionType === 'VIP_ACCOUNT') {
    return (
      <button
        onClick={handleWalletRedeem}
        disabled={isLoading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Afegint al moneder...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Afegir al moneder
          </>
        )}
      </button>
    );
  }

  if (offer.redemptionType === 'CONTACT_FORM') {
    return (
      <>
        <button
          onClick={handleContactRedeem}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-5 h-5" />
          Sol·licitar informació
        </button>

        {/* Modal Contacto */}
        {showContactModal && (
          <ContactFormModal
            offer={offer}
            onClose={() => setShowContactModal(false)}
            onSuccess={() => {
              setShowContactModal(false);
              onRedeemSuccess?.();
            }}
          />
        )}
      </>
    );
  }

  // Fallback: no debería llegar aquí
  return null;
};

export default RedeemButton;