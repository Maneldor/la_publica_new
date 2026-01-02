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

interface CompanyWelcomeEmailProps {
  companyName?: string;
  contactName?: string;
  email?: string;
  password?: string;
  planName?: string;
  gestorName?: string | null;
  loginUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default function CompanyWelcomeEmail({
  companyName = 'Empresa',
  contactName = 'Usuari',
  email = 'empresa@exemple.cat',
  password = '********',
  planName = 'Estàndard',
  gestorName = null,
  loginUrl = `${baseUrl}/login`,
}: CompanyWelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Benvinguts a La Pública - {companyName} ja forma part de la comunitat!</Preview>
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
              <Text style={iconText}>🎉</Text>
            </div>
            <Heading style={heroHeading}>
              Benvinguts a La Pública!
            </Heading>
            <Text style={heroText}>
              Hola <strong>{contactName}</strong>, ens complau donar-vos la benvinguda!
              L'empresa <strong>{companyName}</strong> ja forma part de la nostra
              comunitat d'empreses col·laboradores.
            </Text>
          </Section>

          {/* Credentials Box */}
          <Section style={credentialsSection}>
            <div style={credentialsCard}>
              <Heading style={credentialsTitle}>
                🔐 Les vostres credencials d'accés
              </Heading>

              <div style={credentialRow}>
                <Text style={credentialLabel}>Correu electrònic:</Text>
                <Text style={credentialValue}>{email}</Text>
              </div>

              <div style={credentialRow}>
                <Text style={credentialLabel}>Contrasenya:</Text>
                <Text style={credentialValuePassword}>{password}</Text>
              </div>

              <Text style={warningText}>
                ⚠️ Us recomanem canviar la contrasenya després del primer accés.
              </Text>
            </div>
          </Section>

          {/* Plan Info */}
          <Section style={planSection}>
            <div style={planCard}>
              <Heading style={planTitle}>📋 Informació del vostre pla</Heading>

              <div style={planRow}>
                <Text style={planLabel}>Pla contractat:</Text>
                <Text style={planValue}>{planName}</Text>
              </div>

              {gestorName && (
                <div style={planRow}>
                  <Text style={planLabel}>Gestor assignat:</Text>
                  <Text style={planValue}>{gestorName}</Text>
                </div>
              )}
            </div>
          </Section>

          {/* CTA Button */}
          <Section style={ctaSection}>
            <Button style={ctaButton} href={loginUrl}>
              Accedir a La Pública
            </Button>
          </Section>

          {/* First Steps */}
          <Section style={stepsSection}>
            <Heading style={stepsHeading}>🚀 Primers passos</Heading>
            <div style={stepsList}>
              <Text style={stepItem}>
                <span style={stepNumber}>1</span>
                Accediu al vostre panell de control
              </Text>
              <Text style={stepItem}>
                <span style={stepNumber}>2</span>
                Completeu el perfil de l'empresa
              </Text>
              <Text style={stepItem}>
                <span style={stepNumber}>3</span>
                Afegiu les vostres ofertes i promocions
              </Text>
              <Text style={stepItem}>
                <span style={stepNumber}>4</span>
                Comenceu a connectar amb empleats públics!
              </Text>
            </div>
          </Section>

          <Hr style={divider} />

          {/* Help Section */}
          <Section style={helpSection}>
            <Text style={helpText}>
              💬 Si teniu qualsevol dubte, no dubteu a contactar-nos a{' '}
              <Link href="mailto:suport@lapublica.cat" style={link}>
                suport@lapublica.cat
              </Link>
              {gestorName && (
                <> o parlar directament amb el vostre gestor <strong>{gestorName}</strong>.</>
              )}
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Salutacions cordials,
              <br />
              <strong>L'equip de La Pública</strong>
            </Text>
            <Hr style={footerDivider} />
            <Text style={footerLegal}>
              © {new Date().getFullYear()} La Pública. Tots els drets reservats.
              <br />
              Doctor Josep Maria Tarruella, 61, Barcelona
            </Text>
            <Text style={footerLinks}>
              <Link href={`${baseUrl}/privacitat`} style={footerLink}>
                Política de privacitat
              </Link>
              {' | '}
              <Link href={`${baseUrl}/termes`} style={footerLink}>
                Termes d'ús
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
  background: 'linear-gradient(135deg, #1E3A5F 0%, #2E7D32 100%)',
};

const logo = {
  margin: '0 auto',
};

const hero = {
  padding: '30px 30px 0',
  textAlign: 'center' as const,
};

const iconContainer = {
  margin: '0 auto 20px',
  width: '80px',
  height: '80px',
  backgroundColor: '#E8F5E9',
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
  color: '#1E3A5F',
  margin: '0 0 16px',
};

const heroText = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#6b7280',
  margin: '0',
};

const credentialsSection = {
  padding: '30px 30px 0',
};

const credentialsCard = {
  backgroundColor: '#f8fafc',
  border: '2px solid #1E3A5F',
  borderRadius: '12px',
  padding: '24px',
};

const credentialsTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1E3A5F',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const credentialRow = {
  marginBottom: '12px',
};

const credentialLabel = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 4px',
};

const credentialValue = {
  fontSize: '16px',
  color: '#1f2937',
  fontWeight: '600',
  margin: '0',
  backgroundColor: '#ffffff',
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
};

const credentialValuePassword = {
  fontSize: '16px',
  color: '#1f2937',
  fontWeight: '600',
  margin: '0',
  backgroundColor: '#ffffff',
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
  fontFamily: 'Monaco, Consolas, monospace',
  letterSpacing: '2px',
};

const warningText = {
  fontSize: '13px',
  color: '#92400e',
  backgroundColor: '#fef3c7',
  padding: '10px 14px',
  borderRadius: '6px',
  margin: '16px 0 0',
  textAlign: 'center' as const,
};

const planSection = {
  padding: '20px 30px 0',
};

const planCard = {
  backgroundColor: '#E8F5E9',
  borderRadius: '12px',
  padding: '20px',
};

const planTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#2E7D32',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const planRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
};

const planLabel = {
  fontSize: '14px',
  color: '#374151',
  margin: '0',
};

const planValue = {
  fontSize: '14px',
  color: '#1f2937',
  fontWeight: '600',
  margin: '0',
};

const ctaSection = {
  padding: '30px 30px 0',
  textAlign: 'center' as const,
};

const ctaButton = {
  backgroundColor: '#1E3A5F',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  width: '220px',
  padding: '14px 0',
};

const stepsSection = {
  padding: '30px 30px 0',
};

const stepsHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const stepsList = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '20px',
};

const stepItem = {
  fontSize: '14px',
  color: '#374151',
  margin: '12px 0',
  lineHeight: '22px',
  display: 'flex',
  alignItems: 'center',
};

const stepNumber = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '24px',
  height: '24px',
  backgroundColor: '#2E7D32',
  color: '#ffffff',
  borderRadius: '50%',
  fontSize: '12px',
  fontWeight: '600',
  marginRight: '12px',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '30px 0',
};

const helpSection = {
  padding: '0 30px',
};

const helpText = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '22px',
  textAlign: 'center' as const,
  margin: '0',
};

const footer = {
  padding: '20px 30px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '14px',
  color: '#374151',
  lineHeight: '22px',
  margin: '0 0 20px',
};

const footerDivider = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

const footerLegal = {
  fontSize: '12px',
  color: '#9ca3af',
  lineHeight: '18px',
  margin: '0 0 12px',
};

const footerLinks = {
  fontSize: '12px',
  color: '#9ca3af',
  margin: '0',
};

const footerLink = {
  color: '#6b7280',
  textDecoration: 'underline',
};

const link = {
  color: '#1E3A5F',
  textDecoration: 'underline',
};
