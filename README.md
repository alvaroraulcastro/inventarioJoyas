# Inventario de joyas

Aplicación web para administrar un inventario de joyas. Los datos se guardan en Google Sheets y las fotos en una carpeta de Google Drive. Está pensada para desplegarse en Vercel.

## Qué incluye

- Acceso con usuario y contraseña fijos (configurados por variables de entorno)
- Alta, edición y baja de piezas
- Búsqueda y filtros por tipo y estado
- Subida de fotos a Google Drive
- Creación automática de la pestaña `Inventario` y de los encabezados si la hoja está vacía

## Requisitos

- Node.js 20 o superior
- Un proyecto en [Google Cloud](https://console.cloud.google.com/)
- La hoja de cálculo y la carpeta de Drive compartidas con la cuenta de servicio

## 1. Cuenta de servicio de Google

Sin este paso la app no puede leer ni escribir.

1. Crea un proyecto en Google Cloud.
2. Activa **Google Sheets API** y **Google Drive API**.
3. Crea una **cuenta de servicio** y descarga el JSON.
4. Comparte la [hoja de inventario](https://docs.google.com/spreadsheets/d/1PswT8PYMbdPsAkAlvBWmrhsQ4mSpvDctfAl1S6cJtkc/edit) con el email de la cuenta (`...@....iam.gserviceaccount.com`) como **Editor**.
5. Comparte la [carpeta de fotos](https://drive.google.com/drive/folders/17B8KwnchF5ne68xID0e5pJ2Octk2ZYJ4) con el mismo email, también como **Editor**.

El permiso “cualquiera con el enlace” no alcanza: la cuenta de servicio tiene su propia identidad.

## 2. Variables de entorno

Copia `.env.example` a `.env.local` y completa los valores:

```bash
AUTH_USERNAME=Erika
AUTH_PASSWORD=tu-contraseña
AUTH_SECRET=una-cadena-larga-y-aleatoria
GOOGLE_SHEET_ID=1PswT8PYMbdPsAkAlvBWmrhsQ4mSpvDctfAl1S6cJtkc
GOOGLE_DRIVE_FOLDER_ID=17B8KwnchF5ne68xID0e5pJ2Octk2ZYJ4
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-cuenta@proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

`GOOGLE_PRIVATE_KEY` se toma del JSON de la cuenta de servicio. Si la pegas en una sola línea, deja los `\n` escapados.

Genera `AUTH_SECRET` con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) e inicia sesión.

## 4. Deploy en Vercel

1. Importa este repositorio de GitHub en Vercel (framework: Next.js).
2. Carga las mismas variables de entorno del `.env.example`.
3. Despliega y prueba login, alta con foto, edición, filtros y que la fila/archivo aparezcan en Sheets y Drive.

## Columnas de la hoja `Inventario`

`id`, `codigo`, `nombre`, `tipo`, `material`, `kilates`, `peso_gramos`, `talla`, `piedras`, `precio_costo`, `precio_venta`, `estado`, `ubicacion`, `fecha_ingreso`, `foto_id`, `notas`, `actualizado_en`

## Seguridad

- No subas `.env`, `.env.local` ni el JSON de Google al repositorio.
- En producción, restringe la carpeta de Drive y compártela solo con la cuenta de servicio y tu usuario.
