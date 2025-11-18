import QRCode from 'qrcode';

/**
 * Genera un código de cupón único
 * Formato: LAPUB-COMPANYSLUG-RANDOM
 * Ejemplo: LAPUB-TECHINNOVA-A3F9X2
 */
export function generateCouponCode(companyName: string, offerId: string): string {
  // Limpiar nombre empresa (solo letras y números)
  const cleanCompanyName = companyName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 10);

  // Generar parte aleatoria (6 caracteres alfanuméricos)
  const randomPart = generateRandomString(6);

  // Timestamp corto para evitar colisiones
  const timestamp = Date.now().toString(36).toUpperCase().substring(-4);

  return `LAPUB-${cleanCompanyName}-${timestamp}${randomPart}`;
}

/**
 * Genera string aleatorio alfanumérico
 */
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Genera QR code como Data URL
 * @returns Base64 data URL del QR
 */
export async function generateQRCode(
  couponCode: string,
  options?: {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }
): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(couponCode, {
      width: options?.width || 300,
      margin: options?.margin || 2,
      color: {
        dark: options?.color?.dark || '#000000',
        light: options?.color?.light || '#FFFFFF'
      },
      errorCorrectionLevel: 'H' // High error correction
    });

    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Valida formato de código de cupón
 */
export function isValidCouponCode(code: string): boolean {
  // Formato: LAPUB-XXXX-YYYYYY donde X e Y son alfanuméricos
  const pattern = /^LAPUB-[A-Z0-9]{1,10}-[A-Z0-9]{10}$/;
  return pattern.test(code);
}

/**
 * Calcula fecha de expiración del cupón
 * @param offerExpiresAt Fecha de caducidad de la oferta
 * @param defaultDays Días por defecto si la oferta no tiene fecha
 */
export function calculateCouponExpiration(
  offerExpiresAt: Date | null,
  defaultDays: number = 30
): Date {
  if (offerExpiresAt) {
    // El cupón expira cuando expira la oferta
    return offerExpiresAt;
  }

  // Por defecto 30 días desde ahora
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + defaultDays);
  return expiration;
}

/**
 * Formatea código de cupón para display
 * Ejemplo: LAPUB-TECHINNOVA-A3F9X2 → LAPUB-TECH...F9X2
 */
export function formatCouponCodeDisplay(code: string, maxLength: number = 20): string {
  if (code.length <= maxLength) {
    return code;
  }

  const half = Math.floor((maxLength - 3) / 2);
  return `${code.substring(0, half)}...${code.substring(code.length - half)}`;
}