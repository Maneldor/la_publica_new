import { GestioShell } from './GestioShell'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gestió | La Pública',
  description: 'Panell de gestió de La Pública'
}

interface GestioLayoutProps {
  children: React.ReactNode
}

export default function GestioLayout({ children }: GestioLayoutProps) {
  return <GestioShell>{children}</GestioShell>
}