vEgg.MainMenu = function(vGame){};
vEgg.MainMenu.prototype = {
	create: function(){
		// display images
        var vBackground = this.add.sprite(0, 0, 'background');
    
        vBackground.height = GAME_HEIGHT;
        vBackground.width = GAME_WIDTH;
		//this.add.sprite(-130, vEgg.GAME_HEIGHT-514, 'monster-cover');
		//this.add.sprite((vEgg.GAME_WIDTH-395)/2, 60, 'title');
		// add the button that will start the game
        var vPlayButton = this.add.button(GAME_WIDTH-401-10, GAME_HEIGHT-143-10, 'button-play', this.startGame, this, 1, 0, 2);
        vPlayButton.scale.set(0.2);
	},
	startGame: function() {
		// start the Game state
		this.state.start('Game');
	}
};