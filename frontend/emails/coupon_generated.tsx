import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Row,
  Column
} from '@react-email/components';
import * as React from 'react';

interface CouponGeneratedEmailProps {
  coupon?: {
    code?: string;
    qrCodeUrl?: string;
    expiresAt?: string | Date;
    offerTitle?: string;
    offerDescription?: string;
    companyName?: string;
    originalPrice?: number;
    discountedPrice?: number;
    discount?: string;
  };
  user?: {
    name?: string;
  };
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default function CouponGeneratedEmail({
  coupon = {
    code: 'LAPUB-DEMO-ABCD123',
    offerTitle: 'Descuento especial en servicios',
    offerDescription: 'Aprovecha esta oferta exclusiva para empleados públicos',
    companyName: 'TechInnova Solutions',
    originalPrice: 100,
    discountedPrice: 80,
    discount: '20%',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
  },
  user = {
    name: 'Usuario'
  }
}: CouponGeneratedEmailProps) {
  const expirationDate = coupon.expiresAt ? new Date(coupon.expiresAt) : new Date();
  const formattedDate = expirationDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Html>
      <Head />
      <Preview>¡Tu cupón para {coupon.offerTitle} está listo!</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={`${baseUrl}/logo-email.png`}
              width="120"
              height="40"
              alt="La Pública"
              style={logo}
            />
          </Section>

          {/* Hero Section */}
          <Section style={hero}>
            <Heading style={heroHeading}>
              ¡Tu cupón está listo! 🎉
            </Heading>
            <Text style={heroText}>
              Hola {user.name}, has generado exitosamente tu cupón para la oferta de <strong>{coupon.companyName}</strong>.
            </Text>
          </Section>

          {/* Coupon Details */}
          <Section style={couponSection}>
            <div style={couponCard}>
              <Heading style={offerTitle}>{coupon.offerTitle}</Heading>
              <Text style={offerDescription}>{coupon.offerDescription}</Text>

              {/* Pricing */}
              {coupon.originalPrice && coupon.discountedPrice && (
                <Row style={{ marginBottom: '20px' }}>
                  <Column>
                    <Text style={priceOriginal}>Precio original: <span style={strikethrough}>{coupon.originalPrice}€</span></Text>
                    <Text style={priceDiscounted}>Tu precio: <strong>{coupon.discountedPrice}€</strong></Text>
                    <Text style={savingsText}>¡Ahorras {coupon.discount}!</Text>
                  </Column>
                </Row>
              )}

              {/* QR Code Section */}
              {coupon.qrCodeUrl && (
                <Section style={qrSection}>
                  <Text style={qrText}>Presenta este código QR en el establecimiento:</Text>
                  <Img
                    src={coupon.qrCodeUrl}
                    width="150"
                    height="150"
                    alt={`Código QR para cupón ${coupon.code}`}
                    style={qrCode}
                  />
                </Section>
              )}

              {/* Code Section */}
              <Section style={codeSection}>
                <Text style={codeLabel}>O usa este código:</Text>
                <div style={codeBox}>
                  <Text style={codeText}>{coupon.code}</Text>
                </div>
              </Section>

              {/* Expiration */}
              <Section style={expirationSection}>
                <Text style={expirationText}>
                  ⏰ <strong>Válido hasta: {formattedDate}</strong>
                </Text>
              </Section>
            </div>
          </Section>

          {/* Instructions */}
          <Section style={instructionsSection}>
            <Heading style={instructionsHeading}>📱 Cómo usar tu cupón</Heading>
            <div style={instructionsList}>
              <Text style={instructionItem}>
                <strong>1.</strong> Guarda este email o haz una captura del código QR
              </Text>
              <Text style={instructionItem}>
                <strong>2.</strong> Ve al establecimiento de {coupon.companyName}
              </Text>
              <Text style={instructionItem}>
                <strong>3.</strong> Presenta el código QR o el código de cupón
              </Text>
              <Text style={instructionItem}>
                <strong>4.</strong> ¡Disfruta de tu descuento!
              </Text>
            </div>
          </Section>

          {/* CTA Section */}
          <Section style={ctaSection}>
            <Button style={ctaButton} href={`${baseUrl}/cupones`}>
              Ver mis cupones
            </Button>
            <Text style={ctaSubtext}>
              También puedes acceder a todos tus cupones desde tu perfil en La Pública.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Has recibido este email porque has generado un cupón en{' '}
              <Link href={baseUrl} style={link}>
                La Pública
              </Link>
              .
            </Text>
            <Text style={footerText}>
              Si tienes algún problema con tu cupón, contacta con{' '}
              <Link href={`mailto:soporte@lapublica.es`} style={link}>
                soporte@lapublica.es
              </Link>
            </Text>
            <Text style={footerText}>
              <Link href={`${baseUrl}/preferencias`} style={link}>
                Gestionar preferencias de email
              </Link>{' '}
              |{' '}
              <Link href={`${baseUrl}/privacidad`} style={link}>
                Política de privacidad
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Estilos
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '20px 30px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const hero = {
  padding: '0 30px',
  textAlign: 'center' as const,
};

const heroHeading = {
  fontSize: '28px',
  lineHeight: '32px',
  fontWeight: '700',
  color: '#1f2937',
  margin: '20px 0 16px',
};

const heroText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#6b7280',
  margin: '0 0 30px',
};

const couponSection = {
  padding: '0 30px',
};

const couponCard = {
  backgroundColor: '#f8fafc',
  border: '2px dashed #e5e7eb',
  borderRadius: '12px',
  padding: '30px',
  textAlign: 'center' as const,
  margin: '20px 0',
};

const offerTitle = {
  fontSize: '22px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 12px',
};

const offerDescription = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 20px',
  lineHeight: '20px',
};

const priceOriginal = {
  fontSize: '14px',
  color: '#9ca3af',
  margin: '4px 0',
};

const strikethrough = {
  textDecoration: 'line-through',
};

const priceDiscounted = {
  fontSize: '18px',
  color: '#059669',
  margin: '4px 0',
};

const savingsText = {
  fontSize: '16px',
  color: '#dc2626',
  fontWeight: '600',
  margin: '4px 0',
};

const qrSection = {
  margin: '25px 0',
};

const qrText = {
  fontSize: '14px',
  color: '#374151',
  margin: '0 0 15px',
};

const qrCode = {
  margin: '0 auto',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
};

const codeSection = {
  margin: '25px 0',
};

const codeLabel = {
  fontSize: '14px',
  color: '#374151',
  margin: '0 0 12px',
};

const codeBox = {
  backgroundColor: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  padding: '12px 20px',
  margin: '0 auto',
  maxWidth: '250px',
};

const codeText = {
  fontSize: '20px',
  fontWeight: '700',
  color: '#1f2937',
  fontFamily: 'Monaco, Consolas, monospace',
  margin: '0',
  letterSpacing: '2px',
};

const expirationSection = {
  margin: '25px 0 0',
  padding: '15px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
};

const expirationText = {
  fontSize: '14px',
  color: '#92400e',
  margin: '0',
  textAlign: 'center' as const,
};

const instructionsSection = {
  padding: '0 30px',
  margin: '30px 0',
};

const instructionsHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 16px',
};

const instructionsList = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
};

const instructionItem = {
  fontSize: '14px',
  color: '#374151',
  margin: '8px 0',
  lineHeight: '20px',
};

const ctaSection = {
  padding: '0 30px',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const ctaButton = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  width: '200px',
  padding: '12px 0',
  margin: '0 0 16px',
};

const ctaSubtext = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '30px 0',
};

const footer = {
  padding: '0 30px',
};

const footerText = {
  fontSize: '12px',
  color: '#6b7280',
  lineHeight: '16px',
  margin: '8px 0',
  textAlign: 'center' as const,
};

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
};