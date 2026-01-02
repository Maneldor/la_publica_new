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

interface CompanyPublishedEmailProps {
  companyName?: string;
  contactName?: string;
  planName?: string;
  profileUrl?: string;
  dashboardUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default function CompanyPublishedEmail({
  companyName = 'La vostra empresa',
  contactName = 'Usuari',
  planName = 'Estàndard',
  profileUrl = `${baseUrl}/dashboard/empreses`,
  dashboardUrl = `${baseUrl}/empresa/dashboard`,
}: CompanyPublishedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Felicitats! {companyName} ja està publicada a La Pública</Preview>
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
              La vostra empresa ja està publicada!
            </Heading>
            <Text style={heroText}>
              Hola <strong>{contactName}</strong>, ens complau comunicar-vos que
              l'empresa <strong>{companyName}</strong> ha estat verificada i publicada
              correctament a La Pública!
            </Text>
          </Section>

          {/* Success Message */}
          <Section style={successSection}>
            <div style={successCard}>
              <Text style={successIcon}>✓</Text>
              <Heading style={successTitle}>
                Perfil verificat i actiu
              </Heading>
              <Text style={successText}>
                El vostre perfil d'empresa ara és visible per a tots els empleats públics
                que formen part de la nostra comunitat.
              </Text>
            </div>
          </Section>

          {/* What's Next */}
          <Section style={stepsSection}>
            <Heading style={stepsHeading}>Què passa ara?</Heading>
            <div style={stepsList}>
              <Text style={stepItem}>
                <span style={stepNumber}>1</span>
                El vostre perfil apareix al directori d'empreses col·laboradores
              </Text>
              <Text style={stepItem}>
                <span style={stepNumber}>2</span>
                Podeu començar a publicar ofertes i promocions
              </Text>
              <Text style={stepItem}>
                <span style={stepNumber}>3</span>
                Els empleats públics us podran contactar directament
              </Text>
              <Text style={stepItem}>
                <span style={stepNumber}>4</span>
                Rebreu estadístiques de visualitzacions i interaccions
              </Text>
            </div>
          </Section>

          {/* CTA Buttons */}
          <Section style={ctaSection}>
            <Button style={ctaButton} href={profileUrl}>
              Veure el meu perfil
            </Button>
            <Text style={orText}>o</Text>
            <Button style={ctaButtonSecondary} href={dashboardUrl}>
              Anar al Dashboard
            </Button>
          </Section>

          {/* Plan Info */}
          <Section style={planSection}>
            <div style={planCard}>
              <Heading style={planTitle}>📋 El vostre pla: {planName}</Heading>
              <Text style={planText}>
                Amb el vostre pla actual podeu gaudir de totes les funcionalitats
                disponibles per connectar amb la comunitat d'empleats públics.
              </Text>
            </div>
          </Section>

          <Hr style={divider} />

          {/* Help Section */}
          <Section style={helpSection}>
            <Text style={helpText}>
              💬 Si teniu qualsevol dubte o necessiteu ajuda, no dubteu a contactar-nos a{' '}
              <Link href="mailto:suport@lapublica.cat" style={link}>
                suport@lapublica.cat
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Moltes gràcies per confiar en nosaltres!
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

const successSection = {
  padding: '30px 30px 0',
};

const successCard = {
  backgroundColor: '#E8F5E9',
  border: '2px solid #2E7D32',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
};

const successIcon = {
  fontSize: '40px',
  color: '#2E7D32',
  margin: '0 0 12px',
  display: 'block',
};

const successTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#2E7D32',
  margin: '0 0 12px',
};

const successText = {
  fontSize: '14px',
  color: '#374151',
  margin: '0',
  lineHeight: '22px',
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

const ctaSection = {
  padding: '30px 30px 0',
  textAlign: 'center' as const,
};

const ctaButton = {
  backgroundColor: '#2E7D32',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  width: '200px',
  padding: '14px 0',
};

const orText = {
  fontSize: '14px',
  color: '#9ca3af',
  margin: '12px 0',
};

const ctaButtonSecondary = {
  backgroundColor: '#ffffff',
  border: '2px solid #1E3A5F',
  borderRadius: '8px',
  color: '#1E3A5F',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  width: '200px',
  padding: '12px 0',
};

const planSection = {
  padding: '30px 30px 0',
};

const planCard = {
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  padding: '20px',
  border: '1px solid #e5e7eb',
};

const planTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1E3A5F',
  margin: '0 0 12px',
  textAlign: 'center' as const,
};

const planText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0',
  lineHeight: '22px',
  textAlign: 'center' as const,
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
