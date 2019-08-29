//--------------------- BÁSICO/ CANVAS ---------------------------------------
var width = 400, 
	height = 600,
	gLoop,
	points = 0,
	state = true,
	c = document.getElementById('c'), // Chama o canvas do HTML
	ctx = c.getContext('2d'); 
			
	//Define altura e largura do canvas
	c.width = width; 
	c.height = height;

//Constantes de movimentação
	var left = 37, right = 39; space = 32;

//Variáveis de movimentação
	var mvLeft = mvRight = false;


var clear = function(){
	ctx.fillStyle = '#5d0000'; //Cor de fundo do canvas
	ctx.clearRect(0, 0, width, height);
	ctx.beginPath();
	ctx.rect(0, 0, width, height);
	ctx.closePath();
	ctx.fill();
}

//----------------------------------- CIRCULOS --------------------------------------------------
//circulos desenhados atrás
var howManyCircles = 40, circles = []; 

for (var i = 0; i < howManyCircles; i++) 
	circles.push([Math.random() * width, Math.random() * height, Math.random() * 100, Math.random() / 2]); //Math.random para deixar os desenhos dos circulos em randomico

var DrawCircles = function(){ 
	for (var i = 0; i < howManyCircles; i++) { 
		ctx.fillStyle = 'rgba(230, 115, 0, ' + circles[i][3] + ')';
		ctx.beginPath();
		ctx.arc(circles[i][0], circles[i][1], circles[i][2], 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.fill();
	}
};

var MoveCircles = function(e){
	for (var i = 0; i < howManyCircles; i++) {
		if (circles[i][1] - circles[i][2] > height) {
			circles[i][0] = Math.random() * width;
			circles[i][2] = Math.random() * 100;
			circles[i][1] = 0 - circles[i][2];
			circles[i][3] = Math.random() / 2;
		}
		else {
			circles[i][1] += e;
		}
	}
};

//----------------------------------- PERSONAGEM ---------------------------------
var player = new (function(){
	var that = this;
	that.image = new Image();

	that.image.src = "anjo_sprite.png" //Sprite do anjo 
	that.width = 100; //Largura é a mesma
	that.height = 100; //Altura /2 para que possa ocorrer a transição de sprites para que o anjo pareça voar
	that.frames = 1;
	that.actualFrame = 0; 
	that.X = 0;
	that.Y = 0;	

	that.speed = 75; //velocidade
	that.isJumping = false;
	that.isFalling = false;
	that.jumpSpeed = 0;
	that.fallSpeed = 0;
	
    that.jump = function() {
		if (!that.isJumping && !that.isFalling) {
			that.fallSpeed = 0;
			that.isJumping = true;
			that.jumpSpeed = 17;
		}
	}
	
	that.checkJump = function() {
				
		if (that.Y > height*0.4) {
			that.setPosition(that.X, that.Y - that.jumpSpeed);		
		}
		else {
			if (that.jumpSpeed > 10) 
				points++;
			//Se o jogador estiver no meio da tela não mover o jogador pra cima mas os objetos em baixo

			MoveCircles(that.jumpSpeed * 0.5);
			
			platforms.forEach(function(platform, ind){
				platform.y += that.jumpSpeed;

				if (platform.y > height) {
					var type = ~~(Math.random() * 5);
					if (type == 0) 
						type = 1;
					else 
						type = 0;
					
					platforms[ind] = new Platform(Math.random() * (width - platformWidth), platform.y - height, type);
				}
			});
		}
		
		
		that.jumpSpeed--;
		if (that.jumpSpeed == 0) {
			that.isJumping = false;
			that.isFalling = true;
			that.fallSpeed = 1;
		}
	
	}
	
	that.fallStop = function(){
		that.isFalling = false;
		that.fallSpeed = 0;
		that.jump();	
	}
	
	that.checkFall = function(){
		if (that.Y < height - that.height) {
			that.setPosition(that.X, that.Y + that.fallSpeed);
			that.fallSpeed++;
		} else {
			if (points == 0) 
				that.fallStop();
			else 
				GameOver();
		}
	}
	
	that.moveLeft = function(){
		if (that.X > 0) {
			that.setPosition(that.X - that.speed, that.Y); // that.speed seta a velocidade do anjo
		}
	}
	
	that.moveRight = function(){
		if (that.X + that.width < width) {
			that.setPosition(that.X + that.speed, that.Y);
		}
	}

	
	that.setPosition = function(x, y){
		that.X = x;
		that.Y = y;
	}
	
	that.interval = 0;
	that.draw = function(){
		try {
			ctx.drawImage(that.image, 0, that.height * that.actualFrame, that.width, that.height, that.X, that.Y, that.width, that.height);
		} 
		catch (e) {
		};
		
		if (that.isJumping && !that.isFalling){
			that.actualFrame = 1;
		} if (!that.isJumping && that.isFalling) {
			that.actualFrame = 0;
		}		
	}
})();


player.setPosition(~~((width-player.width)/2), height - player.height);
player.jump();



//-------------------------- CONTROLE/ SETAS ---------------------------------
function reset() {
    location.reload();
}

document.onkeydown = function(e){
		var key = e.keyCode;
        switch (key) {
            case left:
                mvLeft = true;
                break;
            case right:
                mvRight = true;
                break;
			case space:
			    reset();
                break;
        }
		move();
		
	}
	


document.onkeyup = function(e){
		var key = e.keyCode;
        switch (key) {
            case left:
                mvLeft = false;
                break;
            case right:
                mvRight = false;
                break;
        }
		move();
	}
	
function move(){	
		if (mvLeft && !mvRight) {
		player.moveLeft();
		} 
		if (mvRight && !mvLeft) {
		player.moveRight();
		}
}		

//--------------------------- PLATAFORMAS ------------------------------------- 
	var nrOfPlatforms = 5, //Quantiedade de plataformas na tela
		platforms = [],
		platformWidth = 80,
		platformHeight = 20;
		 
	var Platform = function(x, y, type){
		var that=this;
		
		that.firstColor = '#e6e600';
		that.secondColor = '#fc0000';
		that.onCollide = function(){
			player.fallStop(); //Quando o personagem colidir ele para de cair
		};
		
		if (type === 1) { //Plataforma especial/ boost
			that.firstColor = '#ccccff';
			that.secondColor = '#0044ff';
			that.onCollide = function(){
				player.fallStop();
				player.jumpSpeed = 50; //Velocidade do SUPER PULO
			};
		}
		
		

		that.x = ~~ x;
		that.y = y;
		that.type = type;
		that.isMoving = ~~(Math.random() * 2);
		that.direction= ~~(Math.random() * 2) ? -1 : 1;
			
		that.draw = function(){
			ctx.fillStyle = 'rgba(255, 255, 255, 1)'; //Utilizei RGBA para que possa dar efeito de opacidade
			var gradient = ctx.createRadialGradient(that.x + (platformWidth/2), that.y + (platformHeight/2), 5, that.x + (platformWidth/2), that.y + (platformHeight/2), 45);
			gradient.addColorStop(0, that.firstColor);
			gradient.addColorStop(1, that.secondColor);
			ctx.fillStyle = gradient;
			ctx.fillRect(that.x, that.y, platformWidth, platformHeight);
		};
	
		return that;
	};
		
	var generatePlatforms = function(){
		var position = 0, type;
		for (var i = 0; i < nrOfPlatforms; i++) {
			type = ~~(Math.random()*5);
			if (type == 0) 
				type = 1;
			else 
				type = 0;
			platforms[i] = new Platform(Math.random() * (width - platformWidth), position, type);
			if (position < height - platformHeight) 
				position += ~~(height / nrOfPlatforms);
		}
	}();
	
	var checkCollision = function(){
	platforms.forEach(function(e, ind){
		if (
		(player.isFalling) && 
		(player.X < e.x + platformWidth) && 
		(player.X + player.width > e.x) && 
		(player.Y + player.height > e.y) && 
		(player.Y + player.height < e.y + platformHeight)
		) {
			e.onCollide();
		}
	})
	}

// -------------------------------- LOOP --------------------------------------- 
var GameLoop = function(){ 
	clear();
	DrawCircles();
	
	if (player.isJumping) player.checkJump();
	if (player.isFalling) player.checkFall();
	
	player.draw();
	
	platforms.forEach(function(platform, index){
		if (platform.isMoving) {
			if (platform.x < 0) {
				platform.direction = 1;
			} else if (platform.x > width - platformWidth) {
				platform.direction = -1;
			}
				platform.x += platform.direction * (index / 2) * ~~(points / 100);
			}
		platform.draw();
	});
	
	checkCollision();
	
	ctx.fillStyle = "white";
	ctx.font = "10pt Arial";
	ctx.fillText("SUA FÉ: " + points, 10, height-10);
	
	if (state)
		gLoop = setTimeout(GameLoop, 1000 / 50);

}

	var GameOver = function(){
		state = false;
		clearTimeout(gLoop);
		setTimeout(function(){
			clear();
			
			ctx.fillStyle = "white";
			ctx.font = "15pt Arial";
			ctx.fillText("VOCÊ CAIU EM TENTAÇÃO", width / 2 - 130, height / 2 - 50);
			ctx.fillText("SUA FÉ FOI DE: " + points, width / 2 - 115, height / 2 - 20);
		}, 100);
		
	};
GameLoop();