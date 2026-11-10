/* Partituras del minijuego de ritmo (capítulo 6). Versión original: notas sobre los golpes de la canción (pulso de 101,5 BPM).
   Tiempos en segundos de la canción; carril 0, 1 o 2. Otras versiones probadas (percusión a 152 BPM, voz) quedaron en herramientas/. */
window.CHARTS = {
  tema: {
    audio: 'assets/audio/music/mus_tema',   // se busca .mp3 y luego .m4a
    offset: 0,   // si al jugar las notas se sienten adelantadas o atrasadas respecto a la música, ajustar aquí en segundos (por ejemplo 0.05 o -0.05)
    bpm: 101.5, start: 38.96, end: 76.8,   // de 0:39 (frase antes del coro) a 1:17 (fin del coro)
    notes: [[38.96,1],[39.551,1],[39.847,2],[40.142,2],[40.733,0],[41.325,0],[41.62,2],[41.916,1],[43.098,0],[43.393,2],[43.689,2],[44.28,0],[44.871,0],[45.462,2],[47.827,2],[48.418,0],[49.305,2],[49.6,2],[50.192,1],[51.374,1],[51.965,0],[52.26,0],[52.556,1],[52.852,0],[53.738,0],[54.329,2],[54.625,1],[54.921,0],[55.512,0],[56.103,2],[57.285,2],[57.876,0],[58.467,2],[59.059,0],[59.65,2],[60.241,2],[61.127,1],[62.014,1],[62.901,0],[63.492,0],[63.788,2],[64.379,2],[64.97,1],[66.152,1],[66.448,2],[67.334,0],[68.517,1],[69.108,1],[70.881,2],[71.472,2],[72.063,0],[72.359,0],[72.655,1],[73.246,1],[73.837,2],[74.724,0],[75.019,2],[75.61,2]],
  },
};
