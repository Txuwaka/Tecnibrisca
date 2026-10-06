# TecniBrisca — Beta 1

Brisca local por parejas: tú, tu compañero y dos rivales controlados por el ordenador. Adaptación independiente de TecniTute, con el nuevo emblema TecniBrisca en cabecera, tapete e iconos, y los palos y figuras personalizados.

## Publicar

Sube el contenido del ZIP a un repositorio propio y activa GitHub Pages. `index.html` está en la raíz. No necesita compilación ni claves. Para conservar también TecniMus y TecniTute, usa repositorios o subcarpetas separados.

En local: `python3 -m http.server 8080` y abre `http://localhost:8080`. El acceso directo y la caché offline requieren HTTPS o localhost. Tras la primera carga completa, los recursos del juego se guardan para uso sin conexión. Las fuentes externas tienen alternativa local.

## Modalidad

Tres cartas por jugador, juego a derechas y robo empezando por quien ganó la baza. Puedes tirar cualquier carta, incluso cuando se acaba el monte. La pinta se roba al final. Se cuentan únicamente las cartas capturadas: 120 puntos en total; empate a 60, mano anulada. El ganador puede cambiar la pinta antes de robar: siete por una superior, dos por siete o inferior (salvo el propio dos). Sin cantes ni diez de últimas.

Referencia: https://www.nhfournier.es/como-jugar/brisca/

Decisiones de esta versión: parejas fijas; repartidor inicial aleatorio; partida a tres manos ganadas; cambio permitido solo al jugador que acaba de ganar la baza. No implementa señas ni intercambio de manos entre compañeros.

## Interfaz

Selecciona una carta y confirma con Jugar. Turnos individuales con pausas, bocadillos por jugador, robo animado desde el monte y recogida de bazas. La IA no consulta manos ajenas ni el orden del mazo al escoger carta. Los robos de otros jugadores se animan boca abajo.

Marcador, mano, triunfo y cantidad del monte visibles; historial de bazas y cambios, recuento al final, controles inferiores en móvil. Consejos inicialmente apagados; sonido y volumen configurables. Preferencias propias de TecniBrisca guardadas en el dispositivo. Movimiento reducido respetado. El audio se habilita al tocar o pulsar una tecla por las restricciones del navegador.

## Arquitectura y pruebas

`rules.js` contiene el motor independiente. Estados: jugar, baza completa, cambio opcional, robo individual, fin de mano y fin de partida. `brisca.js` controla presentación, animaciones y temporización. Reiniciar invalida operaciones pendientes.

```sh
node tests/rules.cjs
node tests/interface.cjs
```

Pruebas realizadas: 150 partidas reproducibles, 635 manos, 134 cambios y 6 empates. Se verifica conservación de 40 cartas únicas durante cada fase, total de 120 puntos, 28 robos por mano, orden de robo, pinta como última carta, libertad de elección, cambios legales, rechazo de acciones fuera de turno y rotación. Además, cinco manos mediante botones en una simulación DOM, persistencia de ajustes, renderizado numérico y de figuras, y reinicio durante una jugada pendiente.

Limitación: no hay navegador ejecutable disponible en el entorno. Las pruebas DOM no verifican visualmente móvil/escritorio ni la reproducción real de audio y animaciones; queda pendiente esa comprobación en dispositivos reales.
