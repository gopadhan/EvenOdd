// Constants
var GAME_WIDTH = 800; //window.innerWidth * window.devicePixelRatio; //800;
var GAME_HEIGHT = 600; //window.innerHeight * window.devicePixelRatio; //600;

var vGame;

var vGameOptions = {
      playSound: true,
      playMusic: true
	};
	

//bring Phaser to life by creating an instance of a Phaser.Game object and assigning it to a 
//global variable called 'game', The third parameter can be either Phaser.CANVAS, Phaser.WEBGL, 
//or Phaser.AUTO. This is the rendering context that you want to use
//4h parameter is id of the DOM element in which you would like to insert the canvas element that Phaser creates.

window.onload = function() {	      
	vGame = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, 'game');
							
    vGame.state.add('Main', vEgg.main);

    //Start the first state          
    vGame.state.start('Main');
  }

////////////////////////////////////////////////////////////////////////////////

var vEgg = {};
vEgg.main = function(vGame){};
vEgg.main.prototype = {

    //Phaser automatically look preload function when it starts and load anything defined within it.
    //we're going to load everything we need to show our cool splash screen, then we'll use the state system to switch to our awesome splash screen once it is ready.
 
	preload: function(){

        // preload the loading indicator first before anything else
        this.load.image('preloaderBar',  'gameassets/images/loading.png');

        this.load.script('Preloader',  'gamejs/states/Preloader.js');
        this.load.script('MainMenu',  'gamejs/states/MainMenu.js');
        this.load.script('Game',  'gamejs/states/Game.js');        
        
        //console.log('starting......' , this.whoami);

        this.load.image('brand',  'gameassets/images/logo.png');    
  },
  
	create: function(){
		// set scale options
		//this.input.maxPointers = 1;
		//this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		//this.scale.pageAlignHorizontally = true;
		//this.scale.pageAlignVertically = true;
        //this.scale.setScreenSize(true);
        this.stage.backgroundColor = '#020028';

        
        this.state.add('Preloader', vEgg.Preloader);
        this.state.add('MainMenu', vEgg.MainMenu);
        this.state.add('Game', vEgg.Game);
        
		// start the Splash state
		this.state.start('Preloader');
	}
};

