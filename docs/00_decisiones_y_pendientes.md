# Decisiones y pendientes

## A. Diferencias detectadas entre la Biblia y lo trabajado en clase (revisar antes de entregar)
Al leer la Biblia Transmedia (PDF del equipo) aparecieron datos que no coinciden con el texto de la sinopsis, el conflicto y la ficha de tratamiento escritos en las actividades de clase. En el juego se usó **lo que dice la Biblia**:

| Tema | Biblia | Texto de clase | Se usó en el juego |
|---|---|---|---|
| Marea | Cantante emergente de 19 años; su música es su forma de activismo | «joven pescadora que graba con el celular» | Cantante que graba para su próxima canción |
| Efraín | Abuelo de Marea, 68 años | «pescador» / «un pescador mayor» | Abuelo (Marea lo trata de «abuelo»; él le dice «mija») |
| Kevin | Mejor amigo y manager digital de Marea, 20 años | «creador de contenido que llega al pueblo» | Amigo y manager que empuja la viralidad |
| Capítulos | 6 capítulos: La Cachuda, Un día con Efraín, Laboratorio de la Dra. Ríos, La lancha sin luces, La decisión de Marea, Festival de la Cachuda | 6 acontecimientos de la ficha | Se mantuvieron los **acontecimientos de la ficha** (lo más reciente) |

Equivalencias de minijuegos entre ambas versiones:
- Biblia «Un día con Efraín» (ritmo: remar) → nivel 1B (remar al compás).
- Biblia «La lancha sin luces» (point-and-click nocturno con linterna) → nivel 2A (enfocar la lancha).
- Biblia «La decisión de Marea» (ritmo con el estribillo viral) → nivel 3 (editar el video viral).
- Biblia «Laboratorio de la Dra. Ríos» (memoria con tiburones marcados) → nivel 4 (seguir las rutas).
- Biblia «Festival de la Cachuda» → nivel 6 (comparsa).
- Nivel 5 «Armar la cachuda» no existe en la Biblia; es un puente entre la decisión y el festival.

**Sugerencia:** actualizar la sinopsis y la ficha de tratamiento para que digan lo mismo que la Biblia (Marea cantante, Efraín abuelo, Kevin amigo y manager).

## B. Decisiones abiertas
1. **Formato (decidido 2026-11-04):** el juego es **horizontal 16:9** y va en un recuadro dentro de la web principal del universo, que presenta personajes, capítulos, música y plataformas. Fondos en 1920×1080.
2. **Voces:** todas las líneas con voz (propuesto, porque el equipo lo pidió); el texto siempre se muestra.
3. **Letra y melodía** de «Marea Alta» (estribillo del nivel 6, línea `c6_04`).
4. **Diálogos:** las 43 líneas de `prompts_audio.md` son borrador; aprobar o ajustar antes de generar audio.
5. **Final:** sugerencia de cerrar con la invitación a la app «Guardianes de Marea» y al EP, que sí están en la Biblia como plataformas 2 y 3.
6. **Fondos en capas:** en el plan inicial se hablaba de capas; se simplificó a **un fondo por escena** más una capa de niebla, porque las IAs de imagen no entregan capas limpias.

## C. Orden de producción sugerido
1. Hojas de personaje (4) → elegir.
2. Poses de Marea y Efraín, fondos y objetos del nivel 1, UI mínima (logo, botones, panel de diálogo).
3. Voces y audio del nivel 0 y 1 (ver `prompts_audio.md`).
4. Probar el nivel 1 en un celular real y ajustar.
5. Repetir con los niveles 2 a 6 (Claude Code implementa los minijuegos mientras el equipo produce).
