//Score Variables
var score = {
				_scoreXPos: vGame.world.centerX * 0.25,
				_scoreYPos: vGame.world.centerY * 1.3,
				_lastEventTrackedTime: null,
				_elapsedTime: null,
				_score: 0,
				_scoreBuffer: 0
			};


vEgg.Game = function(vGame){
	// define needed variables for vEgg.Game

	this._questionNum = 0;
	this._minNumber = 1;
	this._maxNumber = 99;
	this._circleBasePosX = vGame.world.centerX;
	this._circleBasePosY = vGame.world.centerY*0.8;
	this._circleDiameter = 200;	
	this._circles = [];
	this._number = [];
	this._numberLabel = [];
	//1st attempt Priase message
	this._praiseMessage1 = ['Well Done!', 'You nailed it!', 'You Rock!'];
	//Subsequent attempts Praise message
	this._praiseMessage2 = ['Way to Go!', 'Good Job', 'Keep it Up!'];
	this._textMessage = vGame.add.text(0, 0, ' ');
	this._inputEnabled = null;
	this._firstAttempt = true; 

};

vEgg.Game.prototype = {

	init: function () {

	  },
	  	
	create: function(){
						    

		var myBitmap = this.add.bitmapData(GAME_WIDTH, GAME_HEIGHT);
		var grd=myBitmap.context.createLinearGradient(0,0,0,GAME_HEIGHT);
		//grd.addColorStop(0,"#EF5091");		
		grd.addColorStop(0,"blue");
		grd.addColorStop(1,"white");
		myBitmap.context.fillStyle=grd;
		myBitmap.context.fillRect(0,0,GAME_WIDTH, GAME_HEIGHT);
		var background = this.add.sprite(0,0, myBitmap);
		background.alpha = 0;
		vGame.add.tween(background)
			.to({ alpha: 1 }, 2000, Phaser.Easing.Linear.InOut)
			.loop(false)
			.start();

		var bar = vGame.add.graphics();
		bar.beginFill(0x000000, 0.2);
		bar.drawRect(0, 400, 800, 100);

		this.createQuestion();
		//Create the score label
		createScore();	
	},


	update: function(){

		for (var i = 0; i < 2; i ++) {
			if (this._circles[i].input.pointerOver() && this._inputEnabled) {
				this._circles[i].alpha = 1;
			} else if (this._inputEnabled) {
				this._circles[i].scale.setTo(1);
				this._circles[i].alpha = 0.5;
			}
			//console.log('Input Enabled: ', this._inputEnabled);
			if (this._inputEnabled == false){
				this._circles[i].inputEnabled = false;
				//console.log('Input Enabled: ', this._circles[i].inputEnabled); 
			}
		}

		//While there is score in the score buffer, add it to the actual score
		if(score._scoreBuffer > 0){
			incrementScore();
			score._scoreBuffer --;
		}

	},

	render: function(){

		},

	createQuestion: function(){

		score._lastEventTrackedTime = vGame.time.time;
		this._firstAttempt = true; 		
		this._questionNum ++;		
		this._questionCategory = vGame.rnd.pick([1, 2]);
		if (Phaser.Math.isOdd(this._questionCategory)) {
			this._question = 'Select the Odd Number.'
		} else {
			this._question = 'Select the Even Number.'
		}
		this._question = 'Q' + this._questionNum + ': ' + this._question;
		this.titleText = vGame.make.text(vGame.world.centerX, 50, this._question, {
		font: 'bold 30pt TheMinion',
		fill: '#000102',
		align: 'center'
		});
		this.titleText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
		this.titleText.anchor.set(0.5);
				
		this.add.existing(this.titleText);

		var textStyle = {
			font: "normal 60pt Arial",
			fill: '#ffffff',
			align: 'center',
			boundsAlignH: "center", // bounds center align horizontally
			boundsAlignV: "middle" // bounds center align vertically
		};

		this._number = this.getRandomEvenOddNumbers(this._minNumber, this._maxNumber);
	
		for (var i = 0; i < 2; i++) {
			
			//graphics x, y coordinates are important as the objects will be placed as per this absolute location.
			this._circles[i] = this.add.graphics(0, 0);

			// set a fill and line style for the circle
			this._circles[i].lineStyle(8, 0xFF0000, 0.2);
			this._circles[i].beginFill(0xFFFF00, 0.8);
			//Baseposition is the center of the screen, offset 1st circle to the left of center point and 2nd to the right
			this._circles[i].drawCircle(this._circleBasePosX + 150 * (2* i - 1), this._circleBasePosY, this._circleDiameter);
			//console.log('circleX: ', this._circleBasePosX * (10*i + 1));
			this._circles[i].anchor.set(0.5);
			this._circles[i].endFill();
			this._circles[i].inputEnabled = true;
			this._inputEnabled = true;

			this._numberLabel[i] = new Phaser.Text(vGame, 0, 0, this._number[i], textStyle);
			
			// graphics and textElement bounds/sizes must be the same
			// so your text area covers the whole circle
			this._numberLabel[i].setTextBounds(this._circleBasePosX + 150 * (2* i - 1), this._circleBasePosY);
			
			//setting up the sprite name so we could identify which child is clicked
			this._circles[i].name = i;

			this._circles[i].addChild(this._numberLabel[i]);
			vGame.world.addChild(this._circles[i]);

			this._circles[i].events.onInputDown.add(this.clickAnswer, this);

		}	
		
	},

	destroyQuestion: function(){
		//destroying object instances so we could display the new question
		this.titleText.destroy();
		for (var i = 0; i < 2; i++) {			
			this._circles[i].destroy();
			this._numberLabel[i].destroy();
		}
	},

	getRandomEvenOddNumbers: function(nMin, nMax) {
			var oddEvenNumArray = new Array(2);
			var number = [];
			
			number[0] = vGame.rnd.integerInRange(nMin, nMax-1);
			number[1] = vGame.rnd.integerInRange(nMin, nMax-1);

			//&& AND Condition
			if ((Phaser.Math.isEven(number[0]) && Phaser.Math.isEven(number[1]))
				|| (Phaser.Math.isOdd(number[0]) && Phaser.Math.isOdd(number[1])) )
			{
				//console.log('Both Even/Odd 1st: ', number[0], '2nd: ', number[1]);
				number[vGame.rnd.pick([0, 1])] += 1;
				
			} 

			//following is to ensure small number is placed 1st in the array.
			if (number[0] < number[1]){
				oddEvenNumArray[0] = number[0];
				oddEvenNumArray[1] = number[1];
			}
			else if (number[0] > number[1]){
				oddEvenNumArray[0] = number[1];
				oddEvenNumArray[1] = number[0];
			}	
			
			return oddEvenNumArray;
	   },
	   
	   clickAnswer: function(sprite, pointer){

		//to Tint SPRITE after click
		//sprite.tint = Math.random() * 0xffffff;	
		//console.log('Answer Clicked: ', this._number[sprite.name]);

		this._textMessage.destroy();

		var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
		

		if ((Phaser.Math.isOdd(this._questionCategory) && Phaser.Math.isOdd(this._number[sprite.name]))
			|| (Phaser.Math.isEven(this._questionCategory) && Phaser.Math.isEven(this._number[sprite.name])) )
		{
			score._elapsedTime = vGame.time.elapsedSecondsSince(score._lastEventTrackedTime);
			var item = Phaser.ArrayUtils.getRandomItem(this._firstAttempt ? this._praiseMessage1 : this._praiseMessage2 );
			//console.log(item);
			sprite.tint = 0x008000;	
			this._inputEnabled = false;	
			// alert("YOU WIN, CONGRATULATIONS!");
			// document.location.reload();		

			var newScore = 5;
			
			if (newScore - vGame.math.roundTo(score._elapsedTime) <= 0) {
				newScore = 1;
			}
			else{
				newScore = newScore - vGame.math.roundTo(score._elapsedTime);
			}
		
			if (newScore >= 2) {
				emitter = vGame.add.emitter(this._circleBasePosX, this._circleBasePosY, 100);
				
					emitter.makeParticles('explosion');
					emitter.minParticleSpeed.setTo(-300, 30);
					emitter.maxParticleSpeed.setTo(300, 100);
					emitter.minParticleScale = 0.05;
					emitter.maxParticleScale = 0.1;
					emitter.gravity = 250;
					//flow(lifespan, frequency, quantity, total, immediate)
					emitter.flow(1000, 500, 5, 10, true);
			}

			createScoreAnimation(pointer.x, pointer.y, '+'+newScore, newScore);
			
			this.destroyQuestion();
			this.createQuestion();	
			
		} else {
			console.log('Please try again.');
			sprite.tint = 0xFFA500;
			item = 'Please try again.'
			this._firstAttempt = false;
		}

		//  The Text is positioned at 0, 400
		this._textMessage = vGame.add.text(0, 0, item, style);
		this._textMessage.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
	
		//  We'll set the bounds to be from x0, y100 and be 800px wide by 100px high
		this._textMessage.setTextBounds(0, 400, 800, 100);	
		
	}
};

function createScore(){
    
       var scoreFont = "100px Arial";
	   console.log('this._scoreXPos: ', score._scoreXPos);
	   console.log('this._scoreYPos: ', score._scoreYPos);
       //Create the score label, setting score intial value to “0”.
	   scoreLabel = vGame.add.text(score._scoreXPos, score._scoreYPos, "0", {font: scoreFont, fill: "#ffffff", stroke: "#535353", strokeThickness: 15});
	  //scoreLabel = vGame.add.text(200, 20, "0", {font: scoreFont, fill: "#ffffff", stroke: "#535353", strokeThickness: 15});
       scoreLabel.anchor.setTo(0.5, 0);
       scoreLabel.align = 'center';
    
       //Create a tween to grow / shrink the score label
       // set up a tween, this tween will make the score label grow to 1.5x it’s original size 
       //(we are tweening the labels scale property to do this) and then shrink back down to it’s original size. 
       //This tween won’t do anything yet, but we will be able to trigger it later.

       scoreLabelTween = vGame.add.tween(scoreLabel.scale).to({ x: 1.5, y: 1.5}, 200, Phaser.Easing.Linear.In).to({ x: 1, y: 1}, 200, Phaser.Easing.Linear.In);
    
   }

   function incrementScore(){
    //This function just increases the score by one and updates the text label accordingly.
    
       //Increase the score by one and update the total score label text
       score._score += 1;  
       scoreLabel.text = score._score;     
    
   }

   //function called createScoreAnimation which will allow us to trigger the animation from any coordinates in 
   //the game, add a message that will be displayed to the user, and provide the score to be added to the main score.

   function createScoreAnimation(x, y, vmessage, vscore){

    
       var scoreFont = "90px Arial";	
    
       //Create a new label for the score
       var scoreAnimation = vGame.add.text(x, y, vmessage, {font: scoreFont, fill: "#39d179", stroke: "#ffffff", strokeThickness: 15});
       scoreAnimation.anchor.setTo(0.5, 0);
       scoreAnimation.align = 'center';
    
       //Tween this score label to the total score label
       var scoreTween = vGame.add.tween(scoreAnimation).to({x: score._scoreXPos, y: score._scoreYPos}, 800, Phaser.Easing.Exponential.In, true);
    
       //When the animation finishes, destroy this score label, trigger the total score labels animation and add the score
       scoreTween.onComplete.add(function(){
           scoreAnimation.destroy();
           scoreLabelTween.start();
		   score._scoreBuffer += vscore;
	   }, this);
	}
	