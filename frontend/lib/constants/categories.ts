import {
    Monitor,
    Plane,
    UtensilsCrossed,
    Heart,
    Dumbbell,
    Shirt,
    Home,
    Car,
    GraduationCap,
    Briefcase,
    Ticket,
    Baby,
    PawPrint,
    Leaf,
    Star,
    type LucideIcon
} from 'lucide-react'

// ============================================
// TIPUS
// ============================================

export interface CategorySubcategories {
    ofertes: string[]
    empreses: string[]
}

export interface Category {
    value: string
    label: string
    icon: LucideIcon
    color: string
    description: string
    subcategories: CategorySubcategories
}

// ============================================
// CATEGORIES PRINCIPALS (15)
// ============================================

export const CATEGORIES: Category[] = [
    {
        value: 'tecnologia',
        label: 'Tecnologia i Innovació',
        icon: Monitor,
        color: 'blue',
        description: 'Electrònica, informàtica, software i solucions digitals',
        subcategories: {
            ofertes: [
                'Electrònica',
                'Informàtica',
                'Mòbils',
                'Gaming',
                'Domòtica',
                'Software'
            ],
            empreses: [
                'Fabricants',
                'Retailers tech',
                'Operadors',
                'Startups',
                'SaaS',
                'Marques tecnològiques'
            ]
        }
    },
    {
        value: 'viatges',
        label: 'Viatges i Oci',
        icon: Plane,
        color: 'cyan',
        description: 'Hotels, vols, escapades i experiències turístiques',
        subcategories: {
            ofertes: [
                'Hotels',
                'Vols',
                'Escapades',
                'Parcs temàtics',
                'Experiències',
                'Creuers'
            ],
            empreses: [
                'Cadenes hoteleres',
                'Agències',
                'Turoperadors',
                'Companyies aèries',
                'Plataformes d\'oci'
            ]
        }
    },
    {
        value: 'gastronomia',
        label: 'Gastronomia i Alimentació',
        icon: UtensilsCrossed,
        color: 'orange',
        description: 'Restaurants, productes gurmet i experiències gastronòmiques',
        subcategories: {
            ofertes: [
                'Restaurants',
                'Menjar a domicili',
                'Productes gurmet',
                'Cellers',
                'Experiències gastronòmiques'
            ],
            empreses: [
                'Grups de restauració',
                'Distribuïdors',
                'Productors locals',
                'Cellers',
                'Marques d\'alimentació'
            ]
        }
    },
    {
        value: 'salut',
        label: 'Salut i Benestar',
        icon: Heart,
        color: 'red',
        description: 'Serveis mèdics, òptica, spa i benestar personal',
        subcategories: {
            ofertes: [
                'Revisions mèdiques',
                'Odontologia',
                'Òptica',
                'Spa',
                'Fisioteràpia',
                'Parafarmàcia',
                'Fitness'
            ],
            empreses: [
                'Clíniques',
                'Centres dentals',
                'Òptiques',
                'Gimnasos',
                'Laboratoris',
                'Marques de salut i bellesa'
            ]
        }
    },
    {
        value: 'esport',
        label: 'Esport i Activitat Física',
        icon: Dumbbell,
        color: 'green',
        description: 'Material esportiu, gimnasos i activitats',
        subcategories: {
            ofertes: [
                'Material esportiu',
                'Roba tècnica',
                'Activitats guiades',
                'Gimnasos',
                'Nutrició esportiva'
            ],
            empreses: [
                'Marques esportives',
                'Botigues especialitzades',
                'Centres esportius',
                'Empreses d\'aventura'
            ]
        }
    },
    {
        value: 'moda',
        label: 'Moda i Accessoris',
        icon: Shirt,
        color: 'pink',
        description: 'Roba, calçat, complements i moda sostenible',
        subcategories: {
            ofertes: [
                'Moda home',
                'Moda dona',
                'Moda infantil',
                'Complements',
                'Sabateria',
                'Moda sostenible'
            ],
            empreses: [
                'Marques de moda',
                'Botigues retail',
                'Distribuïdors de complements',
                'Distribuïdors de calçat'
            ]
        }
    },
    {
        value: 'llar',
        label: 'Llar, Decoració i Equipament',
        icon: Home,
        color: 'amber',
        description: 'Mobiliari, decoració, electrodomèstics i reformes',
        subcategories: {
            ofertes: [
                'Mobiliari',
                'Decoració',
                'Electrodomèstics',
                'Bricolatge',
                'Jardineria'
            ],
            empreses: [
                'Fabricants de mobiliari',
                'Botigues de llar',
                'Empreses de reformes',
                'Marques d\'electrodomèstics'
            ]
        }
    },
    {
        value: 'automocio',
        label: 'Automoció i Mobilitat',
        icon: Car,
        color: 'slate',
        description: 'Vehicles, renting, tallers i mobilitat elèctrica',
        subcategories: {
            ofertes: [
                'Compra de vehicles',
                'Lloguer de vehicles',
                'Renting',
                'Motos',
                'Mobilitat elèctrica',
                'Tallers',
                'Assegurances'
            ],
            empreses: [
                'Concessionaris',
                'Marques d\'automoció',
                'Empreses de renting',
                'Asseguradores',
                'Tallers'
            ]
        }
    },
    {
        value: 'educacio',
        label: 'Educació i Formació',
        icon: GraduationCap,
        color: 'indigo',
        description: 'Cursos, idiomes, universitats i formació online',
        subcategories: {
            ofertes: [
                'Cursos',
                'Idiomes',
                'Oposicions',
                'Universitats',
                'Formació online'
            ],
            empreses: [
                'Escoles',
                'Universitats',
                'Acadèmies',
                'Plataformes d\'e-learning',
                'Centres d\'estudis'
            ]
        }
    },
    {
        value: 'serveis',
        label: 'Serveis Professionals i Corporatius',
        icon: Briefcase,
        color: 'violet',
        description: 'Assegurances, assessoria, serveis jurídics i financers',
        subcategories: {
            ofertes: [
                'Assegurances',
                'Assessoria',
                'Serveis jurídics',
                'Banca',
                'Immobiliari'
            ],
            empreses: [
                'Consultores',
                'Bufets',
                'Entitats financeres',
                'Asseguradores',
                'Immobiliàries',
                'Empreses B2B'
            ]
        }
    },
    {
        value: 'cultura',
        label: 'Cultura i Entreteniment',
        icon: Ticket,
        color: 'purple',
        description: 'Cinema, teatre, concerts, museus i subscripcions culturals',
        subcategories: {
            ofertes: [
                'Cinema',
                'Teatre',
                'Concerts',
                'Llibres',
                'Museus',
                'Subscripcions culturals'
            ],
            empreses: [
                'Teatres',
                'Sales de cinema',
                'Festivals',
                'Editorials',
                'Museus',
                'Marques culturals'
            ]
        }
    },
    {
        value: 'familia',
        label: 'Família i Infància',
        icon: Baby,
        color: 'rose',
        description: 'Productes infantils, activitats familiars i educació',
        subcategories: {
            ofertes: [
                'Productes infantils',
                'Roba infantil',
                'Activitats familiars',
                'Educació infantil'
            ],
            empreses: [
                'Botigues infantils',
                'Centres educatius',
                'Marques de puericultura',
                'Proveïdors d\'oci familiar'
            ]
        }
    },
    {
        value: 'mascotes',
        label: 'Mascotes',
        icon: PawPrint,
        color: 'yellow',
        description: 'Alimentació, accessoris i serveis veterinaris',
        subcategories: {
            ofertes: [
                'Alimentació',
                'Accessoris',
                'Veterinari',
                'Serveis de benestar'
            ],
            empreses: [
                'Clíniques veterinàries',
                'Botigues especialitzades',
                'Marques d\'alimentació animal',
                'Marques de cura animal'
            ]
        }
    },
    {
        value: 'sostenibilitat',
        label: 'Sostenibilitat i Economia Verda',
        icon: Leaf,
        color: 'emerald',
        description: 'Productes eco, energia verda i consum responsable',
        subcategories: {
            ofertes: [
                'Productes eco',
                'Energia verda',
                'Mobilitat sostenible',
                'Consum responsable'
            ],
            empreses: [
                'Companyies d\'energia renovable',
                'Marques ecològiques',
                'Projectes d\'impacte social'
            ]
        }
    },
    {
        value: 'marques',
        label: 'Marques i Partners Estratègics',
        icon: Star,
        color: 'gold',
        description: 'Campanyes especials, exclusives i partners premium',
        subcategories: {
            ofertes: [
                'Campanyes especials',
                'Exclusives',
                'Col·leccions'
            ],
            empreses: [
                'Marques premium',
                'Partners oficials',
                'Noves incorporacions',
                'Grans corporacions'
            ]
        }
    }
]

// ============================================
// MAPA DE COLORS TAILWIND
// ============================================

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    cyan: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
    red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    slate: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
    violet: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    rose: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    gold: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' }
}

// ============================================
// HELPERS
// ============================================

/**
 * Obté una categoria pel seu value
 */
export const getCategory = (value: string): Category | undefined => {
    return CATEGORIES.find(c => c.value === value)
}

/**
 * Obté el label d'una categoria
 */
export const getCategoryLabel = (value: string): string => {
    return getCategory(value)?.label || value
}

/**
 * Obté la icona d'una categoria
 */
export const getCategoryIcon = (value: string): LucideIcon | undefined => {
    return getCategory(value)?.icon
}

/**
 * Obté els colors d'una categoria
 */
export const getCategoryColors = (value: string) => {
    const category = getCategory(value)
    return category ? CATEGORY_COLORS[category.color] : CATEGORY_COLORS.slate
}

/**
 * Obté les subcategories d'ofertes d'una categoria
 */
export const getOfferSubcategories = (categoryValue: string): string[] => {
    return getCategory(categoryValue)?.subcategories.ofertes || []
}

/**
 * Obté les subcategories d'empreses d'una categoria
 */
export const getCompanySubcategories = (categoryValue: string): string[] => {
    return getCategory(categoryValue)?.subcategories.empreses || []
}

/**
 * Converteix subcategories a format select
 */
export const getSubcategoriesAsOptions = (
    categoryValue: string,
    type: 'ofertes' | 'empreses'
): { value: string; label: string }[] => {
    const subcategories = type === 'ofertes'
        ? getOfferSubcategories(categoryValue)
        : getCompanySubcategories(categoryValue)

    return subcategories.map(sub => ({
        value: sub.toLowerCase().replace(/\s+/g, '-').replace(/'/g, ''),
        label: sub
    }))
}

/**
 * Obté totes les categories com a opcions per a selects
 */
export const getCategoriesAsOptions = (): { value: string; label: string; icon: LucideIcon }[] => {
    return CATEGORIES.map(c => ({
        value: c.value,
        label: c.label,
        icon: c.icon
    }))
}

/**
 * Cerca categories per text
 */
export const searchCategories = (query: string): Category[] => {
    const normalizedQuery = query.toLowerCase().trim()
    return CATEGORIES.filter(c =>
        c.label.toLowerCase().includes(normalizedQuery) ||
        c.description.toLowerCase().includes(normalizedQuery) ||
        c.subcategories.ofertes.some(s => s.toLowerCase().includes(normalizedQuery)) ||
        c.subcategories.empreses.some(s => s.toLowerCase().includes(normalizedQuery))
    )
}
