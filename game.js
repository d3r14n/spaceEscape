function randomNum(n, m)
{
    return Math.floor((Math.random()*m)+n);
}

function startGame()
{

    /**/
    document.getElementById('creditos').style.display="none";
    document.getElementById('btnStart').style.display="none";
    document.getElementById('btnInstructions').style.display="none";
    /**/

    screen.start();

    gOver = false;

    score = new text("30px", "consolas", "white", 20, 40);
    if(localStorage.getItem('highScore') == null)
    {
        highScore = 1000;
    }
    else
    {
        highScore = localStorage.getItem('highScore');
    }

    stars = [];

    playerShip = new ship(30, "sprites/ship.png", 10, 300);
    playerBullets = [];

    enemyShips = [];
    enemyInterval = [];
    enemyReturn = [];
    enemyBullets = [];

    //playerLaser = [];
    playerLaser = new sound("sounds/playerShot.mp3");
    enemyLaser = new sound("sounds/enemyShot.mp3");
    explosionSound = new sound("sounds/explosion.mp3");
    backgroundMusic = new sound("sounds/the_pace_escape.mp3", true);
    backgroundMusic.play();

    timeForEnemies = 100;
    destroyedEnemies = 0;
    nextLevel = 500;
}

var screen =
{
    canvas : document.createElement("canvas"),
    start : function()
    {
        this.canvas.width = 1280;
        this.canvas.height = 600;
        this.canvas.style.cursor = "url(sprites/crosshair.png), pointer";
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.score = 0;
        this.interval = setInterval(updateGameArea, 1000/30);
        window.addEventListener('click', function (e)
        {
            if(!gOver)
            {
                if(e.pageX > playerShip.x+50)
                {
                    playerShip.shoot(e.pageX, e.pageY);
                }
            }
            else
            {
                startGame();
            }
        })
        window.addEventListener('keydown', function (e)
        {
            screen.keys = (screen.keys || []);
            screen.keys[e.keyCode] = true;
        })
        window.addEventListener('keyup', function (e)
        {
            screen.keys[e.keyCode] = false;
        })
    },
    clear: function()
    {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    gameOver: function()
    {
        playerShip.update();
        if(screen.score == highScore)
        {
            localStorage.setItem('highScore', screen.score)
        }
        over = new text("60px", "consolas", "white", 500, 300);
        eneDes = new text("40px", "consolas", "white", 450, 400);
        ctr = new text("15px", "consolas", "white", 590, 320);
        over.text="GAME OVER";
        eneDes.text="Enemies Destroyed: "+destroyedEnemies;
        ctr.text="Click to Restart";
        over.update();
        eneDes.update();
        ctr.update();
        backgroundMusic.stop();
        clearInterval(this.interval);
        gOver = true;
    }
}

function sound(src, loop=false)
{
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    if(loop)
    {
        this.sound.loop = true;
    }
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function()
    {
        this.sound.play();
    }
    this.stop = function()
    {
        this.sound.pause();
    }
}

function everyInterval(n)
{
    if((screen.frameNo/n)%1==0)
    {
        return true;
    }
    else
    {
        return false;
    }
}

function star()
{
    this.x = 1280;
    this.y = randomNum(0, 600);
    this.speedX = ((-1)*(randomNum(5, 20)));
    this.image = new Image();
    if(this.speedX > -10)
    {
        this.width = 3;
        this.height = 3;
        this.image.src = "sprites/farStar.png";
    }
    else
    {
        if(this.speedX >= -15)
        {
            this.width = 5;
            this.height = 5;
            this.image.src = "sprites/star.png";
        }
        else
        {
            this.width = 8;
            this.height = 8;
            this.image.src = "sprites/closeStar.png";
        }
    }
    this.update = function()
    {
        ctx = screen.context;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
    this.move = function()
    {
        this.x += this.speedX;
    }
}

function text(width, height, color, x, y)
{
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.update = function()
    {
        ctx = screen.context;
        ctx.font = this.width + " " + this.height;
        ctx.fillStyle = color;
        ctx.fillText(this.text, this.x, this.y);
    }
}

function ship(size, image, x, y)
{
    this.width = size;
    this.height = size;
    this.image = new Image();
    this.image.src = image;
    this.fire = new Image();
    this.fire.src = "";
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
    this.update = function()
    {
    	ctx = screen.context;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
	}
    this.crashWith = function(otherObj)
    {
        myLeft = this.x;
        myRight = this.x + this.width;
        myTop = this.y;
        myBottom = this.y + this.height;
        otherLeft = otherObj.x;
        otherRight = otherObj.x + otherObj.width;
        otherTop = otherObj.y;
        otherBottom = otherObj.y + otherObj.height;
        crash = true;
        if((otherLeft > myRight) || (otherTop > myBottom) || (otherBottom < myTop) || (otherRight < myLeft))
        {
            crash = false;
        }
        return crash;
    }
    this.shoot = function(mouseX, mouseY, image="sprites/playerBullet.png")
    {
        playerBullets.push(new bullet(10, 10, image, this.x+30, this.y+10, mouseX, mouseY));
        playerLaser.play();
    }
    this.keepItInScreen = function()
    {
        if(this.x<0)
        {
            this.x = 0;
        }
        else
        {
            if(this.x>1240)
            {
                this.x = 1240;
            }
            else
            {
                this.x += this.speedX;
            }
        }
        if(this.y<0)
        {
            this.y = 0;
        }
        else
        {
            if(this.y>570)
            {
                this.y = 570;
            }
            else
            {
                this.y += this.speedY;
            }
        }
    }
    this.drawFire = function()
    {
        this.fire.src = "sprites/blueFire.png";
        ctx.drawImage(this.fire, playerShip.x, playerShip.y, 10, 30);
    }
    this.destroy = function()
    {
        this.image.src = "sprites/explosion.png";
        explosionSound.stop();
        explosionSound.play();
        screen.gameOver();
    }
}

function enemy(size, image, x, y)
{
    this.width = size;
    this.height = size;
    this.image = new Image();
    this.image.src = image;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    if(y >= 300)
    {
        this.y = y - size;
    }
    else
    {
        this.y = y + size;
    }
    this.alive = true;
    this.forward = true;
    this.update = function()
    {
        if(this.x >= 0 && this.x <= 1280)
        {
            ctx = screen.context;
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }
    this.move = function()
    {
        this.x += this.speedX;
        this.y += this.speedY;
    }
    this.shoot = function(mouseX, mouseY, image="sprites/enemyBullet.png")
    {
        if(this.alive)
        {
            enemyBullets.push(new bullet(10, 10, image, this.x, this.y+(this.width/1.8), mouseX, mouseY, true));
            enemyLaser.play();
        }
    }
    this.destroy = function()
    {
        this.alive = false;
        this.image.src = "sprites/explosion.png";
        explosionSound.play();
        this.speedX = -30;
        this.forward = true;
    }
}

function bullet(width, height, image, x, y, mouseX, mouseY, enemy=false)
{
    this.width = width;
    this.height = height;
    this.image = new Image();
    this.image.src = image;
    this.x = x;
    this.y = y;
    if(enemy)
    {
        //this.speedX = (mouseX-x)/50;
        //this.speedY = (mouseY-y)/50;
        this.speedX = -15;
        this.speedY = (mouseY-y)/50;
    }
    else
    {
        //this.speedX = (mouseX-x)/30;
        //this.speedY = (mouseY-y)/30;
        this.speedX = 10;
        this.speedY = (mouseY-y)/30;
    }
    this.update = function()
    {
        if(this.x >= 0 && this.x <= 1280)
        {
            ctx = screen.context;
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }
    this.move = function()
    {
        this.x += this.speedX;
        this.y += this.speedY;
    }
    this.crashWith = function(otherObj)
    {
        myLeft = this.x;
        myRight = this.x + this.width;
        myTop = this.y;
        myBottom = this.y + this.height;
        otherLeft = otherObj.x;
        otherRight = otherObj.x + otherObj.width;
        otherTop = otherObj.y;
        otherBottom = otherObj.y + otherObj.height;
        crash = true;
        if((otherLeft > myRight) || (otherTop > myBottom) || (otherBottom < myTop) || (otherRight < myLeft))
        {
            crash = false;
        }
        return crash;
    }
    this.destroy = function()
    {
        this.x = -100;
        this.y = 0;
        this.speedX = 0;
        this.speedY = 0;
    }
}

function updateGameArea()
{
    screen.clear();
    screen.frameNo += 1;

    score.text="HIGHSCORE: " + highScore + "\tSCORE: " + screen.score;
    if(screen.score > highScore)
    {
        highScore = screen.score;
    }
    score.update();

    if(everyInterval(60))
    {
        screen.score += 10;
    }

    if(screen.score > nextLevel)
    {
        nextLevel += 500;
        timeForEnemies -= 5;
        if(timeForEnemies <= 1)
        {
            timeForEnemies = 1;
        }
    }

    if(everyInterval(2))
    {
        stars.push(new star());
    }
    for(i = 0; i < stars.length; i += 1)
    {
        stars[i].move();
        stars[i].update();
    }

    playerShip.speedX = 0;
    playerShip.speedY = 0;
    playerShip.image.src="sprites/ship.png";

    if (screen.keys && screen.keys[37] || screen.keys && screen.keys[65])
    {
        playerShip.speedX = -10;
    }
    if (screen.keys && screen.keys[39] || screen.keys && screen.keys[68])
    {
        playerShip.speedX = 15;
        playerShip.drawFire();
    }
    if (screen.keys && screen.keys[38] || screen.keys && screen.keys[87])
    {
        playerShip.speedY = -10;
        playerShip.image.src="sprites/shipUp.png";
    }
    if (screen.keys && screen.keys[40] || screen.keys && screen.keys[83])
    {
        playerShip.speedY = 10;
        playerShip.image.src="sprites/shipDown.png";
    }

    playerShip.keepItInScreen();
    playerShip.update();

    for(i = 0; i < playerBullets.length; i += 1)
    {
        for(x = 0; x < enemyShips.length; x += 1)
        {
            if(playerBullets[i].crashWith(enemyShips[x]))
            {
                if(enemyShips[x].alive)
                {
                    destroyedEnemies += 1;
                    screen.score += 100;
                }
            	enemyShips[x].destroy();
                playerBullets[i].destroy();
            }
        }
        playerBullets[i].move();
        playerBullets[i].update();
    }

    if(everyInterval(timeForEnemies))
    {
        size = randomNum(25, 81)
        enemyShips.push(new enemy(size, "sprites/enemy.png", 1280, randomNum(0, (600))));
        enemyInterval.push(50/size);
    }
    for(i = 0; i < enemyShips.length; i += 1)
    {
        if(playerShip.crashWith(enemyShips[i]) && enemyShips[i].alive)
        {
            playerShip.destroy();
        }
        if(enemyShips[i].alive)
        {
        	if(enemyShips[i].forward)
        	{
        	    enemyShips[i].x += -10;
        	    if(enemyShips[i].x <= 500)
        	    {
        	        enemyShips[i].forward = false;
        	    }
        	}
        	else
        	{
        	    enemyShips[i].x += 3;
        	    if(enemyShips[i].x >= 1200)
        	    {
        	        enemyShips[i].forward = true;
        	    }
        	}
    	}
    	else
    	{
    		enemyShips[i].move();
    	}
        if(everyInterval(enemyInterval[i]))
        {
            if(enemyShips[i].x-100 > playerShip.x)
            {
                enemyShips[i].shoot(playerShip.x, playerShip.y);
            }
        }
        enemyShips[i].update();
    }
    for(i = 0; i < enemyBullets.length; i += 1)
    {
        if(playerShip.crashWith(enemyBullets[i]))
        {
            playerShip.destroy();
        }
        enemyBullets[i].move();
        enemyBullets[i].update();
    }
}