// Prevent zoom
document.addEventListener("dblclick", e => e.preventDefault(), { passive:false });
document.addEventListener("touchmove", function(e){
  if(e.touches.length > 1){
    e.preventDefault();
  }
}, { passive:false });

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

let birdObj, pipes, score;
let gravity = 0.6;
let gameStarted = false;
let gameOver = false;
let firstStage = true;   // controls first click

function stopAllSounds(){
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
    width:100,
    height:100,
    velocity:0
  };
  pipes = [];
  score = 0;
  scoreText.innerText = "0";
  gameOver = false;
}

init();

startBtn.addEventListener("click", ()=>{

  // 🔵 FIRST CLICK → only play intro sound
  if(firstStage){
    firstStage = false;

    stopAllSounds();

    startSound.currentTime = 0;
    startSound.play().catch(()=>{});

    startBtn.innerText = "PLAY";
    return;
  }

  // 🟢 SECOND CLICK → start game
  stopAllSounds();

  gameStarted = true;
  init();

  runSound.loop = true;
  runSound.currentTime = 0;
  runSound.play().catch(()=>{});

  startBtn.style.display = "none";
});

canvas.addEventListener("click", jump);
canvas.addEventListener("touchstart", jump, { passive:false });

function jump(e){
  e.preventDefault();
  if(!gameStarted || gameOver) return;
  birdObj.velocity = -12;
}

function createPipe(){
  let gap = 320;
  let topHeight = Math.random()*(canvas.height-gap-200)+100;

  pipes.push({
    x:canvas.width,
    width:130,
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

  if(pipes.length==0 || pipes[pipes.length-1].x < canvas.width-400){
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

  stopAllSounds();

  deathSound.currentTime = 0;
  deathSound.play().catch(()=>{});

  startBtn.innerText = "RESTART";
  startBtn.style.display = "block";

  firstStage = true;   // reset system
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
