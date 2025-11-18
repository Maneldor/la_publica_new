import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Section,
  Text,
  Row,
  Column
} from '@react-email/components';
import * as React from 'react';

interface CouponUsedEmailProps {
  redemption?: {
    companyName?: string;
    offerTitle?: string;
    couponCode?: string;
    userName?: string;
    userEmail?: string;
    finalPrice?: number;
    location?: string;
    receiptNumber?: string;
    usedAt?: string | Date;
    originalPrice?: number;
    discountAmount?: number;
  };
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default function CouponUsedEmail({
  redemption = {
    companyName: 'TechInnova Solutions',
    offerTitle: 'Descuento especial en servicios',
    couponCode: 'LAPUB-DEMO-ABCD123',
    userName: 'Ana García',
    userEmail: 'ana.garcia@example.com',
    finalPrice: 80,
    originalPrice: 100,
    discountAmount: 20,
    location: 'Barcelona - Passeig de Gràcia 23',
    receiptNumber: 'REC-2024-001',
    usedAt: new Date()
  }
}: CouponUsedEmailProps) {
  const usedDate = redemption.usedAt ? new Date(redemption.usedAt) : new Date();
  const formattedDate = usedDate.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const dashboardUrl = `${baseUrl}/empresa/ofertas`;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={headerTitle}>✅ Cupón Utilizado</Heading>
            <Text style={headerSubtitle}>
              Notificación de redención exitosa
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={greeting}>
              Hola <strong>{redemption.companyName}</strong>,
            </Text>

            <Text style={introText}>
              Te informamos que un cliente ha utilizado exitosamente uno de tus cupones. Aquí tienes todos los detalles:
            </Text>

            {/* Transaction Details Card */}
            <Section style={transactionCard}>
              <Heading style={cardTitle}>📋 Detalles de la Transacción</Heading>

              {/* Transaction Info Table */}
              <table style={infoTable}>
                <tbody>
                  <tr>
                    <td style={labelCell}>Oferta:</td>
                    <td style={valueCell}>{redemption.offerTitle}</td>
                  </tr>
                  <tr>
                    <td style={labelCell}>Código Cupón:</td>
                    <td style={codeCellValue}>
                      <span style={codeHighlight}>{redemption.couponCode}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={labelCell}>Cliente:</td>
                    <td style={valueCell}>{redemption.userName}</td>
                  </tr>
                  <tr>
                    <td style={labelCell}>Email:</td>
                    <td style={valueCell}>{redemption.userEmail}</td>
                  </tr>
                  <tr>
                    <td style={labelCell}>Fecha y Hora:</td>
                    <td style={valueCell}>{formattedDate}</td>
                  </tr>
                  {redemption.location && (
                    <tr>
                      <td style={labelCell}>Ubicación:</td>
                      <td style={valueCell}>{redemption.location}</td>
                    </tr>
                  )}
                  {redemption.receiptNumber && (
                    <tr>
                      <td style={labelCell}>Nº Recibo:</td>
                      <td style={valueCell}>{redemption.receiptNumber}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pricing Summary */}
              {redemption.originalPrice && redemption.finalPrice && (
                <Section style={pricingSection}>
                  <Heading style={pricingSectionTitle}>💰 Resumen Económico</Heading>
                  <Row>
                    <Column style={pricingColumn}>
                      <Text style={pricingLabel}>Precio Original:</Text>
                      <Text style={originalPrice}>{redemption.originalPrice.toFixed(2)}€</Text>
                    </Column>
                    <Column style={pricingColumn}>
                      <Text style={pricingLabel}>Descuento:</Text>
                      <Text style={discountAmount}>-{redemption.discountAmount?.toFixed(2)}€</Text>
                    </Column>
                    <Column style={pricingColumn}>
                      <Text style={pricingLabel}>Precio Final:</Text>
                      <Text style={finalPrice}>{redemption.finalPrice.toFixed(2)}€</Text>
                    </Column>
                  </Row>
                </Section>
              )}
            </Section>

            {/* Success Message */}
            <Section style={successSection}>
              <Text style={successText}>
                🎉 ¡Enhorabuena! Tu oferta ha generado una venta exitosa. El cliente ha disfrutado de tu descuento y tu empresa ha conseguido un nuevo cliente satisfecho.
              </Text>
            </Section>

            {/* CTA Section */}
            <Section style={ctaSection}>
              <Button style={ctaButton} href={dashboardUrl}>
                Ver Analytics en el Dashboard
              </Button>
              <Text style={ctaSubtext}>
                Consulta estadísticas detalladas de todas tus ofertas y cupones
              </Text>
            </Section>

            {/* Tips Section */}
            <Section style={tipsSection}>
              <Heading style={tipsSectionTitle}>💡 Consejos para maximizar tus ventas</Heading>
              <div style={tipsList}>
                <Text style={tipItem}>
                  • <strong>Renueva tu oferta:</strong> Si ha tenido éxito, considera extenderla
                </Text>
                <Text style={tipItem}>
                  • <strong>Crea ofertas similares:</strong> Replica el formato que funciona
                </Text>
                <Text style={tipItem}>
                  • <strong>Contacta al cliente:</strong> Ofrécele más productos o servicios
                </Text>
                <Text style={tipItem}>
                  • <strong>Analiza las métricas:</strong> Revisa qué funciona mejor
                </Text>
              </div>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Este email es una notificación automática del sistema de cupones de{' '}
              <strong>La Pública</strong>.
            </Text>
            <Text style={footerText}>
              Para gestionar las notificaciones de tu empresa, ve a{' '}
              <Button style={footerLink} href={`${baseUrl}/empresa/preferencias`}>
                Preferencias
              </Button>
            </Text>
            <Text style={footerText}>
              <Button style={footerLink} href={`${baseUrl}/empresa/soporte`}>
                Soporte técnico
              </Button>
              {' | '}
              <Button style={footerLink} href={`${baseUrl}/privacidad`}>
                Política de privacidad
              </Button>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Estilos
const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  borderRadius: '8px',
};

const header = {
  padding: '32px 30px 20px',
  textAlign: 'center' as const,
  backgroundColor: '#10b981',
  borderRadius: '8px 8px 0 0',
};

const headerTitle = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 8px',
};

const headerSubtitle = {
  color: '#d1fae5',
  fontSize: '16px',
  margin: '0',
};

const content = {
  padding: '30px',
};

const greeting = {
  fontSize: '18px',
  color: '#1f2937',
  margin: '0 0 16px',
};

const introText = {
  fontSize: '16px',
  color: '#4b5563',
  lineHeight: '24px',
  margin: '0 0 30px',
};

const transactionCard = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
};

const cardTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 20px',
};

const infoTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  marginBottom: '20px',
};

const labelCell = {
  color: '#6b7280',
  fontSize: '14px',
  padding: '10px 16px 10px 0',
  verticalAlign: 'top' as const,
  width: '140px',
  fontWeight: '500',
};

const valueCell = {
  color: '#1f2937',
  fontSize: '14px',
  padding: '10px 0',
  fontWeight: '500',
};

const codeCellValue = {
  ...valueCell,
  padding: '10px 0',
};

const codeHighlight = {
  backgroundColor: '#fef3c7',
  color: '#92400e',
  padding: '4px 8px',
  borderRadius: '4px',
  fontFamily: 'Monaco, Consolas, monospace',
  fontSize: '16px',
  fontWeight: '700',
};

const pricingSection = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #0ea5e9',
  borderRadius: '8px',
  padding: '20px',
  marginTop: '20px',
};

const pricingSectionTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#0c4a6e',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const pricingColumn = {
  textAlign: 'center' as const,
  padding: '0 10px',
};

const pricingLabel = {
  fontSize: '12px',
  color: '#6b7280',
  margin: '0 0 4px',
};

const originalPrice = {
  fontSize: '16px',
  color: '#6b7280',
  textDecoration: 'line-through',
  margin: '0',
};

const discountAmount = {
  fontSize: '16px',
  color: '#dc2626',
  fontWeight: '600',
  margin: '0',
};

const finalPrice = {
  fontSize: '20px',
  color: '#10b981',
  fontWeight: '700',
  margin: '0',
};

const successSection = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #16a34a',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const successText = {
  fontSize: '15px',
  color: '#15803d',
  lineHeight: '22px',
  margin: '0',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const ctaButton = {
  backgroundColor: '#1f2937',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  margin: '0 0 12px',
};

const ctaSubtext = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
};

const tipsSection = {
  backgroundColor: '#fffbeb',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const tipsSectionTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#92400e',
  margin: '0 0 16px',
};

const tipsList = {
  margin: '0',
};

const tipItem = {
  fontSize: '14px',
  color: '#a16207',
  lineHeight: '20px',
  margin: '8px 0',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 30px',
};

const footer = {
  padding: '0 30px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '12px',
  color: '#9ca3af',
  lineHeight: '18px',
  margin: '8px 0',
};

const footerLink = {
  color: '#3b82f6',
  textDecoration: 'underline',
  fontSize: '12px',
  backgroundColor: 'transparent',
  border: 'none',
  padding: '0',
  margin: '0 2px',
};