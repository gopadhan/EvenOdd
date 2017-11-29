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
    _rectWidth: 100,
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

vEgg.ReinforcingPlaceValue = function(vGame){

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
        category: null,
        placeindex: null,
        text: null
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

};

vEgg.ReinforcingPlaceValue.prototype = {
    
    init: function () {
        clock._positionX = 350;
        clock._positionY = 350;
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

        this._question.category = Phaser.ArrayUtils.getRandomItem(this._question.type);

            //return Math.pow(10, vEgg.ReinforcingPlaceValue._abacus.NumberofBars);
        //}, 
        
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
        console.log('Min Number:', this._abacus.MinNumber);
        console.log('Max Number:', this._abacus.MaxNumber);
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
    
    createQuestion: function(){
        
        this.camera.flash('#000000');        
        this._firstAttempt = true;     
        this._question.num ++;
        
         if (this._question.category == 1) {
             this._question.text = 'Find the number shown on the Abacus.'
         } else { //category ==2
             this._question.placeindex = vGame.rnd.integerInRange(0,  this._abacus.NumberofBars -1); 
             this._question.text = 'If you add one more bead to the ' + this._abacus.BarText[this._question.placeindex] + ' place. Then what would be the number?';

         };
        this._question.text = 'Q' + this._question.num + ': ' + this._question.text;
        //console.log('text Question:', this._question.text);
        
        this.titleText = vGame.make.text(vGame.world.centerX, 50, this._question.text, {
        font: 'bold 15pt TheMinion',
        fill: '#000102',
        align: 'center'
        });
        this.titleText.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
        this.titleText.anchor.set(0.5);
                
        this.add.existing(this.titleText);
        
        //  Create a nice and complex graphics object
        var vGraphics = this.add.graphics(0,0);
        
        // set a fill and line style for the Rectangle bar
        vGraphics.lineStyle(8, 0xFF0000, 0.2);
        vGraphics.beginFill('Black', 0.8);
        vGraphics.drawRect(this._abacus.BaseRectX, this._abacus.BaseRectY, this._abacus.BaseRectW, this._abacus.BaseRectH);
        vGraphics.endFill();

        //vGraphics.lineStyle(5, 0x33FF00);

        var gapBetweenBars = (1 / (this._abacus.NumberofBars -1)) * (this._abacus.BaseRectW - 2 * this._abacus.EndoffsetX);

        vGraphics.lineStyle(5, 0x33FF00);
        for (var i = 0; i < this._abacus.NumberofBars; i++){

            vGraphics.moveTo(this._abacus.BaseRectX + this._abacus.EndoffsetX + gapBetweenBars * i, this._abacus.BaseRectY);
            vGraphics.lineTo(this._abacus.BaseRectX + this._abacus.EndoffsetX + gapBetweenBars * i, this._abacus.BaseRectY - this._abacus.BarLength);

        }

        this._abacus.spriteGroup = vGame.add.group();
        
            
        //  Then generate a texture from it and apply the texture to the sprite
        var spriteAbacus = vGame.add.sprite(0, 0, vGraphics.generateTexture());
        //spriteAbacus.anchor.set(0.5);
        this._abacus.spriteGroup.add(spriteAbacus);

        var textGroup = vGame.add.group()

        //console.log('BaseRectX BaseRectY:', this._abacus.BaseRectX, this._abacus.BaseRectY); 

        var vstyle = { font: "15px Arial", fill: "#ffff00", boundsAlignH: "center", boundsAlignV: "middle"};        
        for (var i = 0; i < this._abacus.NumberofBars; i++){
            //console.log('text XY:', this._abacus.BaseRectX + this._abacus.EndoffsetX + 0.65* this._abacus.BaseRectW - 0.95* gapBetweenBars * i, 1.1* this._abacus.BarLength); 
            
            //vtext is a child of spritegroup, hence its 0, 0 starts from the top left corner of spritegroup. 
            var vtext = new Phaser.Text(vGame, 0, 0, this._abacus.BarText[i], vstyle);            
            vtext.setTextBounds(this._abacus.BaseRectW - gapBetweenBars * i - this._abacus.EndoffsetX, this._abacus.BarLength * 1.09);
            textGroup.add(vtext);
        }        
        this._abacus.spriteGroup.add(textGroup);
        vGame.world.addChild(this._abacus.spriteGroup);
                    
        
        //  And destroy the original graphics object
        vGraphics.destroy();
        //console.log('world center:', vGame.world.centerX, vGame.world.centerY); 
        //console.log('world center:', this._abacus.spriteGroup.width, this._abacus.spriteGroup.height); 
        
        this._abacus.spriteGroup.x = vGame.world.centerX - this._abacus.spriteGroup.width*0.7;
        this._abacus.spriteGroup.y = vGame.world.centerY - this._abacus.spriteGroup.height*0.6;

        this._abacus.BeadNumber = vGame.rnd.integerInRange(this._abacus.MinNumber , this._abacus.MaxNumber);

        //following array is used to create the bar beads
        this._abacus.Number = this._abacus.BeadNumber.toString().split("").map(Number);
        console.log('BeadNumber: ', this._abacus.BeadNumber);
       


        //console.log('answer1: ', this._answer); 
        //console.log('Number: ', this._abacus.Number[0], this._abacus.Number[1], this._abacus.Number[2], this._abacus.Number[3]);



        for (var i = 0; i < this._abacus.NumberofBars; i++){
            
            for (var j = 0; j < 9; j++) {
                this._abacus.Bead = this.add.sprite(0, 0, 'ball');
                this._abacus.Bead.anchor.set(0.5);
                this._abacus.Bead.scale.set(0.2, 0.1);  
                this._abacus.Bead.alpha = 0.5;          
                this._abacus.Bead.x = this._abacus.BaseRectW * 1.01 - this._abacus.EndoffsetX - gapBetweenBars * i;
                this._abacus.Bead.y = this._abacus.BarLength * 0.95 - 25 * j;
                this._abacus.spriteGroup.add(this._abacus.Bead);
                this.add.tween(this._abacus.Bead).to({alpha: 1, rotation: [180 / 2, 0]}, 1000, Phaser.Easing.Quadratic.Out, true);
                if (j >= this._abacus.Number[this._abacus.NumberofBars - 1 - i]){
                    this._abacus.Bead.destroy();
                };
                
            }
            
        };
                    

        this.createOptionSet();
        score._lastEventTrackedTime = vGame.time.time;
    },    
            
    createOptionSet: function(){
        var newoption = null;
        this._optionsVal = [];
        //one of the option set is the answer
        this._optionsVal[0] = this._abacus.BeadNumber;

        //generating random options
        if (this._question.category == 2) {
            //Question category, add one bead to the bar, and tell the answer, following is adding the bead behind the scene.
            this._answer = this._abacus.BeadNumber + Math.pow(10, this._question.placeindex);
            this._optionsVal[1] = this._answer;
            for (var i = 2; i < 4; i++) { //4 options
                newoption = this._answer + vGame.rnd.pick([1, -1]) * Math.floor(Math.pow(10, i -1));
                if (this._optionsVal.includes(newoption)) {
                    console.log('Same options: ', this._optionsVal[0], this._optionsVal[1], this._optionsVal[2], this._optionsVal[3]); 
                    newoption = newoption + 2 * vGame.rnd.pick([1, -1]) * Math.floor(Math.pow(10, i -1));                    
                };
                this._optionsVal[i] = newoption;
            };            
        } else {
            this._answer = this._abacus.BeadNumber;
            for (var i = 1; i < 4; i++) { //4 options
                newoption = this._answer + vGame.rnd.pick([1, -1]) * Math.floor(Math.pow(10, i -1));
                if (this._optionsVal.includes(newoption)) {
                    console.log('Same options: ', this._optionsVal[0], this._optionsVal[1], this._optionsVal[2], this._optionsVal[3]); 
                    newoption = newoption + 2 * vGame.rnd.pick([1, -1]) * Math.floor(Math.pow(10, i -1));                
                };
                this._optionsVal[i] = newoption;
            };             
        };

        console.log('opt: ', this._optionsVal[0], this._optionsVal[1], this._optionsVal[2], this._optionsVal[3]);      

        this._optionsVal.sort(function(a, b){return 0.5 - Math.random()});

        //console.log('answer1: ', this._optionsVal[0]);
        //console.log('answer2: ', this._optionsVal[1]);
        //console.log('answer3: ', this._optionsVal[2]);
        //console.log('answer4: ', this._optionsVal[3]); 

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
            
                this._optionsBoxText[i] = new Phaser.Text(vGame, 0, 0, parseFloat(this._optionsVal[i]).toLocaleString('en'), textStyle);    
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


                this._abacus.spriteGroup.alpha = 0.5;
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
                this._abacus.spriteGroup.alpha = 0.5;
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
            this._abacus.spriteGroup.destroy(true, false);
            this._textMessage.destroy();
            option._group.destroy(true, false);
        
        } 

};


vEgg.ReinforcingPlaceValue.prototype.AllowTurn = function(){
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
    