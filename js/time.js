"use strict";

var $text_css = { 'font': '200% Arial', 'color': 'Black', 'text-align': 'center' }
var TiledMapBuilder;
var tiledmap;


var Game = {
	player: null,
	skeletons: [],
	loadingText: null,
	tickSpeed: 1,
	outOfTime: false,
	timeCount: 0,
	outOfTimeFilter: null,
	gearsCollected: 0,
	gameOver: false,
	
	// This defines our grid's size and the size of each of its tiles
	map_grid: {
		width: 30,
		height: 20,
		tile: {
			width: 32,
			height: 32
		}
	},
	
	
	width: function() {
		return this.map_grid.width * this.map_grid.tile.width;
	},
	height: function() {
		return this.map_grid.height * this.map_grid.tile.height;
	},
	
	viewXIncrement: 0,
	viewYIncrement: 0,
	
	viewX: 0,
	viewY: 0,
	
	canLeaveArea: true,
	skeletonsInArea: 0,
	
	
	// Initialize and start our game
	load: function() {
		// Start crafty and set a background color so that we can see it's working
		Crafty.init(Game.width(), Game.height());
		Crafty.viewport.clampToEntities = false;
		
		this.viewXIncrement = (this.map_grid.width - 4) *  this.map_grid.tile.width;
		this.viewYIncrement = (this.map_grid.height - 4) *  this.map_grid.tile.height;
		
		this.viewX = this.viewXIncrement;
		this.viewY = this.viewYIncrement;
		
		Crafty.scene('Loading');
	},
	
	start: function() {
		console.log('start');
	},
	
	keepPlayerInSight: function(player){
		if(player._x > this.viewX + this.viewXIncrement + this.map_grid.tile.width)
		{
			this.viewX += this.viewXIncrement;
		}
		else if(player._x < this.viewX + this.map_grid.tile.width)
		{
			this.viewX -= this.viewXIncrement;
		}
		
		if(player._y > this.viewY + this.viewYIncrement + this.map_grid.tile.height)
		{
			this.viewY += this.viewYIncrement;
		}
		else if(player._y < this.viewY + this.map_grid.tile.height)
		{
			this.viewY -= this.viewYIncrement;
		}
		
		var moved = false;
		if(Crafty.viewport.x != -Game.viewX)
		{
			if(!Game.canLeaveArea)
			{
				return false;
			}
			
			Crafty.viewport.scroll('_x', -Game.viewX);
			moved = true;
		}
		if(Crafty.viewport.y != -Game.viewY)
		{
			if(!Game.canLeaveArea)
			{
				return false;
			}
			
			Crafty.viewport.scroll('_y', -Game.viewY);
			moved = true;
		}
		
		if(moved)
		{
			// Activate skeletons on this screen, and if there are any, disable leaving
			this.outOfTimeFilter.x = -Crafty.viewport.x;
			this.outOfTimeFilter.y = -Crafty.viewport.y;
			
			Game.skeletonsInArea = 0;
			for(var enemy = 0; enemy < Game.skeletons.length; enemy++)
			{
				if (Game.skeletons[enemy].x > Game.viewX &&
					Game.skeletons[enemy].x < Game.viewX + Game.width() &&
					Game.skeletons[enemy].y > Game.viewY &&
					Game.skeletons[enemy].y < Game.viewY + Game.height() &&
					Game.skeletons[enemy].alive)
				{
					Game.skeletons[enemy].active = true;
					Game.skeletonsInArea ++;
				}
			}
			
			if(Game.skeletonsInArea > 0)
			{
				Crafty.audio.play('wakeUp');
				Game.canLeaveArea = false;
			}
		}
		
		return true;
	},
}


Crafty.scene('Game', function()
{
	
	Crafty.audio.play('clockSound', -1, 1.0);
	
	Game.outOfTimeFilter = Crafty.e("2D, DOM, Color")
			.color('rgb(0, 0, 0)')
			.attr({x:0, y:0, w:1000, h:1000, z:1000000});
	Game.outOfTimeFilter.alpha = 0;
	
	
	
	TiledMapBuilder.createWorld( function( map ){
		tiledmap = map;
		for (var obstacle = 0; obstacle < tiledmap.getEntitiesInLayer('Deep Grass').length; obstacle++){
			tiledmap.getEntitiesInLayer('Deep Grass')[obstacle]
				.addComponent("Collision, Obstacle")
				//.collision( new Crafty.polygon([0,0],[35,0],[25,15]) );
				;
		}
		
		for (var obstacle = 0; obstacle < tiledmap.getEntitiesInLayer('Rock Bottoms').length; obstacle++){
			tiledmap.getEntitiesInLayer('Rock Bottoms')[obstacle]
				.addComponent("Collision, Obstacle")
				//.collision( new Crafty.polygon([0,0],[35,0],[25,15]) );
				;
		}
		
		for (var obstacle = 0; obstacle < tiledmap.getEntitiesInLayer('Tree Bottoms').length; obstacle++){
			tiledmap.getEntitiesInLayer('Tree Bottoms')[obstacle]
				.addComponent("Collision, Obstacle")
				//.collision( new Crafty.polygon([0,0],[35,0],[25,15]) );
				;
		}
		
		for (var obstacle = 0; obstacle < tiledmap.getEntitiesInLayer('Cliffs').length; obstacle++){
			tiledmap.getEntitiesInLayer('Cliffs')[obstacle]
				.addComponent("Collision, Obstacle")
				//.collision( new Crafty.polygon([0,0],[35,0],[25,15]) );
				;
		}
		
		for (var obstacle = 0; obstacle < tiledmap.getEntitiesInLayer('Buildings').length; obstacle++){
			tiledmap.getEntitiesInLayer('Buildings')[obstacle]
				.addComponent("Collision, Obstacle")
				//.collision( new Crafty.polygon([0,0],[35,0],[25,15]) );
				;
		}
		
		for (var obstacle = 0; obstacle < tiledmap.getEntitiesInLayer('Rock Tops').length; obstacle++){
			tiledmap.getEntitiesInLayer('Rock Tops')[obstacle]
				.z = Math.floor(tiledmap.getEntitiesInLayer('Rock Tops')[obstacle]._y + 128 );
		}
		
		for (var obstacle = 0; obstacle < tiledmap.getEntitiesInLayer('Tree Tops').length; obstacle++){
			tiledmap.getEntitiesInLayer('Tree Tops')[obstacle]
				.z = Math.floor(tiledmap.getEntitiesInLayer('Tree Tops')[obstacle]._y + 128 );
		}
		
		Game.player = Crafty.e('PlayerCharacter')
			.attr({x:428, y:332, z:1});
		
		
		Game.keepPlayerInSight(Game.player);
		
		
		
		var skeletonLocations = [];
		// In Town
		skeletonLocations.push({x:396, y:960});
		
		// Town pt 2
		skeletonLocations.push({x:1200, y:652});
		skeletonLocations.push({x:1432, y:788});
		
		// East of town
		skeletonLocations.push({x:2372, y:1116});
		skeletonLocations.push({x:2008, y:624});
		skeletonLocations.push({x:2448, y:592});
		
		// South 1
		skeletonLocations.push({x:592, y:1552});
		skeletonLocations.push({x:308, y:1337});
		
		// South 2
		skeletonLocations.push({x:140, y:1696});
		skeletonLocations.push({x:240, y:1888});
		skeletonLocations.push({x:336, y:2096});
		skeletonLocations.push({x:688, y:1904});
		
		// South 3
		skeletonLocations.push({x:144, y:2464});
		skeletonLocations.push({x:240, y:2272});
		skeletonLocations.push({x:460, y:2224});
		skeletonLocations.push({x:580, y:2512});
		skeletonLocations.push({x:796, y:2272});
		
		// In the graveyard, pt1
		skeletonLocations.push({x:1824, y:108});
		skeletonLocations.push({x:1900, y:316});
		skeletonLocations.push({x:2332, y:116});
		
		// In the graveyard, pt2
		skeletonLocations.push({x:1480, y:400});
		skeletonLocations.push({x:1148, y:356});
		skeletonLocations.push({x:1384, y:264});
		skeletonLocations.push({x:1340, y:96});
		
		// South-east, pt1
		skeletonLocations.push({x:2448, y:1184});
		skeletonLocations.push({x:2320, y:1404});
		skeletonLocations.push({x:1872, y:1376});
		
		// South-east, pt2
		skeletonLocations.push({x:1516, y:1268});
		skeletonLocations.push({x:1168, y:1376});
		skeletonLocations.push({x:996, y:1488});
		skeletonLocations.push({x:1448, y:1576});
		
		// South-east, pt3
		skeletonLocations.push({x:1612, y:1888});
		skeletonLocations.push({x:1604, y:2064});
		skeletonLocations.push({x:1356, y:1780});
		skeletonLocations.push({x:1160, y:1928});
		skeletonLocations.push({x:1060, y:1780});
		
		// South-east, pt4
		skeletonLocations.push({x:1136, y:2196});
		skeletonLocations.push({x:1328, y:2352});
		skeletonLocations.push({x:1548, y:2348});
		skeletonLocations.push({x:1668, y:2192});
		skeletonLocations.push({x:1708, y:2460});
		
		// South-east, pt5
		skeletonLocations.push({x:2192, y:2108});
		skeletonLocations.push({x:2032, y:2468});
		skeletonLocations.push({x:2220, y:2268});
		skeletonLocations.push({x:2484, y:2148});
		skeletonLocations.push({x:2496, y:2476});
		skeletonLocations.push({x:2376, y:2284});
		
		
		for(var i = 0; i < skeletonLocations.length; i++)
		{
			Game.skeletons.push(Crafty.e('Skeleton')
				.attr({x:skeletonLocations[i].x, y:skeletonLocations[i].y, z:1}));
			
			// Game.skeletons.push(Crafty.e('Dummy')
				// .attr({x:skeletonLocations[i].x, y:skeletonLocations[i].y, z:1}));
		}
		
		Crafty.e('ClockPiece').attr({x:1384, y:356, z:1})
		Crafty.e('ClockPiece').attr({x:588, y:2396, z:1})
		Crafty.e('ClockPiece').attr({x:2312, y:2276, z:1})
		
		//Crafty.viewport.follow(Crafty("PlayerCharacter"), 0, 0);
		//Crafty.viewport.scroll('_y', -300);
	});

	
	//var entities = TiledMapBuilder.getEntitiesInLayer( layerName );
	//var layers = TiledMapBuilder.getLayers();
	
	
	//Crafty.viewport.scroll('_y', -Game.viewY);
	
	this.bind("EnterFrame", function(data)
	{
		if(Game.gameOver)
		{
			Game.outOfTime = false;
			Game.outOfTimeFilter.alpha = 0;
			Crafty.audio.play('clockSound', -1, 1.0);
			return;
		}
		
		Game.timeCount ++;
		
		if(Game.outOfTime && Game.timeCount > 120)
		{
			Game.outOfTime = !Game.outOfTime;
			Game.timeCount = 0;
			Game.outOfTimeFilter.alpha = 0;
			Crafty.audio.play('clockSound', -1, 1.0);
		}
		else if(!Game.outOfTime && Game.timeCount > 210)
		{
			Game.outOfTime = !Game.outOfTime;
			Game.timeCount = 0;
			Game.outOfTimeFilter.alpha = 0.4;
			Crafty.audio.stop('clockSound');
		}
		
		
		for(var enemy = 0; enemy < Game.skeletons.length; enemy++)
		{
			if(!Game.outOfTime)
			{
				Game.skeletons[enemy].process(1);
			}
			else
			{
				Game.skeletons[enemy].process(0);
			}
		}
		
		
	});
});



// Loading scene
// -------------
// Handles the loading of binary assets such as images and audio files
Crafty.scene('Loading', function(){
	// Draw some text for the player to see in case the file
	// takes a noticeable amount of time to load
	
	var contentLoaded = false;
	var mapLoaded = false;
	
	Game.loadingText = Crafty.e('2D, Canvas, Text')
		.text('Loading...')
		.attr({ x: Game.width()/2 - 50, y: Game.height()/2 - 24 })
		.textColor('#000000')
		.textFont({ size: '20px', weight: 'bold' })
		.unselectable();
	 
	// Load our sprite map image
	Crafty.load([	'assets/hero.png',
					'assets/skeletonGhost.png',
					'assets/clockwork.png',
					'assets/clock-1.wav',
					'assets/clock-1.mp3',
					'assets/clock-1.ogg',
					'assets/bones.wav',
					'assets/bones.mp3',
					'assets/bones.ogg',
					'assets/dead.wav',
					'assets/dead.mp3',
					'assets/dead.ogg',
					'assets/wakeUp.wav',
					'assets/wakeUp.mp3',
					'assets/wakeUp.ogg',
					'assets/clockworkPickup.wav',
					'assets/clockworkPickup.mp3',
					'assets/clockworkPickup.ogg'], function(){
		
		
		Crafty.sprite(64, 'assets/hero.png', {
			spr_hero: [0, 0],
		});
		
		Crafty.sprite(64, 'assets/clockwork.png', {
			spr_clockwork: [0, 0],
		});
		
		Crafty.sprite(64, 'assets/skeletonGhost.png', {
			spr_skeleton: [0, 0],
		});
		
		Crafty.audio.add({
			clockSound: ['assets/clock-1.mp3',
						 'assets/clock-1.ogg',
						 'assets/clock-1.wav']
		});
		
		Crafty.audio.add({
			dead: ['assets/dead.mp3',
					'assets/dead.ogg',
					'assets/dead.wav']
		});
		
		Crafty.audio.add({
			wakeUp: ['assets/wakeUp.mp3',
					'assets/wakeUp.ogg',
					'assets/wakeUp.wav']
		});
		
		Crafty.audio.add({
			clockworkPickup: ['assets/clockworkPickup.wav',
						'assets/clockworkPickup.mp3',
						'assets/clockworkPickup.ogg',]
		});
		
		Crafty.audio.add({
			bones: ['assets/bones.mp3',
					'assets/bones.ogg',
					'assets/bones.wav']
		});
		
		contentLoaded = true;
		
		if(contentLoaded && mapLoaded)
		{
			Crafty.scene('Game');
		}
		
		
		
		// Crafty.sprite(32, 'assets/arrow.32x32.png', {
			// spr_arrow: [0, 0],
		// });
		// 
		// Crafty.sprite(32, 'assets/tree.png', {
			// spr_tree: [0, 0],
		// });
		// 
		// Crafty.audio.add({
			// arrow_shoot: ['assets/arrow_shoot.mp3',
						  // 'assets/arrow_shoot.ogg']
		// });
		// 
		// // Now that our sprites are ready to draw, start the game
		// Game.contentLoaded = true;
		// if(Game.contentLoaded && Game.scriptsLoaded)
		// {
			// Crafty.scene('Game');
		// }
		// else
		// {
			// Game.loadingText.text('Compiling Scripts...');
		// }
	})
	
	//Crafty.scene('Game');
	
	$.getJSON('world.json', function (SOURCE_FROM_TILED_MAP_EDITOR) {
		TiledMapBuilder = Crafty.e("2D, Canvas, TiledMapBuilder").setMapDataSource( SOURCE_FROM_TILED_MAP_EDITOR );
		
		mapLoaded = true;
		
		if(contentLoaded && mapLoaded)
		{
			Crafty.scene('Game');
		}
		
	});
	
});



