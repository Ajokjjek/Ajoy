const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const startBtn = document.getElementById("startBtn");
const scoreText = document.getElementById("score");

const startSound = document.getElementById("startSound");
const runSound = document.getElementById("runSound");
const deathSound = document.getElementById("deathSound");

let bird = new Image();
bird.src = "https://i.ibb.co/mCkRgpQK/1000096379-removebg-preview.png";

let fireImg = new Image();
fireImg.src = "https://files.catbox.moe/n0np9l.png";

let birdObj;
let pipes = [];
let score = 0;

let gravity = 0.55;
let jumpPower = -10;

let gameStarted = false;
let gameOver = false;
let firstStart = true;

function init(){
  birdObj = {
    x:120,
    y:canvas.height/2,
    width:85,
    height:85,
    velocity:0
  };
  pipes = [];
  score = 0;
  scoreText.innerText = "0";
  gameOver = false;
}

init();

startBtn.onclick = ()=>{

  if(firstStart){
    firstStart = false;
    startSound.play().catch(()=>{});
  }

  runSound.loop = true;
  runSound.currentTime = 0;
  runSound.play().catch(()=>{});

  init();
  gameStarted = true;
  startBtn.style.display="none";
};

canvas.addEventListener("touchstart", jump, { passive:false });
canvas.addEventListener("click", jump);

function jump(e){
  if(e) e.preventDefault();
  if(!gameStarted || gameOver) return;
  birdObj.velocity = jumpPower;
}

function createPipe(){
  let gap = 260;
  let topHeight = Math.random()*(canvas.height-gap-200)+100;

  pipes.push({
    x:canvas.width,
    width:90,
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

  if(pipes.length==0 || pipes[pipes.length-1].x < canvas.width-300){
    createPipe();
  }

  pipes.forEach(pipe=>{
    pipe.x -= 3.5;

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

  pipes.forEach(pipe=>{

    // Top fire
    for(let y=0; y<pipe.top; y+=80){
      ctx.drawImage(fireImg, pipe.x, y, pipe.width, 100);
    }

    // Bottom fire
    for(let y=pipe.bottom; y<canvas.height; y+=80){
      ctx.drawImage(fireImg, pipe.x, y, pipe.width, 100);
    }

  });

  ctx.drawImage(bird,birdObj.x,birdObj.y,birdObj.width,birdObj.height);
}

function endGame(){
  if(gameOver) return;

  gameOver = true;
  gameStarted = false;

  runSound.pause();
  runSound.currentTime = 0;

  deathSound.currentTime = 0;
  deathSound.play().catch(()=>{});

  startBtn.innerText="RESTART";
  startBtn.style.display="block";
}

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
