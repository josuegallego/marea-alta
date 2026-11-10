/* Datos de niveles. Cada nivel es una lista de pasos que el motor (engine.js) ejecuta en orden.
   Pasos: bg | show | hide | say | game | choice | fx | end
   Los textos y los audios de las líneas viven en data/dialogues.js (se generan desde docs/prompts_audio.md). */

const BG = n => `assets/bg/${n}.png`;

const LEVELS = [
  {
    id: 1, title: 'Amanecer en el muelle', fn: 'Entrada', ready: true,
    steps: [
      { t: 'bg', src: BG('bg_c1_muelle_amanecer'), label: 'Muelle al amanecer', music: 'mus_c1', amb: 'amb_c1_amanecer', fog: true },
      { t: 'show', id: 'marea', pose: 'neutral', side: 'left' },
      { t: 'say', line: 'c1_01' },
      { t: 'say', line: 'c1_02' },
      { t: 'hide', id: 'marea' },                 // el paisaje queda libre para grabarlo
      { t: 'game', name: 'record', opts: { need: 5, misses: 3, showMs: 1200, spots: [
        { x: 89, y: 49, label: 'Horizonte' }, { x: 17, y: 62, label: 'Manglar' }, { x: 84, y: 75, label: 'Botes' },
        { x: 66, y: 68, label: 'Red' }, { x: 48, y: 83, label: 'Muelle' }] } },
      { t: 'show', id: 'marea', pose: 'neutral', side: 'left' },
      { t: 'say', line: 'c1_03' },
      { t: 'show', id: 'efrain', pose: 'rowing', side: 'right' },
      { t: 'say', line: 'c1_04' },
      { t: 'say', line: 'c1_05' },
      { t: 'say', line: 'c1_06' },
      { t: 'say', line: 'c1_07' },
      { t: 'game', name: 'row', opts: { beats: 8, need: 5, period: 1500 } },
      { t: 'hide', id: 'efrain' },
      { t: 'show', id: 'marea', pose: 'alert', side: 'left' },
      { t: 'fx', name: 'dim', sfx: 'amb_motor_lejano' },
      { t: 'say', line: 'c1_08' },
      { t: 'end' },
    ],
  },
  {
    id: 2, title: 'La lancha sin luces', fn: 'Detonante', ready: true,
    steps: [
      { t: 'bg', src: BG('bg_c2_muelle_noche'), label: 'Muelle de noche', music: 'mus_c2', amb: 'amb_c2_noche', fog: true },
      { t: 'show', id: 'marea', pose: 'alert', side: 'left' },
      { t: 'say', line: 'c2_01' },
      { t: 'say', line: 'c2_02' },
      { t: 'hide', id: 'marea' },                 // el mar queda libre para seguir la lancha
      { t: 'game', name: 'focus', opts: { seconds: 15, size: 18,
        path: { cx: 69, ax: 19, cy: 51.5, ay: 3.5 },   // navega sobre el agua, a la derecha del muelle
        front: { src: BG('bg_c2_muelle_noche'),         // el poste y la red quedan delante de la lancha
          clip: 'polygon(59.2% 41.8%,60.2% 41.8%,60.4% 51%,65.8% 51%,66.3% 51.2%,67.4% 51.6%,65% 76.5%,62% 76%,60% 72%,59.2% 70%)' } } },
      { t: 'show', id: 'marea', pose: 'worried', side: 'left' },
      { t: 'say', line: 'c2_03' },
      { t: 'bg', src: BG('bg_c2_muelle_dia'), label: 'Muelle de día' },
      { t: 'show', id: 'marea', pose: 'worried', side: 'left' },
      { t: 'show', id: 'efrain', pose: 'serious', side: 'right' },
      { t: 'say', line: 'c2_04' },
      { t: 'say', line: 'c2_05' },
      { t: 'say', line: 'c2_06' },
      { t: 'choice', pick: 2, options: [
        { label: '¿Qué es la cachuda?', line: 'c2_07a' },
        { label: '¿Qué pasó con las redes?', line: 'c2_07b' },
        { label: '¿Quién va en esa lancha?', line: 'c2_07c' }] },
      { t: 'show', id: 'marea', pose: 'determined', side: 'left' },
      { t: 'say', line: 'c2_08' },
      { t: 'end' },
    ],
  },
  {
    id: 3, title: 'El video viral', fn: 'Complicación', ready: true,
    steps: [
      { t: 'bg', src: BG('bg_c3_redes'), label: 'Muelle al atardecer', music: 'mus_c3' },
      { t: 'show', id: 'kevin', pose: 'insisting', side: 'right' },
      { t: 'show', id: 'marea', pose: 'worried', side: 'left' },
      { t: 'say', line: 'c3_01' }, { t: 'say', line: 'c3_02' }, { t: 'say', line: 'c3_03' }, { t: 'say', line: 'c3_04' },
      { t: 'hide', id: 'kevin' }, { t: 'hide', id: 'marea' },
      /* SUGERENCIA: frases e imágenes 4 a 6 propuestas, pendientes de confirmar con el equipo */
      { t: 'game', name: 'edit', opts: { seconds: 7,      // segundos por ronda; si se acaba, elige Kevin
        images: [
          { src: 'edit_img_1', label: 'Amanecer', kind: 'real' }, { src: 'edit_img_2', label: 'Red vacía', kind: 'real' }, { src: 'edit_img_3', label: 'Lancha', kind: 'real' },
          { src: 'edit_img_4', label: 'Tiburón', kind: 'viral' }, { src: 'edit_img_5', label: 'Tormenta', kind: 'viral' }, { src: 'edit_img_6', label: 'Aletas', kind: 'viral' }],
        phrases: [
          { text: 'Así amanece mi pueblo.', kind: 'real' }, { text: 'Cada madrugada, menos peces.', kind: 'real' }, { text: 'Anoche pasó una lancha sin luces.', kind: 'real' },
          { text: '¡La mafia del mar llegó!', kind: 'viral' }, { text: '¡Te van a dejar sin mar!', kind: 'viral' }, { text: '¡Compártelo antes de que lo borren!', kind: 'viral' }] } },
      { t: 'show', id: 'marea', pose: 'worried', side: 'left' },
      { t: 'show', id: 'kevin', pose: 'phone', side: 'right' },
      { t: 'say', line: 'c3_05' },
      { t: 'show', id: 'kevin', pose: 'waiting', side: 'right' },
      { t: 'say', line: 'c3_06', when: s => !s.edit || s.edit.voz < 60 },   // si el video quedó auténtico, esta línea no aplica
      { t: 'say', line: 'c3_07' },
      { t: 'end' },
    ],
  },
  {
    id: 4, title: 'Los datos de la Dra. Ríos', fn: 'Revelación', ready: true,
    steps: [
      { t: 'bg', src: BG('bg_c4_estacion'), label: 'Estación de investigación', music: 'mus_c4', amb: 'amb_c4_estacion' },
      { t: 'show', id: 'marea', pose: 'neutral', side: 'left' },
      { t: 'show', id: 'rios', pose: 'tablet', side: 'right' },
      { t: 'say', line: 'c4_01' }, { t: 'say', line: 'c4_02' }, { t: 'say', line: 'c4_03' },
      { t: 'hide', id: 'marea' }, { t: 'hide', id: 'rios' },
      { t: 'bg', src: BG('bg_c4_mapa'), label: 'Mapa de rastreo' },
      { t: 'game', name: 'routes', opts: { line: 'c4_04',          // se dice con las rutas todavía en pantalla
        routes: [   // coordenadas en % del mapa; las rutas se cruzan en las tres manchas turquesa
          { color: '#FF6B4A', dots: [[8, 22], [22, 34], [38.5, 50], [55, 64.5], [67, 80]] },
          { color: '#FFD23F', dots: [[10, 84], [24, 68], [38.5, 50], [53.4, 34.5], [65, 15]] },
          { color: '#FFFFFF', dots: [[36, 12], [45, 22], [53.4, 34.5], [59, 50], [55, 64.5]] }],
        crossings: [[38.5, 50], [53.4, 34.5], [55, 64.5]] } },
      { t: 'bg', src: BG('bg_c4_estacion'), label: 'Estación de investigación' },
      { t: 'show', id: 'rios', pose: 'explaining', side: 'right' },
      { t: 'show', id: 'marea', pose: 'worried', side: 'left' },
      { t: 'say', line: 'c4_05' }, { t: 'say', line: 'c4_06' },
      { t: 'show', id: 'marea', pose: 'determined', side: 'left' },
      { t: 'say', line: 'c4_07' },
      { t: 'end' },
    ],
  },
  {
    id: 5, title: 'Armar la cachuda', fn: 'Desarrollo', ready: true,
    steps: [
      { t: 'bg', src: BG('bg_c5_taller'), label: 'Taller comunitario', music: 'mus_c5', amb: 'amb_c5_taller' },
      { t: 'show', id: 'marea', pose: 'determined', side: 'left' },
      { t: 'say', line: 'c5_01' },
      { t: 'show', id: 'efrain', pose: 'telling', side: 'right' },
      { t: 'say', line: 'c5_02' }, { t: 'say', line: 'c5_03' },
      { t: 'hide', id: 'marea' }, { t: 'hide', id: 'efrain' },
      { t: 'game', name: 'assemble', opts: { aspect: 2.5243, target: { x: 19, y: 13, w: 62 }, endLine: 'c5_06',
        pieces: [   // posiciones calculadas al cortar cachuda_final; tray = dónde empieza cada pieza (% del escenario)
          { id: 'body', tint: 'body', tray: [50, 79], x: 0.1908, y: 0.235, w: 0.58, h: 0.7573 },
          { id: 'tail', tint: 'fins', tray: [11, 72], x: 0.0031, y: 0.2427, w: 0.1877, h: 0.7398 },
          { id: 'fin_dorsal', tint: 'fins', tray: [27, 84], x: 0.4431, y: 0.033, w: 0.1454, h: 0.301 },
          { id: 'fin_pectoral', tint: 'fins', tray: [74, 85], x: 0.4954, y: 0.5922, w: 0.1423, h: 0.3689 },
          { id: 'head', tint: 'head', tray: [89, 70], x: 0.6554, y: 0.0078, w: 0.3415, h: 0.7204 },
        ],
        colors: [
          { name: 'Turquesa', css: '#2EC4B6', filter: 'hue-rotate(-38deg) saturate(1.1)' },
          { name: 'Naranja', css: '#FF9F1C', filter: 'hue-rotate(172deg) saturate(1.35)' },
          { name: 'Morado', css: '#8E5BE8', filter: 'hue-rotate(58deg) saturate(1.15)' }],
        helpers: [
          { img: 'villager_1', side: 'right', line: 'c5_04', ask: 'Elige la tela del cuerpo', tint: 'body', sfx: 'sfx_tela' },
          { img: 'villager_2', side: 'left', line: 'c5_05', ask: 'Elige el color de las aletas', tint: 'fins', sfx: 'sfx_pintura' },
          { img: 'villager_3', side: 'right', ask: 'Y la cabeza, ¿de qué color?', tint: 'head', sfx: 'sfx_pintura' }] } },
      { t: 'end' },
    ],
  },
  {
    id: 6, title: 'La comparsa', fn: 'Consecuencia', ready: true,
    steps: [
      { t: 'bg', src: BG('bg_c6_calle_noche'), label: 'Calle de la comparsa', music: 'mus_c6', amb: 'amb_c6_comparsa' },
      { t: 'show', id: 'marea', pose: 'singing', side: 'center' },
      { t: 'say', line: 'c6_01' }, { t: 'say', line: 'c6_02' },
      { t: 'show', id: 'marea', pose: 'singing', side: 'left' },
      { t: 'game', name: 'rhythm', opts: { chart: 'tema' } },   // estilo Guitar Hero con un fragmento de «Marea Alta»
      { t: 'say', line: 'c6_03' },
      /* c6_04: estribillo cantado, letra pendiente de definir por el equipo */
      { t: 'bg', src: BG('bg_c6_cielo'), label: 'Cielo estrellado', music: 'mus_tema' },
      { t: 'say', line: 'c6_05' },
      { t: 'hide', id: 'marea' },
      /* SUGERENCIA: la invitación a la app y al EP está pendiente de confirmar con el equipo */
      { t: 'game', name: 'finale', opts: { text: 'La historia de Marea sigue. Muy pronto: la app «Guardianes de Marea» y su EP.' } },
      { t: 'end' },
    ],
  },
];
