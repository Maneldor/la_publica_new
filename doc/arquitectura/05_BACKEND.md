# 05 · Arquitectura Backend
Versió definitiva – Novembre 2025

---

# 🎯 Objectiu
Documentar l’arquitectura del backend modular de La Pública.

---

# 🧱 1. Estructura de mòduls

```
/backend/modules/
  planes/
  extras/
  ia/
  crm/
  facturacio/
  empreses/
  logs/
```

---

# 🔧 2. Middlewares

```
planLimits.ts
auth.ts
logs.ts
```

---

# 🧠 3. Serveis principals

- **PlanService**  
- **ExtraService**  
- **IAService**  
- **InvoiceService**  
- **CRMService**

---

# 🔌 4. APIs

```
/api/admin/*
/api/empresa/*
/api/dashboard/*
```

Totes les rutes API han de respondre en català.

---

# ✔ Fi del document
