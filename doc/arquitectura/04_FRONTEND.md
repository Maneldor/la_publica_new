# 04 · Arquitectura Frontend
Versió definitiva – Novembre 2025

---

# 🎯 Objectiu
Documentar l’estructura i les normes del frontend basat en **Next.js 14 (App Router)**.

---

# 🧱 1. Directori Principal
```
/frontend/app/
```

---

# 🧭 2. Rutes Principals

```
/admin/                        ← Administració
/dashboard/                    ← Empleats públics
/empresa/                      ← Empreses col·laboradores
/gestor-empreses/              ← CRM gestors
```

---

# 📌 3. Normes de Routing

### 3.1 `/admin` és única font de veritat
Tot el que sigui gestió administrativa va a `/admin`.

### 3.2 Idioma
- Totes les rutes → Català  
- Contingut UI → Català  
- Arxius → Anglès o Català (consistent)

### 3.3 Paràmetres
Un sol paràmetre per directori:

```
✔ /empresa/ofertes/[id]/
✘ /empresa/ofertes/[ofertaId]/
```

### 3.4 Pàgines pare obligatòries
```
✔ /empresa/page.tsx
✔ /empresa/ofertes/page.tsx
```

---

# 🧩 4. Components i estructures recomanades

```
/components/
  /ui/                          ← Botons, cartes, modal...
  /empresa/
  /dashboard/
  /admin/
```

---

# 🔌 5. Services (client)

```
/frontend/services/
  empresaService.ts
  adminService.ts
  authService.ts
```

---

# 📊 6. Estadístiques

Mostra contingut segons pla:
- Bàsiques  
- Ampliades  
- Pro  

---

# ✔ Fi del document
