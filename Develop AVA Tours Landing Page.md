Actúa como un desarrollador Full-Stack experto en Astro, React y Tailwind CSS v4, especializado en landing pages de alto rendimiento y diseño UI/UX moderno.

Tu tarea es desarrollar una landing page completa para "AVA Tours", una mayorista de viajes en Puerto Rico. La página debe ser responsiva (mobile-first), visualmente inmersiva y optimizada para SEO mediante Astro. El resultado debe ser un **prototipo visual funcional con interactividad core**, priorizando la claridad del layout y la funcionalidad del mapa interactivo sobre manejo exhaustivo de casos extremos.

## RESTRICCIONES CRÍTICAS

- **NO incluyas formularios de contacto** — el cliente no los desea.
- **Astro como framework base** — para máxima velocidad y SEO.
- **Tailwind CSS v4** — solo clases utilitarias, cero CSS personalizado.
- **React únicamente donde sea necesario** — solo para componentes con estado (mapa interactivo).
- **MapLibre-GL integrado en componente React** — para renderizar pines de agencias afiliadas en Puerto Rico con interactividad.
- **Estructura de proyecto existente:** Usa la estructura Astro confirmada en el proyecto (`src/components/`, `src/pages/`, `package.json` con React, Tailwind v4, `@lucide/astro` para iconos, y `gsap` disponible para animaciones).

## SISTEMA DE DISEÑO

**Tipografía:** Sans-serif moderna y geométrica (`Inter`, `Montserrat` o `Plus Jakarta Sans`). Títulos con `font-extrabold` o `font-black`.

**Paleta de Colores (clases Tailwind):**
- **Primary (Rojo AVA):** `bg-red-600` / `#D31224` — botones, acentos, pines de mapa
- **Secondary (Negro Profundo):** `bg-neutral-950` / `#0A0A0A` — textos principales, fondos oscuros
- **Backgrounds:** Alternar `bg-white` y `bg-gray-50` para separar secciones
- **Textos:** `text-neutral-900` en fondos claros, `text-white` en fondos oscuros

## ESTRUCTURA Y CONTENIDO POR SECCIÓN

### A. HEADER Y NAVEGACIÓN (Sticky)
- Transparente sobre el Hero con línea inferior sutil (`border-white/20`); se vuelve blanco sólido con sombra al scroll
- Izquierda: Logo AVA Tours
- Centro: Enlaces (Inicio, Conócenos, Servicios, Agencias, Contacto)
- Derecha: Teléfono + íconos de redes sociales
- **Contacto:** Teléfono `+1-787-692-9896` | Facebook: `https://www.facebook.com/agenciasdeviajesaliadas` | Instagram: `https://www.instagram.com/a.v.a.tours/`

### B. HERO SECTION (Diseño Inmersivo)
- `min-h-screen`, `bg-cover bg-center` con overlay oscuro (`bg-black/50`)
- Contenido alineado a la izquierda
- **Pre-título (mayúsculas, tracking amplio):** "Mayorista de Viajes en Puerto Rico"
- **Título principal:** "AVA Tours" (`text-6xl` a `text-8xl`, `font-black`, `text-white`)
- **Botón CTA:** "Contáctanos +1-787-692-9896" (estilo píldora, fondo Rojo AVA, `text-white`, hover sutil)

### C. SECCIÓN: CONÓCENOS
- Grid 2 columnas en desktop (50/50): texto a la izquierda, imagen a la derecha (`rounded-2xl`)
- **Título:** "Conócenos"
- **Párrafo 1:** "En AVA Tours somos una corporación puertorriqueña de mayoristas de viajes, autorizada bajo la Licencia MVE-47 de la Compañía de Turismo de Puerto Rico. Desde el 2012 trabajamos de la mano con agencias de viajes, operadores turísticos, hoteles y proveedores internacionales para ofrecer paquetes vacacionales, cruceros, excursiones internacionales y experiencias de viaje diseñadas para todo tipo de viajeros."
- **Párrafo 2:** "A través de nuestra red de agencias afiliadas, brindamos acceso a tarifas competitivas, productos exclusivos y el respaldo de un equipo con amplia experiencia en la industria turística. Gracias a nuestras alianzas estratégicas con proveedores alrededor del mundo, ayudamos a que más personas disfruten de vacaciones inolvidables con la confianza y el servicio que nos distinguen."

### D. SECCIÓN: SERVICIOS
- Fondo `bg-gray-50`, título centrado
- Grid responsivo: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Cada tarjeta: ícono limpio (de `lucide-react`), fondo blanco, padding generoso, `rounded-lg`, sombra con hover (`hover:shadow-xl transition-all`)
- **Servicio 1 - Paquetes Vacacionales:** "Descubre una amplia selección de paquetes de viaje para los destinos más populares del mundo. Ofrecemos alternativas para vacaciones familiares, escapadas románticas, viajes en grupo y experiencias personalizadas adaptadas a diferentes presupuestos."
- **Servicio 2 - Cruceros Internacionales:** "Encuentra los mejores cruceros desde Puerto Rico y otras salidas internacionales con reconocidas líneas de cruceros. Disfruta itinerarios por el Caribe, Europa, Mediterráneo y muchos otros destinos."
- **Servicio 3 - Excursiones y Tours Internacionales:** "Explora ciudades, culturas y paisajes únicos mediante excursiones organizadas y tours internacionales cuidadosamente seleccionados para ofrecer experiencias memorables."
- **Servicio 4 - Ofertas de Viajes:** "Accede a promociones especiales en hoteles, paquetes vacacionales, cruceros y destinos internacionales. Nuestro equipo trabaja continuamente para ofrecer excelentes oportunidades durante todo el año."

### E. SECCIÓN: RED DE AGENCIAS ALIADAS (Interactiva con MapLibre)
- Layout panel dividido: Mapa (responsivo, lado derecho en desktop / abajo en mobile) centrado en Puerto Rico con pines rojos interactivos; tarjetas de agencias en sidebar/grid scrolleable (lado izquierdo en desktop / arriba en mobile)
- Al hacer clic en una tarjeta de agencia, el mapa se centra en esa ubicación con zoom apropiado
- Los pines del mapa son clickeables y muestran popups con nombre, teléfono y correo de la agencia
- **Llamado a la acción:** "¡Contáctate con tu agencia de viajes aliada! Nuestra red de agencias está preparada para ayudarte a seleccionar el destino ideal, aprovechar las mejores ofertas de viajes y planificar unas vacaciones inolvidables con el respaldo de AVA Tours."

**Datos de agencias por municipio:**
```
Aibonito: Maleta & Go | 787-735-3030 | maletapr@gmail.com
Bayamón: Fast Travel
Cabo Rojo: Boquerón Travel | 787-851-4751 | boquerontravelagency@yahoo.com
Caguas: 
  - Action Travel | 787-746-3880 | actiontl@actiontravelpr.net
  - Viajero Travel | 787-743-7775 | viajerocaguas@yahoo.com
  - Waves & Wings | 787-258-9588 | wavesnwings@yahoo.com
Fajardo: Coupi Travel | 787-860-1515 | coupi1@aol.com
Guayama: Monsy Tours | 787-864-0358 | monsytours@yahoo.com
Guaynabo: 
  - Beleo Travel | 787-487-0033 | premierbrand@gmail.com
  - Crece Travel | 787-453-6598 | info@crecetravel.com
Hatillo: 
  - Eddamar Travel | 787-898-2450 | eddamar@hotmail.com
  - Gala Travel | 787-879-1132 | sales@galatravel.net
  - Serrano Travel | 787-879-1855 | serranotravelpr@gmail.com
Humacao: Travel Smart | 787-852-1072 | travelsmart1@yahoo.com
Mayagüez: Agencias de Viajes Soler | 787-883-7474 | isoler@agenciassoler.com
Moca: Expert Travel | 787-877-3930 | ventas@expertravelpr.com
Ponce: Ponce Travel | 787-290-8080 | poncetravel@gmail.com
Sabana Grande: Mystic Travel | 787-873-2188 | mystictravelagency@gmail.com
Vega Alta: Viajando con Maritza Adorno | 787-408-1327
Yauco: De Tour Con Lulú | 787-375-3232 | detourconlulu@gmail.com
```

**Para el componente MapLibre:** Usa **coordenadas aproximadas del centro de cada municipio de Puerto Rico** (auto-calculadas). Los pines no requieren precisión exacta; ubicaciones centrales de municipios son suficientes para el prototipo visual.

### F. SECCIÓN: CONTACTO Y FOOTER
- Bloque minimalista oscuro (`bg-neutral-950 text-white`)
- Tipografía grande para métodos de contacto directos (sin formulario)
- **Título:** "Contacto: AVA Tours"
- **Horario:** "Lunes a Viernes, 8:30 a.m. – 5:30 p.m."
- **Teléfono:** `+1-787-692-9896` (enlace `tel:`)
- **Correo:** `avatoursmarketing@gmail.com` (enlace `mailto:`)
- **Redes Sociales:** Íconos grandes con links a Facebook e Instagram

## ENTREGABLES

Proporciona el código completo y bien organizado en forma de componentes separados:
- `src/components/Header.astro` — navegación sticky
- `src/components/Hero.astro` — hero section inmersivo
- `src/components/About.astro` — sección Conócenos
- `src/components/Services.astro` — grid de 4 servicios
- `src/components/AgenciesMap.jsx` — componente React con MapLibre (mapa interactivo + sidebar de agencias)
- `src/components/Footer.astro` — contacto y footer
- `src/pages/index.astro` — página principal que integra todos los componentes

Asegura que:
- El componente `AgenciesMap.jsx` esté exportado con `client:load` en `index.astro` para interactividad inmediata
- MapLibre renderice pines interactivos (marcadores rojos) para cada municipio con coordenadas de Puerto Rico (precisión municipal, no exacta)
- Al hacer clic en una tarjeta de agencia en el sidebar, el mapa se centre suavemente en esa ubicación
- Los pines sean clickeables y muestren popups con información de contacto de la agencia
- La página sea completamente responsiva: en mobile el mapa debe estar debajo del sidebar de agencias; en desktop lado a lado
- El header sea sticky, transparente inicialmente, y cambie a fondo blanco sólido con sombra al hacer scroll
- Toda la tipografía, espaciado y colores sigan exactamente el sistema de diseño especificado
- El código esté optimizado para SEO: etiquetas semánticas HTML, meta tags en `index.astro`, y estructura clara
- El código sea limpio, siga las mejores prácticas de Astro y React, y esté listo para el desarrollo inicial (sin manejo exhaustivo de casos extremos)