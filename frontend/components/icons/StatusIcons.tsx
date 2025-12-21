import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Shield,
  ShieldCheck,
  ShieldX,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  AlertTriangle,
  Info,
  HelpCircle,
  Ban,
  Loader2,
} from 'lucide-react'
import { IconWrapper, IconSize } from './IconWrapper'

interface StatusIconProps {
  size?: IconSize
  variant?: 'filled' | 'light' | 'outline' | 'ghost'
  className?: string
}

export const ActiveIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: StatusIconProps) => (
  <IconWrapper
    icon={CheckCircle2}
    color="green"
    size={size}
    variant={variant}
    className={className}
  />
)

export const InactiveIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: StatusIconProps) => (
  <IconWrapper
    icon={XCircle}
    color="gray"
    size={size}
    variant={variant}
    className={className}
  />
)

export const WarningIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: StatusIconProps) => (
  <IconWrapper
    icon={AlertCircle}
    color="amber"
    size={size}
    variant={variant}
    className={className}
  />
)

export const DangerIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: StatusIconProps) => (
  <IconWrapper
    icon={AlertTriangle}
    color="red"
    size={size}
    variant={variant}
    className={className}
  />
)

export const PendingIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: StatusIconProps) => (
  <IconWrapper
    icon={Clock}
    color="blue"
    size={size}
    variant={variant}
    className={className}
  />
)

export const InfoIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: StatusIconProps) => (
  <IconWrapper
    icon={Info}
    color="blue"
    size={size}
    variant={variant}
    className={className}
  />
)

export const HelpIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: StatusIconProps) => (
  <IconWrapper
    icon={HelpCircle}
    color="gray"
    size={size}
    variant={variant}
    className={className}
  />
)

export const VerifiedIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: StatusIconProps) => (
  <IconWrapper
    icon={ShieldCheck}
    color="green"
    size={size}
    variant={variant}
    className={className}
  />
)

export const UnverifiedIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: StatusIconProps) => (
  <IconWrapper
    icon={ShieldX}
    color="amber"
    size={size}
    variant={variant}
    className={className}
  />
)

export const ShieldIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: StatusIconProps) => (
  <IconWrapper
    icon={Shield}
    color="indigo"
    size={size}
    variant={variant}
    className={className}
  />
)

export const UserActiveIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: StatusIconProps) => (
  <IconWrapper
    icon={UserCheck}
    color="green"
    size={size}
    variant={variant}
    className={className}
  />
)

export const UserInactiveIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: StatusIconProps) => (
  <IconWrapper
    icon={UserX}
    color="red"
    size={size}
    variant={variant}
    className={className}
  />
)

export const PrivateIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: StatusIconProps) => (
  <IconWrapper
    icon={Lock}
    color="amber"
    size={size}
    variant={variant}
    className={className}
  />
)

export const PublicIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: StatusIconProps) => (
  <IconWrapper
    icon={Unlock}
    color="gray"
    size={size}
    variant={variant}
    className={className}
  />
)

export const BlockedIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: StatusIconProps) => (
  <IconWrapper
    icon={Ban}
    color="red"
    size={size}
    variant={variant}
    className={className}
  />
)

export const LoadingIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: StatusIconProps) => (
  <IconWrapper
    icon={Loader2}
    color="blue"
    size={size}
    variant={variant}
    className={`animate-spin ${className || ''}`}
  />
)
