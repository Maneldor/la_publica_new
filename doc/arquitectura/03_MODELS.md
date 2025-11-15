# 03 · Models de Dades (Prisma)
Versió definitiva – Novembre 2025

---

# 🎯 Objectiu
Documentar tots els models Prisma utilitzats pel backend de La Pública.

---

# 🧱 Models Principals

## User
```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  primaryRole  UserRole
  company      Company?
  createdAt    DateTime @default(now())
}
```

---

## Company
```prisma
model Company {
  id            String @id @default(cuid())
  userId        String @unique
  name          String
  planType      String
  limitOffers   Int
  teamLimit     Int
  iaLevel       String
  Presupuesto   Presupuesto[]
  SolicitudExtra SolicitudExtra[]
  Invoice       Invoice[]
  createdAt     DateTime @default(now())
}
```

---

## Presupuesto
```prisma
model Presupuesto {
  id          String @id @default(cuid())
  empresaId   String
  estado      String
  totalAPagar Float
  items       PresupuestoItem[]
}
```

---

## FeatureExtra
```prisma
model FeatureExtra {
  id          String @id @default(cuid())
  name        String
  categoria   String
  price       Float
  description String
}
```

---

## SolicitudExtra
```prisma
model SolicitudExtra {
  id        String @id @default(cuid())
  empresaId String
  extraId   String
  status    String
  createdAt DateTime @default(now())
}
```

---

# 🧩 Relacions importants

- `User` 1–1 `Company`  
- `Company` 1–N `Presupuesto`  
- `Company` 1–N `SolicitudExtra`  
- `Company` 1–N `Invoice`  

---

# ✔ Fi del document
