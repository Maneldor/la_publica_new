import {
  Calendar,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  CalendarClock,
  Clock,
  Timer,
  AlarmClock,
  Bell,
  BellRing,
  Target,
  Flag,
  Milestone,
  ListTodo,
  CheckSquare,
  Repeat,
  Play,
  Pause,
  Square,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Settings,
  Trophy,
  Heart,
  FileText,
  BookOpen,
  Plane,
  Triangle,
  Pill,
  Eye,
  GripVertical,
} from 'lucide-react'
import { IconWrapper, IconSize } from './IconWrapper'

interface AgendaIconProps {
  size?: IconSize
  variant?: 'filled' | 'light' | 'outline' | 'ghost'
  className?: string
}

// Calendario
export const CalendarIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={Calendar}
    color="indigo"
    size={size}
    variant={variant}
    className={className}
  />
)

export const CalendarDaysIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={CalendarDays}
    color="blue"
    size={size}
    variant={variant}
    className={className}
  />
)

export const CalendarCheckIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={CalendarCheck}
    color="green"
    size={size}
    variant={variant}
    className={className}
  />
)

export const CalendarXIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={CalendarX}
    color="red"
    size={size}
    variant={variant}
    className={className}
  />
)

export const CalendarClockIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={CalendarClock}
    color="amber"
    size={size}
    variant={variant}
    className={className}
  />
)

// Temps
export const ClockIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={Clock}
    color="blue"
    size={size}
    variant={variant}
    className={className}
  />
)

export const TimerIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={Timer}
    color="amber"
    size={size}
    variant={variant}
    className={className}
  />
)

export const AlarmIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={AlarmClock}
    color="red"
    size={size}
    variant={variant}
    className={className}
  />
)

// Notificacions
export const BellIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={Bell}
    color="amber"
    size={size}
    variant={variant}
    className={className}
  />
)

export const BellRingIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={BellRing}
    color="orange"
    size={size}
    variant={variant}
    className={className}
  />
)

// Tasques i objectius
export const TargetIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={Target}
    color="emerald"
    size={size}
    variant={variant}
    className={className}
  />
)

export const FlagIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={Flag}
    color="orange"
    size={size}
    variant={variant}
    className={className}
  />
)

export const MilestoneIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={Milestone}
    color="purple"
    size={size}
    variant={variant}
    className={className}
  />
)

export const TodoIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={ListTodo}
    color="indigo"
    size={size}
    variant={variant}
    className={className}
  />
)

export const TaskDoneIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={CheckSquare}
    color="green"
    size={size}
    variant={variant}
    className={className}
  />
)

// Repetició i hàbits
export const RepeatIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={Repeat}
    color="violet"
    size={size}
    variant={variant}
    className={className}
  />
)

export const HabitsIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={TrendingUp}
    color="orange"
    size={size}
    variant={variant}
    className={className}
  />
)

// Reflexió
export const ReflectionIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={MessageSquare}
    color="purple"
    size={size}
    variant={variant}
    className={className}
  />
)

// Frase del dia
export const SparklesIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={Sparkles}
    color="amber"
    size={size}
    variant={variant}
    className={className}
  />
)

// Configuració
export const SettingsIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={Settings}
    color="slate"
    size={size}
    variant={variant}
    className={className}
  />
)

// Mòduls opcionals
export const TrophyIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={Trophy}
    color="amber"
    size={size}
    variant={variant}
    className={className}
  />
)

export const GratitudeIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={Heart}
    color="pink"
    size={size}
    variant={variant}
    className={className}
  />
)

export const ConclusionsIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={FileText}
    color="slate"
    size={size}
    variant={variant}
    className={className}
  />
)

export const ReadingIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={BookOpen}
    color="cyan"
    size={size}
    variant={variant}
    className={className}
  />
)

export const TravelIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={Plane}
    color="blue"
    size={size}
    variant={variant}
    className={className}
  />
)

export const TriangleIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={Triangle}
    color="red"
    size={size}
    variant={variant}
    className={className}
  />
)

export const TimeCapsuleIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={Pill}
    color="violet"
    size={size}
    variant={variant}
    className={className}
  />
)

export const VisualizationIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={Eye}
    color="indigo"
    size={size}
    variant={variant}
    className={className}
  />
)

export const ModulesIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={GripVertical}
    color="gray"
    size={size}
    variant={variant}
    className={className}
  />
)

// Control
export const PlayIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={Play}
    color="green"
    size={size}
    variant={variant}
    className={className}
  />
)

export const PauseIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={Pause}
    color="amber"
    size={size}
    variant={variant}
    className={className}
  />
)

export const StopIcon = ({
  size = 'md',
  variant = 'light',
  className,
}: AgendaIconProps) => (
  <IconWrapper
    icon={Square}
    color="red"
    size={size}
    variant={variant}
    className={className}
  />
)
