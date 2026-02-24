const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/* ================= SCORE ELEMENT SAFE LOAD ================= */

let scoreText = document.getElementById("score");

if(!scoreText){
  scoreText = document.createElement("div");
  scoreText.id = "score";
  scoreText.style.position = "absolute";
  scoreText.style.top = "20px";
  scoreText.style.left = "20px";
  scoreText.style.color = "white";
  scoreText.style.fontSize = "22px";
  scoreText.style.fontWeight = "bold";
  document.body.appendChild(scoreText);
}

/* ================= AUDIO ================= */

const startBtn = document.getElementById("startBtn");
const introSound = document.getElementById("introSound");
const runSound = document.getElementById("runSound");
const deathSound = document.getElementById("deathSound");

/* ================= IMAGES ================= */

let bird = new Image();
bird.src = "https://i.ibb.co/mCkRgpQK/1000096379-removebg-preview.png";

let fireImg = new Image();
fireImg.src = "https://files.catbox.moe/n0np9l.png";

/* ================= SCORE SYSTEM ================= */

let highScore = localStorage.getItem("highScore");
highScore = highScore ? parseInt(highScore) : 0;

let score = 0;

/* ================= GAME STATE ================= */

let birdObj;
let pipes = [];

let gravity = 0.5;
let lift = -9;
let maxFall = 9;

let gameStarted = false;
let gameOver = false;
let introPlayed = false;

/* ================= INIT ================= */

function init(){

  birdObj = {
    x: canvas.width * 0.25,
    y: canvas.height / 2,
    width: 80,
    height: 80,
    velocity: 0
  };

  pipes = [];
  score = 0;
  gameOver = false;

  scoreText.innerText = "Score: 0 | High: " + highScore;
}

init();

/* ================= START BUTTON ================= */

startBtn.onclick = () => {

  if(!introPlayed){
    introPlayed = true;
    introSound.currentTime = 0;
    introSound.play().catch(()=>{});
    startBtn.innerText = "PLAY";
    return;
  }

  startGame();
};

function startGame(){

  init();

  gameStarted = true;
  gameOver = false;

  startBtn.style.display = "none";

  runSound.pause();
  runSound.currentTime = 0;
  runSound.loop = true;
  runSound.play().catch(()=>{});
}

/* ================= CONTROL ================= */

canvas.addEventListener("touchstart", jump, { passive:false });
canvas.addEventListener("mousedown", jump);

function jump(e){
  if(e) e.preventDefault();
  if(!gameStarted || gameOver) return;
  birdObj.velocity = lift;
}

/* ================= PIPE ================= */

function createPipe(){

  let gap = 280;
  let topHeight = Math.random()*(canvas.height-gap-200)+100;

  pipes.push({
    x: canvas.width + 100,
    width: 100,
    top: topHeight,
    bottom: topHeight + gap,
    counted:false
  });
}

/* ================= UPDATE ================= */

function update(){

  if(!gameStarted || gameOver) return;

  birdObj.velocity += gravity;
  if(birdObj.velocity > maxFall) birdObj.velocity = maxFall;

  birdObj.y += birdObj.velocity;

  if(birdObj.y + birdObj.height > canvas.height || birdObj.y < 0){
    endGame();
  }

  if(pipes.length==0 || pipes[pipes.length-1].x < canvas.width-350){
    createPipe();
  }

  pipes.forEach(pipe=>{
    pipe.x -= 3;

    if(!pipe.counted && pipe.x + pipe.width < birdObj.x){
      score++;
      pipe.counted = true;

      if(score > highScore){
        highScore = score;
        localStorage.setItem("highScore", highScore);
      }

      scoreText.innerText = "Score: " + score + " | High: " + highScore;
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

/* ================= DRAW ================= */

function draw(){

  ctx.clearRect(0,0,canvas.width,canvas.height);

  pipes.forEach(pipe=>{
    ctx.drawImage(fireImg, pipe.x, 0, pipe.width, pipe.top);
    ctx.drawImage(fireImg, pipe.x, pipe.bottom, pipe.width,
                  canvas.height - pipe.bottom);
  });

  ctx.save();
  let angle = birdObj.velocity * 0.05;
  ctx.translate(birdObj.x + birdObj.width/2, birdObj.y + birdObj.height/2);
  ctx.rotate(angle);
  ctx.drawImage(bird, -birdObj.width/2, -birdObj.height/2,
                birdObj.width, birdObj.height);
  ctx.restore();
}

/* ================= GAME OVER ================= */

function endGame(){

  if(gameOver) return;

  gameOver = true;
  gameStarted = false;

  runSound.pause();
  runSound.currentTime = 0;

  deathSound.currentTime = 0;
  deathSound.play().catch(()=>{});

  startBtn.innerText = "RESTART";
  startBtn.style.display = "block";
}

/* ================= LOOP ================= */

function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
