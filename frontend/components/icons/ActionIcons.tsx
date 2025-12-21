import {
  Edit2,
  Trash2,
  Eye,
  Send,
  Plus,
  Check,
  X,
  Download,
  Upload,
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Save,
  Copy,
  Link,
  ExternalLink,
} from 'lucide-react'
import { IconWrapper, IconSize } from './IconWrapper'

interface ActionIconProps {
  size?: IconSize
  variant?: 'filled' | 'light' | 'outline' | 'ghost'
  className?: string
}

export const EditIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: ActionIconProps) => (
  <IconWrapper
    icon={Edit2}
    color="indigo"
    size={size}
    variant={variant}
    className={className}
  />
)

export const DeleteIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: ActionIconProps) => (
  <IconWrapper
    icon={Trash2}
    color="red"
    size={size}
    variant={variant}
    className={className}
  />
)

export const ViewIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: ActionIconProps) => (
  <IconWrapper
    icon={Eye}
    color="blue"
    size={size}
    variant={variant}
    className={className}
  />
)

export const SendIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: ActionIconProps) => (
  <IconWrapper
    icon={Send}
    color="emerald"
    size={size}
    variant={variant}
    className={className}
  />
)

export const AddIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: ActionIconProps) => (
  <IconWrapper
    icon={Plus}
    color="green"
    size={size}
    variant={variant}
    className={className}
  />
)

export const SuccessIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: ActionIconProps) => (
  <IconWrapper
    icon={Check}
    color="green"
    size={size}
    variant={variant}
    className={className}
  />
)

export const CloseIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: ActionIconProps) => (
  <IconWrapper
    icon={X}
    color="gray"
    size={size}
    variant={variant}
    className={className}
  />
)

export const ErrorIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: ActionIconProps) => (
  <IconWrapper
    icon={X}
    color="red"
    size={size}
    variant={variant}
    className={className}
  />
)

export const DownloadIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: ActionIconProps) => (
  <IconWrapper
    icon={Download}
    color="gray"
    size={size}
    variant={variant}
    className={className}
  />
)

export const UploadIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: ActionIconProps) => (
  <IconWrapper
    icon={Upload}
    color="indigo"
    size={size}
    variant={variant}
    className={className}
  />
)

export const SearchIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: ActionIconProps) => (
  <IconWrapper
    icon={Search}
    color="gray"
    size={size}
    variant={variant}
    className={className}
  />
)

export const FilterIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: ActionIconProps) => (
  <IconWrapper
    icon={Filter}
    color="slate"
    size={size}
    variant={variant}
    className={className}
  />
)

export const RefreshIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: ActionIconProps) => (
  <IconWrapper
    icon={RefreshCw}
    color="blue"
    size={size}
    variant={variant}
    className={className}
  />
)

export const NextIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: ActionIconProps) => (
  <IconWrapper
    icon={ChevronRight}
    color="gray"
    size={size}
    variant={variant}
    className={className}
  />
)

export const PrevIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: ActionIconProps) => (
  <IconWrapper
    icon={ChevronLeft}
    color="gray"
    size={size}
    variant={variant}
    className={className}
  />
)

export const MoreIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: ActionIconProps) => (
  <IconWrapper
    icon={MoreHorizontal}
    color="gray"
    size={size}
    variant={variant}
    className={className}
  />
)

export const SaveIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: ActionIconProps) => (
  <IconWrapper
    icon={Save}
    color="green"
    size={size}
    variant={variant}
    className={className}
  />
)

export const CopyIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: ActionIconProps) => (
  <IconWrapper
    icon={Copy}
    color="slate"
    size={size}
    variant={variant}
    className={className}
  />
)

export const LinkIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: ActionIconProps) => (
  <IconWrapper
    icon={Link}
    color="blue"
    size={size}
    variant={variant}
    className={className}
  />
)

export const ExternalLinkIcon = ({
  size = 'sm',
  variant = 'light',
  className,
}: ActionIconProps) => (
  <IconWrapper
    icon={ExternalLink}
    color="indigo"
    size={size}
    variant={variant}
    className={className}
  />
)
