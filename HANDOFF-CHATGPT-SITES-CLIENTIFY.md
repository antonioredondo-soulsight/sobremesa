# Handoff: Sobremesa × Clientify — correcciones aplicadas

**URL producción:** https://soulsight.es/sobremesa/  
**Fecha:** 24 septiembre 2026  
**Para:** responsable que publica/edita la landing con ChatGPT Sites  
**Objetivo:** que ChatGPT Sites (u otra regeneración) **no deshaga** lo que ya funciona

---

## 1. Contexto

La landing de Sobremesa se generó/editó con **ChatGPT Sites** y se publica como sitio estático en `soulsight.es/sobremesa/`.

Hay **dos tipos de captación** con Clientify:

| Uso | Tipo Clientify | ID | Cómo se integra |
|---|---|---|---|
| Formulario general de contacto (final de página) | Formulario / “araña” backend | `301900` | `POST` a la API desde `script-clientify-v4.js` |
| Popups “Descargar informe” (4 encuentros) | Superforms embebidos | `283226`, `301889`, `284015` | Iframe → `/sobremesa/forms/{ID}.html` |

### Scripts Clientify oficiales

**Contacto (formulario general / araña 301900):**
```html
<!-- NO usar el script de la araña para capturar en esta web (ver sección 3).
     El envío lo hace script-clientify-v4.js al endpoint de la araña. -->
```

Endpoint real de captura (el mismo que usa la araña por detrás):
```
https://api.clientify.net/web-marketing/webforms/action/301900/
```

**Popups – superforms:**
```html
<!-- Documento 1: La ficción de la lealtad -->
<script src="https://api.clientify.net/web-marketing/superforms/script/283226.js"></script>

<!-- Documento 2: Deus Ex Machina -->
<script src="https://api.clientify.net/web-marketing/superforms/script/301889.js"></script>

<!-- Documentos 3 y 4 (sin descarga activa): La aceleración sin destino + La tentación de no hacer nada -->
<script src="https://api.clientify.net/web-marketing/superforms/script/284015.js"></script>
```

---

## 2. Problemas que hubo (y por qué fallaban)

### A) Popups “Descargar informe” vacíos

**Síntoma:** se abría el modal, pero por dentro no había formulario.

**Causa:** ChatGPT Sites (y versiones intermedias) inyectaban el script de Clientify dentro de un iframe con `srcdoc` / HTML dinámico. Los **superforms de Clientify usan `document.write()`**, y eso **solo funciona** al cargar una **página HTML real**, no en `srcdoc` generado por JS.

**Solución definitiva:**
1. Crear páginas estáticas en `/sobremesa/forms/{ID}.html` con el script del superform.
2. El popup abre un iframe con `src="/sobremesa/forms/{ID}.html"` (**nunca** `srcdoc`).

### B) Formulario de contacto no llegaba a Clientify

**Síntoma:** al enviar, a veces se borraban campos o salía “éxito”, pero **no entraba el contacto** en Clientify.

**Causas encadenadas:**
1. El script de la araña (`webforms/external/script/301900.js`) intenta engancharse al botón a los **~5 segundos** y es frágil si hay `preventDefault`, validación propia o recargas.
2. En pruebas en producción: el mensaje de éxito se mostraba y **no salía ninguna petición** a Clientify (la araña no ejecutaba el envío).
3. Si se dejaba el submit nativo con `action="#"`, la página recargaba y cancelaba la petición.
4. Mezcla de versiones (React export de ChatGPT Sites vs HTML estático) y **caché agresiva de JS** (7 días) hacía que se siguiera sirviendo código viejo.

**Solución definitiva:**
- El contacto se envía con `fetch` desde `script-clientify-v4.js` al endpoint `action/301900/` (el de la araña).
- Se valida teléfono con prefijo internacional (`+34600123456`).
- Se muestra feedback de éxito/error sin recargar.
- **No depender** del hook de clic del script externo de la araña para capturar.

### C) Teléfono sin validar / sin feedback

**Requisito:** formato internacional, prefijo + número sin espacios, ej. `+34600123456`.

**Solución:** `pattern` + validación JS + mensajes visibles `#form-feedback`.

### D) Caché

El `.htaccess` cacheaba CSS/JS 7 días. Al subir fixes, el navegador seguía con JS antiguo (`srcdoc`, etc.).

**Solución:** renombrar scripts (`script-clientify-v4.js`) + `.htaccess` con `no-cache` para html/js/css.

---

## 3. Estado actual que DEBE respetarse

### Arquitectura en producción (versión estática que funciona)

```
/sobremesa/
  index.html                 ← HTML estático (NO el export React gigante de Sites)
  script-clientify-v4.js     ← popups + contacto + footer links + carrusel
  styles.css
  .htaccess
  forms/
    283226.html              ← La ficción de la lealtad
    301889.html              ← Deus Ex Machina
    284015.html              ← Aceleración + Tentación
  assets/                    ← imágenes, fuentes, logos…
```

### Formulario de contacto — requisitos del HTML

```html
<form id="clientify-contact-form" novalidate>
  <!-- Campos con name EXACTOS (mapeo Clientify): -->
  <!-- name, company, email, phone, interest, message, privacy -->
  <p id="form-feedback" class="form-feedback" role="status" aria-live="polite" hidden></p>
</form>

<script src="./script-clientify-v4.js"></script>
```

**Mapeo enviado a Clientify 301900:**

| `name` HTML | Campo Clientify |
|---|---|
| `name` | `name` |
| `company` | `company` |
| `email` | `email` |
| `phone` | `phone` |
| `interest` | `custom_field_535942` |
| `message` | `message` |
| `privacy` | `gdpr_acceptance` |

### Popups — requisitos

En JS, títulos → IDs:

| Título encuentro | Form ID |
|---|---|
| La ficción de la lealtad | `283226` |
| Deus Ex Machina | `301889` |
| La aceleración sin destino | `284015` |
| La tentación de no hacer nada | `284015` |

Cada `forms/{ID}.html` debe ser:

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>html,body{margin:0;padding:0;background:transparent}</style>
</head>
<body>
  <script type="text/javascript" src="https://api.clientify.net/web-marketing/superforms/script/{ID}.js"></script>
</body>
</html>
```

Y el modal debe hacer:
```js
iframe.src = "/sobremesa/forms/" + formId + ".html";
// NUNCA iframe.srcdoc = "....script Clientify...."
```

---

## 4. Reglas para ChatGPT Sites (NO romper)

Si regeneras o editas la landing en ChatGPT Sites, **aplica estas reglas**:

1. **No uses `srcdoc`** para formularios Clientify. Solo `iframe.src` a `/sobremesa/forms/{ID}.html`.
2. **No sustituyas** el envío del contacto por el script externo `webforms/external/script/301900.js` como única captura: en esta web **no es fiable**. Mantén el `fetch` a `action/301900/` de `script-clientify-v4.js`.
3. **No quites** los `name` de los inputs del contacto ni cambies esos nombres.
4. **No quites** `#form-feedback` ni la validación de teléfono `+…`.
5. **No conviertas** la landing a SPA/React para los formularios si eso vuelve a meter Clientify en `srcdoc` o hidratación que rompa el envío.
6. Si cambias JS, **renombra el fichero** (`v5`, `v6`…) y actualiza la etiqueta `<script src>` en `index.html` (caché).
7. Tras publicar, prueba siempre:
   - `https://soulsight.es/sobremesa/forms/283226.html` → debe verse el form Clientify
   - Popup “Descargar informe” → form visible
   - Contacto con `+34600111222` → mensaje verde + contacto en Clientify

### Prompt corto para pegar en ChatGPT Sites

> La landing Sobremesa en producción ya tiene integración Clientify estable. NO uses srcdoc para los popups de “Descargar informe”: abre iframes a `/sobremesa/forms/283226.html`, `301889.html` y `284015.html`. El formulario de contacto `#clientify-contact-form` debe seguir enviándose con fetch a `https://api.clientify.net/web-marketing/webforms/action/301900/` desde `script-clientify-v4.js` (o sucesor), con validación de teléfono internacional (+34…) y mensaje `#form-feedback`. Conserva los name: name, company, email, phone, interest, message, privacy. No dependas del script araña external/301900.js para capturar. Si tocas el JS, renombra el archivo para evitar caché.

---

## 5. Archivos del zip de producción (referencia)

Incluir en el zip para el equipo / ChatGPT Sites:

| Archivo | Rol |
|---|---|
| `index.html` | Página |
| `script-clientify-v4.js` | Lógica contacto + popups + UI |
| `styles.css` | Estilos (incl. modal y feedback) |
| `.htaccess` | Caché / DirectoryIndex |
| `forms/283226.html` | Superform lealtad |
| `forms/301889.html` | Superform Deus Ex Machina |
| `forms/284015.html` | Superform encuentros 3 y 4 |
| `assets/` | Imágenes y estáticos necesarios |

`LEEME_INSTALACION.txt` y este handoff pueden ir en el zip como documentación.

---

## 6. Control de versiones (recomendación)

Hoy el flujo es: ChatGPT Sites → export/subida FTP a `soulsight.es/sobremesa/`, sin repo claro.

**Recomendable:**
1. Preguntar al responsable si ChatGPT Sites tiene historial/versiones o export reproducible.
2. Si no, crear un **repo Git** (`sobremesa` o dentro de soulsight) con exactamente el zip de producción.
3. Regla: **ningún deploy a `/sobremesa/` sin commit**.
4. Ramas o tags por release (`v4-clientify`, etc.).

Hasta tener Git, el zip + este documento son la fuente de verdad de lo que funciona el 24/09/2026.

---

## 7. Resumen en una frase

> Los popups de Clientify solo funcionan en páginas HTML reales bajo `/forms/`; el contacto no puede depender del script araña en el navegador y debe hacer POST al endpoint `action/301900/` con los `name` mapeados, validación de teléfono y feedback visible, evitando `srcdoc` y cachés de JS obsoletas.
