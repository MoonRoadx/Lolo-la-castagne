// Rodrigo Kulb
// Alex Kidd em p5.js - Lolo La Castagne Edition
// https://youtube.com/rodrigoKulb
// Direitos autorais da SEGA

const order = 8;
let N;
let total;
let ladoAnterior;
let path = [];
let backR = 1, backG = 0, backB = 252;

// sprites
let spritesheet,
    spritedata,
    spritedataP,
    spritesheetP,
    mapa1 = [],
    animation = [],
    inimigos = []

// personagem e game
let jump = 0,
    down = 0,
    life = 5,
    counter = 0,
    menu = 0,
    i = 0,
    b = 0,
    flechaMenu = 110,
    pisca = 1

// sons
let level1,
    punchSound,
    coinSound,
    jumpingSound,
    diedSound,
    crashSound,
    enemyDiedSound,
    crashglassSound,
    superforcaSound

// MENU START
let gameStarted = false;
let menuStartAnimation = 0;
let menuSelection = 0;
let lastKeyPressTime = 0;

function preload() {
    // sprites - CHEMINS CORRIGÉS
    spritedata = loadJSON('game/src/img/alex.json');
    spritesheet = loadImage('game/src/img/alex.png');
    spritedataP = loadJSON('game/src/img/fundo.json');
    spritesheetP = loadImage('game/src/img/fundo-01.png');
    menuImg = loadImage('game/src/img/menu.jpg');
    fontGame = loadFont('game/src/fonts/PixelGame.ttf');
    mapa1 = loadJSON('game/src/json/level-1.json');

    // sounds - CHEMINS CORRIGÉS
    soundFormats('mp3', 'wav');
    level1 = loadSound('game/src/sounds/level1.mp3');
    level2 = loadSound('game/src/sounds/level2.mp3');
    punchSound = loadSound('game/src/sounds/punch.wav');
    coinSound = loadSound('game/src/sounds/coins.wav');
    jumpingSound = loadSound('game/src/sounds/jumping1.wav');
    diedSound = createAudio('game/src/sounds/died.wav');
    crashSound = loadSound('game/src/sounds/crash.wav');
    crashglassSound = loadSound('game/src/sounds/crashglass.wav');
    enemyDiedSound = loadSound('game/src/sounds/crow.wav');
    superforcaSound = loadSound('game/src/sounds/superforca.wav');
}

function setup() {
    createCanvas(256, 224);
    let frames = spritedata.frames;
    for (let i = 0; i < frames.length; i++) {
        let pos = frames[i].position;
        let img = spritesheet.get(pos.x, pos.y, pos.w, pos.h);
        animation.push(img);
    }

    personagem = new Personagem(44, 53, animation);
    cenario = new Cenario(); 
    cenario.mapLevel = mapa1; 

    araras = [[personagem.bloco*5,personagem.bloco*18],
    [personagem.bloco*8,personagem.bloco*25],
    [personagem.bloco*4,personagem.bloco*33],
    [personagem.bloco*10,personagem.bloco*36],
    [personagem.bloco*5,personagem.bloco*45],
    [personagem.bloco*5,personagem.bloco*49],
    [personagem.bloco*5,personagem.bloco*54],
    [personagem.bloco*5,personagem.bloco*63],
    [personagem.bloco*5,personagem.bloco*73],
    [personagem.bloco*3,personagem.bloco*80],
    [personagem.bloco*2,personagem.bloco*90],
    [personagem.bloco*2,personagem.bloco*93]];
    for (var linha = 0; linha < araras.length; linha++) {
        inimigos[linha] = new Inimigos(araras[linha][0], araras[linha][1], animation);
    }

    resolucao();
    document.getElementById('container').style.display = 'none';
}

// inicia o som 
let settings = {
    vol: 0.2
}

function chamaSom(valorSom,level) {
    if (valorSom == true) {
        level1.stop()
        level2.stop()
        if(level == '1') level1.loop(1, 1, settings.vol);
        else if(level == '2') level2.loop(1, 1, settings.vol);
    }
    if (valorSom == false) {
        level1.stop()
    }
}

// ========================================
// MENU START
// ========================================

function drawStartMenu() {
    background(backR, backG, backB);
    
    menuStartAnimation++;
    
    push();
    textFont(fontGame);
    textAlign(CENTER);
    
    // Titre principal avec effet
    fill(255, 215, 0);
    textSize(36);
    text("LOLO", width/2, 50);
    
    fill(139, 69, 19);
    textSize(20);
    text("LA CASTAGNE", width/2, 75);
    
    // Sous-titre clignotant
    fill(255);
    textSize(8);
    if (menuStartAnimation % 60 < 30) {
        text("PRESS SPACE TO START", width/2, 95);
    }
    
    // Ligne de séparation
    stroke(255, 215, 0);
    line(40, 105, 216, 105);
    noStroke();
    
    // Options du menu
    textSize(12);
    
    // Option 1: Start Game
    if (menuSelection == 0) {
        fill(255, 255, 0);
        text("> START GAME <", width/2, 130);
    } else {
        fill(200);
        text("START GAME", width/2, 130);
    }
    
    // Option 2: Controls
    if (menuSelection == 1) {
        fill(255, 255, 0);
        text("> CONTROLS <", width/2, 148);
    } else {
        fill(200);
        text("CONTROLS", width/2, 148);
    }
    
    // Afficher les contrôles si sélectionné
    if (menuSelection == 1) {
        fill(255, 215, 0);
        textSize(8);
        textAlign(LEFT);
        
        text("KEYBOARD:", 30, 170);
        fill(255);
        text("Arrows : Move", 30, 180);
        text("SPACE  : Jump", 30, 188);
        text("A      : Punch", 30, 196);
        text("C      : Map", 30, 204);
        
        fill(255, 215, 0);
        text("TOUCH:", 145, 170);
        fill(255);
        text("Left  : Move", 145, 180);
        text("Right : Actions", 145, 188);
    }
    
    // Crédits en bas
    textSize(7);
    textAlign(CENTER);
    fill(150);
    text("BASED ON ALEX KIDD", width/2, height - 15);
    text("CRYPTO ADVENTURE", width/2, height - 7);
    
    pop();
}

function handleStartMenuInput() {
    const currentTime = millis();
    
    // Anti-spam des touches (200ms entre chaque pression)
    if (currentTime - lastKeyPressTime < 200) {
        return;
    }
    
    // Navigation avec flèches
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) { // W aussi
        if (menuSelection > 0) {
            menuSelection--;
            lastKeyPressTime = currentTime;
        }
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) { // S aussi
        if (menuSelection < 1) {
            menuSelection++;
            lastKeyPressTime = currentTime;
        }
    }
    
    // Validation avec Espace, Z ou Enter
    if (keyIsDown(32) || keyIsDown(90) || keyIsDown(13)) { // SPACE, Z ou ENTER
        if (menuSelection == 0) {
            gameStarted = true;
            let valorSom = true;
            chamaSom(valorSom, '1');
            lastKeyPressTime = currentTime;
        }
    }
    
    // Touch controls pour mobile
    if (pressZ || pressX) {
        if (menuSelection == 0) {
            gameStarted = true;
            let valorSom = true;
            chamaSom(valorSom, '1');
        }
    }
}

// ========================================
// DRAW PRINCIPAL
// ========================================

function draw() {
    let gameCanvas = document.getElementById('defaultCanvas0')
    const ctx = gameCanvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    
    // Si le jeu n'a pas commencé, afficher le menu
    if (!gameStarted) {
        drawStartMenu();
        handleStartMenuInput();
        return;
    }
    
    // CODE DU JEU
    background(backR, backG, backB);

    if (menu == 1) {
        background(menuImg);
        if (pisca <= 5) image(cenario.bg[35], flechaMenu, 165);
        fill(255);
        textSize(11);
        textFont(fontGame);
        textAlign(RIGHT);
        text(personagem.money, 70, 193);
        text(personagem.life, 70, 208);
        text(personagem.score, 170, 208);
        text("Score", 112, 208);
        
        if (keyIsDown(LEFT_ARROW)) {
            if (flechaMenu >= 110) flechaMenu -= 1;
        } else if (keyIsDown(RIGHT_ARROW)) {
            if (flechaMenu <= 220) flechaMenu += 1;
        }
        if (personagem.superForca == 1) {
            image(cenario.bg[19], 110, 178);
            if (flechaMenu <= 120) {
                pisca++;
                if (pisca >= 10) pisca = 0.5;
            } else pisca = 0.5;
        }
    }
    else if (menu == 2) {
        personagem.sairPause();
        let valorSom = false
        chamaSom(valorSom)
        cenario.pedra(personagem)
        personagem.parado()
    }
    else {
        cenario.pedra(personagem)
        personagem.normaliza(cenario, inimigos);
        for (let inimigo of inimigos) {
            inimigo.aparece(cenario, personagem);
        }
    }
}

function keyPressed() {
    // Pas d'inputs si le jeu n'a pas commencé
    if (!gameStarted) return;
    
    // teclas não funcionais enquanto há pausa
    if (menu != 2) {
        // soco
        if (key == 'x' || key == 'X') {
            personagem.soco(cenario);
            if (personagem.superForca == 2) {
                personagem.vaisuperForca();
            }
            if ((menu == 1) && (flechaMenu <= 690) && (personagem.superForca == 1)) {
                personagem.superForca = 2;
                console.log('superforca');
            }
        }

        // pulo normal
        if (key == 'z' || key == 'Z') {
            personagem.segueRight = 0;
            personagem.segueLeft = 0;
            personagem.pular();
            if ((menu == 1) && (flechaMenu <= 690) && (personagem.superForca == 1)) {
                personagem.superForca = 2;
                console.log('superforca');
            }
        }

        if(key == '1'){
            cenario.scrollPer = 1600;
            cenario.scrollHorizontal = 350;
        }

        if(key == '2'){
            cenario.scrollPer = 1600;
            cenario.scrollHorizontal = 0;
        }

        // abre o mapa
        if (key == 'c' || key == 'C') {
            if (menu == 0) menu = 1;
            else menu = 0;
        }
    }

    // movimentacao
    if (key == 'ArrowRight') {
        personagem.passo = 0;
        i = i + 2;
    }
    if (key == 'ArrowLeft') {
        personagem.passo = 0;
        i = i - 2;
    }
    if (key == 'ArrowDown') {
        b = b + 2;
    }
    if (key == 'ArrowUp') {
        b = b - 2;
    }
}

function keyReleased() {
    if (!gameStarted) return;
    
    // corrida 
    if (key == 'ArrowRight') {
        //personagem.passo = 0;
        //personagem.inercia(personagem.lado);
    }
    if (key == 'ArrowLeft') {
        //personagem.passo = 0;
        //personagem.inercia(personagem.lado);
    }

    // super soco
    if (key == 'z' || key == 'Z') {
        if (personagem.vy < 0) personagem.vy = 0;
    }
}

function resolucao() {
    let canvas = document.getElementById('defaultCanvas0');
    if (canvas) {
        const rel = 1.142857143;
        const height = window.innerHeight;
        const width = window.innerWidth;
       
        if (height > width) {
            console.log(width / rel);
            canvas.style.width = width + "px";
            canvas.style.height = (width / rel) + "px";
            canvas.style.imageRendering = 'pixelated';
        } else {
            console.log(height * rel);
            canvas.style.width = (height * rel) + "px";
            canvas.style.height = height + "px";
            canvas.style.imageRendering = 'pixelated';
        }
    }
}

// caso usuario saia da aba o jogo pausa
document.addEventListener('visibilitychange', () => { 
    //let state = document.visibilityState
    //if(state == 'hidden') menu = 2 & level1.pause()
    //if(state == 'visible') menu = 2
})
