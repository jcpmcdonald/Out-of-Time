"use strict";

// The Grid component allows an element to be located
// on a grid of tiles
Crafty.c('Grid',
{
	
	init: function()
	{
		this.attr({
			w: Game.map_grid.tile.width,
			h: Game.map_grid.tile.height
		})
	},
	 
	// Locate this entity at the given position on the grid
	at: function(x, y)
	{
		if (x === undefined && y === undefined) {
			return { x: this.x/Game.map_grid.tile.width, y: this.y/Game.map_grid.tile.height }
		} else {
			this.attr({ x: x * Game.map_grid.tile.width, y: y * Game.map_grid.tile.height });
			return this;
		}
	},
	
	tileX: function()
	{
		return this.x / Game.map_grid.tile.width;
	},
	
	tileY: function()
	{
		return this.y / Game.map_grid.tile.height;
	},
});


Crafty.c('Actor', {
	
	init: function() {
		this.requires('2D, Canvas, Grid, Collision');
		this._facing = 2;
	},
	
	facing: function(face)
	{
		if (face === undefined)
		{
			return this._facing;
		}
		else
		{
			this._facing = (face + 4) % 4;
			//Crafty.trigger('NewDirection', this);
			return this;
		}
	},
	
});


Crafty.c('LPCAnimation', {
	init: function() {
		this.requires('SpriteAnimation')
			.animate('spell0', 0, 0, 6)
			.animate('spell1', 0, 3, 6)
			.animate('spell2', 0, 2, 6)
			.animate('spell3', 0, 1, 6)
			.animate('standing0', 0, 8, 0)
			.animate('standing1', 0, 11, 0)
			.animate('standing2', 0, 10, 0)
			.animate('standing3', 0, 9, 0)
			.animate('walking0', 0, 8, 8)
			.animate('walking1', 0, 11, 8)
			.animate('walking2', 0, 10, 8)
			.animate('walking3', 0, 9, 8)
			.animate('die0', 0, 20, 5)
			.animate('die1', 0, 20, 5)
			.animate('die2', 0, 20, 5)
			.animate('die3', 0, 20, 5)
			.animate('victory0', 5, 0, 5)
			.animate('victory1', 5, 3, 5)
			.animate('victory2', 5, 2, 5)
			.animate('victory3', 5, 1, 5)
			;
			
		this.bind('Moved', function(from){
			//set z-index
			this.z = Math.floor(this._y + this._h/2);
		});
	}
});


Crafty.c('Wall', {
	init: function() {
		this.requires('2D, Grid, Solid');
	},
});


Crafty.c('PlayerCharacter', {
	stopped: null,
	anim: null,
	alive: true,
	
	init: function() {
		this.requires('Actor, Fourway, spr_hero, LPCAnimation')
			.fourway(4)
			.collision( new Crafty.circle(32, 48, 16));
			
		this._w = 64;
		this._h = 64;
		
		this.animate('standing1', 10, 0);
		
		this.bind('Moved', function(from){
			if( this.hit('Obstacle') || !this.alive){
				this.attr({x: from.x, y:from.y});
			}
			
			if(Game.outOfTime && this.alive)
			{
				var hitSkeletons = this.hit('Skeleton');
				if(hitSkeletons){
					//console.log(hitSkeletons);
					for(var i = 0; i < hitSkeletons.length; i++)
					{
						if(hitSkeletons[i].obj.alive)
						{
							hitSkeletons[i].obj.alive = false;
							hitSkeletons[i].obj.animate('die0', 10, 0);
							Crafty.audio.play('bones');
							Game.skeletonsInArea --;
							if(Game.skeletonsInArea <= 0)
							{
								Game.canLeaveArea = true;
								
								if(Game.viewX == 0 && Game.viewY == 0)
								{
									var bg = Crafty.e('2D, DOM, Color')
										.color('#AAAAAA');
									
									bg.w = 200;
									bg.h = 150;
									bg.alpha = 0.5;
									bg.x = Game.viewX + Game.width()/2 - 50;
									bg.y = Game.viewY +  Game.height()/2 - 24;
									bg.z = 99999998;
									
									
									var txt = Crafty.e('2D, DOM, Text')
										.text('Time has been mended!')
										//.attr({ x: Game.width()/2 - 50, y: Game.height()/2 - 24, w:200, h:200 })
										.textColor('#000000')
										.textFont({ size: '20px', weight: 'bold' })
										.unselectable();
										
									txt.x = Game.viewX + Game.width()/2 - 50;
									txt.y = Game.viewY +  Game.height()/2 - 24;
									txt.z = 99999999;
									
									Game.gameOver = true;
								}
							}
							
							//this.anim = 'spell' + this.facing();
							//this.animate(this.anim, 10, 0);
						}
					}
				}
			}
			
			
			if(this.hit('ClockPiece'))
			{
				this.hit('ClockPiece')[0].obj.destroy();
				Crafty.audio.play('clockworkPickup');
				Game.gearsCollected ++;
				
				if(Game.gearsCollected >= 3)
				{
					var bg = Crafty.e('2D, DOM, Color')
						.color('#AAAAAA');
					
					bg.w = 200;
					bg.h = 150;
					bg.alpha = 0.5;
					bg.x = Game.viewX + Game.width()/2 - 50;
					bg.y = Game.viewY +  Game.height()/2 - 24;
					bg.z = 99999998;
					
					
					var txt = Crafty.e('2D, DOM, Text')
						.text('The time is now<br>Now is the time<br>For you must fix<br>Time itself')
						//.attr({ x: Game.width()/2 - 50, y: Game.height()/2 - 24, w:200, h:200 })
						.textColor('#333333')
						.textFont({ size: '20px', weight: 'bold' })
						.unselectable();
					
					txt.w = 400;
					txt.x = Game.viewX + Game.width()/2 - 50;
					txt.y = Game.viewY +  Game.height()/2 - 24;
					txt.z = 99999999;
					
					
					var skeletonLocations = [];
					// In Town
					skeletonLocations.push({x:900, y:992});
					skeletonLocations.push({x:1132, y:936});
					skeletonLocations.push({x:1168, y:664});
					skeletonLocations.push({x:1468, y:688});
					skeletonLocations.push({x:1484, y:832});
					
					// In Town 2
					skeletonLocations.push({x:752, y:784});
					skeletonLocations.push({x:620, y:868});
					skeletonLocations.push({x:480, y:588});
					skeletonLocations.push({x:276, y:748});
					skeletonLocations.push({x:96, y:912});
					
					// South of town
					skeletonLocations.push({x:104, y:1128});
					skeletonLocations.push({x:492, y:1156});
					skeletonLocations.push({x:644, y:1356});
					skeletonLocations.push({x:404, y:1344});
					skeletonLocations.push({x:140, y:1376});
					
					
					// Clock room
					skeletonLocations.push({x:352, y:144});
					skeletonLocations.push({x:500, y:136});
					skeletonLocations.push({x:608, y:216});
					skeletonLocations.push({x:652, y:320});
					skeletonLocations.push({x:224, y:322});
					skeletonLocations.push({x:220, y:192});
					
					// Create some zombies in town
					for(var i = 0; i < skeletonLocations.length; i++)
					{
						Game.skeletons.push(Crafty.e('Skeleton')
							.attr({x:skeletonLocations[i].x, y:skeletonLocations[i].y, z:1}));
						
						// Game.skeletons.push(Crafty.e('Dummy')
							// .attr({x:skeletonLocations[i].x, y:skeletonLocations[i].y, z:1}));
					}
					
					
				}
			}
			
			if(!Game.keepPlayerInSight(this))
			{
				this.attr({x: from.x, y:from.y});
			}
		});
		
		this.bind('NewDirection', function(newDir){
			
				if(!this.alive){ return; }
			
			this.stopped = false;
			if(newDir.x > 0) {
				this.facing(1);
			}else if(newDir.x < 0) {
				this.facing(3);
			}else if(newDir.y > 0) {
				this.facing(2);
			}else if(newDir.y < 0){
				this.facing(0);
			}else{
				this.stopped = true;
			}
			
			if(!this.stopped)
			{
				this.anim = 'walking' + this.facing();
				this.animate(this.anim, 10, -1);
			}
			else
			{
				this.anim = 'standing' + this.facing();
				this.animate(this.anim, 10, 0);
			}
		});
	},
});



Crafty.c('Dummy', {
	init: function() {
		this.requires('Actor, spr_skeleton, LPCAnimation')
			.collision( new Crafty.circle(32, 48, 16));
	},
	
	process: function(delta){
	}
});



Crafty.c('Skeleton', {
	stopped: null,
	anim: null,
	victory: false,
	alive: true,
	active: false,
	
	history: [],
	
	init: function() {
		this.requires('Actor, spr_skeleton, LPCAnimation')
			.collision( new Crafty.circle(32, 48, 16));
			
		this._w = 64;
		this._h = 64;
		
		this.animate('standing1', 10, 0);
		
		this.bind('Moved', function(from){
			if( this.hit('Obstacle')){
				this.attr({x: from.x, y:from.y});
			}
		});
		
		this.bind('NewDirection', function(newDir){
			
			
		});
	},
	
	
	process: function(delta){
		
		if(!this.active || !this.alive){ return; }
		
		if(delta > 0 && !this.victory)
		{
			// if(!this.isPlaying())
			// {
				// this.resumeAnimation();
			// }
			
			// Move toward hero
			var newDir = new Crafty.math.Vector2D(this._x - Game.player._x, this._y - Game.player._y);
			newDir = newDir.scaleToMagnitude(-1);
			
			this.x += newDir.x;
			this.y += newDir.y;
			
			
			this.stopped = false;
			if(newDir.x != 0 && Crafty.math.abs(newDir.x) >= Crafty.math.abs(newDir.y)) {
				if(newDir.x > 0){
					this.facing(1);
				}else{ //  if(newDir.x < 0) {
					this.facing(3);
				}
			}else if(Crafty.math.abs(newDir.x) < Crafty.math.abs(newDir.y)){
				if(newDir.y > 0) {
					this.facing(2);
				}else if(newDir.y < 0){
					this.facing(0);
				}
			}else{
				this.stopped = true;
			}
			
			if(!this.stopped)
			{
				this.anim = 'walking' + this.facing();
				if(!this.isPlaying(this.anim))
				{
					this.animate(this.anim, 30, -1);
				}
			}
			else
			{
				this.anim = 'standing' + this.facing();
				if(!this.isPlaying(this.anim))
				{
					this.animate(this.anim, 30, 0);
				}
			}
			
			
			if( this.hit('PlayerCharacter') && !Game.outOfTime)
			{
				if(Game.player.alive)
				{
					Game.player.alive = false;
					Game.player.removeComponent('Fourway');
					Game.player.animate('die0', 10, 0);
					
					this.victory = true;
					this.anim = 'victory' + this.facing();
					this.animate(this.anim, 0, 0);
					
					Crafty.audio.play('dead');
					var txt = Crafty.e('2D, DOM, Text')
						.text('YOU ARE DEAD')
						//.attr({ x: Game.width()/2 - 50, y: Game.height()/2 - 24, w:200, h:200 })
						.textColor('#000000')
						.textFont({ size: '20px', weight: 'bold' })
						.unselectable();
						
					txt.x = Game.viewX + Game.width()/2 - 50;
					txt.y = Game.viewY +  Game.height()/2 - 24;
					txt.z = 99999999;
				}
			}
			
		}
		else if(delta <= 0)
		{
			// Reverse time. I can do that, right?
			this.anim = 'standing' + this.facing();
			if(!this.isPlaying(this.anim))
			{
				this.animate(this.anim, 30, 0);
			}
		}
	}
});




Crafty.c('ClockPiece', {
	
	init: function() {
		this.requires('Actor, spr_clockwork')
			.collision( new Crafty.circle(32, 48, 16));
			
		this._w = 64;
		this._h = 64;
	},
});




