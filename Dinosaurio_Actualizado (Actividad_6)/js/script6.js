// Inicializa el tiempo y la diferencia de tiempo entre los cuadros
let time = new Date();
let deltaTime = 0;

// Si el documento ya está cargado, inicializa el juego de inmediato. De lo contrario, espera hasta que el DOM esté completamente cargado.
if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(Init, 1);
} else {
    document.addEventListener("DOMContentLoaded", Init);
}

// Función de inicialización del juego
function Init() {
    time = new Date();
    Start(); // Inicializa los elementos del juego
    Loop(); // Comienza el ciclo principal del juego
}

// Función principal de actualización del juego
function Loop() {
    deltaTime = (new Date() - time) / 1000; // Calcula el tiempo transcurrido desde el último cuadro en segundos
    time = new Date(); // Actualiza el tiempo
    Update(); // Actualiza el estado del juego
    requestAnimationFrame(Loop); // Solicita el siguiente cuadro de animación
}

// Parámetros del juego
let sueloY = 22; // Posición Y del suelo
let velY = 0; // Velocidad vertical del dinosaurio
let impulso = 900; // Impulso del salto
let gravedad = 2500; // Fuerza de gravedad
let gravedadAdicional = 5000; // Gravedad adicional cuando se presiona la tecla de flecha abajo

let dinoPosX = 42; // Posición X del dinosaurio
let dinoPosY = sueloY; // Posición Y del dinosaurio

let sueloX = 0; // Posición X del suelo
let velEscenario = 1280 / 3; // Velocidad del fondo del juego
let gameVel = 1; // Velocidad del juego
let score = 0; // Puntuación actual

let parado = false; // Estado de si el juego está detenido
let saltando = false; // Estado de si el dinosaurio está saltando
let presionandoFlechaAbajo = false; // Estado de si la tecla de flecha abajo está presionada

// Variables para el control de obstáculos y nubes
let tiempoHastaObstaculo = 2; // Tiempo hasta la aparición del siguiente obstáculo
let tiempoObstaculoMin = 0.7; // Tiempo mínimo entre obstáculos
let tiempoObstaculoMax = 1.8; // Tiempo máximo entre obstáculos
let obstaculoPosY = 16; // Posición Y de los obstáculos
let obstaculos = []; // Array para almacenar los obstáculos

let tiempoHastaNube = 0.5; // Tiempo hasta la aparición de la siguiente nube
let tiempoNubeMin = 0.7; // Tiempo mínimo entre nubes
let tiempoNubeMax = 2.7; // Tiempo máximo entre nubes
let maxNubeY = 450; // Altura máxima de las nubes
let minNubeY = 100; // Altura mínima de las nubes
let nubes = []; // Array para almacenar las nubes
let velNube = 0.5; // Velocidad de las nubes

let tiempoHastaPajaro = 3; // Tiempo hasta la aparición del siguiente pájaro
let tiempoPajaroMin = 0.9; // Tiempo mínimo entre pájaros
let tiempoPajaroMax = 2.1; // Tiempo máximo entre pájaros
let maxPajaroY = 100; // Altura máxima de los pájaros
let minPajaroY = 25; // Altura mínima de los pájaros
let pajaros = []; // Array para almacenar los pájaros
let velPajaro = 0.7; // Velocidad de los pájaros
let pajarosActivos = false; // Para controlar si los pájaros están activos

// Elementos del DOM
let contenedor;
let dino;
let textoScore;
let suelo;
let gameOver;

// Función para inicializar los elementos del juego
function Start() {
    gameOver = document.querySelector(".game-over");
    suelo = document.querySelector(".suelo");
    contenedor = document.querySelector(".contenedor");
    textoScore = document.querySelector(".score");
    dino = document.querySelector(".dino");
    document.addEventListener("keydown", HandleKeyDown); // Añade un evento para detectar teclas presionadas
    document.addEventListener("keyup", HandleKeyUp); // Añade un evento para detectar cuando se suelta una tecla
}

// Actualiza el estado del juego
function Update() {
    if (parado) return; // Si el juego está parado, no hace nada

    MoverDinosaurio(); // Mueve el dinosaurio
    MoverSuelo(); // Mueve el suelo
    DecidirCrearObstaculos(); // Decide si se debe crear un nuevo obstáculo
    DecidirCrearNubes(); // Decide si se debe crear una nueva nube
    DecidirCrearPajaros(); // Decide si se debe crear un nuevo pájaro
    MoverPajaros(); // Mueve los pájaros
    MoverObstaculos(); // Mueve los obstáculos
    MoverNubes(); // Mueve las nubes
    DetectarColision(); // Detecta si hay una colisión
    DetectarColisionPajaro(); // Detecta si colisiona con un pájaro

    // Aplica la gravedad adicional si la tecla de flecha abajo está presionada y el dinosaurio está en el aire
    let gravedadAplicada = presionandoFlechaAbajo && saltando ? gravedad + gravedadAdicional : gravedad;
    velY -= gravedadAplicada * deltaTime; // Aplica la gravedad al dinosaurio
}

// Maneja el evento de presionar una tecla
function HandleKeyDown(ev) {
    if (ev.keyCode === 32) { // Barra espaciadora para saltar
        Saltar();
    } else if (ev.keyCode === 40) { // Flecha abajo para agacharse
        presionandoFlechaAbajo = true; // Marca que la flecha abajo está presionada
        Agacharse();
    }
}


// Maneja el evento de soltar una tecla
function HandleKeyUp(ev) {
    if (ev.keyCode === 40) { // Flecha abajo para dejar de agacharse
        presionandoFlechaAbajo = false; // Marca que la flecha abajo ya no está presionada
        Levantarse();
    }
}
// Hace que el dinosaurio salte
function Saltar() {
    if (dinoPosY === sueloY) { // Solo puede saltar si está en el suelo
        saltando = true;
        velY = impulso; // Asigna la velocidad de impulso
        dino.classList.remove("dino-corriendo"); // Cambia el estado del dinosaurio
        dino.classList.remove("dino-agachado"); 
    }
}
// Función para agacharse
function Agacharse() {
    if (!saltando && dinoPosY === sueloY) { // Solo puede agacharse si no está saltando y está en el suelo
        dino.classList.add("dino-agachado"); // Añade la clase que modifica la apariencia del dinosaurio
        dino.classList.remove("dino-corriendo"); // Deja de correr
    }
}

// Función para levantarse
function Levantarse() {
    dino.classList.remove("dino-agachado"); // Quita la clase de agachado
    dino.classList.add("dino-corriendo"); // Vuelve a correr
}

// Mueve al dinosaurio según su velocidad
function MoverDinosaurio() {
    dinoPosY += velY * deltaTime; // Actualiza la posición Y del dinosaurio
    if (dinoPosY < sueloY) {
        TocarSuelo(); // Verifica si el dinosaurio ha tocado el suelo
    }
    dino.style.bottom = dinoPosY + "px"; // Actualiza la posición en el DOM
}

// Coloca al dinosaurio de nuevo en el suelo y reinicia su velocidad vertical
function TocarSuelo() {
    dinoPosY = sueloY;
    velY = 0;
    if (saltando) {
        dino.classList.add("dino-corriendo"); // Reinicia la animación de correr
    }
    saltando = false;
}

// Mueve el suelo en función de la velocidad del escenario
function MoverSuelo() {
    sueloX += CalcularDesplazamiento(); // Actualiza la posición X del suelo
    suelo.style.left = -(sueloX % contenedor.clientWidth) + "px"; // Ajusta la posición del suelo en el DOM
}

// Calcula el desplazamiento del fondo
function CalcularDesplazamiento() {
    return velEscenario * deltaTime * gameVel;
}

// Cambia el estado del dinosaurio a estrellado y detiene el juego
function Estrellarse() {
    dino.classList.remove("dino-corriendo"); // Elimina la clase de corriendo
    dino.classList.remove("dino-agachado");  // Elimina la clase de agachado si está agachado
    dino.classList.add("dino-estrellado");   // Añade la clase de estrellado
    parado = true; // Detiene el juego
}

// Decide si debe crear un nuevo obstáculo
function DecidirCrearObstaculos() {
    tiempoHastaObstaculo -= deltaTime; // Reduce el tiempo hasta el próximo obstáculo
    if (tiempoHastaObstaculo <= 0) {
        CrearObstaculo();
    }
}

// Decide si debe crear una nueva nube
function DecidirCrearNubes() {
    tiempoHastaNube -= deltaTime; // Reduce el tiempo hasta la próxima nube
    if (tiempoHastaNube <= 0) {
        CrearNube();
    }
}

function DecidirCrearPajaros() {
    if (!pajarosActivos) return; // Solo crea pájaros si están activos

    tiempoHastaPajaro -= deltaTime;
    if (tiempoHastaPajaro <= 0) {
        CrearPajaro();
    }
}

// Crea un nuevo obstáculo y lo agrega al juego
function CrearObstaculo() {
    let obstaculo = document.createElement("div");
    contenedor.appendChild(obstaculo);
    obstaculo.classList.add("cactus");
    if (Math.random() > 0.5) obstaculo.classList.add("cactus2");
    obstaculo.posX = contenedor.clientWidth; // Posiciona el obstáculo fuera de la vista
    obstaculo.style.left = contenedor.clientWidth + "px";

    obstaculos.push(obstaculo);
    tiempoHastaObstaculo = tiempoObstaculoMin + Math.random() * (tiempoObstaculoMax - tiempoObstaculoMin) / gameVel; // Ajusta el tiempo hasta el próximo obstáculo
}

// Crea una nueva nube y la agrega al juego
function CrearNube() {
    let nube = document.createElement("div");
    contenedor.appendChild(nube);
    nube.classList.add("nube");
    nube.posX = contenedor.clientWidth; // Posiciona la nube fuera de la vista
    nube.style.left = contenedor.clientWidth + "px";
    nube.style.bottom = minNubeY + Math.random() * (maxNubeY - minNubeY) + "px"; // Posiciona la nube aleatoriamente

    nubes.push(nube);
    tiempoHastaNube = tiempoNubeMin + Math.random() * (tiempoNubeMax - tiempoNubeMin) / gameVel; // Ajusta el tiempo hasta la próxima nube
}

// Crea un nuevo pájaro y lo agrega al juego
function CrearPajaro() {
    let pajaro = document.createElement("div");
    contenedor.appendChild(pajaro);
    pajaro.classList.add("pajaro");
    pajaro.posX = contenedor.clientWidth; // Posiciona el pájaro fuera de la vista
    pajaro.style.left = contenedor.clientWidth + "px";
    pajaro.style.bottom = minPajaroY + Math.random() * (maxPajaroY - minPajaroY) + "px"; // Posiciona el pájaro aleatoriamente

    pajaros.push(pajaro);
    tiempoHastaPajaro = tiempoPajaroMin + Math.random() * (tiempoPajaroMax - tiempoPajaroMin) / gameVel; // Ajusta el tiempo hasta el próximo pájaro
}

// Mueve los obstáculos y elimina los que se han salido de la pantalla
function MoverObstaculos() {
    for (let i = obstaculos.length - 1; i >= 0; i--) {
        if (obstaculos[i].posX < -obstaculos[i].clientWidth) {
            obstaculos[i].parentNode.removeChild(obstaculos[i]); // Elimina el obstáculo del DOM
            obstaculos.splice(i, 1); // Elimina el obstáculo del array
            GanarPuntos(); // Aumenta la puntuación
        } else {
            obstaculos[i].posX -= CalcularDesplazamiento(); // Actualiza la posición X del obstáculo
            obstaculos[i].style.left = obstaculos[i].posX + "px"; // Ajusta la posición en el DOM
        }
    }
}

// Mueve las nubes y elimina las que se han salido de la pantalla
function MoverNubes() {
    for (let i = nubes.length - 1; i >= 0; i--) {
        if (nubes[i].posX < -nubes[i].clientWidth) {
            nubes[i].parentNode.removeChild(nubes[i]); // Elimina la nube del DOM
            nubes.splice(i, 1); // Elimina la nube del array
        } else {
            nubes[i].posX -= CalcularDesplazamiento() * velNube; // Actualiza la posición X de la nube
            nubes[i].style.left = nubes[i].posX + "px"; // Ajusta la posición en el DOM
        }
    }
}

// Mueve los pájaros y elimina los que se han salido de la pantalla
function MoverPajaros() {
    for (let i = pajaros.length - 1; i >= 0; i--) {
        if (pajaros[i].posX < -pajaros[i].clientWidth) {
            pajaros[i].parentNode.removeChild(pajaros[i]); // Elimina el pájaro del DOM
            pajaros.splice(i, 1); // Elimina el pájaro del array
        } else {
            pajaros[i].posX -= CalcularDesplazamiento() * velPajaro; // Actualiza la posición X del pájaro
            pajaros[i].style.left = pajaros[i].posX + "px"; // Ajusta la posición en el DOM
        }
    }
}

// Aumenta la puntuación y ajusta la velocidad y el fondo según el puntaje
function GanarPuntos() {
    score++;
    textoScore.innerText = score; // Actualiza el texto de la puntuación
    if (score === 20) {
        gameVel = 1.5;
        contenedor.classList.add("mediodia"); // Cambia el estilo del contenedor
    } else if (score === 40) {
        gameVel = 2;
        contenedor.classList.add("tarde"); // Cambia el estilo del contenedor
    } else if (score === 65) {
        gameVel = 3;
        pajarosActivos = true; // Activa la aparición de pájaros
        contenedor.classList.add("noche"); // Cambia el estilo del contenedor
    } else if (score === 100) {
        gameVel = 3.5;
        contenedor.classList.add("dia"); // Cambia el estilo del contenedor
    } else if (score === 140) {
        gameVel = 4;
        contenedor.classList.add("mediodia_2"); // Cambia el estilo del contenedor
    } else if (score === 190) {
        gameVel = 4.5;
        contenedor.classList.add("tarde_2"); // Cambia el estilo del contenedor
    } else if (score === 250) {
        gameVel = 5;
        contenedor.classList.add("noche_2"); // Cambia el estilo del contenedor
    }

    suelo.style.animationDuration = (3 / gameVel) + "s"; // Ajusta la duración de la animación del suelo
}

// Finaliza el juego y muestra el mensaje de "GAME OVER"
function GameOver() {
    Estrellarse(); // Cambia el estado del dinosaurio a estrellado
    gameOver.style.display = "block"; // Muestra el mensaje de Game Over
    // Elimina los listeners de las teclas para que no se pueda hacer nada más
    document.removeEventListener("keydown", HandleKeyDown);
    document.removeEventListener("keyup", HandleKeyUp);
}

// Detecta si hay colisiones entre el dinosaurio y los obstáculos
function DetectarColision() {
    for (let i = 0; i < obstaculos.length; i++) {
        if (obstaculos[i].posX > dinoPosX + dino.clientWidth) {
            break; // Si el obstáculo está completamente fuera de la vista, no hay colisión
        } else {
            if (IsCollision(dino, obstaculos[i], 10, 30, 15, 20)) {
                GameOver(); // Si hay colisión, termina el juego
            }
        }
    }
}

// Detecta si hay colisiones entre el dinosaurio y los pájaros
function DetectarColisionPajaro() {
    for (let i = 0; i < pajaros.length; i++) {
        if (pajaros[i].posX > dinoPosX + dino.clientWidth) {
            break; // Si el pájaro está completamente fuera de la vista, no hay colisión
        } else {
            if (IsCollision(dino, pajaros[i], 10, 30, 15, 20)) {
                GameOver(); // Si hay colisión, termina el juego
            }
        }
    }
}

// Función para detectar colisiones entre dos elementos
function IsCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
    let aRect = a.getBoundingClientRect(); // Obtiene las dimensiones del primer elemento
    let bRect = b.getBoundingClientRect(); // Obtiene las dimensiones del segundo elemento

    return !(
        ((aRect.top + aRect.height - paddingBottom) < (bRect.top)) ||
        (aRect.top + paddingTop > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width - paddingRight) < bRect.left) ||
        (aRect.left + paddingLeft > (bRect.left + bRect.width))
    ); // Verifica si hay una intersección entre los dos elementos
}