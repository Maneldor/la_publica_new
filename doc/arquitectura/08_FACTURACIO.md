# 08 · Arquitectura de Facturació
Versió definitiva – Novembre 2025

---

# 🎯 Objectiu
Descriure l’arquitectura del sistema de facturació i pressupostos.

---

# 💸 1. Funcions principals

- Conversió **pressupost → factura**  
- Generació automàtica de PDFs  
- Pagaments amb Stripe/PayPal  
- Historial d’empreses  
- Upgrades de plans  
- Bonus 50% primer any (Pioneres i nous plans)  

---

# 📂 2. Carpetes Backend

```
/backend/modules/facturacio/
  invoiceService.ts
  pdfService.ts
  budgetToInvoice.ts
```

---

# 🧾 3. Frontend

```
/empresa/facturacio/
```

Mostra:
- factures  
- pressupostos  
- estat dels pagaments  
- renovacions  

---

# ✔ Fi del document
