# 🔐 Configuración de Stripe - La Pública

## 📋 Variables de Entorno Requeridas

```env
# Stripe Keys (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Frontend público
STRIPE_SECRET_KEY=sk_test_...                    # Backend privado
STRIPE_WEBHOOK_SECRET=whsec_...                  # Webhook signature
NEXT_PUBLIC_APP_URL=http://localhost:3000        # Base URL redirecciones
```

⚠️ **IMPORTANTE:** Estas son claves de TEST. Cambiar a claves LIVE solo en producción.

## 🛠️ Setup Desarrollo Local

### 1. Instalar Stripe CLI
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Verificar instalación
stripe --version
```

### 2. Login en Stripe
```bash
stripe login
```
Seguir el código de pairing que aparece en terminal.

### 3. Iniciar Webhook Forwarding
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copiar el webhook secret (whsec_...) y actualizar en `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
```

## 🧪 Testing con Tarjetas de Prueba

### Tarjetas Exitosas
- **Visa:** `4242 4242 4242 4242`
- **Visa (debit):** `4000 0566 5566 5556`
- **Mastercard:** `5555 5555 5555 4444`

### Tarjetas con Errores
- **Decline genérico:** `4000 0000 0000 0002`
- **Funds insuficientes:** `4000 0000 0000 9995`
- **Tarjeta perdida:** `4000 0000 0000 9987`

### Autenticación 3D Secure
- **Requiere auth:** `4000 0025 0000 3155`
- **Auth falla:** `4000 0000 0000 3220`

### Datos Generales Test
- **Fecha expiración:** Cualquier fecha futura (ej: 12/34)
- **CVC:** Cualquier 3 dígitos (ej: 123)
- **ZIP:** Cualquier código postal válido

## 🚀 Flujo de Testing End-to-End

### 1. Preparar Entorno
```bash
# Terminal 1: Servidor Next.js
cd /Users/maneldor/Desktop/la_publica_new/frontend
npm run dev

# Terminal 2: Webhook listener
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 2. Ejecutar Flujo Completo
1. **Login:** `pionera@test.cat / Password123!`
2. **Navegar:** `/empresa/plans`
3. **Seleccionar plan:** Click "Actualitzar a ESTÀNDARD"
4. **Ver modal:** Verificar cálculo prorrateo correcto
5. **Confirmar upgrade:** Click "Confirmar actualització"
6. **Stripe Checkout:** Debe redirigir a página de pago Stripe
7. **Completar pago:** Usar tarjeta `4242 4242 4242 4242`
8. **Verificar webhook:** Ver evento en terminal 2
9. **Verificar success:** Redirección a `/empresa/pla/payment-success`
10. **Verificar update:** Dashboard muestra plan actualizado

### 3. Verificaciones Post-Pago
- [ ] Plan actualizado en dashboard
- [ ] Widget sidebar muestra límites nuevos
- [ ] Badge notificaciones actualizado
- [ ] Webhook procesado correctamente
- [ ] Subscription actualizada en BD

## 📊 Arquitectura del Sistema

### APIs Creadas
```
POST /api/stripe/create-checkout-session
├── Autentica usuario
├── Valida planId
├── Calcula amount (con prorrateo)
├── Crea Stripe Session con metadata
└── Retorna URL de checkout

POST /api/stripe/webhook
├── Valida signature Stripe
├── Maneja eventos: checkout.session.completed
├── Actualiza subscription en BD
└── Logs eventos para debugging
```

### Metadata en Checkout Session
```javascript
{
  companyId: "uuid-empresa",
  planId: "uuid-plan-nuevo",
  currentPlanId: "uuid-plan-actual",
  upgradeType: "plan_upgrade"
}
```

### Componentes Frontend
```
UpgradeModal
├── Calcula prorrateo
├── Llama create-checkout-session API
├── Redirige a Stripe Checkout
└── Maneja errores

PaymentSuccessPage
├── Countdown 5 segundos
├── Redirección automática
└── Link manual al dashboard
```

## 🔍 Debugging y Logs

### Ver Eventos Stripe
```bash
# Webhook listener con logs verbose
stripe listen --forward-to localhost:3000/api/stripe/webhook --log-level debug

# Ver eventos en dashboard
open https://dashboard.stripe.com/test/events

# Reenviar evento específico
stripe events resend evt_1234567890
```

### Logs del Sistema
- **Backend:** Console logs en webhook handler
- **Frontend:** Network tab para APIs
- **Stripe CLI:** Output en tiempo real de eventos

### Endpoints de Testing
```bash
# Verificar checkout API (debe retornar 401)
curl -X POST http://localhost:3000/api/stripe/create-checkout-session

# Verificar webhook API (debe retornar error signature)
curl -X POST http://localhost:3000/api/stripe/webhook
```

## 🚀 Despliegue a Producción

### 1. Obtener Claves Live
1. Ir a https://dashboard.stripe.com/apikeys
2. Activar "View live data"
3. Copiar claves live:
   - `pk_live_...` (Publishable key)
   - `sk_live_...` (Secret key)

### 2. Configurar Webhook Producción
1. Ir a https://dashboard.stripe.com/webhooks
2. Añadir endpoint: `https://tudominio.com/api/stripe/webhook`
3. Seleccionar eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copiar webhook signing secret
5. Actualizar variables de entorno producción

### 3. Variables Entorno Producción
```env
# Stripe Keys (Live Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://tudominio.com
```

### 4. Testing Producción
- Usar tarjetas reales con cantidades pequeñas
- Verificar webhooks llegan correctamente
- Probar refunds desde dashboard Stripe
- Configurar alertas para pagos fallidos

## 📝 Eventos Manejados

### checkout.session.completed
- **Trigger:** Pago completado exitosamente
- **Acción:** Actualiza subscription y crea registro pago
- **Resultado:** Plan empresa actualizado inmediatamente

### payment_intent.succeeded
- **Trigger:** Pago procesado correctamente
- **Acción:** Log de confirmación
- **Resultado:** Confirmación adicional de éxito

### payment_intent.payment_failed
- **Trigger:** Pago rechazado o fallido
- **Acción:** Log error y notificación
- **Resultado:** Plan empresa sin cambios

## ⚠️ Seguridad y Buenas Prácticas

### Variables de Entorno
- ❌ NUNCA commitear claves en Git
- ❌ NUNCA usar claves live en desarrollo
- ✅ Usar .env.local para desarrollo
- ✅ Variables entorno seguras en producción

### Validación Webhooks
- ✅ Siempre verificar signature Stripe
- ✅ Validar metadata antes de procesar
- ✅ Manejo de errores graceful
- ✅ Logs detallados para debugging

### Manejo de Pagos
- ✅ Validar usuario autenticado
- ✅ Verificar permisos empresa
- ✅ Calcular amounts server-side
- ✅ Nunca confiar en datos frontend

## 🔧 Troubleshooting Común

### Error: "No autenticado"
- Verificar sesión NextAuth activa
- Comprobar cookie válida
- Login de nuevo si necesario

### Error: "Invalid signature"
- Verificar STRIPE_WEBHOOK_SECRET correcto
- Reiniciar stripe CLI listener
- Copiar nuevo webhook secret

### Error: "Plan no encontrado"
- Verificar planId existe en BD
- Comprobar empresa tiene permisos
- Revisar metadata en checkout session

### Webhook no llega
- Verificar stripe CLI corriendo
- Comprobar puerto 3000 libre
- Revisar URL forwarding correcta

### Build falla
- Verificar todas variables .env definidas
- Comprobar importaciones Stripe correctas
- Revisar tipos TypeScript

## 📚 Recursos Adicionales

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## 🎯 Próximas Mejoras

### Funcionalidades Adicionales
- [ ] Dashboard de facturación `/empresa/facturacio`
- [ ] Descarga de facturas PDF
- [ ] Manejo de suscripciones recurrentes
- [ ] Refunds desde admin panel
- [ ] Emails confirmación (Resend/SendGrid)

### Optimizaciones
- [ ] Cache checkout sessions
- [ ] Retry logic para webhooks
- [ ] Metrics y analytics pagos
- [ ] Alertas pagos fallidos
- [ ] Soporte múltiples monedas

---

**Actualizado:** 15 Noviembre 2025
**Versión:** 1.0
**Mantenido por:** Equipo Desarrollo La Pública