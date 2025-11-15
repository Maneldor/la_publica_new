# 02 · Arquitectura de Plans i Extras – La Pública
Versió definitiva – Novembre 2025

---

# 🎯 1. Objectiu del document

Aquest document defineix l’arquitectura funcional i tècnica del **sistema de plans d’empreses** i **sistema d’extras** de La Pública.  
És un mòdul crític, ja que controla:

- Límits d’ús  
- Capacitats actives o bloquejades  
- Nivell d’IA  
- Estadístiques disponibles  
- Visibilitat dins la plataforma  
- Accés a serveis premium  
- Upgrades i downgrades  

---

# 🧱 2. Models principals

## Company (resum)
```prisma
model Company {
  id            String @id @default(cuid())
  name          String
  planType      String
  limitOffers   Int
  teamLimit     Int
  iaLevel       String
  Presupuesto   Presupuesto[]
  SolicitudExtra SolicitudExtra[]
  Invoice       Invoice[]
}
```

## FeatureExtra
```prisma
model FeatureExtra {
  id         String @id @default(cuid())
  name       String
  categoria  String
  price      Float
  description String
}
```

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

# 🧩 3. Tipus de Plans

| Pla | Límits | IA | Estadístiques | Visibilitat |
|-----|--------|-----|----------------|--------------|
| **Pionera** | 5 ofertes | IA bàsica | Bàsiques | Prioritària |
| **Estàndard** | 5 | IA bàsica | Bàsiques | Normal |
| **Estratègic** | 10 | IA bàsica + Mkt | Ampliades | Preferent |
| **Enterprise** | Il·limitades | IA Pro completa | Professionals | Prioritat màxima |

---

# ⚙ 4. Comportament automàtic al canviar de Pla

Quan una empresa tria o canvia pla, el backend actualitza:

```
company.limitOffers
company.teamLimit
company.iaLevel
activació d’estadístiques
visibilitat automàtica
accés a IA Pro (si escau)
bloqueig o desbloqueig d’extras premium
```

---

# 🔧 5. Middleware de Límits (`planLimits.ts`)

Funcions principals:

- Validar límit d’ofertes (publicar, editar, duplicar)  
- Bloquejar accés a pàgines restringides  
- Bloquejar accés a IA Pro si no és Enterprise  
- Controlar límit de membres d’equip  
- Desactivar estadístiques avançades  
- Apagar enllaços Premium  

Els missatges d’error han de ser **sempre clars i educats**.

---

# 🎁 6. Sistema d’Extras

Els extras són serveis addicionals que una empresa pot contractar:

### Categories:
- Web i Digital  
- Creatiu  
- Màrqueting i Promoció  
- IA  
- Consultoria i Formació  
- Tècnic Avançat  

### Flux tècnic:
1. Empresa sol·licita un extra  
2. Es crea un registre a `SolicitudExtra`  
3. Un gestor el revisa → accepta/rebutja  
4. Si és pagament automàtic → via Stripe/PayPal  
5. Si requereix feina → queda en estat “in progress”  
6. Finalització → estat “completed”

---

# 🧠 7. Recomendador d’Extras (IA)

La plataforma pot suggerir extras segons:

- baix rendiment d’una oferta  
- falta de visibilitat  
- taulell d’estadístiques pobre  
- manca de creativitats  
- absència de fotos  
- empreses sense web  
- molt trànsit però baixa conversió  

---

# 💸 8. Upgrades i Downgrades

### Upgrades disponibles:
- des de Estàndard → Estratègic  
- des de Estratègic → Enterprise  
- des de Estàndard/Estratègic → Enterprise

### Pagaments:
- anual  
- mensual (opcional)  
- descompte 50% primer any (Pioneres i altres plans)

---

# 📊 9. Visibilitat segons Pla

Ordre de prioritat:

1. Enterprise  
2. Pioneres  
3. Estratègic  
4. Estàndard  

Afecta a:

- ordre en el directori  
- estil visual  
- etiquetes  
- destacats  
- posició a resultats  

---

# 🧪 10. Tests recomanats

- Test límit 5 → error controlat  
- Test límit 10 → ok  
- Test ofertes il·limitades  
- Test accés IA Pro → només Enterprise  
- Test d’extras premium bloquejats  

---

# ✔ Fi del document
Versió totalment funcional i ampliable.
