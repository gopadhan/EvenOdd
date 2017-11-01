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
		
		// load spritesheets		
		this.load.spritesheet('button-play', 'gameassets/images/playbutton.png', 512, 512);
		this.load.spritesheet('egg1place', 'gameassets/images/eggonesplace.png', 600, 600);
		this.load.spritesheet('egg10place', 'gameassets/images/eggtensplace.png', 600, 600);
		this.load.spritesheet('egg100place', 'gameassets/images/egghundredplace.png', 600, 600);
		this.load.spritesheet('star', 'gameassets/images/star.png', 512, 512);
		this.load.spritesheet('present', 'gameassets/images/present.png', 512, 512);
		this.load.spritesheet('ring', 'gameassets/images/ring.png', 512, 512);
		this.load.spritesheet('chest', 'gameassets/images/chest.png', 512, 512);
		
	},
	create: function(){
		// start the MainMenu state
		this.state.start('MainMenu');
	}
};