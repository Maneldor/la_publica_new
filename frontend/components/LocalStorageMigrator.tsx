'use client';

import { useEffect } from 'react';

export default function LocalStorageMigrator() {
    useEffect(() => {
        try {
            // Migrate Companies
            const storedEmpresas = localStorage.getItem('createdEmpresas');
            if (storedEmpresas) {
                let modified = false;
                const empresas = JSON.parse(storedEmpresas);
                if (Array.isArray(empresas)) {
                    const migrated = empresas.map((emp: any) => {
                        // Rename category to sector if sector is missing and category exists
                        if (emp.category && !emp.sector) {
                            modified = true;
                            const { category, ...rest } = emp;
                            return { ...rest, sector: category };
                        }
                        return emp;
                    });

                    if (modified) {
                        localStorage.setItem('createdEmpresas', JSON.stringify(migrated));
                        console.log('Migrated companies from category to sector in localStorage');
                    }
                }
            }

            // Migrate Leads
            const storedLeads = localStorage.getItem('createdLeads');
            if (storedLeads) {
                let modified = false;
                const leads = JSON.parse(storedLeads);
                if (Array.isArray(leads)) {
                    const migrated = leads.map((lead: any) => {
                        // Rename category to sector if sector is missing and category exists
                        if (lead.category && !lead.sector) {
                            modified = true;
                            const { category, ...rest } = lead;
                            return { ...rest, sector: category };
                        }
                        return lead;
                    });

                    if (modified) {
                        localStorage.setItem('createdLeads', JSON.stringify(migrated));
                        console.log('Migrated leads from category to sector in localStorage');
                    }
                }
            }
        } catch (e) {
            console.error('Error migrating localStorage:', e);
        }
    }, []);

    return null;
}
