# 🎈 Pegue y Monte CDE - App Web PWA (Ciudad del Este, Paraguay)

Aplicación Web Progresiva (PWA) **Mobile-First** desarrollada para **Pegue y Monte CDE** (Ciudad del Este, Alto Paraná, Paraguay), especializada en el alquiler de **38 kits de decoración para eventos ("Pegue y Monte" en 15 minutos)** y **equipos audiovisuales (sonido, luces y pantallas LED)**.

---

## 🚀 Cómo correr el proyecto en tu computadora

### 1. Instalar las dependencias
Abrí una terminal en la carpeta raíz del proyecto y ejecutá:

```bash
npm install
```

### 2. Iniciar el servidor de desarrollo
```bash
npm run dev
```

Luego abrí tu navegador en:
👉 **[http://localhost:3000](http://localhost:3000)**

### 3. Compilar para producción (opcional)
```bash
npm run build
npm start
```

---

## ✨ Funcionalidades Principales Incluidas

1. **Catálogo Completo con los 38 Kits Oficiales (`/lib/kits.ts`)**:
   - **Deco Infantil (1 al 14)**: Safari Baby, Princesa Rosa, Dino Party, Granja Feliz, Stitch Azul, Mickey Clásico, Minnie Rosa, Mariposas, Fútbol, Kuromi, Conejita, Osito Teddy, Plim Plim, Arcoíris.
   - **15 Años / Boda (15 al 22)**: 15 Dorado Lujo, 15 Rosa Gold, 15 Lila Elegante, Neón 15, Graduación, Cumple Adulto, Boda Boho, Boda Blanco.
   - **Bautismo / Baby (23 al 27)**: Bautismo Nena, Bautismo Nene, Baby Shower Nena, Baby Shower Nene, Primera Comunión.
   - **Empresa (28 al 30)**: Navidad, Empresa, Kit Mini Foto.
   - **Audiovisual (31 al 38)**: Kit Sonido Fiesta Casa, Kit Sonido Salón, Kit Luces Fiesta, Kit Luces Pro, Kit Cine en Casa, Kit Pantalla TV, Kit Pantalla LED, Kit Fiesta Total.
2. **Modo "Soy Decoradora" (`/mi-cuenta` y Header)**:
   - Switch interactivo que actualiza instantáneamente todos los precios a `precioDecoradora` y muestra el ahorro exacto (`Ahorrás Gs. XXX con membresía`).
3. **Detalle del Kit (`/kit/[id]`)**:
   - Galería interactiva con 5 fotos + Botón Play **"Ver video de montaje"**.
   - Listado de **Qué incluye** y **Qué NO incluye**.
   - **Calendario Interactivo**: Verde = Libre, Rojo = Ocupado (bloquea automáticamente fechas ya reservadas para impedir doble reserva).
   - **Upsell en vivo**: Checkbox *"Agregá Sonido Fiesta Casa por Gs. 350.000 más"* que actualiza el total y la seña del 50% en tiempo real.
4. **Reserva y Pago del 50% (`/reserva` y `/pago`)**:
   - Formulario con Nombre, CI, WhatsApp, Dirección de la fiesta en CDE y opción de **Retiro en local (Gratis)** o **Delivery CDE (Gs. 80.000)**.
   - Métodos de pago: **Transferencia / QR SIPAP** (con subida de comprobante), **Tarjeta Bancard** y **PIX**.
   - Generación automática de **Código QR de Retiro** con la librería `qrcode`, **Descargar PDF** y **Enviar por WhatsApp**.
5. **Panel Admin (`/admin`, `/admin/kits`, `/admin/reservas`)**:
   - Dashboard con 5 métricas clave: **Reservas hoy, Retiros, Devoluciones, Cobrado, Pendiente**.
   - **5 reservas de ejemplo precargadas** listas para probar.
   - Botones de inspección de devolución: **OK / Roto / Sucio**.
   - Cálculo automático de descuento de garantía por rotura según tarifario oficial:
     - Panel: `Gs. 450.000`
     - Cilindro: `Gs. 180.000`
     - Arco: `Gs. 350.000`
     - Parlante: `Gs. 2.000.000`
     - Proyector: `Gs. 3.500.000`
     - TV: `Gs. 3.500.000`
     - Micrófono: `Gs. 400.000`

---

## 🗄️ Configuración de Supabase (Opcional)

El proyecto funciona inmediatamente con persistencia local y datos precargados. Para conectarlo a tu proyecto de **Supabase**:
1. Ejecutá el archivo `/supabase/schema.sql` en el SQL Editor de Supabase.
2. Creá un archivo `.env.local` con:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```
