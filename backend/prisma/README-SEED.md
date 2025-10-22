# 🌱 Sistema de Seeds - La Pública

Este sistema de seeds proporciona datos de prueba realistas para el desarrollo y testing del dashboard de empleados.

## 🚀 Ejecución del Seed

### Primera vez:
```bash
npm run db:seed
```

### Reset completo (borra todo y reinserta):
```bash
npm run db:reset
```

## 📊 Datos Creados

### 🏛️ Comunidad
- **Catalunya**: Comunidad autónoma configurada con idiomas catalán y español

### 👥 Usuarios

#### Admin Principal
- **Email**: `admin@lapublica.es`
- **Password**: `admin123456`
- **Rol**: ADMIN
- **Permisos**: Acceso completo al sistema

#### Empleado Principal
- **Email**: `empleado@lapublica.cat`
- **Password**: `empleado123`
- **Rol**: EMPLEADO_PUBLICO
- **Perfil**: Joan Martínez, Tècnic Superior TIC

#### 10 Empleados Adicionales
- **Emails**: `empleado1@lapublica.cat` a `empleado10@lapublica.cat`
- **Password**: `empleado123` (todos)
- **Perfiles**: Variados departamentos (RRHH, Legal, Ambiental, etc.)

### 🏢 Grupos (5 grupos)
1. **Polítiques Públiques** - Público
2. **Innovació i Tecnologia** - Público
3. **Administració Local** - Público
4. **Recursos Humans** - Privado
5. **Sostenibilitat i Medi Ambient** - Público

### 📝 Contenido
- **20 Posts** con contenido realista en catalán
- **3 Posts anclados** (importantes)
- **Likes**: Entre 2-50 likes por post
- **50 Comentarios** distribuidos en los posts
- **Fechas**: Distribuidas en los últimos 30 días

## 🎯 Casos de Uso

### Para Testing del Dashboard
```bash
# Login como empleado principal
Email: empleado@lapublica.cat
Password: empleado123
```

### Para Testing Admin
```bash
# Login como administrador
Email: admin@lapublica.es
Password: admin123456
```

### Para Testing API
```bash
# Cualquier empleado (1-10)
Email: empleado[1-10]@lapublica.cat
Password: empleado123
```

## 🔄 Regeneración de Datos

El seed es **idempotente**: puedes ejecutarlo múltiples veces sin duplicar datos.

```bash
# Verificar existencia antes de crear
npm run db:seed  # Seguro, no duplica

# Forzar recreación completa
npm run db:reset  # Borra todo y recrea
```

## 📋 Datos Específicos por Empleado

| Usuario | Departamento | Especialidad |
|---------|-------------|-------------|
| empleado@lapublica.cat | TIC | Innovación digital |
| empleado1@lapublica.cat | RRHH | Gestión de personas |
| empleado2@lapublica.cat | Estrategia | Políticas públicas |
| empleado3@lapublica.cat | Comunicación | Relaciones públicas |
| empleado4@lapublica.cat | Legal | Derecho administrativo |
| empleado5@lapublica.cat | Medio Ambiente | Sostenibilidad |
| empleado6@lapublica.cat | Finanzas | Análisis económico |
| empleado7@lapublica.cat | Social | Trabajo social |
| empleado8@lapublica.cat | Sistemas | Infraestructuras TIC |
| empleado9@lapublica.cat | Cultura | Gestión cultural |
| empleado10@lapublica.cat | Urbanismo | Inspección de obras |

## 🧪 Verificación del Seed

Después de ejecutar el seed, puedes verificar los datos:

```bash
npm run db:studio
```

Esto abrirá Prisma Studio donde podrás ver todos los datos creados.

## ⚠️ Notas Importantes

1. **Passwords**: Todos los passwords están hasheados con bcrypt
2. **Fechas**: Los posts tienen fechas realistas de los últimos 30 días
3. **Relaciones**: Todos los datos están correctamente relacionados
4. **Idioma**: El contenido está en catalán para realismo
5. **Grupos**: Los miembros están distribuidos aleatoriamente en los grupos

## 🐛 Troubleshooting

### Error de conexión a BD:
```bash
# Verificar que PostgreSQL esté corriendo
# Verificar .env DATABASE_URL
```

### Error de TypeScript:
```bash
npx prisma generate
npm run db:seed
```

### Reset completo si hay problemas:
```bash
npm run db:reset
```