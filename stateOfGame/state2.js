let fps = 60;
let ballonHeight = 130;
var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var verticalPadding = canvas.height / 10;
var ctx = canvas.getContext("2d");
let triangles = [];
const restartButton = document.getElementById("restart");

//mozda preimenovati u ballonMaxTopPoint 
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


function generateTriangles(numberOfTriangles) {
    let maximumGap = 500;
    const minimumGap = 120;

    for (let i = 0; i < numberOfTriangles; i++) {
        let x;
        if(i == 0){
            x = 600;
        }else{
            x = entities[i].components.x.value + minimumGap + Math.floor(Math.random() * (maximumGap - minimumGap));
        }
        
        const h = 60 + Math.random() * 80; 
        const triangleColors = ["#cbd6d8","#bdc4c5","#909697"];
        const color = triangleColors[Math.floor(Math.random() * 3)];
        const triangleWidth = 80;   
        var random = Math.floor(Math.random() * 2);
        entities.push(generateTriangleEntity(x, h, color, triangleWidth,random));
    }
}

// Poziv funkcije za generisanje 5 trouglova
generateTriangles(50);

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


function drawBalloon(e){
    // Probati responsive
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

function drawSky(){
  
  ctx.clearRect(0,0,canvas.width,canvas.height);
  var gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#000000");
  gradient.addColorStop(0.9, "#444444");
  gradient.addColorStop(0, "#000000");
  ctx.fillStyle = gradient;
  ctx.fillRect( 0 , verticalPadding, canvas.width,canvas.height - verticalPadding * 2 ); 
  // 1. gornji lijevi ugao x    2. gornji lijevi ugao y 
  // 2. sirina   3. visina ( * 2 zato sto smo vec gore makli jedan vertical paddgin)
}

function resetGame() {
    entities = []; // Očisti sve entitete
    // Dodaj ponovno balon i generiši trouglove
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
    );
    
    generateTriangles(50); // Ponovno generiši trouglove
}


let systems = [];

var pressed = false;

userInputSystem = (function inputSystem(){
    
    function LClickPressed(e){
        e.preventDefault();
        pressed = true;
    }

    function LClickReleased(e){
        e.preventDefault();
        pressed = false;
    }

    function restartClicked(e){
        e.preventDefault();
        resetGame();
        restartButton.style.display = "none";
    }

    restartButton.addEventListener("click",restartClicked);
    window.addEventListener("mousedown",LClickPressed);
    window.addEventListener("mouseup",LClickReleased);

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
        drawSky();
        for(e of entities){
            if(e.components.position_x !== undefined){
                ctx.translate(-e.components.position_x.value + canvas.width / 4, canvas.height / 2);
                drawBalloon(e);
                drawTriangles(e);
                ctx.restore();
                
            }
        }
        return entities;
    }
}());


heatingSoundSystem = function(entities){  // Moze i u physicsSystem al ako ne budem imao vise sistema ostaviti
    let newEntities = [];
    for(e of entities){
        if(e.components.heating !== undefined){
            if(e.components.heating.value == true && e.components.gameStarted.value == true){
                e.components.heatingSound.value.play();
            }else {
                // zaustavljanje zvuka i povratak na pocetak
                e.components.heatingSound.value.pause();
                e.components.heatingSound.value.currentTime = 0; // Postavi vrijeme na početak kako bi se zvuk ponovno pokrenuo od početka
            }
           
        }
        newEntities.push(e);
    }
    return newEntities
}

physicsSystem = function(entities){
    let newEntities = [];

    for(e of entities){
        
        if(e.components.gameStarted !== undefined && e.components.gameStarted.value == true){
            //Kretanje Balona
            if(e.components.heating.value == false){
                if(e.components.velocity_y.value < 5){
                    e.components.velocity_y.value += e.components.releasedVelocityY.value;
                }
            }else if(e.components.velocity_y.value > -8){
                e.components.velocity_y.value -= e.components.pressedVelocityY.value;
            }
            e.components.position_x.value += e.components.velocity_x.value;
            e.components.position_y.value += e.components.velocity_y.value;

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

function pointInCircle(point, center, radius) {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return dx * dx + dy * dy < radius * radius;
}

function pointInTriangle(pt, v1, v2, v3) {
    const d1 = sign(pt, v1, v2);
    const d2 = sign(pt, v2, v3);
    const d3 = sign(pt, v3, v1);
    const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
    return !(hasNeg && hasPos);
}

function sign(p1, p2, p3) {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
}



collisionSystem = function (entities) {
    let newEntities = [];
    for (e of entities) {
        // Za Balon
        if (e.components.position_x !== undefined && e.components.position_y !== undefined) {
            const balloonCenter = { x: e.components.position_x.value, y: e.components.position_y.value - 80 };
            const balloonRadius = 50;

            
            const bX = e.components.position_x.value
            const bY = e.components.position_y.value

            const korpaRectangle = {
                bottomRight: { x: bX + 20, y: bY },
                bottomLeft: { x: bX - 20, y: bY },
                topRight: { x: bX + 20, y: bY - 15 },
                topLeft: { x: bX - 20, y: bY - 15 },
            };

            // collision gornje i donje ivice

            if(bY === balloonBottomHitPoint || bY === balloonTopHitPoint){
                e.components.gameStarted = false;
            }
            
            // Za trougao
            for (triangle of entities) {

                if (triangle.components.x !== undefined && triangle.components.h !== undefined && triangle.components.random !== undefined) {
                    const x = triangle.components.x.value;
                    const h = triangle.components.h.value;
                    const random = triangle.components.random.value;

                    let triangleLeft,triangleRight,triangleTop;
        
                    // umjesto 300 napraviti responsive sa canvas.height
                    // Tacke u kojima se desava collision ako su unutar radiusa balona
                    if (random === 0) {
                        triangleLeft = { x: x - 20, y: -300 + Math.abs(h)};
                        triangleRight = { x: x + 20, y: -300 + Math.abs(h)};
                        triangleTop = { x: x, y: -300 + Math.abs(h * 2)};
                        
                    } else {
                        triangleLeft = { x: x - 20, y: 300 - h};
                        triangleRight = { x: x + 20, y: 300 - h};
                        triangleTop = { x: x, y: 300 - h * 2};
                    }
                    if (
                        pointInCircle(triangleLeft, balloonCenter, balloonRadius) ||
                        pointInCircle(triangleRight, balloonCenter, balloonRadius) ||
                        pointInCircle(triangleTop, balloonCenter, balloonRadius) ||
                        pointInTriangle(korpaRectangle.bottomRight, triangleLeft, triangleRight, triangleTop) ||
                        pointInTriangle(korpaRectangle.bottomLeft, triangleLeft, triangleRight, triangleTop) ||
                        pointInTriangle(korpaRectangle.topRight, triangleLeft, triangleRight, triangleTop) ||
                        pointInTriangle(korpaRectangle.topLeft, triangleLeft, triangleRight, triangleTop)
                    ) {
                        console.log("Collision detected!");
                        e.components.gameStarted.value = false;
                        restartButton.style.display = " block";
                    }
                }
            }
        }

        newEntities.push(e);
    }

    return newEntities;
}

obstacleAndScoreManagmentSystem = function(entities){

}

systems.push(userInputSystem,collisionSystem,renderingSystem,heatingSoundSystem,physicsSystem);

function game(entities,systems){
    for(s of systems){
        entities = s(Object.freeze(entities));
    }
}

setInterval(() => {
    game(entities,systems);
}, 1000 / fps)
