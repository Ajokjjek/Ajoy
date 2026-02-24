const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", ()=>{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

const startBtn = document.getElementById("startBtn");
const scoreText = document.getElementById("score");

const startSound = document.getElementById("startSound");
const runSound = document.getElementById("runSound");
const deathSound = document.getElementById("deathSound");

let bird = new Image();
bird.src = "https://i.ibb.co/mCkRgpQK/1000096379-removebg-preview.png";

let birdObj;
let pipes = [];
let score = 0;
let gravity = 0.6;
let gameStarted = false;
let gameOver = false;
let introPlayed = false;

function stopAll(){
  startSound.pause();
  runSound.pause();
  deathSound.pause();
  startSound.currentTime = 0;
  runSound.currentTime = 0;
  deathSound.currentTime = 0;
}

function init(){
  birdObj = {
    x:150,
    y:canvas.height/2,
    width:90,
    height:90,
    velocity:0
  };
  pipes = [];
  score = 0;
  scoreText.innerText = "0";
  gameOver = false;
}

init();

startBtn.addEventListener("click", ()=>{

  if(!introPlayed){
    introPlayed = true;
    stopAll();
    startSound.play().catch(()=>{});
    startBtn.innerText = "PLAY";
    return;
  }

  stopAll();
  init();
  gameStarted = true;

  runSound.loop = true;
  runSound.play().catch(()=>{});

  startBtn.style.display = "none";
});

canvas.addEventListener("click", ()=>{
  if(!gameStarted || gameOver) return;
  birdObj.velocity = -12;
});

function createPipe(){
  let gap = 280;
  let topHeight = Math.random()*(canvas.height-gap-150)+75;

  pipes.push({
    x:canvas.width,
    width:110,
    top:topHeight,
    bottom:topHeight+gap,
    counted:false
  });
}

function update(){
  if(!gameStarted || gameOver) return;

  birdObj.velocity += gravity;
  birdObj.y += birdObj.velocity;

  if(birdObj.y + birdObj.height > canvas.height || birdObj.y < 0){
    endGame();
  }

  if(pipes.length==0 || pipes[pipes.length-1].x < canvas.width-350){
    createPipe();
  }

  pipes.forEach(pipe=>{
    pipe.x -= 4;

    if(!pipe.counted && pipe.x + pipe.width < birdObj.x){
      score++;
      scoreText.innerText = score;
      pipe.counted = true;
    }

    if(
      birdObj.x < pipe.x + pipe.width &&
      birdObj.x + birdObj.width > pipe.x &&
      (birdObj.y < pipe.top ||
       birdObj.y + birdObj.height > pipe.bottom)
    ){
      endGame();
    }
  });

  pipes = pipes.filter(p=>p.x+p.width>0);
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle="green";
  pipes.forEach(pipe=>{
    ctx.fillRect(pipe.x,0,pipe.width,pipe.top);
    ctx.fillRect(pipe.x,pipe.bottom,pipe.width,
                 canvas.height-pipe.bottom);
  });

  ctx.drawImage(bird,
    birdObj.x,
    birdObj.y,
    birdObj.width,
    birdObj.height);
}

function endGame(){
  if(gameOver) return;

  gameOver = true;
  gameStarted = false;

  stopAll();
  deathSound.play().catch(()=>{});

  startBtn.innerText = "RESTART";
  startBtn.style.display = "block";
  introPlayed = false;
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
