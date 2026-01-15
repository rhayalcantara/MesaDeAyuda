# Sesion de Prueba - Envio de Correo al Resetear Contrasena

**Fecha:** 14 de Enero 2026

---

## Objetivo

Verificar que el sistema envie correctamente un correo electronico cuando un administrador cambia la contrasena de un empleado.

---

## Contexto del Problema

El usuario reporto que al resetear la contrasena de un empleado desde el panel de administracion, el sistema mostraba exito pero **el correo no llegaba** a la bandeja de entrada del empleado.

---

## Proceso de Verificacion

### Paso 1: Prueba Inicial con Backend de Produccion

**Configuracion:**
- Frontend: localhost:3000 (local)
- Backend: rhayalcantara-002-site1.ntempurl.com (produccion)

**Resultado:**
- La API respondia 200 OK
- El mensaje decia "Se ha enviado un correo con las credenciales"
- **El correo NO llegaba**

### Paso 2: Prueba con Backend Local + BD de Produccion

Para aislar el problema, se configuro:
- Frontend: localhost:3000 (local)
- Backend: localhost:5000 (local)
- Base de datos: SQL5113.site4now.net (produccion)

**Archivos modificados localmente:**

1. `backend/appsettings.json` - ConnectionString apuntando a BD de produccion
2. `backend/appsettings.Production.json` - Credenciales SMTP
3. `frontend/.env.local` - API_URL apuntando a localhost:5000

### Paso 3: Diagnostico del Error

Se agrego logging al EmailService para ver la configuracion que estaba usando:

```csharp
_logger.LogError("DEBUG Email config - SmtpServer: '{SmtpServer}', Port: {Port}...");
```

**Hallazgo:** El log mostro valores placeholder:
```
SmtpServer: 'YOUR_SMTP_SERVER'
Username: 'YOUR_EMAIL'
FromEmail: 'noreply@yourdomain.com'
```

### Paso 4: Causa Raiz Identificada

El archivo `appsettings.Production.json` tenia valores placeholder para la configuracion de Email:

```json
"Email": {
  "SmtpServer": "YOUR_SMTP_SERVER",
  "Port": 587,
  "Username": "YOUR_EMAIL",
  "Password": "YOUR_EMAIL_PASSWORD",
  "FromEmail": "noreply@yourdomain.com",
  "FromName": "MDAyuda"
}
```

ASP.NET Core carga primero `appsettings.json` y luego `appsettings.{Environment}.json`, donde el segundo **sobrescribe** al primero. Como el environment era "Production", los valores placeholder sobrescribian la configuracion correcta.

---

## Solucion Aplicada

### En Local

Se actualizo `backend/appsettings.Production.json` con las credenciales SMTP correctas:

```json
"Email": {
  "SmtpServer": "smtp.gmail.com",
  "Port": 587,
  "Username": "rhayalcantara@gmail.com",
  "Password": "wcri duxl wyye oshj",
  "FromEmail": "rhayalcantara@gmail.com",
  "FromName": "MDAyuda"
}
```

### Resultado de Prueba Local

Despues de reiniciar el backend con la configuracion corregida:
- Se reseteo la contrasena del empleado "Rhay Alcantara"
- El correo **SI llego** a la bandeja de entrada
- Asunto: "MDAyuda - Contraseña Restablecida"
- UID del correo: 60509

---

## Despliegue a Produccion

### Verificacion del Archivo en Produccion

Se leyo el archivo via FTP:
```
Host: win8106.site4now.net
Usuario: rhayalcantara-002
Ruta: /MDAyuda/appsettings.Production.json
```

**Confirmacion:** El archivo en produccion tenia los mismos valores placeholder.

### Actualizacion via FTP

Se uso el MCP de FTP para escribir el archivo actualizado:

```javascript
mcp__ftp__ftp_write({
  remotePath: "/MDAyuda/appsettings.Production.json",
  content: "{ ... configuracion corregida ... }"
})
```

**Resultado:** Archivo actualizado exitosamente en produccion.

---

## Configuracion Final de Email (Produccion)

```json
"Email": {
  "SmtpServer": "smtp.gmail.com",
  "Port": 587,
  "Username": "rhayalcantara@gmail.com",
  "Password": "wcri duxl wyye oshj",
  "FromEmail": "rhayalcantara@gmail.com",
  "FromName": "MDAyuda"
}
```

---

## Nota Importante

Las credenciales SMTP son una **App Password** de Gmail, no la contrasena principal. Estas se generan en:
- Google Account > Security > 2-Step Verification > App passwords

---

## Verificacion en Produccion

### Prueba Realizada: 14 de Enero 2026, 22:41 UTC

1. Se accedio al sitio de produccion: `http://rhayalcantara-002-site1.ntempurl.com`
2. Se inicio sesion como administrador (admin@mdayuda.com)
3. Se navego a Gestion de Usuarios > Empleados
4. Se reseteo la contrasena del empleado "Rhay Alcantara"
5. El sistema genero contrasena temporal: `rWcy85rLcMbF`

**Resultado:** El correo **SI llego** a la bandeja de entrada

- **UID del correo:** 60511
- **Asunto:** "MDAyuda - Contraseña Restablecida"
- **Fecha/Hora:** 2026-01-14 22:41:10 UTC
- **Remitente:** MDAyuda (rhayalcantara@gmail.com)

---

## Archivos Relevantes

| Archivo | Ubicacion | Descripcion |
|---------|-----------|-------------|
| appsettings.json | backend/ | Config base (se sobrescribe) |
| appsettings.Production.json | backend/ | Config de produccion (prioridad) |
| appsettings.Production.json | FTP:/MDAyuda/ | Config en servidor de produccion |
| EmailService.cs | backend/Services/ | Servicio de envio de correo |
| PRODUCCION.md | MesaDeAyuda/ | Credenciales y documentacion |

---

## Resumen

| Paso | Estado |
|------|--------|
| Identificar problema | ✅ Completado |
| Diagnosticar causa raiz | ✅ Completado |
| Corregir localmente | ✅ Completado |
| Probar localmente | ✅ Completado (correo recibido UID 60509) |
| Actualizar produccion via FTP | ✅ Completado |
| Reiniciar sitio en produccion | ✅ Completado (automatico) |
| Probar en produccion | ✅ Completado (correo recibido UID 60511) |

**Estado Final: RESUELTO** ✅

---

## Credenciales de Referencia

**FTP:**
- Host: win8106.site4now.net
- Usuario: rhayalcantara-002
- Password: BcdefG7h*
- Ruta: /MDAyuda/

**SMTP Gmail:**
- Servidor: smtp.gmail.com
- Puerto: 587
- Usuario: rhayalcantara@gmail.com
- App Password: wcri duxl wyye oshj

**Admin MDAyuda:**
- Email: admin@mdayuda.com
- Password: BcdefG7h*

**Empleado de prueba:**
- Nombre: Rhay Alcantara
- Email: rhayalcantara@gmail.com
