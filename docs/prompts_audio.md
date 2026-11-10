# Prompts de audio — Marea Alta (ElevenLabs)

Las líneas de diálogo de abajo son **BORRADOR** para que el equipo las apruebe o ajuste. No se inventó la letra del estribillo de la canción; queda pendiente.

Los nombres de modelo y funciones de ElevenLabs pueden cambiar según el plan: usar el modelo multilingüe disponible; si hay un modelo con etiquetas de emoción, se pueden usar para la dirección de actuación.

## 1. Voces (crear una vez, con Voice Design / descripción de voz)

### Marea  (`marea`)
```
Mujer joven colombiana de 19 años, voz cálida, clara y con musicalidad natural, acento neutro colombiano con calidez costera del Pacífico, energía curiosa y segura; cuando se emociona se vuelve más suave; habla como quien le cuenta algo importante a una amiga.
```

### Abuelo Efraín  (`efrain`)
```
Hombre colombiano de 68 años, voz grave, cálida y un poco rasposa, ritmo pausado, acento del Pacífico colombiano, tono de abuelo que cuenta historias; sabio, tranquilo, con un deje de cansancio.
```

### Dra. Valentina Ríos  (`rios`)
```
Mujer colombiana de 34 años, voz clara, serena y amable, dicción cuidada, acento neutro colombiano, tono de científica que explica con paciencia y entusiasmo contenido.
```

### Kevin  (`kevin`)
```
Joven colombiano de 20 años, voz enérgica, rápida y entusiasta, acento urbano colombiano, tono de mejor amigo y manager que insiste un poco.
```

### Vecina  (`villager_f`)
```
Mujer colombiana adulta, voz cálida y alegre, acento del Pacífico colombiano.
```

### Vecino  (`villager_m`)
```
Hombre colombiano adulto, voz amable y animada, acento del Pacífico colombiano.
```

Después de crear cada voz, guardarla con el mismo nombre y usarla para todas sus líneas. Probar primero con una línea corta y ajustar estabilidad/expresividad hasta que suene igual en todas.

## 2. Líneas de diálogo por nivel (texto → archivo)

Generar cada línea con la voz indicada, formato MP3, y guardar como `public/assets/audio/voice/<id>.mp3`. La columna «dirección» es la intención de la actuación (si el modelo no admite etiquetas, ajustarla con la puntuación y el ritmo del texto).


### Nivel 0

| ID | Voz | Texto | Dirección |
|---|---|---|---|
| `c0_01` | Marea | Hola, soy Marea. Bienvenida, bienvenido a mi pueblo. ¿Me acompañas? | cálida, sonriente |

### Nivel 1

| ID | Voz | Texto | Dirección |
|---|---|---|---|
| `c1_01` | Marea | Antes de que salga el sol, este muelle es solo mío. Bueno… mío y del mar. | íntima, calmada |
| `c1_02` | Marea | Ayúdame a grabar lo que veas. Toca lo que quieras guardar para mi próxima canción. | cercana, invitando |
| `c1_03` | Marea | Listo. Esto es lo que somos: madera, manglar y redes. | orgullosa, suave |
| `c1_04` | Abuelo Efraín | Buenos días, mija. El mar amaneció callado. | pausado, cálido |
| `c1_05` | Marea | Abuelo, ¿cómo le fue hoy? | tierna |
| `c1_06` | Abuelo Efraín | Poquito. Cada madrugada, menos. | cansado, sin quejarse |
| `c1_07` | Marea | Rememos con él. Toca cuando el remo cruce la marca. | animada |
| `c1_08` | Marea | ¿Oíste eso? Un motor… pero no veo nada en el mar. | baja la voz, alerta |

### Nivel 2

| ID | Voz | Texto | Dirección |
|---|---|---|---|
| `c2_01` | Marea | No pude dormir. Algo en el mar sonaba raro. | en voz baja, inquieta |
| `c2_02` | Marea | Ahí, ¡una lancha! Pero no tiene luces. Ayúdame a no perderla de vista. | susurrando, tensa |
| `c2_03` | Marea | Se fue. Alcancé a grabar algo, pero salió borroso. | decepcionada |
| `c2_04` | Marea | Abuelo, mire. Anoche pasó una lancha grande. Apagada. Sin luces. | preocupada |
| `c2_05` | Abuelo Efraín | Eso no es pesca de aquí, mija. | grave, serio |
| `c2_06` | Marea | Pregúntale algo a mi abuelo. ¿Qué quieres saber? | invitando |
| `c2_07a` | Abuelo Efraín | La cachuda es el tiburón martillo. Mi abuelo decía que cuando ella llegaba, el mar estaba sano. | evocador, lento |
| `c2_07b` | Abuelo Efraín | Se llevan los peces antes de que lleguemos. Y lo que queda, ya no alcanza. | amargo, tranquilo |
| `c2_07c` | Abuelo Efraín | Eso no lo sé, mija. Pero alguien compra lo que no se debería vender. | serio |
| `c2_08` | Marea | Voy a averiguar qué está pasando. | decidida |

### Nivel 3

| ID | Voz | Texto | Dirección |
|---|---|---|---|
| `c3_01` | Kevin | Marea, ese video de la lancha puede explotar. Hay que subirlo ya. | entusiasta, acelerado |
| `c3_02` | Marea | Kev, no sé… ni siquiera sabemos qué vimos. | dudosa |
| `c3_03` | Kevin | Mientras más fuerte el mensaje, más gente lo ve. Confía en mí. | persuasivo |
| `c3_04` | Marea | Ayúdame a editarlo. Elige imágenes y frases, pero rápido. | apurada |
| `c3_05` | Kevin | ¡Mira cómo suben las reacciones! | eufórico |
| `c3_06` | Marea | Sí… pero esto ya no suena a mí. | apagada, pensativa |
| `c3_07` | Marea | Necesito algo real. Alguien que sepa de verdad. | decidida, baja la voz |

### Nivel 4

| ID | Voz | Texto | Dirección |
|---|---|---|---|
| `c4_01` | Marea | Doctora Ríos, esto es lo que grabé. | respetuosa |
| `c4_02` | Dra. Valentina Ríos | Hola, Marea. Mira estos tiburones. Cada punto es un martillo con rastreador. | amable, didáctica |
| `c4_03` | Dra. Valentina Ríos | Ayúdame a seguir sus rutas. Une los puntos en orden. | clara |
| `c4_04` | Dra. Valentina Ríos | ¿Ves dónde se cortan? Ahí las áreas de crianza están desapareciendo. | seria, serena |
| `c4_05` | Marea | Entonces no era solo una sospecha. Es real. | impactada |
| `c4_06` | Dra. Valentina Ríos | Los datos no mienten, pero necesitan una voz. | firme y cálida |
| `c4_07` | Marea | Entonces voy a convocar a mi pueblo. | decidida |

### Nivel 5

| ID | Voz | Texto | Dirección |
|---|---|---|---|
| `c5_01` | Marea | Mi pueblo se va a reunir. Vamos a hacer una cachuda gigante para la comparsa. | ilusionada |
| `c5_02` | Abuelo Efraín | Yo me encargo de la estructura, mija. | orgulloso |
| `c5_03` | Marea | Ayúdame a armarla. Arrastra cada pieza a su lugar. | animada |
| `c5_04` | Vecina | Necesitamos telas para el cuerpo. | práctica, alegre |
| `c5_05` | Vecino | Yo pinto las aletas. ¿De qué color las quieres? | animado |
| `c5_06` | Marea | ¡Quedó hermosa! Ahora sí, a la calle. | emocionada |

### Nivel 6

| ID | Voz | Texto | Dirección |
|---|---|---|---|
| `c6_01` | Marea | Esta noche el mar nos escucha. | solemne, suave |
| `c6_02` | Marea | Sigue el tambor. Toca cuando el círculo llegue. | animada |
| `c6_03` | Marea | Cada voz que se suma hace la marea más alta. | emocionada |
| `c6_05` | Marea | Esto apenas empieza. Acompáñame. | cálida, invitando |

> Pendiente: `c6_04` — estribillo cantado de «Marea Alta». La letra y la melodía no están definidas; generar con ElevenLabs Music cuando el equipo las apruebe.

## 3. Efectos de sonido (Sound Effects)

| Archivo | Prompt | Duración |
|---|---|---|
| `sfx_tap.mp3` | Toque suave de botón de madera, corto, cálido | 0.5s |
| `sfx_rec.mp3` | Clic de cámara de celular con un pitido corto de grabación | 0.8s |
| `sfx_remo.mp3` | Remo entrando al agua con un golpe suave y gotas | 1.0s |
| `sfx_ok.mp3` | Campanita corta y alegre de acierto, tono cálido | 0.8s |
| `sfx_fail.mp3` | Tono bajo suave de error, no brusco | 0.6s |
| `sfx_reaccion.mp3` | Sonidos de notificaciones de redes sociales subiendo rápido, burbujeantes | 2.0s |
| `sfx_tela.mp3` | Roce de tela gruesa al colocar una pieza | 0.8s |
| `sfx_pintura.mp3` | Pincel mojado de pintura sobre papel | 1.0s |
| `sfx_tambor.mp3` | Golpe de bombo del Pacífico colombiano, profundo, con eco corto | 0.8s |
| `sfx_pieza_ok.mp3` | Pieza que encaja en su lugar con un clic de madera y un destello suave | 0.8s |

## 4. Ambientes (bucle)

| Archivo | Prompt | Duración |
|---|---|---|
| `amb_c1_amanecer.mp3` | Ambiente de muelle al amanecer en la costa del Pacífico: olas suaves, aves marinas lejanas, madera que cruje, silencio de mañana. Bucle sin cortes. | 30s |
| `amb_c2_noche.mp3` | Ambiente nocturno de mar en calma: olas lejanas, viento suave, grillos del manglar, sensación de bruma. Bucle sin cortes. | 30s |
| `amb_motor_lejano.mp3` | Motor de lancha lejano que se acerca poco a poco, apenas audible al principio y más grave al final, sobre ruido de mar. | 12s |
| `amb_c4_estacion.mp3` | Interior de estación de investigación: zumbido tenue de equipos, teclado lejano, olas por la ventana. | 30s |
| `amb_c5_taller.mp3` | Plaza comunitaria al atardecer: murmullo amable de gente trabajando, risas lejanas, golpes de martillo suaves, telas. | 30s |
| `amb_c6_comparsa.mp3` | Calle de pueblo de noche en una comparsa: multitud, pasos, antorchas que crepitan, tambores lejanos acercándose. | 30s |

## 5. Música (instrumental, bucle)

| Archivo | Prompt | Duración |
|---|---|---|
| `mus_tema.mp3` | Tema principal instrumental de un videojuego narrativo: música currulao del Pacífico colombiano con marimba de chonta, cununos, bombo y guasá, con textura contemporánea suave. Cálido, emotivo y esperanzador. Bucle de 60 segundos. | 60s |
| `mus_c1.mp3` | Versión calmada y íntima del tema: marimba de chonta suave y guasá muy bajo, amanecer tranquilo. Bucle de 60 s, sin voz. | 60s |
| `mus_c2.mp3` | Tensión baja: marimba grave y espaciada, pulso lento de bombo lejano, atmósfera nocturna y misteriosa. Bucle de 60 s, sin voz. | 60s |
| `mus_c3.mp3` | Pop contemporáneo con base de currulao acelerada, sensación de redes sociales y urgencia, más percusión electrónica ligera. Bucle de 60 s, sin voz. | 60s |
| `mus_c4.mp3` | Música instrumental científica y serena: marimba ligera, pulsos suaves y sonidos de agua, curiosidad y descubrimiento. Bucle de 60 s, sin voz. | 60s |
| `mus_c5.mp3` | Música comunitaria y festiva que va creciendo: marimba, cununos, palmas y guasá, trabajo colectivo y esperanza. Bucle de 60 s, sin voz. | 60s |
| `mus_c6.mp3` | Clímax de comparsa: bombo, cununos y marimba con coro de voces femeninas y masculinas sin letra, solemne y festivo. Bucle de 60 s. | 60s |
