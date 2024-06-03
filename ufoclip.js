var canvas = document.getElementById('canvas');
var ctx = canvas.getContext("2d");

let objects = [];
let movespeed = 0;
let isAnimating = false;
let rectHeight;
let shoot = 0; let shoot_time = 1000;
let golds = [[getRandom(10,canvas.width-130), getRandom(435,510)]];
let goldWidth = 120; let goldHeight = 60; let gold_count = 1; let gold_index = 1;
let booms = []; let boom_count = 0; let boom_index = 0;
let times = 0; let timem = 0; let score = 0;
let lifes = 5;
let ifCreditOpen = false;
let ifGameStart = false;
let ifAttacked = false;
let nowMonsterIndex = 0;
var gametime;
let ufoPositonY = 20
var logo_animation;
var summon_gold = setInterval(SummonGold,3000);
var summon_boom = setInterval(SummonBoom,5000);

var bgmAudio = document.getElementById("bgm");
var buttonAudio = document.getElementById("button");
var goldAudio = document.getElementById("gold");
var boomAudio = document.getElementById("boom");
var lightAudio = document.getElementById("light");
var jellyAudio = document.getElementById("jelly");
var kurageAudio = document.getElementById("kurage");

window.addEventListener("keydown", function(e){
  if (e.keyCode == 32) {
    event.preventDefault(); // 移除預設行為
    if (lifes > 0){
      lightAudio.currentTime = 0;
      lightAudio.play();
    }
    if (!isAnimating){
      isAnimating = true;
      animationStartTime = Date.now();
      shoot = 0;
      shoot_time = 100;
      setTimeout(function(){
        isAnimating = true;
        animationStartTime = Date.now();
        shoot = 1;
        shoot_time = 1000;
      }, 100);
    }
    findObject("light").height = 480+20-ufoPositonY;
    findObject("light").y = 80-20+ufoPositonY;
  }

  switch (e.keyCode){
    case 39:
      movespeed = Math.abs(movespeed);
      break;
    case 37:
      movespeed = Math.abs(movespeed)*-1;
      break;
    case 68:
      movespeed = Math.abs(movespeed);
      break;
    case 65:
      movespeed = Math.abs(movespeed)*-1;
      break;
    case 83:
      if (!isAnimating){
        ufoPositonY = 135;
        findObject("character").y = ufoPositonY;
        findObject("clip").y = 60 +ufoPositonY;
      }
      break;
    case 87:
      if (!isAnimating){
        ufoPositonY = 20;
        findObject("character").y = ufoPositonY;
        findObject("clip").y = 60 + ufoPositonY;
      }
      break;
  }
});

function updateGameArea(){

  switch (lifes){
    case 5:
      document.getElementById("life").innerHTML = "❤️❤️❤️❤️❤️";
      break;
    case 4:
      document.getElementById("life").innerHTML = "❤️❤️❤️❤️🤍";
      break;
    case 3:
      document.getElementById("life").innerHTML = "❤️❤️❤️🤍🤍";
      break;
    case 2:
      document.getElementById("life").innerHTML = "❤️❤️🤍🤍🤍";
      break;
    case 1:
      document.getElementById("life").innerHTML = "❤️🤍🤍🤍🤍";
      break;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < objects.length; i++){
    let object = objects[i];
    if (!isAnimating){
      if (object.name=="light"){
        continue;
      }
    }
    ctx.drawImage(object.image, object.x, object.y, object.width, object.height);
  }

  if (isAnimating){
    const elapsedTime = Date.now() - animationStartTime;
    const animationProgress = Math.min(elapsedTime / shoot_time, 1);
    rectHeight = 50 + 430*Math.abs(shoot-animationProgress) + 20 - ufoPositonY;
    findObject("clip").height = rectHeight;

    if (animationProgress >= 1){
      isAnimating = false;
    }
  }
  else{
    if (movespeed > 0){
      movespeed = 3+score*0.1;
    }
    else{
      movespeed = -3-score*0.1;
    }
    findObject("character").x += movespeed*1.8;
    findObject("clip").x += movespeed*1.8;
    findObject("light").x += movespeed*1.8;
    if (findObject("character").x > canvas.width-160){
      movespeed = Math.abs(movespeed)*-1;
    }
    else if (findObject("character").x < 0){
      movespeed = Math.abs(movespeed);
    }
  }

  //限制金幣或炸彈數量
  if (gold_count > 6){
    deleteObject("gold");
    gold_count -= 1;
  }
  if (boom_count > 3){
    deleteObject("boom");
    boom_count -= 1;
  }

  //檢測吸到金幣或炸彈
  for(var i=0;i<gold_index;i++){
    if (checkCollision(findObject("gold"+i),findObject("clip"))){
      findObject("gold"+i).y = rectHeight+golds[i][1]-440;
      if (ufoPositonY === 20){
        findObject("gold"+i).width /= 1.01
        findObject("gold"+i).height /= 1.01;
      }
      else{
        findObject("gold"+i).width /= 1.03
        findObject("gold"+i).height /= 1.03;
      }
      if (findObject("gold"+i).x > findObject("clip").x-20){
        findObject("gold"+i).x -= 1;
      }
      else if (findObject("gold"+i).x < findObject("clip").x-20){
        findObject("gold"+i).x += 1;
      }
      break;
    }
    else if (checkCollision(findObject("boom"+i),findObject("clip"))){
      findObject("boom"+i).y = rectHeight+golds[i][1]-440;
      if (ufoPositonY === 20){
        findObject("boom"+i).width /= 1.01
        findObject("boom"+i).height /= 1.01;
      }
      else{
        findObject("boom"+i).width /= 1.03
        findObject("boom"+i).height /= 1.03;
      }
      if (findObject("boom"+i).x > findObject("clip").x-10){
        findObject("boom"+i).x -= 1;
      }
      else if (findObject("boom"+i).x < findObject("clip").x-10){
        findObject("boom"+i).x += 1;
      }
      break;
    }
  }
  for(var i=0;i<gold_index;i++){
    if (!isAnimating){
      if (checkCollision(findObject("gold"+i),findObject("character"))){
        if (lifes > 0){
          goldAudio.currentTime = 0;
          goldAudio.play();
        }
        score+=1;
        document.getElementById("score").innerHTML = score;
        gold_count -= 1;
        deleteObject("gold"+i);
        break;
      }
      else if (checkCollision(findObject("boom"+i),findObject("character"))){
        if (lifes > 0){
          boomAudio.currentTime = 0;
          boomAudio.play();
        }
        boom_count -= 1;
        deleteObject("boom"+i);
        lifes -= 1;
        break;
      }
    }
  }
  if (checkCollision(findObject("monster"),findObject("character"))){
    if (!ifAttacked){
      lifes -= 1;
      ifAttacked = true;
      if (lifes > 0){
        jellyAudio.currentTime = 0;
        jellyAudio.play()
      }
      setTimeout(function() {
        ifAttacked = false;
      }, 1000);
    }
  }

  if (lifes > 0){
    requestAnimationFrame(updateGameArea);
  }
  else{
    if (score >=localStorage.getItem("high_score")){
      localStorage.setItem('high_score', score);
    }
    document.getElementById("life").innerHTML = "🤍🤍🤍🤍🤍";
    document.getElementById("lastscore").innerHTML = score;
    document.getElementById("status").style.display = "flex";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    clearInterval(gametime);
    clearInterval(summon_gold);
    clearInterval(summon_boom);
    end_scene = new Image();
    end_scene.onload = function(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(end_scene, 0, 0, canvas.width, canvas.height);
    }
    end_scene.src = "yoru.png"
  }
}

function createObject(name, x, y, width, height, imageSrc){
  let object = {
    name: name,
    x: x,
    y: y,
    width: width,
    height: height,
    image: new Image()
  };
  object.image.src = imageSrc;
  if(name[0]+name[1]+name[2]+name[3] == "gold" || name[0]+name[1]+name[2]+name[3] == "boom"){
    objects.splice(objects.length-1,0,object);
  }
  else{
    objects.push(object);
  }
}

function deleteObject(object){
  for (var i = 0; i < objects.length; i++){
    if (objects[i].name.includes(object)){
      objects.splice(i, 1);
      break;
    }
  }
}

function findObject(object) {
  for (var i = 0; i < objects.length; i++){
    if (objects[i].name == object){
      return objects[i];
      break;
    }
  }
  return false;
}

function checkCollision(object1, object2){
  if (
    object1.x < object2.x + object2.width &&
    object1.x + object1.width > object2.x &&
    object1.y < object2.y + object2.height &&
    object1.y + object1.height > object2.y
  ){
    return true;
  }
  return false;
}

function GameTime(){
  times+=1;
  if (times == 60){
    timem+=1;
    times=0;
  }
  document.getElementById("time").innerHTML = timem+"分"+times+"秒";
}

function SummonGold(){
  golds.push([getRandom(10,canvas.width-130),getRandom(435,510)]);
  createObject("gold"+gold_index, golds[golds.length-1][0], golds[golds.length-1][1], goldWidth, goldHeight, "gold.png");
  gold_index+=1;
  gold_count+=1;
}

let movement;

function WarningHint(){
  let monsX = 30;
  let monsY = 25
  const randomP = getRandom(1, 2);
  const randomP2 = getRandom(1, 2);
  if (randomP === 1){
    monsY = 25;
  }
  else{
    monsY = 145;
  }
  if (randomP2 === 1){
    monsX = 30;
    createObject("monster", -150, monsY, 150, 100, "monster.png");
  }
  else{
    monsX = canvas.width - 50;
    createObject("monster", canvas.width + 50, monsY, 125, 100, "monster2.png");
  }
  kurageAudio.currentTime = 0;
  kurageAudio.play()
  createObject("warning", monsX, monsY, 15, 80, "warning.png");
  setTimeout(function(){
    SummonMonster(randomP2);
  }, 1000);
}

function SummonMonster(direct){
  let ifMove = true;
  let ifAlreadyBeClicked = false;
  deleteObject("warning");

  if (movement){
    clearInterval(movement);
  }

  movement = setInterval(frame, 10);

  canvas.addEventListener("click", function(event){
    var x = event.clientX - canvas.getBoundingClientRect().left;
    var y = event.clientY - canvas.getBoundingClientRect().top;

    if (x >= findObject("monster").x && x <= findObject("monster").x + findObject("monster").width && y >= findObject("monster").y && y <= findObject("monster").y + findObject("monster").height) {
      if (ifMove && !ifAlreadyBeClicked){
        clearInterval(movement);
        movement = null;
        ifMove = false;
        createObject("jelly", findObject("monster").x - 30, findObject("monster").y + 20, 220, 50, "jelly.png");
        setTimeout(function() {
          ifMove = true;
          ifAlreadyBeClicked = true;
          if (movement === null){
            movement = setInterval(frame, 10);
          }
          deleteObject("jelly");
        }, 1000)
      }
    }
  });

  function frame(){
    if (findObject("monster").x > canvas.width+150 || findObject("monster").x < -150) {
      clearInterval(movement);
      deleteObject("monster");
      const randomTime = getRandom(100, 1500);
      if (lifes > 0){
        setTimeout(WarningHint, randomTime);
      }
    }
    else {
      if (direct === 1){
        findObject("monster").x += 8;
      }
      else{
        if (ifMove){
          findObject("monster").x -= 8;
        }
      }
    }
  }
}


function SummonBoom(){
  booms.push([getRandom(10,canvas.width-130),getRandom(450,510)]);
  createObject("boom"+boom_index, booms[booms.length-1][0], booms[booms.length-1][1], 70, 70, "boom.png");
  boom_index+=1;
  boom_count+=1;
}

function Restart() {
  lifes = 5;
  objects = []; movespeed = 0;
  golds = [[getRandom(10,canvas.width-130), getRandom(435,510)]];
  gold_count = 1; gold_index = 1;
  booms = []; boom_count = 0; boom_index = 0;
  times = 0; timem = 0; score = 0;
  gametime = setInterval(GameTime,1000);
  summon_gold = setInterval(SummonGold,3000);
  summon_boom = setInterval(SummonBoom,5000);
  document.getElementById("score").style.display = score;
  document.getElementById("status").style.display = "none";
  document.location.reload();
}

function getRandom(min,max) {
    return Math.floor(Math.random()*(max-min+1))+min;
};

function startGame() {
  ifGameStart = true;
  bgmAudio.pause();
  createObject("bg", 0, 0, canvas.width, canvas.height, "background.jpg");
  createObject("light", (canvas.width+60)/2, 80, 100, 480, "light.png");
  createObject("clip", (canvas.width+140)/2, 80, 20, rectHeight, "");
  createObject("gold0", golds[0][0], golds[0][1], goldWidth, goldHeight, "gold.png");
  createObject("character", (canvas.width)/2, 20, 160, 100, "ayumufly.png");
  updateGameArea();
  setTimeout(WarningHint, 3000);
}

function start() {
  if (localStorage.getItem("high_score") === null){
    localStorage.setItem("high_score", 0);
  }
  processStartScene();
}

function processStartScene() {
  ifCreditOpen = false;
  let creditButtonStatus = false;
  var start_scene = new Image();
  start_scene.onload = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(start_scene, 0, 0, canvas.width, canvas.height);

    var buttonWidth = 150;
    var buttonHeight = 60;
    var padding = 100;
    var totalWidth = buttonWidth * 3 + padding * 2;
    var startX = (canvas.width - totalWidth) / 2;
    var startY = canvas.height - buttonHeight - 80;

    ctx.fillStyle = "#FFECB3";
    ctx.strokeStyle = "#FFA500";
    ctx.lineWidth = 7;
    ctx.fillRect(startX, startY, buttonWidth, buttonHeight);
    ctx.strokeRect(startX, startY, buttonWidth, buttonHeight);
    ctx.fillStyle = "#573000";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("開始遊戲", startX + buttonWidth / 2, startY + buttonHeight / 2 + 6);
    ctx.fillStyle = "#FFECB3";
    ctx.fillRect(startX + buttonWidth + padding, startY, buttonWidth, buttonHeight);
    ctx.strokeRect(startX + buttonWidth + padding, startY, buttonWidth, buttonHeight);
    ctx.fillStyle = "#573000";
    ctx.fillText("工作人員", startX + buttonWidth + padding + buttonWidth / 2, startY + buttonHeight / 2 + 6);
    ctx.fillStyle = "#FFECB3";
    ctx.fillRect(startX + 2 * (buttonWidth + padding), startY, buttonWidth, buttonHeight);
    ctx.strokeRect(startX + 2 * (buttonWidth + padding), startY, buttonWidth, buttonHeight);
    ctx.fillStyle = "#573000";
    ctx.fillText("離開遊戲", startX + 2 * (buttonWidth + padding) + buttonWidth / 2, startY + buttonHeight / 2 + 6);

    canvas.addEventListener("mousemove", function(event) {
      var x = event.clientX - canvas.getBoundingClientRect().left;
      var y = event.clientY - canvas.getBoundingClientRect().top;

      if (x >= startX && x <= startX + buttonWidth && y >= startY && y <= startY + buttonHeight) {
        drawButton(startX, startY, "開始遊戲", true);
      }
      else if (x >= startX + buttonWidth + padding && x <= startX + 2 * buttonWidth + padding && y >= startY && y <= startY + buttonHeight) {
        drawButton(startX + buttonWidth + padding, startY, "工作人員", true);
      }
      else if (x >= startX + 2 * (buttonWidth + padding) && x <= startX + 3 * buttonWidth + 2 * padding && y >= startY && y <= startY + buttonHeight) {
        drawButton(startX + 2 * (buttonWidth + padding), startY, "離開遊戲", true);
      }
      else {
        drawButton(startX, startY, "開始遊戲", false);
        drawButton(startX + buttonWidth + padding, startY, "工作人員", creditButtonStatus);
        drawButton(startX + 2 * (buttonWidth + padding), startY, "離開遊戲", false);
      }
    });

    if (!ifGameStart){
      canvas.addEventListener("click", function(event) {
        var x = event.clientX - canvas.getBoundingClientRect().left;
        var y = event.clientY - canvas.getBoundingClientRect().top;

        if (!ifGameStart){
          bgmAudio.play();
          if (x >= startX && x <= startX + buttonWidth && y >= startY && y <= startY + buttonHeight) {
            gametime = setInterval(GameTime,1000);
            ifGameStart = true;
            if (lifes > 0){
              buttonAudio.currentTime = 0;
              buttonAudio.play();
            }
            clearInterval(logo_animation);
            startGame();
          }
          else if (x >= startX + buttonWidth + padding && x <= startX + 2 * buttonWidth + padding && y >= startY && y <= startY + buttonHeight) {
            ifCreditOpen = !ifCreditOpen;
            if (lifes > 0){
              buttonAudio.currentTime = 0;
              buttonAudio.play();
            }
            if (ifCreditOpen){
              creditButtonStatus = true;
              var credits = new Image();
              credits.onload = function() {
                ctx.drawImage(credits, 62, 20, 740, 400);
              }
              credits.src = "credit.png"
            }
            else{
              creditButtonStatus = false;
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              var start_scene = new Image();
              start_scene.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(start_scene, 0, 0, canvas.width, canvas.height);
                var title_logo = new Image();
                title_logo.onload = function() {
                  ctx.drawImage(title_logo, 90, 50, 680, 260);
                }
                title_logo.src = "logo.png"
                drawButton(startX, startY, "開始遊戲", false);
                drawButton(startX + buttonWidth + padding, startY, "工作人員", false);
                drawButton(startX + 2 * (buttonWidth + padding), startY, "離開遊戲", false);
              }
              start_scene.src = "mainbg.png";
            }
          }
          else if (x >= startX + 2 * (buttonWidth + padding) && x <= startX + 3 * buttonWidth + 2 * padding && y >= startY && y <= startY + buttonHeight) {
            if (lifes > 0){
              buttonAudio.currentTime = 0;
              buttonAudio.play();
            }
            var input = prompt("你確定要離開嗎（要離開請輸入\"確定\"）", "");

            if (input === "確定") {
              window.alert("再見，我會想念你的。");
              window.alert("享受你接下來的生活吧");
              document.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
            }
            else {
              window.alert("好欸，看起來你是沒有要離開的意思，那就繼續玩吧");
            }
          }
        }
      });
    }

    function drawButton(x, y, text, isHover) {
      if (!ifGameStart){
        ctx.fillStyle = isHover ? "#FFD54F" : "#FFECB3";
        ctx.strokeStyle = "#FFA500";
        ctx.lineWidth = 3;
        ctx.fillRect(x, y, buttonWidth, buttonHeight);
        ctx.strokeRect(x, y, buttonWidth, buttonHeight);
        ctx.fillStyle = "#573000";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(text, x + buttonWidth / 2, y + buttonHeight / 2 + 9);
      }
    }

    if (!ifGameStart){
      var title_logo = new Image();
      title_logo.onload = function() {
        ctx.drawImage(title_logo, 90, 50, 685, 240);
        var scale = 1.0;
        var scaleStep = 0.0005;

        var fake_bg = new Image();
        fake_bg.src = "mainbg2.png"
        var credits = new Image();
        credits.src = "credit.png"

        function scaleTitleLogo() {
          ctx.clearRect(100, 50, 685 * scale, 240 * scale);
          ctx.drawImage(fake_bg, 0, 0, canvas.width, canvas.height*0.72);
          ctx.drawImage(title_logo, 430 - 340*scale, 180 - 130*scale, 685 * scale, 240 * scale);
          ctx.font = "30px Arial";
          ctx.textAlign = "center";
          ctx.fillStyle = "#000000";
          ctx.fillText("最高分："+localStorage.getItem("high_score"), canvas.width/2, 380);
          if (ifCreditOpen){
            ctx.drawImage(credits, 62, 20, 740, 400);
          }

          scale += scaleStep;
          if (scale >= 1.025 || scale <= 1) {
            scaleStep = -scaleStep;
          }
        }

        logo_animation = setInterval(scaleTitleLogo, 10);
      }
      title_logo.src = "logo.png"
    }

  };
  start_scene.src = "mainbg.png";
}
