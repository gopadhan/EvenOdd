vEgg.Preloader = function(vGame){
	// define width and height of the game
	//vEgg.GAME_WIDTH = 640;
	//vEgg.GAME_HEIGHT = 960;
};
vEgg.Preloader.prototype = {
	preload: function(){
		// set background color and preload image

		this.stage.backgroundColor = '#B4D9E7';
		this.preloadBar = this.make.sprite((vEgg.GAME_WIDTH-311)/2, (vEgg.GAME_HEIGHT-27)/2, 'preloaderBar');
		this.load.setPreloadSprite(this.preloadBar);
		// load images
		 this.load.image('background', 'gameassets/images/background.png');
		 this.load.image('explosion', 'gameassets/images/fission.png');
		 this.load.image('clockface', 'gameassets/images/ClockFace.png');		
		 this.load.image('hourhand', 'gameassets/images/HourHand.png');	
		 this.load.image('minutehand', 'gameassets/images/MinuteHand.png');			 		  
		
		// load spritesheets		
		this.load.spritesheet('button-play', 'gameassets/images/playbutton.png', 512, 512);
		
	},
	create: function(){
		// start the MainMenu state
		this.state.start('MainMenu');
	}
};