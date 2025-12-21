import {
  MessageCircle,
  MessageSquare,
  Mail,
  Inbox,
  Star,
  BellOff,
  Archive,
  Users,
  Building2,
  Pin,
  Search,
  Phone,
  MoreVertical,
  Reply,
  Trash2,
  Smile,
  Paperclip,
  Camera,
  FileText,
  MapPin,
  User,
  Mic,
  Send,
  Lock,
  Check,
  CheckCheck,
  Clock,
  ArrowLeft,
  Image,
  X,
} from 'lucide-react'
import { IconWrapper, IconSize, IconColor } from './IconWrapper'

interface IconProps {
  size?: IconSize
  color?: IconColor
  variant?: 'filled' | 'light' | 'outline' | 'ghost'
  className?: string
}

// Main Messages Icon
export function MessagesIcon({ size = 'md', color = 'blue', variant = 'light', className }: IconProps) {
  return <IconWrapper icon={MessageCircle} size={size} color={color} variant={variant} className={className} />
}

// Sidebar filter icons
export function AllChatsIcon({ size = 'md', color = 'blue', variant = 'light', className }: IconProps) {
  return <IconWrapper icon={Inbox} size={size} color={color} variant={variant} className={className} />
}

export function StarredIcon({ size = 'md', color = 'amber', variant = 'light', className }: IconProps) {
  return <IconWrapper icon={Star} size={size} color={color} variant={variant} className={className} />
}

export function MutedIcon({ size = 'md', color = 'gray', variant = 'light', className }: IconProps) {
  return <IconWrapper icon={BellOff} size={size} color={color} variant={variant} className={className} />
}

export function ArchivedIcon({ size = 'md', color = 'slate', variant = 'light', className }: IconProps) {
  return <IconWrapper icon={Archive} size={size} color={color} variant={variant} className={className} />
}

export function GroupsIcon({ size = 'md', color = 'violet', variant = 'light', className }: IconProps) {
  return <IconWrapper icon={Users} size={size} color={color} variant={variant} className={className} />
}

export function CompaniesIcon({ size = 'md', color = 'indigo', variant = 'light', className }: IconProps) {
  return <IconWrapper icon={Building2} size={size} color={color} variant={variant} className={className} />
}

// Conversation indicators
export function PinIcon({ size = 'md', color = 'amber', variant = 'ghost', className }: IconProps) {
  return <IconWrapper icon={Pin} size={size} color={color} variant={variant} className={className} />
}

// Chat actions
export function SearchChatIcon({ size = 'md', color = 'gray', variant = 'ghost', className }: IconProps) {
  return <IconWrapper icon={Search} size={size} color={color} variant={variant} className={className} />
}

export function CallIcon({ size = 'md', color = 'green', variant = 'ghost', className }: IconProps) {
  return <IconWrapper icon={Phone} size={size} color={color} variant={variant} className={className} />
}

export function MoreOptionsIcon({ size = 'md', color = 'gray', variant = 'ghost', className }: IconProps) {
  return <IconWrapper icon={MoreVertical} size={size} color={color} variant={variant} className={className} />
}

// Message actions
export function ReplyIcon({ size = 'md', color = 'blue', variant = 'ghost', className }: IconProps) {
  return <IconWrapper icon={Reply} size={size} color={color} variant={variant} className={className} />
}

export function DeleteIcon({ size = 'md', color = 'red', variant = 'ghost', className }: IconProps) {
  return <IconWrapper icon={Trash2} size={size} color={color} variant={variant} className={className} />
}

export function EmojiIcon({ size = 'md', color = 'amber', variant = 'ghost', className }: IconProps) {
  return <IconWrapper icon={Smile} size={size} color={color} variant={variant} className={className} />
}

// Attachment icons
export function AttachIcon({ size = 'md', color = 'gray', variant = 'ghost', className }: IconProps) {
  return <IconWrapper icon={Paperclip} size={size} color={color} variant={variant} className={className} />
}

export function PhotoVideoIcon({ size = 'md', color = 'blue', variant = 'light', className }: IconProps) {
  return <IconWrapper icon={Camera} size={size} color={color} variant={variant} className={className} />
}

export function DocumentIcon({ size = 'md', color = 'amber', variant = 'light', className }: IconProps) {
  return <IconWrapper icon={FileText} size={size} color={color} variant={variant} className={className} />
}

export function LocationIcon({ size = 'md', color = 'red', variant = 'light', className }: IconProps) {
  return <IconWrapper icon={MapPin} size={size} color={color} variant={variant} className={className} />
}

export function ContactIcon({ size = 'md', color = 'violet', variant = 'light', className }: IconProps) {
  return <IconWrapper icon={User} size={size} color={color} variant={variant} className={className} />
}

// Message input
export function MicIcon({ size = 'md', color = 'gray', variant = 'ghost', className }: IconProps) {
  return <IconWrapper icon={Mic} size={size} color={color} variant={variant} className={className} />
}

export function SendIcon({ size = 'md', color = 'blue', variant = 'filled', className }: IconProps) {
  return <IconWrapper icon={Send} size={size} color={color} variant={variant} className={className} />
}

// Security
export function EncryptedIcon({ size = 'md', color = 'green', variant = 'ghost', className }: IconProps) {
  return <IconWrapper icon={Lock} size={size} color={color} variant={variant} className={className} />
}

// Message status
export function SentIcon({ size = 'xs', color = 'gray', variant = 'ghost', className }: IconProps) {
  return <IconWrapper icon={Check} size={size} color={color} variant={variant} className={className} />
}

export function DeliveredIcon({ size = 'xs', color = 'gray', variant = 'ghost', className }: IconProps) {
  return <IconWrapper icon={CheckCheck} size={size} color={color} variant={variant} className={className} />
}

export function ReadIcon({ size = 'xs', color = 'blue', variant = 'ghost', className }: IconProps) {
  return <IconWrapper icon={CheckCheck} size={size} color={color} variant={variant} className={className} />
}

export function PendingIcon({ size = 'xs', color = 'gray', variant = 'ghost', className }: IconProps) {
  return <IconWrapper icon={Clock} size={size} color={color} variant={variant} className={className} />
}

// Navigation
export function BackIcon({ size = 'md', color = 'gray', variant = 'ghost', className }: IconProps) {
  return <IconWrapper icon={ArrowLeft} size={size} color={color} variant={variant} className={className} />
}

export function CloseIcon({ size = 'md', color = 'gray', variant = 'ghost', className }: IconProps) {
  return <IconWrapper icon={X} size={size} color={color} variant={variant} className={className} />
}

// Message types
export function ImageMessageIcon({ size = 'xs', color = 'blue', variant = 'ghost', className }: IconProps) {
  return <IconWrapper icon={Image} size={size} color={color} variant={variant} className={className} />
}

export function AudioMessageIcon({ size = 'xs', color = 'violet', variant = 'ghost', className }: IconProps) {
  return <IconWrapper icon={Mic} size={size} color={color} variant={variant} className={className} />
}

// Raw Lucide icons for inline use (no wrapper)
export {
  MessageCircle,
  MessageSquare,
  Mail,
  Inbox,
  Star,
  BellOff,
  Archive,
  Users,
  Building2,
  Pin,
  Search,
  Phone,
  MoreVertical,
  Reply,
  Trash2,
  Smile,
  Paperclip,
  Camera,
  FileText,
  MapPin,
  User,
  Mic,
  Send,
  Lock,
  Check,
  CheckCheck,
  Clock,
  ArrowLeft,
  Image,
  X,
}
