/**
 * Material Design Icons Paths
 *
 * Aquesta és la base de dades central d'icones per La Pública
 * Utilitza els paths SVG de @mdi/js per garantir consistència
 */

// Imports dels paths de @mdi/js
import {
  // Navegació i interfície
  mdiViewDashboard,
  mdiHome,
  mdiMenu,
  mdiClose,
  mdiChevronUp,
  mdiChevronDown,
  mdiChevronLeft,
  mdiChevronRight,
  mdiArrowLeft,
  mdiArrowRight,
  mdiArrowUp,
  mdiArrowDown,

  // Usuaris i perfils
  mdiAccount,
  mdiAccountGroup,
  mdiAccountPlus,
  mdiAccountMinus,
  mdiAccountEdit,
  mdiAccountTie,
  mdiAccountMultiple,
  mdiAccountCircle,

  // Accions bàsiques
  mdiPlus,
  mdiMinus,
  mdiDelete,
  mdiPencil,
  mdiContentSave,
  mdiContentCopy,
  mdiDownload,
  mdiUpload,
  mdiRefresh,
  mdiSync,
  mdiLoading,

  // Comunicació
  mdiEmail,
  mdiEmailOutline,
  mdiMessage,
  mdiMessageText,
  mdiMessageTextOutline,
  mdiPhone,
  mdiCellphone,
  mdiBell,
  mdiBellOutline,

  // Empreses i negocis
  mdiOfficeBuilding,
  mdiOfficeBuildingOutline,
  mdiFactory,
  mdiBriefcase,
  mdiBriefcaseOutline,
  mdiDomain,

  // Dades i analítiques
  mdiChartBar,
  mdiChartLine,
  mdiChartPie,
  mdiTrendingUp,
  mdiTrendingDown,
  mdiTrendingNeutral,
  mdiGoogleAnalytics,

  // Estats i feedback
  mdiCheckCircle,
  mdiCheckCircleOutline,
  mdiCloseCircle,
  mdiCloseCircleOutline,
  mdiAlertCircle,
  mdiAlertCircleOutline,
  mdiInformation,
  mdiInformationOutline,
  mdiHelpCircle,
  mdiHelpCircleOutline,

  // Temps i calendari
  mdiCalendar,
  mdiCalendarOutline,
  mdiClock,
  mdiClockOutline,
  mdiTimer,
  mdiTimerOutline,

  // Configuració i eines
  mdiCog,
  mdiCogOutline,
  mdiTools,
  mdiWrench,
  mdiHammer,

  // Visibilitat i accés
  mdiEye,
  mdiEyeOff,
  mdiLock,
  mdiLockOutline,
  mdiKey,
  mdiKeyOutline,

  // Documents i arxius
  mdiFile,
  mdiFileDocument,
  mdiFileDocumentOutline,
  mdiFolder,
  mdiFolderOutline,
  mdiFileImage,
  mdiFilePdfBox,

  // Web i enllaços
  mdiWeb,
  mdiLink,
  mdiLinkOff,
  mdiOpenInNew,

  // Cerca i filtres
  mdiMagnify,
  mdiFilter,
  mdiFilterOutline,
  mdiSort,
  mdiSortAscending,
  mdiSortDescending,

  // Favorits i marcadors
  mdiStar,
  mdiStarOutline,
  mdiHeart,
  mdiHeartOutline,
  mdiBookmark,
  mdiBookmarkOutline,

  // Xarxes i connectivitat
  mdiConnection,
  mdiWifi,
  mdiWifiOff,
  mdiEthernet,

  // Ubicació
  mdiMapMarker,
  mdiMapMarkerOutline,
  mdiEarth,
  mdiCompass,

  // Audio i vídeo
  mdiVolumeHigh,
  mdiVolumeMedium,
  mdiVolumeLow,
  mdiVolumeOff,
  mdiPlay,
  mdiPause,
  mdiStop,
  mdiRecord,

  // Compres i comerç
  mdiCart,
  mdiCartOutline,
  mdiCreditCard,
  mdiCurrencyEur,
  mdiCurrencyUsd,
  mdiReceipt,

  // Educació i formació
  mdiSchool,
  mdiBookOpen,
  mdiSchoolOutline,
  mdiCertificate,

  // Tecnologia
  mdiRobot,
  mdiChip,
  mdiServer,
  mdiDatabase,
  mdiCloud,
  mdiCloudOutline,

  // Diversos
  mdiLightbulb,
  mdiLightbulbOutline,
  mdiFlash,
  mdiFire,
  mdiTarget,
  mdiPin,
  mdiPinOutline,
  mdiTag,
  mdiTagOutline,
  mdiFlag,
  mdiFlagOutline,
  mdiPackage,
  mdiPackageVariant,
  mdiGift,
  mdiRocket,
  mdiPartyPopper,

  // Control de volums addicionals
  mdiMinusCircle,
  mdiMinusCircleOutline,
  mdiPlusCircle,
  mdiPlusCircleOutline,

  // Cerca web específica
  mdiSearchWeb,

  // Corona
  mdiCrown,
} from '@mdi/js';

// Tipus per als noms d'icones disponibles
export type IconName = keyof typeof iconPaths;

// Mapa de noms d'icones als seus paths SVG
export const iconPaths = {
  // Navegació i interfície
  dashboard: mdiViewDashboard,
  home: mdiHome,
  menu: mdiMenu,
  close: mdiClose,
  chevronUp: mdiChevronUp,
  chevronDown: mdiChevronDown,
  chevronLeft: mdiChevronLeft,
  chevronRight: mdiChevronRight,
  arrowLeft: mdiArrowLeft,
  arrowRight: mdiArrowRight,
  arrowUp: mdiArrowUp,
  arrowDown: mdiArrowDown,

  // Usuaris i perfils
  account: mdiAccount,
  accountGroup: mdiAccountGroup,
  accountPlus: mdiAccountPlus,
  accountMinus: mdiAccountMinus,
  accountEdit: mdiAccountEdit,
  accountTie: mdiAccountTie,
  accountMultiple: mdiAccountMultiple,
  accountCircle: mdiAccountCircle,

  // Accions bàsiques
  plus: mdiPlus,
  minus: mdiMinus,
  delete: mdiDelete,
  edit: mdiPencil,
  save: mdiContentSave,
  copy: mdiContentCopy,
  download: mdiDownload,
  upload: mdiUpload,
  refresh: mdiRefresh,
  sync: mdiSync,
  loading: mdiLoading,

  // Comunicació
  email: mdiEmail,
  emailOutline: mdiEmailOutline,
  message: mdiMessage,
  messageText: mdiMessageText,
  messageTextOutline: mdiMessageTextOutline,
  phone: mdiPhone,
  cellphone: mdiCellphone,
  bell: mdiBell,
  bellOutline: mdiBellOutline,

  // Empreses i negocis
  office: mdiOfficeBuilding,
  officeOutline: mdiOfficeBuildingOutline,
  factory: mdiFactory,
  briefcase: mdiBriefcase,
  briefcaseOutline: mdiBriefcaseOutline,
  domain: mdiDomain,

  // Dades i analítiques
  chartBar: mdiChartBar,
  chartLine: mdiChartLine,
  chartPie: mdiChartPie,
  trendingUp: mdiTrendingUp,
  trendingDown: mdiTrendingDown,
  trendingNeutral: mdiTrendingNeutral,
  analytics: mdiGoogleAnalytics,

  // Estats i feedback
  checkCircle: mdiCheckCircle,
  checkCircleOutline: mdiCheckCircleOutline,
  closeCircle: mdiCloseCircle,
  closeCircleOutline: mdiCloseCircleOutline,
  alertCircle: mdiAlertCircle,
  alertCircleOutline: mdiAlertCircleOutline,
  info: mdiInformation,
  infoOutline: mdiInformationOutline,
  help: mdiHelpCircle,
  helpOutline: mdiHelpCircleOutline,

  // Temps i calendari
  calendar: mdiCalendar,
  calendarOutline: mdiCalendarOutline,
  clock: mdiClock,
  clockOutline: mdiClockOutline,
  timer: mdiTimer,
  timerOutline: mdiTimerOutline,

  // Configuració i eines
  cog: mdiCog,
  cogOutline: mdiCogOutline,
  tools: mdiTools,
  wrench: mdiWrench,
  hammer: mdiHammer,

  // Visibilitat i accés
  eye: mdiEye,
  eyeOff: mdiEyeOff,
  lock: mdiLock,
  lockOutline: mdiLockOutline,
  key: mdiKey,
  keyOutline: mdiKeyOutline,

  // Documents i arxius
  file: mdiFile,
  fileDocument: mdiFileDocument,
  fileDocumentOutline: mdiFileDocumentOutline,
  folder: mdiFolder,
  folderOutline: mdiFolderOutline,
  fileImage: mdiFileImage,
  filePdf: mdiFilePdfBox,

  // Web i enllaços
  web: mdiWeb,
  link: mdiLink,
  linkOff: mdiLinkOff,
  openInNew: mdiOpenInNew,

  // Cerca i filtres
  search: mdiMagnify,
  filter: mdiFilter,
  filterOutline: mdiFilterOutline,
  sort: mdiSort,
  sortAscending: mdiSortAscending,
  sortDescending: mdiSortDescending,

  // Favorits i marcadors
  star: mdiStar,
  starOutline: mdiStarOutline,
  heart: mdiHeart,
  heartOutline: mdiHeartOutline,
  bookmark: mdiBookmark,
  bookmarkOutline: mdiBookmarkOutline,

  // Xarxes i connectivitat
  connection: mdiConnection,
  wifi: mdiWifi,
  wifiOff: mdiWifiOff,
  ethernet: mdiEthernet,

  // Ubicació
  mapMarker: mdiMapMarker,
  mapMarkerOutline: mdiMapMarkerOutline,
  earth: mdiEarth,
  compass: mdiCompass,

  // Audio i vídeo
  volumeHigh: mdiVolumeHigh,
  volumeMedium: mdiVolumeMedium,
  volumeLow: mdiVolumeLow,
  volumeOff: mdiVolumeOff,
  play: mdiPlay,
  pause: mdiPause,
  stop: mdiStop,
  record: mdiRecord,

  // Compres i comerç
  cart: mdiCart,
  cartOutline: mdiCartOutline,
  creditCard: mdiCreditCard,
  currencyEur: mdiCurrencyEur,
  currencyUsd: mdiCurrencyUsd,
  receipt: mdiReceipt,

  // Educació i formació
  school: mdiSchool,
  bookOpen: mdiBookOpen,
  graduationCap: mdiSchoolOutline,
  certificate: mdiCertificate,

  // Tecnologia
  robot: mdiRobot,
  chip: mdiChip,
  server: mdiServer,
  database: mdiDatabase,
  cloud: mdiCloud,
  cloudOutline: mdiCloudOutline,

  // Diversos
  lightbulb: mdiLightbulb,
  lightbulbOutline: mdiLightbulbOutline,
  flash: mdiFlash,
  fire: mdiFire,
  target: mdiTarget,
  pin: mdiPin,
  pinOutline: mdiPinOutline,
  tag: mdiTag,
  tagOutline: mdiTagOutline,
  flag: mdiFlag,
  flagOutline: mdiFlagOutline,
  package: mdiPackage,
  packageVariant: mdiPackageVariant,
  gift: mdiGift,
  rocket: mdiRocket,
  party: mdiPartyPopper,

  // Control de volums addicionals
  minusCircle: mdiMinusCircle,
  minusCircleOutline: mdiMinusCircleOutline,
  plusCircle: mdiPlusCircle,
  plusCircleOutline: mdiPlusCircleOutline,

  // Cerca web específica
  searchWeb: mdiSearchWeb,

  // Corona
  crown: mdiCrown,
} as const;