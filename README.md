# Marea Alta — web interactiva

Experiencia web por capítulos con minijuegos y diálogos con voz.

## Correr
Abrir `public/index.html` con doble clic: es la web principal, con el juego en un recuadro. `public/juego.html` abre solo el juego. No necesita servidor ni instalar nada. El nivel 1 es jugable; los demás tienen el flujo y los diálogos y un minijuego «pendiente».

## Qué hay en cada carpeta
- `CLAUDE.md` — contexto y tareas para Claude Code (empezar por aquí).
- `docs/` — historia base, decisiones pendientes, prompts de imágenes y de audio.
- `assets_manifest.csv` — lista de los 71 assets de imagen y todo el audio, con su ruta, tamaño y prompt; marcar `estado` cuando esté listo.
- `public/` — el juego.

## Cómo agregar un asset
Guardar el archivo con el **nombre y ruta exactos** del manifiesto (por ejemplo `public/assets/characters/marea_neutral.png`). Recargar el navegador. No hay que tocar código.
