/**
 * MDI Icons - La Pública
 *
 * Sistema centralitzat d'icones amb Material Design Icons
 *
 * @example
 * // Import principal
 * import { MdiIcon } from '@/components/ui/icons';
 *
 * // Ús bàsic
 * <MdiIcon name="dashboard" />
 * <MdiIcon name="users" size="lg" variant="primary" />
 *
 * // Components especialitzats
 * import { MdiIconBadge, TrendIcon, StatusIcon, LoadingIcon } from '@/components/ui/icons';
 *
 * <MdiIconBadge name="bell" badge={5} />
 * <TrendIcon value={12.5} />
 * <StatusIcon status="success" />
 * <LoadingIcon />
 *
 * // Accés als paths si necessites ús directe
 * import { iconPaths } from '@/components/ui/icons';
 *
 * // Accés als estils
 * import { iconPresets, iconVariantStyles } from '@/components/ui/icons';
 */

// Components
export {
  MdiIcon,
  MdiIconBadge,
  TrendIcon,
  StatusIcon,
  LoadingIcon,
} from './Mdi';

export type {
  MdiIconProps,
  MdiIconBadgeProps,
  TrendIconProps,
  StatusIconProps,
  LoadingIconProps,
} from './Mdi';

// Paths d'icones
export { iconPaths } from './iconPaths';
export type { IconName } from './iconPaths';

// Estils i variants
export {
  iconVariantStyles,
  iconSizeValues,
  iconInteractionStyles,
  iconPresets,
  combineIconStyles,
  getVariantStyle,
  getSizeValue,
} from './iconStyles';

export type {
  IconVariant,
  IconSize
} from './iconStyles';

// Default export
export { MdiIcon as default } from './Mdi';