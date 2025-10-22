# 🏛️ La Pública

Plataforma social per a empleats públics de Catalunya

## 🏗️ Estructura del Proyecto
```
la_publica_new/
├── frontend/          # Next.js 14 (TypeScript + Tailwind)
└── backend/           # Node.js API
```

## 🚀 Frontend

### Stack Tecnológico
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Estado**: React Hooks + Context API

### Instalación
```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:3000

### Features Implementadas

- 📅 **Calendari**: Gestión completa de eventos
- 📢 **Anuncis**: Marketplace con wizard multi-paso
  - 5 pasos con validación progresiva
  - Upload de imágenes drag & drop
  - Sistema de revisión
- 📝 **Blogs**: Sistema de publicación
- 👥 **Xarxa Social**: Interacción entre usuarios

### Refactorización Anuncis

- ✅ 1,409 → 212 líneas (-85%)
- ✅ 10 componentes modulares
- ✅ Sistema de modales global
- ✅ Arquitectura escalable

### Componentes Reutilizables

- **BaseModal**: Sistema de modales global
- **MultiStepWizard**: Formularios por pasos
- **ProgressIndicator**: Barra de progreso
- **Hooks**: useImageGallery, useGuardats, useCreateAnunci

## 🔧 Backend

### Instalación
```bash
cd backend
npm install
npm start
```

## 📦 Instalación Completa
```bash
git clone https://github.com/Maneldor/la_publica_new.git
cd la_publica_new

# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

## 🔐 Variables de Entorno

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:XXXX
```

### Backend (.env)
```env
PORT=XXXX
DATABASE_URL=
```

## 👨‍💻 Desarrollo
```bash
# Terminal 1 - Frontend
cd frontend && npm run dev

# Terminal 2 - Backend
cd backend && npm start
```

## 🎯 Estado

✅ Frontend: Funcional con refactorización completa  
🚧 Backend: En desarrollo  
🚧 Integración: En progreso  

## 👨‍💻 Autor

Desarrollado para empleados públicos de Catalunya

## 📄 Licencia

Privado - Todos los derechos reservados
# Test branch protection
