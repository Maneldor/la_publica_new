import {
  Briefcase,
  GraduationCap,
  Building2,
  Globe,
  Languages,
  Lightbulb,
  Activity,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Share2,
  Camera,
  Image,
} from 'lucide-react'
import { IconWrapper, IconColor, IconSize } from './IconWrapper'

interface ProfileIconProps {
  size?: IconSize
  variant?: 'filled' | 'light' | 'outline' | 'ghost'
  className?: string
}

// Iconos de Perfil con colores predefinidos
export const ProfileInfoIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: ProfileIconProps) => (
  <IconWrapper
    icon={Briefcase}
    color="indigo"
    size={size}
    variant={variant}
    className={className}
  />
)

export const EducationIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: ProfileIconProps) => (
  <IconWrapper
    icon={GraduationCap}
    color="blue"
    size={size}
    variant={variant}
    className={className}
  />
)

export const ExperienceIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: ProfileIconProps) => (
  <IconWrapper
    icon={Building2}
    color="emerald"
    size={size}
    variant={variant}
    className={className}
  />
)

export const SkillsIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: ProfileIconProps) => (
  <IconWrapper
    icon={Lightbulb}
    color="amber"
    size={size}
    variant={variant}
    className={className}
  />
)

export const LanguagesIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: ProfileIconProps) => (
  <IconWrapper
    icon={Languages}
    color="violet"
    size={size}
    variant={variant}
    className={className}
  />
)

export const SocialIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: ProfileIconProps) => (
  <IconWrapper
    icon={Globe}
    color="pink"
    size={size}
    variant={variant}
    className={className}
  />
)

export const ActivityIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: ProfileIconProps) => (
  <IconWrapper
    icon={Activity}
    color="orange"
    size={size}
    variant={variant}
    className={className}
  />
)

export const UserIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: ProfileIconProps) => (
  <IconWrapper
    icon={User}
    color="indigo"
    size={size}
    variant={variant}
    className={className}
  />
)

export const ContactIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: ProfileIconProps) => (
  <IconWrapper
    icon={Mail}
    color="gray"
    size={size}
    variant={variant}
    className={className}
  />
)

export const PhoneIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: ProfileIconProps) => (
  <IconWrapper
    icon={Phone}
    color="green"
    size={size}
    variant={variant}
    className={className}
  />
)

export const LocationIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: ProfileIconProps) => (
  <IconWrapper
    icon={MapPin}
    color="red"
    size={size}
    variant={variant}
    className={className}
  />
)

export const CalendarIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: ProfileIconProps) => (
  <IconWrapper
    icon={Calendar}
    color="blue"
    size={size}
    variant={variant}
    className={className}
  />
)

export const CoverImageIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: ProfileIconProps) => (
  <IconWrapper
    icon={Image}
    color="purple"
    size={size}
    variant={variant}
    className={className}
  />
)

export const ProfilePhotoIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: ProfileIconProps) => (
  <IconWrapper
    icon={Camera}
    color="indigo"
    size={size}
    variant={variant}
    className={className}
  />
)

export const ShareIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: ProfileIconProps) => (
  <IconWrapper
    icon={Share2}
    color="cyan"
    size={size}
    variant={variant}
    className={className}
  />
)
