# Marea Alta — contexto para Claude Code

Proyecto universitario de **Diseño Transmedia** (Colombia, español). La plataforma principal es una **experiencia web interactiva por capítulos**, hecha con HTML/CSS/JS sin dependencias. El equipo produce las imágenes (ChatGPT, Gemini/Google Flow) y el audio (ElevenLabs); este repositorio es el motor y la guía de producción.

## Reglas de trabajo
- Responder y escribir la interfaz en **español**.
- **No inventar** información importante sobre personajes, acontecimientos o reglas del universo. Lo que no esté en `docs/historia_base.md` se marca como *sugerencia* y se confirma con el equipo.
- Las líneas de diálogo en `docs/prompts_audio.md` y `public/data/dialogues.js` son **borrador**. No inventar la letra del estribillo (`c6_04` está pendiente).
- Priorizar lo que el equipo pueda producir con sus recursos (sin servidor, sin base de datos, sin librerías pesadas).
- Mantener el juego funcionando aunque falten assets: el motor muestra recuadros de relleno y no falla si falta un PNG o un MP3.
- Antes de dar algo por terminado, probarlo en un navegador (hay un ejemplo de prueba con Playwright en la sección «Pruebas»).

## Cómo correrlo
Abrir `public/index.html` con doble clic. **No necesita servidor**: todo se carga con `<script>`, `<img>` y `<audio>`. No usar `fetch` ni módulos ES (`type="module"`), porque fallan en `file://`. Mantenerlo así.

## Flujo de trabajo con el equipo
Al implementar cada nivel, entregar al final la **lista de assets que hay que pedir** (imágenes a ChatGPT/Gemini, audios a ElevenLabs): nombre de archivo exacto, ruta, tamaño, si va con fondo transparente y el prompt listo para copiar. Si aparece un asset nuevo, agregarlo también a `assets_manifest.csv` y a `docs/prompts_imagenes.md` o `docs/prompts_audio.md`.

Referencia de estilo: juegos de PBS Kids tipo «Alma on the Case» (narración que guía cada paso, objetivos grandes para tocar, diálogo siempre con voz).

## Arquitectura
Dos partes: la **web principal del universo** y el **juego**, que va dentro de ella en un recuadro (como los juegos de PBS Kids).
- `public/index.html` + `css/site.css` + `js/site.js` — web principal **estilo PBS Kids** (colores vivos, tarjetas con rebote, sonidos sintetizados al pasar el mouse): portada con los personajes, juego en recuadro (`<iframe src="juego.html">`), teaser de YouTube, capítulos (se generan desde `LEVELS` y muestran el progreso; un personaje se asoma al pasar el mouse), personajes (tarjetas que giran), música (disco), «El mundo de Marea» y plataformas. Los personajes reutilizan `assets/characters/`; las imágenes propias van en `assets/web/`.
- Teaser: YouTube `FxBuRe3eZr8`. En `file://` YouTube no deja incrustarlo, así que se abre en YouTube; publicado (http/https) se reproduce dentro de la página.
- `public/juego.html` — el juego, contenedor `#stage` **horizontal 16:9**. Se puede abrir solo o en el recuadro.
- Comunicación web ↔ juego con `postMessage`: la web envía `{type:'marea:play', level}` o `{type:'marea:map'}`; el juego responde `{type:'marea:progress', done:[...]}`.
- `public/js/levels.js` — **datos de los 6 niveles** como lista de pasos: `bg | show | hide | say | game | choice | fx | end`.
- `public/js/engine.js` — título, mapa, ejecución de niveles, diálogo con voz (texto + audio), audio de fondo, progreso en `localStorage`. Cada capítulo guarda el paso actual (`marea_resume`) y continúa ahí; el minijuego interrumpido vuelve a empezar.
- `public/js/synth.js` — efectos y ambientes generados con Web Audio; solo suenan si falta el archivo. Hechos: `sfx_tap/rec/remo/ok/fail`, `sfx_reaccion`, `sfx_tela`, `sfx_pintura`, `sfx_pieza_ok`, `sfx_tambor`, `sfx_guia`, coro (`addVoice`), `amb_motor_lejano`, `amb_c1_amanecer`, `amb_c2_noche` (solo mar, sin grillos). Las voces y la música sí necesitan archivos.
- `public/js/minigames.js` — minijuegos. Cada uno es `nombre(ctx, opts, done)`; al terminar llama `done()`.
- `public/data/dialogues.js` — todas las líneas (`window.DIALOGUES = { id: { who, name, text, audio } }`).
- `public/css/style.css` — estilos del juego. Las medidas usan `cqh` (porcentaje de la altura del escenario).

### Estado de implementación
| Nivel | Estado |
|---|---|
| 0 Título y mapa | hecho (con relleno si faltan imágenes) |
| 1 Amanecer en el muelle | **jugable**: `record` (puntos con tiempo, 3 fallos y reintento) y `row` (zona que cambia de lugar y ancho; mínimo 5 de 8 y reintento) |
| 2 La lancha sin luces | **jugable**: minijuego `focus` (el visor se dibuja con CSS; no necesita `ui_viewfinder`) |
| 3 El video viral | **jugable**: minijuego `edit` en versión «¿Kevin o Marea?»: 6 rondas (imagen y frase de 3 tomas), Marea propone lo real y Kevin lo llamativo; si se acaba el tiempo elige Kevin. Frases e imágenes 4-6 son *sugerencia*. Con 4 o más elecciones reales se omite `c3_06` |
| 4 Los datos de la Dra. Ríos | **jugable**: minijuego `routes`; `c4_04` se dice sobre el mapa con `ctx.say` |
| 5 Armar la cachuda | **jugable**: minijuego `assemble`. Las 5 piezas `cachuda_*` se cortan por código de `cachuda_final`; los colores se aplican con `hue-rotate` |
| 6 La comparsa | **jugable**: minijuego `rhythm` (estilo Guitar Hero, 3 carriles, con el fragmento 0:39–1:17 de `mus_tema` (frase antes del coro y coro); partitura en `data/charts.js`, versión original elegida por el equipo: notas sobre los golpes, pulso 101,5 BPM. Se probaron y descartaron una versión por percusión a 152 BPM y otra siguiendo la voz (sus herramientas están en `herramientas/`) |

### Contrato de assets
Cada asset tiene **nombre y ruta fijos** en `assets_manifest.csv` (columna `ruta`). El equipo guarda los archivos con ese nombre y el juego los toma solo.
- Personajes: `assets/characters/<personaje>_<pose>.png` (PNG transparente, 1024×1536)
- Fondos: `assets/bg/bg_*.png` (16:9, 1920×1080; se ajustan con `object-fit: cover`)
- Web principal: `assets/web/web_*.png`, más los videos en loop `web_clip_*.mp4` (sin sonido, se reproducen solo cuando están en pantalla)
- **PNG o JPG**: el juego y la web buscan primero `.png` y, si no existe, el mismo nombre en `.jpg` (útil para fondos e imágenes de Flow).
- **MP3 o M4A**: el audio se busca primero en `.mp3` y, si no existe, en `.m4a` (el tema principal es `mus_tema.m4a`).
- Portada de la web: video `assets/web/web_hero.mp4` (con `web_hero.jpg` como poster) + `web_grupo.png` (los cuatro juntos; zonas `.spot` por personaje con globo y enlace a su tarjeta). El logo crema lleva contorno azul en la portada y va en una píldora azul en la barra.
- **Personajes**: el equipo los genera con fondo verde. Se quita con el script de croma en Chrome (Playwright) y se recortan todos con el mismo encuadre: **de la cabeza al muslo** (las de cuerpo entero se cortan al 60 % de la altura). Los originales se guardan en `fuentes/` (fuera de `public/`, no se publican).
- **Fondo verde obligatorio**: el equipo no puede entregar PNG transparente. Todo prompt de algo recortado pide fondo verde croma `#00FF00`, y el verde se quita en el proyecto. Excepción: `fog_overlay` se pide sobre negro y se mezcla con `mix-blend-mode: screen`.
- Interfaz ilustrada: `ui_panel_dialogo` y `ui_boton_madera` se montan con `border-image`; iconos `ui_btn_sound/mute/map`, `ui_icon_lock/star`, `ui_hint_tap`, cortados de una sola hoja.
- Objetos: `assets/objects/*.png` · Interfaz: `assets/ui/*.png` · Efectos: `assets/fx/*.png`
- Voz: `assets/audio/voice/<id>.mp3` (el `<id>` es el de `dialogues.js`)
- Efectos de sonido: `assets/audio/sfx/sfx_*.mp3` · Ambientes: `assets/audio/amb/amb_*.mp3` · Música: `assets/audio/music/mus_*.mp3`

## Tareas pendientes (en este orden)
1. **Pulido**: pantalla de carga, precarga de assets, accesibilidad (alto contraste, tamaño de texto, subtítulos siempre visibles), pruebas en celular real, rendimiento.
2. **Publicación**: sitio estático (GitHub Pages o Netlify).

## Decisiones abiertas (confirmar con el equipo)
Ver `docs/00_decisiones_y_pendientes.md`.

## Pruebas
Ejemplo mínimo con Playwright: abrir `file:///.../public/index.html` (no hace falta servidor), pulsar `.big` (Empezar), avanzar los diálogos con `.dialog .next` (el primer clic completa el texto, el segundo avanza), tocar `.pin`, y comprobar que no hay `pageerror`.
