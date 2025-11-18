# 🚀 ACCESOS RÁPIDOS - LA PÚBLICA

## 👑 SUPER ADMIN
```
Email:    super.admin@lapublica.cat
Password: superadmin123
Rol:      SUPER_ADMIN
Nombre:   Super Administrador
```

## 👑 LAURA GARCÍA (También SUPER_ADMIN)
```
Email:    laura.garcia@generalitat.cat
Password: admin123
Rol:      SUPER_ADMIN
```

## 👤 USUARIO NORMAL
```
Email:    laura.garcia@generalitat.cat
Password: password123
Rol:      USER (antes era SUPER_ADMIN, ahora admin123)
```

## 🌐 ENLACES RÁPIDOS

### 🔐 Autenticación
- **Login**: http://localhost:3000/auth/signin
- **Logout**: http://localhost:3000/auth/signout

### 📊 Dashboard Usuario
- **Home**: http://localhost:3000/dashboard
- **Perfil**: http://localhost:3000/dashboard/perfil
- **Mensajes**: http://localhost:3000/dashboard/missatges

### ⚙️ Panel Admin
- **Admin Dashboard**: http://localhost:3000/admin
- **Logs de Auditoría**: http://localhost:3000/admin/logs
- **Gestión Usuarios**: http://localhost:3000/admin/usuarios/listar
- **Gestión Empresas**: http://localhost:3000/admin/empresas/listar

### 🏢 Panel Empresa
- **Dashboard Empresa**: http://localhost:3000/empresa

## 🔧 HERRAMIENTAS DE DESARROLLO

### 📱 Prisma Studio
```bash
npx prisma studio
# Abre: http://localhost:5555
```

### 🗄️ Base de Datos
```bash
psql -h localhost -U lapublica -d lapublica_dev
# Password: dev123
```

## ⚡ SCRIPTS ÚTILES

### Cambiar contraseña de usuario
```bash
node scripts/change-laura-password.js
```

### Configurar Super Admin
```bash
node scripts/super-admin-login.js
```

---
**Última actualización**: $(date)
**Puerto del servidor**: 3000
**Estado**: ✅ Funcionando