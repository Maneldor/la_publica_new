export interface OfferFormData {
    id?: string | number;

    // Company (Admin only)
    companyId?: string;
    companyName?: string;

    // Step 1: Info
    title: string;
    categoryId: string;
    shortDescription?: string;

    // Step 2: Redemption
    redemptionType: 'COUPON' | 'ONLINE' | 'VIP_ACCOUNT' | 'CONTACT_FORM';
    externalUrl?: string; // For ONLINE

    // Step 3: Prices
    originalPrice?: string | number;
    price?: string | number; // Final price
    discountPercentage?: string | number;
    priceType?: 'FIXED' | 'PER_PERSON' | 'PER_HOUR' | 'PER_DAY' | 'PER_MONTH' | 'ON_REQUEST';
    currency?: string;

    // Step 4: Dates
    publishedAt?: string;
    expiresAt?: string;
    duration?: string;

    // Step 5: Images
    images: string[];

    // Step 6: Content
    description: string; // Detailed description
    benefits?: string;

    // Step 7: Conditions
    requirements?: string;
    conditions?: string;
    internalNotes?: string;

    // Step 8: Contact
    contactMethod?: 'EMAIL' | 'PHONE' | 'FORM' | 'WEBSITE';
    contactEmail?: string;
    contactPhone?: string;
    location?: string;
    remote?: boolean;

    // Step 9: Publication / Meta
    featured?: boolean;
    priority?: number;
    tags?: string[];
    status?: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
    submittedAt?: string;
    slug?: string;
}

export const INITIAL_FORM_DATA: OfferFormData = {
    title: '',
    categoryId: '',
    shortDescription: '',
    redemptionType: 'COUPON',
    description: '',
    images: [],
    priceType: 'FIXED',
    contactMethod: 'EMAIL',
    status: 'DRAFT',
    remote: false,
    featured: false,
    priority: 0,
    tags: []
};
