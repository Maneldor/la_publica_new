import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type PlanTier = 'PIONERES' | 'STANDARD' | 'STRATEGIC' | 'ENTERPRISE';

export interface MinimalCompanyData {
  companyName: string;
  companyEmail: string;
  companyNif: string;
  sector: string;
  selectedPlan: PlanTier;
}

export interface GeneratedCredentials {
  username: string;
  email: string;
  password: string;
}

/**
 * Genera username basado en nombre de empresa y fecha
 */
export function generateUsername(companyData: MinimalCompanyData): string {
  const { companyName } = companyData;

  // 1. Slug del nombre (máx 6 chars para dejar espacio)
  const nameSlug = companyName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[^a-zA-Z0-9]/g, '') // solo alfanumérico
    .toLowerCase()
    .substring(0, 6);

  // 2. Fecha: YYMMDD (6 dígitos)
  const today = new Date();
  const dateCode = today.getFullYear().toString().slice(-2) +
                   (today.getMonth() + 1).toString().padStart(2, '0') +
                   today.getDate().toString().padStart(2, '0');

  return `${nameSlug}${dateCode}`;
}

/**
 * Genera contraseña temporal segura
 */
export function generateSecurePassword(companyData: MinimalCompanyData): string {
  const { companyName, selectedPlan } = companyData;

  // 1. Prefijo del nombre (3 chars, primera mayúscula)
  const namePrefix = companyName.charAt(0).toUpperCase() +
                     companyName.replace(/[^a-zA-Z]/g, '').substring(1, 3).toLowerCase();

  // 2. Números aleatorios (3 dígitos)
  const randomNumbers = Math.floor(100 + Math.random() * 900).toString();

  // 3. Símbolo del plan
  const planSymbols: Record<PlanTier, string> = {
    'PIONERES': '#',
    'STANDARD': '$',
    'STRATEGIC': '%',
    'ENTERPRISE': '&'
  };

  // 4. Sufijo temporal con año
  const yearSuffix = new Date().getFullYear().toString().slice(-2);

  // Formato: Abc456$24
  return `${namePrefix}${randomNumbers}${planSymbols[selectedPlan]}${yearSuffix}`;
}

/**
 * Asegura que las credenciales sean únicas
 */
export async function ensureUniqueCredentials(
  baseUsername: string,
  companyEmail: string
): Promise<{ username: string; email: string }> {
  let username = baseUsername;
  let counter = 1;

  // El username es solo para mostrar, no hay campo username en DB
  // Por simplicidad, mantenemos el username generado
  username = baseUsername;

  // Verificar email único
  const existingEmail = await prisma.user.findFirst({ where: { email: companyEmail } });
  if (existingEmail) {
    throw new Error(`El email ${companyEmail} ya está en uso`);
  }

  return { username, email: companyEmail };
}

/**
 * Genera credenciales completas y únicas para una nueva empresa
 */
export async function generateCompanyCredentials(
  companyData: MinimalCompanyData
): Promise<GeneratedCredentials> {
  // Generar credenciales base
  const baseUsername = generateUsername(companyData);
  const password = generateSecurePassword(companyData);

  // Asegurar unicidad
  const { username, email } = await ensureUniqueCredentials(
    baseUsername,
    companyData.companyEmail
  );

  return {
    username,
    email,
    password
  };
}

/**
 * Valida el formato del NIF/CIF español
 */
export function validateSpanishNIF(nif: string): boolean {
  const nifRegex = /^[0-9]{8}[A-Za-z]$|^[A-Za-z][0-9]{7}[0-9A-Za-z]$/;
  return nifRegex.test(nif.toUpperCase());
}

/**
 * Sectores predefinidos para empresas
 */
export const COMPANY_SECTORS = [
  'Tecnología',
  'Construcción',
  'Educación',
  'Sanidad',
  'Transporte',
  'Energía',
  'Agricultura',
  'Turismo',
  'Comercio',
  'Servicios Financieros',
  'Consultoría',
  'Industria',
  'Alimentación',
  'Textil',
  'Automóvil',
  'Inmobiliario',
  'Medios de Comunicación',
  'Deportes',
  'Cultura',
  'Otros'
] as const;

export type CompanySector = typeof COMPANY_SECTORS[number];