# Configuración de Google reCAPTCHA

## Instrucciones para configurar Google reCAPTCHA v2

### 1. Obtener las claves de reCAPTCHA

1. Ve a la consola de Google reCAPTCHA: https://www.google.com/recaptcha/admin
2. Haz clic en "+" para crear un nuevo sitio
3. Completa el formulario:
   - **Label**: Nombre descriptivo (ej: "Wayu Store Login")
   - **reCAPTCHA type**: Selecciona "reCAPTCHA v2" > "I'm not a robot" Checkbox
   - **Domains**: Agrega tus dominios (ej: `localhost`, `wayustore.bitwia.com`)
4. Acepta los términos de servicio
5. Haz clic en "Submit"

### 2. Configurar el Frontend (Quasar/Vue)

En el archivo `/wayu-store/.env`:
```bash
# Google reCAPTCHA v2
VITE_RECAPTCHA_SITE_KEY=tu_site_key_aqui
```

### 3. Configurar el Backend (FastAPI)

En el archivo `/fastapi-store/.env`:
```bash
# Google reCAPTCHA
RECAPTCHA_SECRET_KEY=tu_secret_key_aqui
```

### 4. Claves de prueba (solo para desarrollo)

Google proporciona estas claves de prueba que siempre pasan la validación:

**Site Key (Frontend):** `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
**Secret Key (Backend):** `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

### 5. Características implementadas

#### Frontend:
- ✅ reCAPTCHA aparece solo en el formulario de login
- ✅ El botón de login se deshabilita hasta que se complete el reCAPTCHA
- ✅ Se resetea automáticamente en caso de error de login
- ✅ Manejo de errores (expiración, errores de carga)

#### Backend:
- ✅ Validación del token de reCAPTCHA con la API de Google
- ✅ Validación opcional (si no hay secret key configurada, pasa por desarrollo)
- ✅ Manejo de errores y timeouts
- ✅ Incluye la IP del cliente en la validación

### 6. Seguridad adicional

Esta implementación mejora la seguridad al:
- Prevenir ataques de fuerza bruta automatizados
- Reducir el spam y bots maliciosos
- Cumplir con estándares de seguridad web
- Proteger contra ataques CSRF

### 7. Consideraciones de producción

1. **Reemplaza las claves de prueba** por las reales antes de ir a producción
2. **Configura los dominios correctos** en la consola de Google reCAPTCHA
3. **Monitorea el uso** desde la consola de Google para detectar patrones sospechosos
4. **Considera implementar rate limiting** adicional en el backend

### 8. Troubleshooting

**Error: "Validación de reCAPTCHA fallida"**
- Verifica que las claves sean correctas
- Asegúrate de que el dominio esté registrado en Google reCAPTCHA
- Revisa que las variables de entorno estén cargándose correctamente

**reCAPTCHA no aparece**
- Verifica que `vue-recaptcha` esté instalado
- Revisa que el boot file esté registrado en quasar.config.js
- Comprueba la variable VITE_RECAPTCHA_SITE_KEY en el frontend
