'use client';

import { useState } from 'react';
import OfferWizardLayout, { WizardStep } from './OfferWizardLayout';
import { OfferFormData, INITIAL_FORM_DATA } from './types';
import {
    StepCompanySelection,
    Step1Info,
    Step2RedemptionType,
    Step3Preus,
    Step4Dates,
    Step5Imatges,
    Step6Contingut,
    Step7Condicions,
    Step8Contacte,
    Step9Publicacio
} from './OfferSteps';

interface SharedOfferWizardProps {
    initialData?: OfferFormData;
    enableCompanySelection?: boolean;
    onSave: (data: OfferFormData, status: 'DRAFT' | 'PENDING' | 'PUBLISHED') => Promise<void>;
    categories?: any[];
    empreses?: any[]; // Required if enableCompanySelection is true
}

export default function SharedOfferWizard({
    initialData,
    enableCompanySelection = false,
    onSave,
    categories = [],
    empreses = []
}: SharedOfferWizardProps) {
    const [formData, setFormData] = useState<OfferFormData>(initialData || INITIAL_FORM_DATA);

    // Construct steps dynamically
    const steps: WizardStep[] = [
        ...(enableCompanySelection ? [{
            id: 'company',
            title: 'Empresa',
            description: 'Selecciona l\'empresa responsable',
            component: <StepCompanySelection formData={formData} onChange={setFormData} empreses={empreses} />,
            isValid: !!formData.companyId
        }] : []),
        {
            id: 'info',
            title: 'Informació',
            description: 'Informació bàsica de l\'oferta',
            component: <Step1Info formData={formData} onChange={setFormData} categories={categories} />,
            isValid: !!formData.title && !!formData.categoryId
        },
        {
            id: 'redempcio',
            title: 'Tipus redempció',
            description: 'Com accediran els usuaris a l\'oferta',
            component: <Step2RedemptionType formData={formData} onChange={setFormData} />,
            isValid: (formData.redemptionType === 'ONLINE') ? !!formData.externalUrl : true
        },
        {
            id: 'preus',
            title: 'Preus',
            description: 'Configura els descomptes i preus',
            component: <Step3Preus formData={formData} onChange={setFormData} />
        },
        {
            id: 'dates',
            title: 'Dates',
            description: 'Defineix les dates de validesa',
            component: <Step4Dates formData={formData} onChange={setFormData} />
        },
        {
            id: 'imatges',
            title: 'Imatges',
            description: 'Afegeix imatges de l\'oferta',
            component: <Step5Imatges formData={formData} onChange={setFormData} />
        },
        {
            id: 'contingut',
            title: 'Contingut',
            description: 'Descripció detallada i beneficis',
            component: <Step6Contingut formData={formData} onChange={setFormData} />,
            isValid: !!formData.description
        },
        {
            id: 'condicions',
            title: 'Condicions',
            description: 'Requisits i condicions d\'ús',
            component: <Step7Condicions formData={formData} onChange={setFormData} />
        },
        {
            id: 'contacte',
            title: 'Contacte',
            description: 'Informació de contacte i ubicació',
            component: <Step8Contacte formData={formData} onChange={setFormData} />
        },
        {
            id: 'publicacio',
            title: 'Publicació',
            description: 'Revisió final i opcions de publicació',
            component: <Step9Publicacio formData={formData} onChange={setFormData} />
        }
    ];

    const handleSave = async (status: 'DRAFT' | 'PENDING' | 'PUBLISHED') => {
        await onSave(formData, status);
    };

    return (
        <OfferWizardLayout
            steps={steps}
            onSave={handleSave}
            formData={formData}
            onChange={setFormData}
            isEdit={!!initialData?.id}
            currentStatus={formData.status}
        />
    );
}
