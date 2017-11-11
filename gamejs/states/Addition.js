//Score Variables
var score = {
    _scoreXPos: vGame.world.centerX * 0.25,
    _scoreYPos: vGame.world.centerY * 1.45,
    _lastEventTrackedTime: null,
    _elapsedTime: null,
    _score: 0,
    _scoreBuffer: 0,
    _scoreLabelTween: null,
    _scoreLabel: null
};

var triangle = {

    _mainX: vGame.world.centerX - 200,
    _mainY: vGame.world.centerY - 50,
    _vertex1X: vGame.world.centerX,
    _vertex1Y: vGame.world.centerY - 150,
    _vertex2X: vGame.world.centerX,
    _vertex2Y: vGame.world.centerY + 50
};

var option = {
    _group: null,
    _baseXPos: 650,
    _baseYPos: 140,
    _rectYOffset: 60,
    _rectWidth: 100,
    _rectHeight: 40,
    _rectRadius: 15,
    _textXOffset: 50,
    _textYOffset: 23    
};

var textStyle = {
    font: "normal 25pt Arial",
    fill: '#ffffff',
    align: 'center',
    boundsAlignH: "center", // bounds center align horizontally
    boundsAlignV: "middle" // bounds center align vertically
};    


vEgg.Addition = function(vGame){
// define needed variables for vEgg.Game

this._questionNum = 0;
this._minNumber = 1;
this._maxNumber = 99;
this._questionIndex = null;
this._answer = null;

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

this._optionsBox = [];
this._optionsVal = [];
this._optionsBoxText = [];

};

vEgg.Addition.prototype = {

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
    bar.drawRect(0, 450, 800, 100);

    //  Our BitmapData (same size as our canvas)
    bmd = vGame.make.bitmapData(600, 600);

    //  Add it to the world or we can't see it
    bmd.addToWorld();

    
    this.createQuestion();
    //Create the score label
    createScore();	   


},


update: function(){


		//While there is score in the score buffer, add it to the actual score
		if(score._scoreBuffer > 0){
			incrementScore();
			score._scoreBuffer --;
        };
        
},

render: function(){
    //vGame.debug.geom(line1);
    //vGame.debug.lineInfo(line1, 32, 32);
    //vGame.debug.geom(line2);
    //vGame.debug.lineInfo(line2, 32, 50);
    //vGame.debug.text("Drag the handles", 32, 550);
},

createCircle: function(cirX, cirY, cirDiameter, numIndex, quesIndex){
    //  Create the Circles
    var innerCircle = new Phaser.Circle(cirX, cirY, cirDiameter*0.25);
    var outerCircle = new Phaser.Circle(cirX, cirY, cirDiameter);

    var grd = bmd.context.createRadialGradient(innerCircle.x, innerCircle.y, innerCircle.radius, outerCircle.x, outerCircle.y, outerCircle.radius);
    grd.addColorStop(0, '#8ED6FF');

    if (numIndex == quesIndex){
        grd.addColorStop(1, 'orange');
        //this._numberLabel[numIndex] = new Phaser.Text(vGame, 0, 0, '?', textStyle);
    } else {
        grd.addColorStop(1, '#003BA2');
        //this._numberLabel[numIndex] = new Phaser.Text(vGame, 0, 0, this._number[numIndex], textStyle);
    };
    bmd.circle(outerCircle.x, outerCircle.y, outerCircle.radius, grd);
  
    this._circles[numIndex] = this.add.graphics(0, 0);
    
    // set a fill and line style for the circle
    this._circles[numIndex].lineStyle(8, 0xFF0000, 0);
    //this._circles[numIndex].beginFill(0xFFFF00, 0.8);
    //Baseposition is the center of the screen, offset 1st circle to the left of center point and 2nd to the right
    this._circles[numIndex].drawCircle(cirX, cirY, cirDiameter);
    //console.log('circleX: ', this._circleBasePosX * (10*i + 1));
    this._circles[numIndex].anchor.set(0.5);
    this._circles[numIndex].endFill();
    this._circles[numIndex].inputEnabled = true;
    this._circles[numIndex].alpha = 1;
    this._inputEnabled = true;

    
    //setting up the sprite name so we could identify which child is clicked
    this._circles[numIndex].name = numIndex;

    if (numIndex == quesIndex){
        this._numberLabel[numIndex] = new Phaser.Text(vGame, 0, 0, '?', textStyle);
    } else {
        this._numberLabel[numIndex] = new Phaser.Text(vGame, 0, 0, this._number[numIndex], textStyle);
    };

    this._numberLabel[numIndex].setTextBounds(cirX, cirY);  
        
    this._circles[numIndex].addChild(this._numberLabel[numIndex]);
    vGame.world.addChild(this._circles[numIndex]);

},

clickAnswer: function(sprite, pointer){
    console.log('Val Parameter:', sprite.name); 
    //return function () {
        //alert(val);
        //console.log('Val Parameter:', val); 
        //console.log('Val Answer:', answer);  
        //console.log('Val 1st attempt:', firstattempt); 
        
		this._textMessage.destroy();
        
                var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
                
        
                if (sprite.name == this._answer){
                    score._elapsedTime = vGame.time.elapsedSecondsSince(score._lastEventTrackedTime);
                    var item = Phaser.ArrayUtils.getRandomItem(this._firstAttempt ? this._praiseMessage1 : this._praiseMessage2 );
                    //console.log(item);
                    //sprite.tint = 0x008000;	
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
                        emitter = vGame.add.emitter(pointer.X, pointer.Y, 100);
                        
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
                    //sprite.tint = 0xFFA500;
                    item = 'Please try again.'
                    this._firstAttempt = false;
                }
        
                //  The Text is positioned at 0, 400
                this._textMessage = vGame.add.text(0, 0, item, style);
                this._textMessage.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
            
                //  We'll set the bounds to be from x0, y400 and be 800px wide by 100px high
                this._textMessage.setTextBounds(0, 450, 800, 100);	

    //};    
},


createQuestion: function(){
    
            score._lastEventTrackedTime = vGame.time.time;
            this._firstAttempt = true;        
            this._questionNum ++;		
            
            this._question = 'Complete the following Number Bond.'
            this._question = 'Q' + this._questionNum + ': ' + this._question;
            this.titleText = vGame.make.text(vGame.world.centerX, 50, this._question, {
            font: 'bold 30pt TheMinion',
            fill: '#000102',
            align: 'center'
            });
            this.titleText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
            this.titleText.anchor.set(0.5);
                    
            this.add.existing(this.titleText);


  
            //line(x1, y1, x2, y2, color, width) 
            bmd.line(triangle._mainX, triangle._mainY, triangle._vertex1X, triangle._vertex1Y, 'Black', 1);
            bmd.line(triangle._mainX, triangle._mainY, triangle._vertex2X, triangle._vertex2Y, 'Black', 1);

            
            this._number[0] = vGame.rnd.integerInRange(this._minNumber, this._maxNumber);
            this._number[1] = vGame.rnd.integerInRange(this._minNumber, this._maxNumber);
            this._number[2] = this._number[0] + this._number[1];

            this._questionIndex = vGame.rnd.pick([0,1,2]);
            this._answer = this._number[this._questionIndex];
            console.log('Num0: ', this._number[0]);
            console.log('Num1: ', this._number[1]);
            console.log('Num2: ', this._number[2]);
            console.log('Question: ', this._questionIndex);
            console.log('Answer: ', this._answer);
            this.createCircle(triangle._vertex1X, triangle._vertex1Y, 120, 0, this._questionIndex);
            this.createCircle(triangle._vertex2X, triangle._vertex2Y, 120, 1, this._questionIndex);
            this.createCircle(triangle._mainX, triangle._mainY, 120, 2, this._questionIndex); 
            
    

            if (vGame.rnd.pick([-1, 1]) == -1) {
                this._optionsVal = [this._answer-2, this._answer-1, this._answer, this._answer+1];   
            }
            else{
                this._optionsVal = [this._answer-1, this._answer, this._answer+1, this._answer+2]; 
            }
        
            this._optionsVal.sort(function(a, b){return 0.5 - Math.random()});
            //console.log('answers: ', this._optionsVal.length);
            console.log('answer1: ', this._optionsVal[0]);
            console.log('answer2: ', this._optionsVal[1]);
            console.log('answer3: ', this._optionsVal[2]);
            console.log('answer4: ', this._optionsVal[3]);            
            this.createOptionSet();
            

        },


createOptionSet: function(){

        option._group = vGame.add.group();
    
        var graphics = this.add.graphics(0, 0);
        
        // set a fill and line style for the rectangle
        graphics.lineStyle(5, '#2d2d2d', 0.2);
        graphics.beginFill(0xFFFF00, 0.4);    
    
    
        //drawRoundedRect(x, y, width, height, radius)
        graphics.drawRoundedRect(620, 100, 160, 300, 15);
        graphics.anchor.set(0.5);
        graphics.endFill();
    
        option._group.add(graphics);
        // set a fill and line style for the rectangle
        //graphics.lineStyle(5, 0xFF0000, 0.2);
        //graphics.beginFill(0x3D85C6, 0.4);
        
        ///////////////////////////////////////////////////////////////


        for (var i =0 ; i < 4; i ++) {

            //graphics x, y coordinates are important as the objects will be placed as per this absolute location.
            this._optionsBox[i] = this.add.graphics(0, 0);
        
            // set a fill and line style for the circle
            this._optionsBox[i].lineStyle(8, '#2d2d2d', 0.2);
            this._optionsBox[i].beginFill(0xa000f3, 0.8);
        
            //drawRoundedRect(x, y, width, height, radius)
            this._optionsBox[i].drawRoundedRect(option._baseXPos, option._baseYPos + option._rectYOffset * i, option._rectWidth, option._rectHeight, option._rectRadius);
            this._optionsBox[i].anchor.set(0.5);
            this._optionsBox[i].endFill();
            this._optionsBox[i].inputEnabled = true;
            this._optionsBox[i].input.useHandCursor = true;
        
            this._optionsBoxText[i] = new Phaser.Text(vGame, 0, 0, this._optionsVal[i], textStyle);    
            // // graphics and textElement bounds/sizes must be the same
            // // so your text area covers the whole circle
            this._optionsBoxText[i].setTextBounds(option._baseXPos + option._textXOffset, option._baseYPos + option._rectYOffset * i + option._textYOffset);    
            // //setting up the sprite name so we could identify which child is clicked
            this._optionsBox[i].name = this._optionsVal[i];
            this._optionsBox[i].addChild(this._optionsBoxText[i]);
            //vGame.world.addChild(this._optionsBox[i]);
            option._group.add(this._optionsBox[i]);
        
        
            this._optionsBox[i].events.onInputDown.add(this.clickAnswer, this);

        }
   
        
        //graphics.endFill();
    
        //window.graphics = graphics;
        vGame.world.bringToTop(option._group);

},

destroyQuestion: function(){
    //destroying object instances so we could display the new question
    this.titleText.destroy();
    for (var i = 0; i < 3; i++) {			
        this._circles[i].destroy();
        this._numberLabel[i].destroy();
    }
    //console.log('checking object existance: ', this._optionsBox[1].name);
    bmd.clear();
    
    option._group.destroy(true, false);

    // for (var i = 0; i < 4; i++) {			
    //     this._optionsBox[i].destroy();
    //     this._optionsBoxText[i].destroy();
    // }    
    
    //console.log('checking after existance: ', this._circles[2].name);
},


}

function createScore(){
    
       var scoreFont = "100px Arial";
	   console.log('this._scoreXPos: ', score._scoreXPos);
	   console.log('this._scoreYPos: ', score._scoreYPos);
       //Create the score label, setting score intial value to “0”.
	   score._scoreLabel = vGame.add.text(score._scoreXPos, score._scoreYPos, "0", {font: scoreFont, fill: "#ffffff", stroke: "#535353", strokeThickness: 15});
	  //scoreLabel = vGame.add.text(200, 20, "0", {font: scoreFont, fill: "#ffffff", stroke: "#535353", strokeThickness: 15});
      score._scoreLabel.anchor.setTo(0.5, 0);
      score._scoreLabel.align = 'center';
    
       //Create a tween to grow / shrink the score label
       // set up a tween, this tween will make the score label grow to 1.5x it’s original size 
       //(we are tweening the labels scale property to do this) and then shrink back down to it’s original size. 
       //This tween won’t do anything yet, but we will be able to trigger it later.

       score._scoreLabelTween = vGame.add.tween(score._scoreLabel.scale).to({ x: 1.5, y: 1.5}, 200, Phaser.Easing.Linear.In).to({ x: 1, y: 1}, 200, Phaser.Easing.Linear.In);
    
   }

   function incrementScore(){
    //This function just increases the score by one and updates the text label accordingly.
    
       //Increase the score by one and update the total score label text
       score._score += 1;  
       score._scoreLabel.text = score._score;     
    
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
           score._scoreLabelTween.start();
		   score._scoreBuffer += vscore;
	   }, this);
	}