'use client'

import { useState, useEffect, useRef } from 'react'
import {
    Settings,
    Save,
    Upload,
    X,
    Globe,
    Mail,
    Phone,
    Palette,
    Shield,
    Lock,
    FileText,
    Wrench,
    Eye,
    EyeOff,
    AlertTriangle,
    Check,
    ExternalLink
} from 'lucide-react'

// Tipos
interface PlatformSettings {
    // General
    platformName: string
    slogan: string
    baseUrl: string
    contactEmail: string
    supportPhone: string
    
    // Aparença i Marca
    primaryLogo: string
    secondaryLogo: string
    favicon: string
    primaryColor: string
    secondaryColor: string
    accentColor: string
    loginBackgroundImage: string
    showLogoInNavbar: boolean
    
    // Registre i Autenticació
    allowPublicRegistration: boolean
    requireEmailVerification: boolean
    sessionExpirationTime: string
    maxLoginAttempts: number
    lockoutTimeAfterFailedAttempts: string
    
    // Notificacions i Email
    sendWelcomeEmail: boolean
    notifyAdminsNewCompanies: boolean
    dailyEmailSummary: boolean
    senderEmail: string
    senderName: string
    
    // Seguretat
    forceHttps: boolean
    allowMultipleSessions: boolean
    detailedActivityLogging: boolean
    logRetentionDays: number
    
    // Legal i Textos
    privacyPolicyUrl: string
    termsConditionsUrl: string
    footerText: string
    showCookieNotice: boolean
    
    // Manteniment
    maintenanceModeEnabled: boolean
    maintenanceMessage: string
    allowedIpsDuringMaintenance: string
}

const defaultSettings: PlatformSettings = {
    platformName: 'La Pública',
    slogan: 'Connectant el sector públic amb empreses innovadores',
    baseUrl: 'https://lapublica.cat',
    contactEmail: 'contacte@lapublica.cat',
    supportPhone: '+34 900 123 456',
    primaryLogo: '',
    secondaryLogo: '',
    favicon: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#64748B',
    accentColor: '#10B981',
    loginBackgroundImage: '',
    showLogoInNavbar: true,
    allowPublicRegistration: true,
    requireEmailVerification: true,
    sessionExpirationTime: '8h',
    maxLoginAttempts: 5,
    lockoutTimeAfterFailedAttempts: '15min',
    sendWelcomeEmail: true,
    notifyAdminsNewCompanies: true,
    dailyEmailSummary: false,
    senderEmail: 'noreply@lapublica.cat',
    senderName: 'La Pública',
    forceHttps: true,
    allowMultipleSessions: false,
    detailedActivityLogging: true,
    logRetentionDays: 90,
    privacyPolicyUrl: '',
    termsConditionsUrl: '',
    footerText: '© 2024 La Pública. Tots els drets reservats.',
    showCookieNotice: true,
    maintenanceModeEnabled: false,
    maintenanceMessage: 'Estem realitzant tasques de manteniment. Tornarem aviat.',
    allowedIpsDuringMaintenance: ''
}

// Navegació lateral
const navigationSections = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'aparenca', label: 'Aparença i Marca', icon: Palette },
    { id: 'registre', label: 'Registre i Autenticació', icon: Shield },
    { id: 'notificacions', label: 'Notificacions i Email', icon: Mail },
    { id: 'seguretat', label: 'Seguretat', icon: Lock },
    { id: 'legal', label: 'Legal i Textos', icon: FileText },
    { id: 'manteniment', label: 'Manteniment', icon: Wrench }
]

// Componente Toggle
function Toggle({ 
    checked, 
    onChange, 
    label, 
    description 
}: { 
    checked: boolean
    onChange: (checked: boolean) => void
    label: string
    description?: string 
}) {
    return (
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    {label}
                </label>
                {description && (
                    <p className="text-sm text-slate-500">{description}</p>
                )}
            </div>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    checked ? 'bg-blue-600' : 'bg-slate-300'
                }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
    )
}

// Componente ColorPicker
function ColorPicker({ 
    value, 
    onChange, 
    label 
}: { 
    value: string
    onChange: (color: string) => void
    label: string 
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
                {label}
            </label>
            <div className="flex items-center gap-3">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-10 w-16 rounded-lg border border-slate-300 cursor-pointer"
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#000000"
                />
                <div 
                    className="w-10 h-10 rounded-lg border border-slate-300 shadow-sm"
                    style={{ backgroundColor: value }}
                />
            </div>
        </div>
    )
}

// Componente FileUpload
function FileUpload({ 
    value, 
    onChange, 
    label, 
    accept = "image/*",
    description 
}: { 
    value: string
    onChange: (url: string) => void
    label: string
    accept?: string
    description?: string 
}) {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            // TODO: Implementar upload real a servidor
            const mockUrl = URL.createObjectURL(file)
            onChange(mockUrl)
        }
    }

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
                {label}
            </label>
            {description && (
                <p className="text-sm text-slate-500 mb-3">{description}</p>
            )}
            
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 relative">
                {value ? (
                    <div className="flex items-center gap-4">
                        <img 
                            src={value} 
                            alt="Preview" 
                            className="h-16 w-16 object-cover rounded-lg border border-slate-200"
                        />
                        <div className="flex-1">
                            <p className="text-sm text-slate-900">Imatge carregada</p>
                            <p className="text-xs text-slate-500">Fes clic per canviar</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            className="p-1 text-slate-400 hover:text-slate-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Arrossega una imatge aquí o fes clic per seleccionar</p>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG, SVG fins a 2MB</p>
                    </div>
                )}
                
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
            </div>
        </div>
    )
}

export default function ConfiguracioPage() {
    const [loading, setLoading] = useState(true)
    const [settings, setSettings] = useState<PlatformSettings>(defaultSettings)
    const [originalSettings, setOriginalSettings] = useState<PlatformSettings>(defaultSettings)
    const [activeSection, setActiveSection] = useState('general')
    const [saving, setSaving] = useState(false)
    const [showToast, setShowToast] = useState(false)

    // Detectar si hay cambios
    const isDirty = JSON.stringify(settings) !== JSON.stringify(originalSettings)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/admin/settings')
            if (response.ok) {
                const data = await response.json()
                setSettings({ ...defaultSettings, ...data.settings })
                setOriginalSettings({ ...defaultSettings, ...data.settings })
            } else {
                console.log('Using default settings - API endpoint not available')
                setSettings(defaultSettings)
                setOriginalSettings(defaultSettings)
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
            setSettings(defaultSettings)
            setOriginalSettings(defaultSettings)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })
            
            if (response.ok) {
                setOriginalSettings(settings)
                setShowToast(true)
                setTimeout(() => setShowToast(false), 3000)
            } else {
                console.error('Error saving settings')
            }
        } catch (error) {
            console.error('Error saving settings:', error)
        } finally {
            setSaving(false)
        }
    }

    const updateSetting = (key: keyof PlatformSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    const renderSection = () => {
        switch (activeSection) {
            case 'general':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-slate-900">Configuració General</h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Nom de la plataforma
                                </label>
                                <input
                                    type="text"
                                    value={settings.platformName}
                                    onChange={(e) => updateSetting('platformName', e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Eslògan / Descripció curta
                                </label>
                                <input
                                    type="text"
                                    value={settings.slogan}
                                    onChange={(e) => updateSetting('slogan', e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    URL base
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={settings.baseUrl}
                                        readOnly
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-500 bg-slate-50 focus:outline-none"
                                    />
                                    <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email de contacte
                                </label>
                                <input
                                    type="email"
                                    value={settings.contactEmail}
                                    onChange={(e) => updateSetting('contactEmail', e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div className="lg:col-span-1">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Telèfon de suport
                                </label>
                                <input
                                    type="tel"
                                    value={settings.supportPhone}
                                    onChange={(e) => updateSetting('supportPhone', e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                )

            case 'aparenca':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-slate-900">Aparença i Marca</h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <FileUpload
                                value={settings.primaryLogo}
                                onChange={(url) => updateSetting('primaryLogo', url)}
                                label="Logo principal"
                                description="Logo principal de la plataforma (recomanat SVG o PNG transparent)"
                            />
                            
                            <FileUpload
                                value={settings.secondaryLogo}
                                onChange={(url) => updateSetting('secondaryLogo', url)}
                                label="Logo secundari / blanc"
                                description="Versió alternativa per fondos foscos"
                            />
                            
                            <FileUpload
                                value={settings.favicon}
                                onChange={(url) => updateSetting('favicon', url)}
                                label="Favicon"
                                description="Icona que apareix a la pestanya del navegador (32x32 o 64x64)"
                                accept="image/png,image/x-icon,image/vnd.microsoft.icon"
                            />
                            
                            <div className="space-y-4">
                                <ColorPicker
                                    value={settings.primaryColor}
                                    onChange={(color) => updateSetting('primaryColor', color)}
                                    label="Color primari"
                                />
                                
                                <ColorPicker
                                    value={settings.secondaryColor}
                                    onChange={(color) => updateSetting('secondaryColor', color)}
                                    label="Color secundari"
                                />
                                
                                <ColorPicker
                                    value={settings.accentColor}
                                    onChange={(color) => updateSetting('accentColor', color)}
                                    label="Color accent"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            <FileUpload
                                value={settings.loginBackgroundImage}
                                onChange={(url) => updateSetting('loginBackgroundImage', url)}
                                label="Imatge de fons login"
                                description="Imatge de fons per la pàgina de login (recomanat 1920x1080)"
                            />
                            
                            <Toggle
                                checked={settings.showLogoInNavbar}
                                onChange={(checked) => updateSetting('showLogoInNavbar', checked)}
                                label="Mostrar logo a la navbar"
                                description="Mostrar el logo principal a la barra de navegació superior"
                            />
                        </div>
                    </div>
                )

            case 'registre':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-slate-900">Registre i Autenticació</h3>
                        
                        <div className="space-y-6">
                            <Toggle
                                checked={settings.allowPublicRegistration}
                                onChange={(checked) => updateSetting('allowPublicRegistration', checked)}
                                label="Permetre registre públic"
                                description="Els usuaris es poden registrar per ells mateixos"
                            />
                            
                            <Toggle
                                checked={settings.requireEmailVerification}
                                onChange={(checked) => updateSetting('requireEmailVerification', checked)}
                                label="Requerir verificació email"
                                description="Els usuaris han de verificar el seu email abans d'accedir"
                            />
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Temps expiració sessió
                                    </label>
                                    <select 
                                        value={settings.sessionExpirationTime}
                                        onChange={(e) => updateSetting('sessionExpirationTime', e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="1h">1 hora</option>
                                        <option value="4h">4 hores</option>
                                        <option value="8h">8 hores</option>
                                        <option value="24h">24 hores</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Màxim intents login abans de bloqueig
                                    </label>
                                    <input
                                        type="number"
                                        min="3"
                                        max="10"
                                        value={settings.maxLoginAttempts}
                                        onChange={(e) => updateSetting('maxLoginAttempts', parseInt(e.target.value))}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div className="lg:col-span-1">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Temps bloqueig després d'intents fallits
                                    </label>
                                    <select 
                                        value={settings.lockoutTimeAfterFailedAttempts}
                                        onChange={(e) => updateSetting('lockoutTimeAfterFailedAttempts', e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="5min">5 minuts</option>
                                        <option value="15min">15 minuts</option>
                                        <option value="30min">30 minuts</option>
                                        <option value="1h">1 hora</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            case 'notificacions':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-slate-900">Notificacions i Email</h3>
                        
                        <div className="space-y-6">
                            <Toggle
                                checked={settings.sendWelcomeEmail}
                                onChange={(checked) => updateSetting('sendWelcomeEmail', checked)}
                                label="Enviar email benvinguda"
                                description="Enviar un email de benvinguda als nous usuaris registrats"
                            />
                            
                            <Toggle
                                checked={settings.notifyAdminsNewCompanies}
                                onChange={(checked) => updateSetting('notifyAdminsNewCompanies', checked)}
                                label="Notificar admins noves empreses"
                                description="Enviar notificació als administradors quan es registri una nova empresa"
                            />
                            
                            <Toggle
                                checked={settings.dailyEmailSummary}
                                onChange={(checked) => updateSetting('dailyEmailSummary', checked)}
                                label="Resum diari per email"
                                description="Enviar un resum diari d'activitat als administradors"
                            />
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Email remitent
                                    </label>
                                    <input
                                        type="email"
                                        value={settings.senderEmail}
                                        onChange={(e) => updateSetting('senderEmail', e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="noreply@lapublica.cat"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Nom remitent
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.senderName}
                                        onChange={(e) => updateSetting('senderName', e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="La Pública"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )

            case 'seguretat':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-slate-900">Seguretat</h3>
                        
                        <div className="space-y-6">
                            <Toggle
                                checked={settings.forceHttps}
                                onChange={() => {}} // readonly
                                label="Forçar HTTPS"
                                description="Redirigir automàticament tot el tràfic a HTTPS (activat per defecte)"
                            />
                            
                            <Toggle
                                checked={settings.allowMultipleSessions}
                                onChange={(checked) => updateSetting('allowMultipleSessions', checked)}
                                label="Permetre múltiples sessions"
                                description="Permitir que un usuari tingui sessions actives en múltiples dispositius"
                            />
                            
                            <Toggle
                                checked={settings.detailedActivityLogging}
                                onChange={(checked) => updateSetting('detailedActivityLogging', checked)}
                                label="Registre d'activitat detallat"
                                description="Registrar accions detallades dels usuaris per auditoria"
                            />
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Retenció logs en dies
                                </label>
                                <input
                                    type="number"
                                    min="7"
                                    max="365"
                                    value={settings.logRetentionDays}
                                    onChange={(e) => updateSetting('logRetentionDays', parseInt(e.target.value))}
                                    className="w-full lg:w-48 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-sm text-slate-500 mt-1">
                                    Temps que es mantenen els logs d'activitat (mínim 7 dies, màxim 365)
                                </p>
                            </div>
                        </div>
                    </div>
                )

            case 'legal':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-slate-900">Legal i Textos</h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    URL Política de Privacitat
                                </label>
                                <input
                                    type="url"
                                    value={settings.privacyPolicyUrl}
                                    onChange={(e) => updateSetting('privacyPolicyUrl', e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://lapublica.cat/privacitat"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    URL Termes i Condicions
                                </label>
                                <input
                                    type="url"
                                    value={settings.termsConditionsUrl}
                                    onChange={(e) => updateSetting('termsConditionsUrl', e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://lapublica.cat/termes"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Text footer
                            </label>
                            <textarea
                                value={settings.footerText}
                                onChange={(e) => updateSetting('footerText', e.target.value)}
                                rows={3}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="© 2024 La Pública. Tots els drets reservats."
                            />
                        </div>
                        
                        <Toggle
                            checked={settings.showCookieNotice}
                            onChange={(checked) => updateSetting('showCookieNotice', checked)}
                            label="Mostrar avís cookies"
                            description="Mostrar el banner de consentiment de cookies segons GDPR"
                        />
                    </div>
                )

            case 'manteniment':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-slate-900">Manteniment</h3>
                        
                        {settings.maintenanceModeEnabled && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-800">Mode manteniment actiu</p>
                                    <p className="text-sm text-red-600">La plataforma està en mode manteniment. Els usuaris no podran accedir.</p>
                                </div>
                            </div>
                        )}
                        
                        <div className="space-y-6">
                            <Toggle
                                checked={settings.maintenanceModeEnabled}
                                onChange={(checked) => updateSetting('maintenanceModeEnabled', checked)}
                                label="Mode manteniment activat"
                                description="Activa el mode manteniment per bloquejar l'accés dels usuaris"
                            />
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Missatge manteniment
                                </label>
                                <textarea
                                    value={settings.maintenanceMessage}
                                    onChange={(e) => updateSetting('maintenanceMessage', e.target.value)}
                                    rows={3}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Estem realitzant tasques de manteniment. Tornarem aviat."
                                />
                                <p className="text-sm text-slate-500 mt-1">
                                    Missatge que es mostrarà als usuaris durant el manteniment
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    IPs permeses durant manteniment
                                </label>
                                <textarea
                                    value={settings.allowedIpsDuringMaintenance}
                                    onChange={(e) => updateSetting('allowedIpsDuringMaintenance', e.target.value)}
                                    rows={4}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="192.168.1.100&#10;203.0.113.50&#10;..."
                                />
                                <p className="text-sm text-slate-500 mt-1">
                                    Adreces IP que podran accedir durant el manteniment (una per línia)
                                </p>
                            </div>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8 mx-4">
            {/* Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                        <div className="flex items-center mb-2">
                            <Settings className="h-6 w-6 mr-3 text-slate-600" strokeWidth={1.5} />
                            <h1 className="text-2xl font-bold text-slate-900">Configuració del Sistema</h1>
                        </div>
                        <p className="text-slate-600">
                            Paràmetres generals de la plataforma
                        </p>
                    </div>
                    
                    <div className="mt-4 lg:mt-0">
                        <button 
                            onClick={handleSave}
                            disabled={!isDirty || saving}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                isDirty 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            }`}
                        >
                            <Save className="h-4 w-4" strokeWidth={1.5} />
                            {saving ? 'Guardant...' : 'Guardar canvis'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Layout principal */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Navegació lateral */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-4">
                        <nav className="space-y-1">
                            {navigationSections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                        activeSection === section.id
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                >
                                    <section.icon className="h-4 w-4" strokeWidth={1.5} />
                                    <span className="text-sm font-medium">{section.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Contingut */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        {renderSection()}
                    </div>
                </div>
            </div>

            {/* Toast de confirmació */}
            {showToast && (
                <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
                    <Check className="h-4 w-4" strokeWidth={1.5} />
                    Configuració guardada correctament
                </div>
            )}
        </div>
    )
}