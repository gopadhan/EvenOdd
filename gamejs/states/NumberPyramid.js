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

var option = {
    _group: null,
    _baseXPos: 650,
    _baseYPos: 140,
    _rectYOffset: 60,
    _rectWidth: 120,
    _rectHeight: 40,
    _rectRadius: 15,
    _textXOffset: 50,
    _textYOffset: 23    
};

var textStyle = {
    font: "normal 22pt Arial",
    fill: '#ffffff',
    align: 'center',
    boundsAlignH: "center", // bounds center align horizontally
    boundsAlignV: "middle" // bounds center align vertically
};  


var counter = 0
var explicitlyPaused = false

vEgg.NumberPyramid = function(vGame){

// define needed variables for this game


    this._abacus = {
        spriteGroup: null,
        textGroup: null,
        BaseRectX: 100,
        BaseRectY: 100,
        BaseRectH: 30,
        BaseRectW: 450,
        NumberofBars: 4,     //Level 0 easy 2 Bars (ones/Tens), 1 Medium 3 Bars (one/tens/hundreds), 2 Hard 4 Bars (1/10/100/1000)
        BarLength: 250,
        EndoffsetX: 50,
        EndoffsetY: 2,
        BarText: ['Ones', 'Tens', 'Hundreds', 'Thousands'], 
        MinNumber: null,
        MaxNumber: null,  
        BeadNumber: null,  
        Number: [],
        Bead: null
    };

    this._question = {
        num: 0,
        index: null,
        type: [1,2],
        level: null,
        numFactor: null,    //Factor =5 or 1 depending on level/type, 5 means numbers will be multiple of 5
        placeindex: null,
        text: null,
        MinNumber: 1,
        MaxNumber: 65,
        Line2Index: [1,2],
        Line3Index: [3,4,5],
        numDisplayBox: [],
        Line1Box: [],   //1 Box
        Line2Box: [],   //2 Boxes
        Line3Box: [],   //3 Boxes
        BasePosX: vGame.world.centerX - 150,
        BasePosY: vGame.world.centerY - 80,
        BaseOffset: 2,
        Box: [],      //Box Sprite  
        BoxHeight: 100,
        BoxWidth: 100,
        PosX: [],
        PosY: [],
        BoxName: ['A', 'B', 'C', 'D', 'E', 'F'],
        BoxDisplayNum: []
    };


    this._answer = null;
    
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
    
    this.resetTimer;    
    
    this.rightAnswerBadge; //sprite image used to show the right answer was selected
    this.wrongAnswerBadge; //sprite image used to show the Wrong answer was selected
    this.thumbsUpBadge; //sprite image used to show the right answer was selected within 3 sec
    
    this.game_over = false;
    this._numberLabel = [];    

};

vEgg.NumberPyramid.prototype = {
    
    init: function () {

        this._abacus.MinNumber = Math.pow(10, this._abacus.NumberofBars - 1);
        this._abacus.MaxNumber = Math.pow(10, this._abacus.NumberofBars) -1;        
    },

    preload: function(){
        this.load.image('rightAnswerBadge','gameassets/images/CorrectAnswer.png');
        this.load.image('wrongAnswerBadge','gameassets/images/WrongAnswer.png');
        this.load.image('thumbsUpBadge','gameassets/images/ThumbsUp.png');
        this.load.atlas("atlas","assets/images/sprites.png","assets/images/sprites.json");
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

        var bar = vGame.add.graphics(0,0);
        bar.beginFill(0x000000, 0.2);
        bar.drawRect(0, 450, 800, 100);

        //  Our BitmapData (same size as our canvas)
        bmd = vGame.make.bitmapData(600, 600);        
        //  Add it to the world or we can't see it
        bmd.addToWorld();

             
        this.createQuestion();
        //Create the score label
        createScore();	 
        
        this.rightAnswerBadge = this.add.image(this.world.centerX,this.world.centerY,'rightAnswerBadge');
        this.rightAnswerBadge.anchor.setTo(0.5,0.5);
        this.rightAnswerBadge.kill();

        this.wrongAnswerBadge = this.add.image(this.world.centerX,this.world.centerY,'wrongAnswerBadge');
        this.wrongAnswerBadge.anchor.setTo(0.5,0.5);
        this.wrongAnswerBadge.kill();  
        
        this.thumbsUpBadge = this.add.image(this.world.centerX,this.world.centerY,'thumbsUpBadge');
        this.thumbsUpBadge.anchor.setTo(0.5,0.5);
        this.thumbsUpBadge.kill();    

        this.resetTimer = this.time.create(false);
        this.resetTimer.loop(2000,this.AllowTurn,this);  
        this.game_over = false;
        
    },


    update: function(){

        //While there is score in the score buffer, add it to the actual score
        if(score._scoreBuffer > 0){
            incrementScore();
            score._scoreBuffer --;
        };
            
    },

    render: function(){
        //vGame.debug.text('Sprite X: ' + spriteGroup.centerX + ' Y: ' + spriteGroup.centerY, 32, 64);
        
    },


    createbox: function(rectX, rectY, rectWidth, rectHeight, numIndex, isQuestionFlag){
        //  Create the Circles


        var innerRect = new Phaser.Rectangle(rectX, rectY, rectWidth*0.25, rectHeight*0.25);
        var outerRect = new Phaser.Rectangle(rectX, rectY, rectWidth, rectHeight);
        
        innerRect.centerX = outerRect.x + rectWidth/2;
        innerRect.centerY = outerRect.y + rectHeight/2;

        var grd=bmd.context.createLinearGradient(outerRect.bottomRight.x, outerRect.bottomRight.y, outerRect.x, outerRect.y);
        grd.addColorStop(0,"purple");
        //grd.addColorStop(0, '#8ED6FF');
        //grd.addColorStop(1,"yellow");

        if (isQuestionFlag){
            grd.addColorStop(1, 'orange');
            //this._numberLabel[numIndex] = new Phaser.Text(vGame, 0, 0, '?', textStyle);
        } else {
            grd.addColorStop(1, '#003BA2');
            //this._numberLabel[numIndex] = new Phaser.Text(vGame, 0, 0, this._number[numIndex], textStyle);
        };
        bmd.rect(outerRect.x, outerRect.y, outerRect.width, outerRect.height, grd);
        //var boxSprite = this.add.sprite(outerRect.x,outerRect.y, bmd);
        
        textStyle.font = "normal 50pt Arial";

        if (isQuestionFlag){
            this._numberLabel[numIndex] = new Phaser.Text(vGame, 0, 0, this._question.BoxName[numIndex], textStyle);            
        } else {
            this._numberLabel[numIndex] = new Phaser.Text(vGame, 0, 0, this._question.BoxDisplayNum[numIndex], textStyle);
        };
    
        this._numberLabel[numIndex].setTextBounds(outerRect.centerX, outerRect.centerY);  
            
            
        //return boxSprite;
        return bmd;
    },
        
    createQuestion: function(){

        this.camera.flash('#000000');        
        this._firstAttempt = true;     
        this._question.num ++;
        
        this._question.text = 'Find the missing numbers in the Pyramid.'

        this._question.text = 'Q' + this._question.num + ': ' + this._question.text;
        //console.log('text Question:', this._question.text);
        
        this.titleText = vGame.make.text(vGame.world.centerX, 50, this._question.text, {
        font: 'bold 25pt TheMinion',
        fill: '#000102',
        align: 'center'
        });
        this.titleText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
        this.titleText.anchor.set(0.5);
                
        this.add.existing(this.titleText);        

        var num1 = [];

        var level = vGame.rnd.pick(this._question.type);

        if (level == 1) {
            this._question.numFactor = 5;
        } else {
            this._question.numFactor = 1;
        };

        var min = Math.ceil(this._question.MinNumber / this._question.numFactor);
        var max = Math.ceil(this._question.MaxNumber / this._question.numFactor);

        console.log('level:', level);        
        console.log('Min Number:', min);
        console.log('Max Number:', max);

        num1[0] = vGame.rnd.integerInRange(min , max - 2);
        num1[1] = vGame.rnd.integerInRange(min , max -min - num1[0]);
        num1[2] = max - num1[0] - num1[1];
        num1.sort(function(a, b){return a - b});
        num1[3] = num1[0] + num1[1];
        num1[4] = num1[1] + num1[2];
        num1[5] = num1[3] + num1[4];
        
        if (level == 1) {
            for (i = 0; i < 6; i ++) {
                num1[i] = num1[i]*5;
            }

        };

        for (i = 0; i < 6; i ++) {
            if (i < 3) {
                this._question.Line3Box[i] = num1[i]; 
                this._question.BoxDisplayNum[3 + i] = num1[i];
            } else if (i < 5) {
                this._question.Line2Box[i-3] = num1[i]; 
                this._question.BoxDisplayNum[i - 2] = num1[i];
            } else {
                this._question.Line1Box[i-5] = num1[i]; 
                this._question.BoxDisplayNum[i - 5] = num1[i];
            };
        };
  
        console.log('Number: ', num1);  
        console.log('Line3Box: ', this._question.Line3Box);      
        console.log('Line2Box: ', this._question.Line2Box);   
        console.log('Line1Box: ', this._question.Line1Box);           

        this._question.PosX[0] = this._question.BasePosX;
        this._question.PosY[0] = this._question.BasePosY - this._question.BoxHeight - this._question.BaseOffset;
        this._question.PosX[1] = this._question.BasePosX - this._question.BoxHeight/2 - this._question.BaseOffset/2 ;
        this._question.PosY[1] = this._question.BasePosY;
        this._question.PosX[2] = this._question.BasePosX + this._question.BoxHeight/2 + this._question.BaseOffset/2 ;
        this._question.PosY[2] = this._question.BasePosY;        
        this._question.PosX[3] = this._question.BasePosX - this._question.BoxHeight - this._question.BaseOffset ;
        this._question.PosY[3] = this._question.BasePosY + this._question.BoxHeight + this._question.BaseOffset; 
        this._question.PosX[4] = this._question.BasePosX;
        this._question.PosY[4] = this._question.BasePosY + this._question.BoxHeight + this._question.BaseOffset; 
        this._question.PosX[5] = this._question.BasePosX + this._question.BoxHeight + this._question.BaseOffset ;
        this._question.PosY[5] = this._question.BasePosY + this._question.BoxHeight + this._question.BaseOffset;                         
        
        //this.createbox(vGame.world.centerX, vGame.world.centerY, 100, 100, 1, 1);
        //0 is the topmost box, 1,2 are line 2 (left 2 right) 3,4,5 Line3 (left 2 right)

        this._question.numDisplayBox[0] = 0; //Line 1 Top Box Always displayed number (one number from each line is always displayed)
        this._question.numDisplayBox[1] = vGame.rnd.pick(this._question.Line2Index);
        this._question.numDisplayBox[2] = vGame.rnd.pick(this._question.Line3Index);
        console.log('numDisplayBox: ', this._question.numDisplayBox);  

        for (i = 0; i < 6; i ++) {
            var mybmd = null;
            var questionBox = true;
            for (var index in this._question.numDisplayBox) {  
                if (i == this._question.numDisplayBox[index]){
                    console.log('i: ', i);  
                    questionBox = false;
                };
            }; 

            mybmd = this.createbox(this._question.PosX[i], this._question.PosY[i], this._question.BoxWidth, this._question.BoxHeight, i, questionBox);

            vGame.world.addChild(this._numberLabel[i]);  
         
        };        

    this.createOptionSet();
    score._lastEventTrackedTime = vGame.time.time;
},    
        
createOptionSet: function(){
    var newoption = null;
    this._optionsVal = ['','','',''];
    this._answer = '';
//+ ((i==5) ? '': ', ')
    //one of the option set is the answer    
    for (i = 0; i < 6; i ++) {
 
            if (! this._question.numDisplayBox.includes(i)){
                this._optionsVal[0] = this._optionsVal[0] + this._question.BoxName[i] + ':' + this._question.BoxDisplayNum[i] + ' ';
                this._optionsVal[1] = this._optionsVal[1] + this._question.BoxName[i] + ':' + (this._question.BoxDisplayNum[i] + this._question.numFactor * vGame.rnd.pick([1, -1])) + ' ';
                this._optionsVal[2] = this._optionsVal[2] + this._question.BoxName[i] + ':' + (this._question.BoxDisplayNum[i] + this._question.numFactor * vGame.rnd.pick([2, -2])) + ' ';
                this._optionsVal[3] = this._optionsVal[3] + this._question.BoxName[i] + ':' + (this._question.BoxDisplayNum[i] + this._question.numFactor * vGame.rnd.pick([3, -3])) + ' ';
            };
     
    }; 
    this._answer = this._optionsVal[0];
    console.log('answer1: ',  this._optionsVal[0]);
    




    console.log('opt: ', this._optionsVal[0], this._optionsVal[1], this._optionsVal[2], this._optionsVal[3]);      

    this._optionsVal.sort(function(a, b){return 0.5 - Math.random()});

    //console.log('answer1: ', this._optionsVal[0]);
    //console.log('answer2: ', this._optionsVal[1]);
    //console.log('answer3: ', this._optionsVal[2]);
    //console.log('answer4: ', this._optionsVal[3]); 

        option._group = vGame.add.group();
    
        var graphics = this.add.graphics(0, 0);
        
        option._rectWidth = 140;
        option._baseXPos = 630;
        option._textXOffset = 70;

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

        textStyle.font = "normal 12pt Arial";
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
            //If number, change the display format parseFloat(this._optionsVal[i]).toLocaleString('en')
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
    
    
    clickAnswer: function(sprite, pointer){
        //console.log('Val Parameter:', sprite.name); 
        //return function () {
        //alert(val);
        //console.log('Val Parameter:', sprite.name); 
        //console.log('Val Answer:', this._answer);  
        //console.log('Val 1st attempt:', firstattempt)


        for (var i =0 ; i < 4; i ++) {
            this._optionsBox[i].inputEnabled = false;
            this._optionsBox[i].input.useHandCursor = false;
        };
        this.game.canvas.style.cursor = "default";
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
            };
        
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
            };

            createScoreAnimation(pointer.x, pointer.y, '+'+newScore, newScore);


            //this._abacus.spriteGroup.alpha = 0.5;
            option._group.alpha = 0.5;


            if (vGame.math.roundTo(score._elapsedTime) <= 3) {
                this.thumbsUpBadge.reset(this.world.centerX,this.world.centerY);
                this.thumbsUpBadge.scale.set(0.7);
                this.thumbsUpBadge.alpha = 0.5;
                vGame.world.bringToTop(this.thumbsUpBadge);
                //to(properties, duration, ease, autoStart, delay, repeat, yoyo)
                this.game.add.tween(this.thumbsUpBadge).to({alpha: 1}, 400, Phaser.Easing.Linear.None, true, 0, 100, true);

            } else {
                this.rightAnswerBadge.reset(this.world.centerX,this.world.centerY);
                this.rightAnswerBadge.scale.set(0.7);
                this.rightAnswerBadge.alpha = 0.5;
                vGame.world.bringToTop(this.rightAnswerBadge);
                //to(properties, duration, ease, autoStart, delay, repeat, yoyo)
                this.game.add.tween(this.rightAnswerBadge).to({alpha: 1}, 400, Phaser.Easing.Linear.None, true, 0, 100, true);
                        
            };
            

        } else {
            //console.log('Please try again.');
            //sprite.tint = 0xFFA500;
            item = 'Please try again.'
            this._firstAttempt = false;

            this.wrongAnswerBadge.reset(this.world.centerX,this.world.centerY);
            this.wrongAnswerBadge.scale.set(0.7);
            //this._abacus.spriteGroup.alpha = 0.5;
            option._group.alpha = 0.5;
            this.wrongAnswerBadge.alpha = 0.5;
            vGame.world.bringToTop(this.wrongAnswerBadge);
            //to(properties, duration, ease, autoStart, delay, repeat, yoyo)
            this.game.add.tween(this.wrongAnswerBadge).to({alpha: 1}, 400, Phaser.Easing.Linear.None, true, 0, 100, true);

        };

        if(!this.resetTimer.running)
            this.resetTimer.start();
    
        if(this.resetTimer.paused)
            this.resetTimer.resume();            

        //  The Text is positioned at 0, 400
        this._textMessage = vGame.add.text(0, 0, item, style);
        this._textMessage.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2);
    
        //  We'll set the bounds to be from x0, y400 and be 800px wide by 100px high
        this._textMessage.setTextBounds(0, 450, 800, 100);	

        //check if token has landed on final grid
        if(this._question.num == 10){
            this.game_over = true;
        };                        
                              
    },
    
    destroyQuestion: function(){
        //destroying object instances so we could display the new question
        this.titleText.destroy();
        //this._abacus.spriteGroup.destroy(true, false);
        for (var i = 0; i < 6; i++) {			
            this._numberLabel[i].destroy();
        }

        bmd.clear();
        this._textMessage.destroy();
        option._group.destroy(true, false);
    
    }     
 
};

vEgg.NumberPyramid.prototype.AllowTurn = function(){
    this.resetTimer.pause();
    this.rightAnswerBadge.kill();
    this.thumbsUpBadge.kill(); 
    this.wrongAnswerBadge.kill(); 
    this.destroyQuestion();    
    if (! this.game_over) {
        this.createQuestion();
    } else {
        var scoreFont = "120px Arial";
        vGame.add.text(50, this.world.centerY-150, 'Game Over!', {font: scoreFont, fill: "#ffffff", stroke: "#535353", strokeThickness: 2});
        console.log('this.game over: ', score);
    };

};



function createScore(){
    
       var scoreFont = "100px Arial";
	   //console.log('this._scoreXPos: ', score._scoreXPos);
	   //console.log('this._scoreYPos: ', score._scoreYPos);
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
    
   };

   function incrementScore(){
    //This function just increases the score by one and updates the text label accordingly.
    
       //Increase the score by one and update the total score label text
       score._score += 1;  
       score._scoreLabel.text = score._score;     
    
   };

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
    };
    