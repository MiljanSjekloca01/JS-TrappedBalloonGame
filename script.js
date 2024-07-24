// Trenutno se igrica razlikuje za malo zbog razlicitih ekrana. ( balloon i trouglovi ) / po tezini
// Moj Screen {  window.innerWidth - 1536 ,  window.innerHeight - 738 } 

let fps = 60;

//Canvas
var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var verticalPadding = canvas.height / 10;
var ctx = canvas.getContext("2d");

// numberOfObstacles
var numberOfObstacles = 0;

//Trouglovi
const maximumGap = 450;
const minimumGap = 120;
let triangles = [];

// Buttons
const restartButton = document.getElementById("restart");
const level_1Button = document.getElementById("level_1");
const level_2Button = document.getElementById("level_2");

// Paragraphs
const instruction = document.getElementById("instruction");
const score = document.getElementById("score");
const level = document.getElementById("level");

//Ballon Max Y position and Minimum Y position before hit.
let ballonHeight = 130;
var balloonBottomHitPoint =  canvas.height / 2 - verticalPadding + 5;  // 
var balloonTopHitPoint = -(canvas.height / 2) + ballonHeight + verticalPadding;


function Entity(){
    Entity.prototype._count++;
    this.id = Entity.prototype._count;
    this.components = {};
    this.addComponent = function addComponent(component){
        this.components[component.name] = component;
        return this;
    }
    this.removeComponent = function removeComponent(component){
        delete this.components[component.name];
        return this;
    }
}

function Component(name,value){
    this.name = name;
    this.value = value;
}

(function init(){
    Entity.prototype._count = 0;
    }())


let entities = [];

// Balloon i njegove komponente
entities.push(new Entity()
.addComponent(new Component("position_x",200))
.addComponent(new Component("position_y",0))
.addComponent(new Component("velocity_x",5))
.addComponent(new Component("velocity_y",5))
.addComponent(new Component("pressedVelocityY",0.4))
.addComponent(new Component("releasedVelocityY",0.2))
.addComponent(new Component("heating",false))
.addComponent(new Component("gameStarted",false))
.addComponent(new Component("heatingSound",new Audio('heating.wav')))
.addComponent(new Component("passedTriangles", []))
);

// Prepreke(Trouglovi) i njegove komponente
function generateTriangleEntity(x, h, color, triangleWidth, random) {
    return new Entity()
        .addComponent(new Component("x", x))
        .addComponent(new Component("h", h))
        .addComponent(new Component("color", color))
        .addComponent(new Component("triangle_width", triangleWidth))
        .addComponent(new Component("random",random));
}

// Generisanje Entitiy componenti za trouglove.Sa x pozicijom,visinom,bojom...itd

function generateTriangles(numberOfTriangles) {
    let newEntities = []; 

    for (let i = 0; i < numberOfTriangles; i++) {
        let x;
        if (i == 0) {
            x = 600;
        }
        else {
            x = newEntities[i - 1].components.x.value + minimumGap + Math.floor(Math.random() * (maximumGap - minimumGap));
        }
        const h = 70 + Math.random() * 70; // dodati responsive za screen width height
        const triangleColors = ["#cbd6d8", "#bdc4c5", "#909697"];
        const color = triangleColors[Math.floor(Math.random() * 3)]; // 0 1 ili 2 boja
        const triangleWidth = 80;   // napraviti responsive na screen width 
        var random = Math.floor(Math.random() * 2);
        newEntities.push(generateTriangleEntity(x, h, color, triangleWidth, random));
    }
    entities = entities.concat(newEntities); 
}

// Crtanje trouglova u canvasu.
function drawTriangles() {
    entities.forEach(entity => {
    
    if(entity.components.x !== undefined && entity.components.random != undefined){
        
        const x = entity.components.x.value;
        const h = entity.components.h.value;
        const color = entity.components.color.value;
        const triangleWidth = entity.components.triangle_width.value;
        
        if (entity.components.random.value === 0) { //gornji trouglovi
            ctx.save();
            ctx.translate(x, -balloonBottomHitPoint + 5);
            ctx.beginPath();
            ctx.moveTo(-triangleWidth / 2, 0);
            ctx.lineTo(0, h * 2);
            ctx.lineTo(triangleWidth / 2, 0);
            ctx.closePath();
        } else {
            ctx.save();
            ctx.translate(x, balloonBottomHitPoint - 5);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(-triangleWidth / 2, 0);
            ctx.lineTo(0, -(h * 2));
            ctx.lineTo(triangleWidth / 2, 0);
            ctx.closePath();
        }
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    }
    });
}

// Napraviti responsive sa ekranom
// Crtanje Balona.
function drawBalloon(e){
    ctx.save();
    ctx.translate(e.components.position_x.value,e.components.position_y.value);
    //Korpa
    ctx.fillStyle = "#DB504A";
    ctx.fillRect(-20,-20 ,40, 5);
    ctx.fillStyle = "#EA9E8D";
    ctx.fillRect(-20 ,-15 ,40 ,10 );
    // Konopci
    ctx.strokeStyle = "#D62828";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-15,-15);
    ctx.lineTo(-15,-30);
    ctx.moveTo(15,-15);
    ctx.lineTo(15,-30);
    ctx.stroke();
    //Balon
    ctx.fillStyle = "#D62828";
    ctx.beginPath();
    ctx.moveTo(-30,-30);
    ctx.quadraticCurveTo(-50,-50,-50,-80);
    ctx.arc(0 , -80 , 50, Math.PI,0,false);
    ctx.quadraticCurveTo(50 ,-50 ,30 ,-30);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

// Linear Gradient background
function drawBackground(){

  ctx.clearRect(0,0,canvas.width,canvas.height);
  var gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#000000");
  gradient.addColorStop(0.9, "#444444");
  gradient.addColorStop(0, "#000000");
  ctx.fillStyle = gradient;
  ctx.fillRect( 0 , verticalPadding, canvas.width,canvas.height - verticalPadding * 2 ); 
  // 1. gornji lijevi ugao x    2. gornji lijevi ugao y 
  // 3. sirina   4. visina ( * 2 zato sto smo vec gore makli jedan vertical padding)
}

// funkcija za reset game prazni entitete i dodaje standardni pocetni entitet - balon.
function resetGame() {
    entities = []; 
    entities.push(new Entity()
        .addComponent(new Component("position_x", 200))
        .addComponent(new Component("position_y", 0))
        .addComponent(new Component("velocity_x", 5))
        .addComponent(new Component("velocity_y", 5))
        .addComponent(new Component("pressedVelocityY", 0.4))
        .addComponent(new Component("releasedVelocityY", 0.2))
        .addComponent(new Component("heating", false))
        .addComponent(new Component("gameStarted", false))
        .addComponent(new Component("heatingSound", new Audio('heating.wav')))
        .addComponent(new Component("passedTriangles", []))
    );

    numberOfObstacles = 0;
    
    score.textContent = "Obstacles passed: ";
    level.textContent = "";
    restartButton.textContent = "RESTART";
}


let systems = [];

var pressed = false;


userInputSystem = (function inputSystem(){
    // mousedown
    function LClickPressed(e){
        e.preventDefault();
        pressed = true;
    }
    // mouseup
    function LClickReleased(e){
        e.preventDefault();
        pressed = false;
    }

    function restartClicked(e){
        e.preventDefault();
        resetGame();
        restartButton.style.display = "none";
        level_1Button.style.display = "block";
        level_2Button.style.display = "block";
        instruction.style.display = "flex";
    }
    // Level Select
    function getObstacleNumber(e){
        e.preventDefault();
        const clickedButton = e.target.id;

        if(clickedButton == "level_1"){
            numberOfObstacles = 50;
            level.textContent = "Level 1 | Obstacles 50"
        }else if(clickedButton == "level_2"){
            numberOfObstacles = 100;
            level.textContent = "Level 2 | Obstacles 100"
        }

        level_1Button.style.display = "none";
        level_2Button.style.display = "none";
        instruction.style.display = "none";
        // generisanje prepreka(trouglova) na osnovu levela.
        generateTriangles(numberOfObstacles);
    }

    restartButton.addEventListener("click",restartClicked);
    window.addEventListener("mousedown",LClickPressed);
    window.addEventListener("mouseup",LClickReleased);
    level_1Button.addEventListener("click",getObstacleNumber);
    level_2Button.addEventListener("click",getObstacleNumber);

    return (entities) =>{
        let newEntities = [];
        for(e of entities){
            if(e.components.position_x !== undefined && e.components.position_y !== undefined){
                if(pressed){
                    e.components.heating.value = true;
                    e.components.gameStarted.value = true;
                }else if(pressed == false){
                    e.components.heating.value = false;
                }
            }  
        newEntities.push(e);
        }
        return newEntities;
    }
})()

// Graficki sistem 
// Sistem iscrtavanja
renderingSystem = (function graphicsSystem(){
    
    return(entities) =>{
        ctx.clearRect(0,0,canvas.width,canvas.height)
        ctx.save();
        drawBackground();
        for(e of entities){
            if(e.components.position_x !== undefined){
                ctx.translate(-e.components.position_x.value + canvas.width / 4, canvas.height / 2);
                drawBalloon(e);
                drawTriangles();
                ctx.restore();
            }
        }
        return entities;
    }
}());

// game sound (kada je igra pocela i kada se ballon podize i broj prepreka nije 0)
heatingSoundSystem = function(entities){ 
    let newEntities = [];

    for(e of entities){
        if(e.components.heating !== undefined && numberOfObstacles != 0){
            if(e.components.heating.value == true && e.components.gameStarted.value == true){
                e.components.heatingSound.value.volume = 0.1;
                e.components.heatingSound.value.play();
            }else {
                // zaustavljanje zvuka i povratak na pocetak
                e.components.heatingSound.value.pause();
                // Postavi vrijeme na početak kako bi se zvuk ponovno pokrenuo od početka
                e.components.heatingSound.value.currentTime = 0;
            }
        }
        newEntities.push(e);
    }
     
    return newEntities
}

// Kretanje balona (samo u slucaju kada igra pocne i generisan je broj prepreka)
physicsSystem = function(entities){
    let newEntities = [];

    
    for(e of entities){
        if( numberOfObstacles !== 0 && e.components.gameStarted !== undefined && e.components.gameStarted.value == true){
            if(e.components.heating.value == false){
                //Maksimalna brzina pada
                if(e.components.velocity_y.value < 5){
                    e.components.velocity_y.value += e.components.releasedVelocityY.value;
                }
            }else if(e.components.velocity_y.value > -8){ // Max brzina podizanja
                e.components.velocity_y.value -= e.components.pressedVelocityY.value;
            }
            // Pomjeranje balloon-a po x i y osi
            e.components.position_x.value += e.components.velocity_x.value;
            e.components.position_y.value += e.components.velocity_y.value;
            
            // Maksimalna i Minimalna Y pozicija balona.
            if(e.components.position_y.value >= balloonBottomHitPoint){
                e.components.position_y.value = balloonBottomHitPoint;
            }else if(e.components.position_y.value <= balloonTopHitPoint){
                e.components.position_y.value = balloonTopHitPoint;
                
            }
            newEntities.push(e);
        }
}
    return newEntities;
}

// Collision funkcije 

// Funkcija koja provjerava da li se tacka(point) nalazi unutar kruga sa zadatim centrom i radiusom
function pointInCircle(point, center, radius) {
    const dx = point.x - center.x;  
    const dy = point.y - center.y;
    return dx * dx + dy * dy < radius * radius;
}

// Funkcija koja provjerava da li se tacka nalazi unutar trougla koji je definisan sa 3 tacke
function pointInTriangle(pt, v1, v2, v3) {
    const d1 = sign(pt, v1, v2);
    const d2 = sign(pt, v2, v3);
    const d3 = sign(pt, v3, v1);
    const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
    return !(hasNeg && hasPos);
}
// Pomocna funkcija za pointInTriangle
function sign(p1, p2, p3) {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}


// Sistem za detekciju kolizicije centra balona i njegovog radiusa sa tackama u trouglu
// i korpe balona sa trouglovima.
collisionSystem = function (entities) {
    let newEntities = [];
    
    for (e of entities) {
        // Za Balon
        if (e.components.position_x !== undefined && e.components.position_y !== undefined) {
            // Centar Balloona,Radius,X i Y
            const balloonCenter = { x: e.components.position_x.value, y: e.components.position_y.value - 80 };
            const balloonRadius = 50;

            const bX = e.components.position_x.value
            const bY = e.components.position_y.value

            // Pozicija korpe balona ( njene ivice )
            const korpaRectangle = {
                bottomRight: { x: bX + 20, y: bY },
                bottomLeft: { x: bX - 20, y: bY },
                topRight: { x: bX + 20, y: bY - 15 },
                topLeft: { x: bX - 20, y: bY - 15 },
            };

            // Collision Balloona sa gornjom i donjom ivicom.

            if(bY === balloonBottomHitPoint || bY === balloonTopHitPoint){
                e.components.gameStarted = false;
                restartButton.style.display = "block";
            }
            
            for (triangle of entities) {
                
                if (triangle.components.x !== undefined && triangle.components.h !== undefined && triangle.components.random !== undefined) {
                    // X,Visina,UpsideIliDownside Atributi Trougla
                    const x = triangle.components.x.value;
                    const h = triangle.components.h.value;
                    const random = triangle.components.random.value;

                    let triangleLeft,triangleRight,triangleTop;
                    
                    if (random === 0) {  // Gornji trouglovi.
                        triangleLeft = { x: x - 20, y: -balloonBottomHitPoint + Math.abs(h)};
                        triangleRight = { x: x + 20, y: -balloonBottomHitPoint + Math.abs(h)};
                        triangleTop = { x: x, y: -balloonBottomHitPoint + Math.abs(h * 2)};
                        
                    } else {
                        triangleLeft = { x: x - 20, y: balloonBottomHitPoint - h};
                        triangleRight = { x: x + 20, y: balloonBottomHitPoint - h};
                        triangleTop = { x: x, y: balloonBottomHitPoint - h * 2};
                    }
                    // Provjera collisiona sa balonom i korpom.
                    if (
                        pointInCircle(triangleLeft, balloonCenter, balloonRadius) ||
                        pointInCircle(triangleRight, balloonCenter, balloonRadius) ||
                        pointInCircle(triangleTop, balloonCenter, balloonRadius) ||
                        pointInTriangle(korpaRectangle.bottomRight, triangleLeft, triangleRight, triangleTop) ||
                        pointInTriangle(korpaRectangle.bottomLeft, triangleLeft, triangleRight, triangleTop) ||
                        pointInTriangle(korpaRectangle.topRight, triangleLeft, triangleRight, triangleTop) ||
                        pointInTriangle(korpaRectangle.topLeft, triangleLeft, triangleRight, triangleTop)
                    ) {
                        //console.log("Collision detected!");
                        // U slucaju collisiona zaustavljanje igre i restarta
                        e.components.gameStarted.value = false;
                        restartButton.style.display = " block";
                    }
                    
                    // Dodavanje trougla u passedTriangles kad x ballona predje x trougla
                    if (bX >= triangleTop.x) {
                        if (!e.components.passedTriangles.value.includes(triangle)) {
                            e.components.passedTriangles.value.push(triangle);
                        }
                    }
                }
            }
        }

        newEntities.push(e);
    }
    return newEntities;
}


// Scoring system - Obstacless passed sistem pokazuje broj predjenih obstacle-a
scoringSystem = function (entities) {
    let newEntities = [];

    // Filtriranje entiteta koji ima passedTriangles
    const entitiesWithPassedTriangles = entities.filter(e => e.components.passedTriangles !== undefined);

    for (e of entitiesWithPassedTriangles) {
        const passedTriangles = e.components.passedTriangles.value;

        // Provjera da li su sve prepreke predjene
        if (numberOfObstacles !== 0 && passedTriangles.length === numberOfObstacles) {
            e.components.heatingSound.value.pause();
            e.components.gameStarted.value = false;
            resetGame();
            restartButton.textContent = "PLAY AGAIN"
            restartButton.style.display = "block";
            alert("Bravo, uspješno ste završili level");
        }

        // Dinamičko prikazivanje predjenih prepreka
        const totalPassedObstacles = entities.reduce((acc, entity) => {
                acc += entity.components.passedTriangles.value.length;
            return acc;
        }, 0);
        // passedTraingles.length
        score.textContent = "Obstacles passed: " + totalPassedObstacles;

        newEntities.push(e);
    }

    return newEntities;
};

systems.push(userInputSystem,collisionSystem,renderingSystem,heatingSoundSystem,physicsSystem,scoringSystem);

function game(entities,systems){
    for(s of systems){
        entities = s(Object.freeze(entities));
    }
}

setInterval(() => {
    game(entities,systems);
}, 1000 / fps)