'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown para redirección automática
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/empresa/pla');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Pagament Exitós!
        </h1>

        <p className="text-gray-600 mb-6">
          El teu pla s'ha actualitzat correctament. Ja pots gaudir de totes les noves funcionalitats.
        </p>

        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>El teu pla ha estat activat immediatament.</strong>
            <br />
            Rebràs un correu electrònic de confirmació en els propers minuts.
          </p>
        </div>

        {/* Auto redirect */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Redirigint en {countdown} segons...</span>
        </div>

        {/* Manual link */}
        <Link
          href="/empresa/pla"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Anar al meu pla ara
        </Link>
      </div>
    </div>
  );
}