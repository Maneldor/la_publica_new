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
} from '@react-email/components';
import * as React from 'react';

interface EmailVerificationProps {
  user?: {
    name?: string;
    email?: string;
  };
  verificationUrl?: string;
  expiresInHours?: number;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default function EmailVerificationEmail({
  user = {
    name: 'Usuario',
    email: 'usuario@ejemplo.com'
  },
  verificationUrl = `${baseUrl}/verificar-email?token=ejemplo`,
  expiresInHours = 24
}: EmailVerificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Verifica tu correo electrónico para completar el registro en La Pública</Preview>
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
            <div style={iconContainer}>
              <Text style={iconText}>✉️</Text>
            </div>
            <Heading style={heroHeading}>
              Verifica tu correo electrónico
            </Heading>
            <Text style={heroText}>
              Hola <strong>{user.name}</strong>, gracias por registrarte en La Pública.
              Para completar tu registro y acceder a todos los beneficios de la comunidad,
              necesitamos verificar tu dirección de correo electrónico.
            </Text>
          </Section>

          {/* Verification Box */}
          <Section style={verificationSection}>
            <div style={verificationCard}>
              <Text style={verificationTitle}>
                Haz clic en el botón para verificar tu cuenta:
              </Text>

              <Button style={ctaButton} href={verificationUrl}>
                Verificar mi correo
              </Button>

              <Text style={expirationText}>
                ⏰ Este enlace expira en <strong>{expiresInHours} horas</strong>
              </Text>
            </div>
          </Section>

          {/* Alternative Link */}
          <Section style={alternativeSection}>
            <Text style={alternativeText}>
              Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
            </Text>
            <div style={linkBox}>
              <Text style={linkText}>{verificationUrl}</Text>
            </div>
          </Section>

          {/* Info Section */}
          <Section style={infoSection}>
            <Heading style={infoHeading}>¿Qué puedes hacer en La Pública?</Heading>
            <div style={infoList}>
              <Text style={infoItem}>
                ✅ Conectar con otros profesionales del sector público
              </Text>
              <Text style={infoItem}>
                ✅ Acceder a ofertas y descuentos exclusivos
              </Text>
              <Text style={infoItem}>
                ✅ Participar en grupos y comunidades
              </Text>
              <Text style={infoItem}>
                ✅ Gestionar tu agenda personal y objetivos
              </Text>
            </div>
          </Section>

          <Hr style={divider} />

          {/* Security Notice */}
          <Section style={securitySection}>
            <Text style={securityText}>
              🔒 <strong>Nota de seguridad:</strong> Si no has creado una cuenta en La Pública,
              puedes ignorar este correo de forma segura. Tu dirección de correo no será
              utilizada sin tu consentimiento.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Este correo ha sido enviado a {user.email} porque alguien ha
              usado esta dirección para registrarse en{' '}
              <Link href={baseUrl} style={link}>
                La Pública
              </Link>
              .
            </Text>
            <Text style={footerText}>
              ¿Tienes problemas?{' '}
              <Link href={`mailto:soporte@lapublica.es`} style={link}>
                Contacta con soporte
              </Link>
            </Text>
            <Text style={footerText}>
              <Link href={`${baseUrl}/privacidad`} style={link}>
                Política de privacidad
              </Link>{' '}
              |{' '}
              <Link href={`${baseUrl}/terminos`} style={link}>
                Términos de uso
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

const iconContainer = {
  margin: '20px auto 0',
  width: '80px',
  height: '80px',
  backgroundColor: '#eef2ff',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const iconText = {
  fontSize: '40px',
  lineHeight: '80px',
  margin: '0',
  textAlign: 'center' as const,
};

const heroHeading = {
  fontSize: '28px',
  lineHeight: '32px',
  fontWeight: '700',
  color: '#1f2937',
  margin: '24px 0 16px',
};

const heroText = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#6b7280',
  margin: '0 0 30px',
};

const verificationSection = {
  padding: '0 30px',
};

const verificationCard = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  padding: '30px',
  textAlign: 'center' as const,
  margin: '20px 0',
};

const verificationTitle = {
  fontSize: '16px',
  color: '#374151',
  margin: '0 0 24px',
};

const ctaButton = {
  backgroundColor: '#4f46e5',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  width: '220px',
  padding: '14px 0',
  margin: '0 0 20px',
};

const expirationText = {
  fontSize: '14px',
  color: '#92400e',
  backgroundColor: '#fef3c7',
  padding: '10px 16px',
  borderRadius: '6px',
  margin: '0',
};

const alternativeSection = {
  padding: '0 30px',
  margin: '24px 0',
};

const alternativeText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 12px',
  textAlign: 'center' as const,
};

const linkBox = {
  backgroundColor: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  padding: '12px',
  wordBreak: 'break-all' as const,
};

const linkText = {
  fontSize: '12px',
  color: '#4f46e5',
  margin: '0',
  fontFamily: 'Monaco, Consolas, monospace',
};

const infoSection = {
  padding: '0 30px',
  margin: '30px 0',
};

const infoHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const infoList = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
};

const infoItem = {
  fontSize: '14px',
  color: '#374151',
  margin: '10px 0',
  lineHeight: '22px',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '30px 0',
};

const securitySection = {
  padding: '0 30px',
  margin: '0 0 20px',
};

const securityText = {
  fontSize: '13px',
  color: '#6b7280',
  backgroundColor: '#f9fafb',
  padding: '16px',
  borderRadius: '8px',
  lineHeight: '20px',
  margin: '0',
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
  color: '#4f46e5',
  textDecoration: 'underline',
};
