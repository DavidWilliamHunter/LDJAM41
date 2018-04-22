class GameState
{
	constructor()
	{

		
		this.stateEnum = {
			Intructions : 0,
			ZombieWave : 1,
			Defeated : 2,
			Victory: 3
		};
		
		this.state = this.stateEnum.Intructions;
	}
	
	preload()
	{
		game.load.image('ToolBar','assets/toolBar.png');
		game.load.image('TikiBar','assets/tikiBar.png');
		game.load.image('DanceFloor','assets/danceFloor.png');
		game.load.image('Praxis','assets/praxis.png');
		game.load.image('HealthBar','assets/healthBar.png');
		game.load.image('UnHealthyPotion','assets/unhealthyPotion.png');		
	}
	
	create()
	{
		this.enterState(this.stateEnum.Intructions);
		this.enterState(this.stateEnum.ZombieWave);

		//var toolBar = game.add.image(game.width/2, game.height - 70, 'ToolBar');
		this.toolBar = game.add.image(game.width/2, game.height, 'ToolBar');
		
		this.toolBar.anchor.x = 0.5;
		this.toolBar.anchor.y = 1.0;
		this.toolBar.bringToTop();
		
		this.tikiBar = new TikiBarMenuItem(game, game.width/2-115, game.height-35, 'TikiBar');
		//this.tikiBar = new TikiBarMenuItem(game, game.width/2+45, game.height-35, 'TikiBar');
		this.tikiBar.create();
		
		this.danceFloor = new DanceFloorMenuItem(game, game.width/2-46, game.height-35, 'DanceFloor');
		this.danceFloor.create();		
		
		this.unhealthyPotion = new UnHealthyPotionMenuItem(game, game.width/2+190, game.height-35, 'UnHealthyPotion');
		this.unhealthyPotion.create();
		

	}
	
	render()
	{
		var x = 32;
		var y = 0;
		var yi = 32;
		
		game.debug.text('Zombie Tycoon', x, y += yi);
		
		var statusString = "Zombie Remaining : " + zombies.zombieCount() + " Houses Remaining: " + this.houseRemaining + ". Cash Remaining: " + this.money;
		
		game.debug.text(statusString, x, y+= yi);
		
		statusString = "Time to next uprising : " + (this.zombieTimer - game.time.now);
		
		game.debug.text(statusString, x, y+= yi);
		
		this.tikiBar.render();
		this.danceFloor.render();
		this.unhealthyPotion.render();
	}
	
	update()
	{
		switch(this.state)
		{
			case this.stateEnum.ZombieWave:
				if(this.zombieTimer <= game.time.now)
				{
					zombies.newZombieWave();
					this.zombieTimer = game.time.now + this.zombieDiff;
				}
				break;
					
		}
	}
				
	
	isValidState(target)
	{
		switch(target)
		{
			case this.stateEnum.Intructions : // reset equivalent
				return true;
			case this.stateEnum.ZombieWave :
				return this.state==this.stateEnum.Intructions;  // only start zombie wave from Instructions
			case this.stateEnum.Defeated :
				return this.state==this.stateEnum.ZombieWave;  // can only be defeated by zombie wave
			case this.stateEnum.Victory :
				return this.state==this.stateEnum.ZombieWave;  // can only be victorious by zombie wave	
		}
	}

	enterState(target)
	{
		if(!this.isValidState(target))
			return false;
		switch(target)
		{
			case this.stateEnum.Intructions : // reset equivalent
				this.restart();
				break;
			case this.stateEnum.ZombieWave :
				this.startZombieWaves();
				break;
			case this.stateEnum.Defeated:
				this.doDefeat();
				break;
			case this.stateEnum.Victory() :
				this.doVictory();
		}
		this.state = target;
	}
	
	restart()
	{
		this.houseRemaining = 0;
		this.money = 500;
		this.zombieWave = 0;
		this.zombieTimer = game.time.now + 10000;
		this.zombieDiff = 10000;
		
		if(this.state!=this.stateEnum.Intructions)
		{
			zombies.destroy();
			town.destroy();
		}
		zombies.create();
		town.create();
	}
	
	startZombieWaves()
	{
		//if(this.state!=this.stateEnum.ZombieWave) // already in wave
		//{
		//	this.zombieWave = 0;
		//	this.zombieTimer = game.time.now + this.zombieTimer;
		//}
	}
	
	
	/*
	* Money functions
	*/
	spend(amount)
	{
		if( (this.money - amount) < 0 )
			return false;
		this.money -= amount;
		return true;
	}
	
	sell(amount)
	{
		if(amount < 0)
			return false;
		this.money+=amount;
		return true;
	}

	
}

class MenuBarItem extends Phaser.Sprite {
	constructor(game, x, y, key, frame) {
		super(game, x, y, key, frame);
		this.validLocation = true;
		game.add.existing(this);
		this.startLocX = x;
		this.startLocY = y;
	}
	
	create() {
		//var tikiBar = game.add.image(game.width/2+45, game.height-5, 'TikiBar');
		this.anchor.x = 0.5;
		this.anchor.y = 0.5;
		this.scale.x = 0.9;
		this.scale.y = 0.9;
		this.bringToTop();
		
		this.inputEnabled = true;
		this.input.enableDrag();
		this.events.onDragStart.add(this.onDragStart, this);
		this.events.onDragStop.add(this.onDragEnd, this);
		this.events.onDragUpdate.add(this.onDragUpdate, this);
		
		this.game.physics.arcade.enable(this);
		this.enableBody = true;
		this.body.immovable = true;

	}	
}

class TikiBarMenuItem extends MenuBarItem
{
	constructor(game, x, y, key, frame) {
		super(game, x, y, key, frame);
		this.validLocation = true;
	}
	
	create() {
		//var tikiBar = game.add.image(game.width/2+45, game.height-5, 'TikiBar');
		super.create();

	}
	
	onDragStart(sprite, pointer)
	{
	}
	
	onDragEnd(sprite, pointer)
	{
		if(this.validLocation)
		{
			if(gameState.spend(150))
			{
				town.addTikiBar(sprite.x, sprite.y);
			}
		} 
		this.x = this.startLocX;
		this.y = this.startLocY;
	}
	
	onDragUpdate(sprite, pointer)
	{
		var collisionFound = false;
		game.physics.arcade.overlap(this, town.houseGroup, function(obj1, obj2){
			if(obj2 instanceof House)
			{
				this.validLocation = false;
				this.tint = 0xFF0000;
				collisionFound = true;
			}
		}, null, this);
		game.physics.arcade.overlap(this, town.playerObjsGroup, function(obj1, obj2){
			if(obj2 instanceof House)
			{
				this.validLocation = false;
				this.tint = 0xFF0000;
				collisionFound = true;
			}
		}, null, this);				
		if(!collisionFound)
		{
			this.tint = 0xFFFFFF;
			this.validLocation = true;
		}
		
	}
	
	render()
	{
		game.debug.text('$150', this.position.x, this.position.y-5);

		//game.debug.body(this);
	}

}

class DanceFloorMenuItem extends MenuBarItem
{
	constructor(game, x, y, key, frame) {
		super(game, x, y, key, frame);
		this.validLocation = true;
	}
	
	create() {
		//var tikiBar = game.add.image(game.width/2+45, game.height-5, 'TikiBar');
		super.create();

	}
	
	onDragStart(sprite, pointer)
	{
	}
	
	onDragEnd(sprite, pointer)
	{
		if(this.validLocation)
		{
			if(gameState.spend(500))
			{
				town.addDanceFloor(sprite.x, sprite.y);
			}
		} 
		this.x = this.startLocX;
		this.y = this.startLocY;
	}
	
	onDragUpdate(sprite, pointer)
	{
		var collisionFound = false;
		game.physics.arcade.overlap(this, town.houseGroup, function(obj1, obj2){
			if(obj2 instanceof House)
			{
				this.validLocation = false;
				this.tint = 0xFF0000;
				collisionFound = true;
			}
		}, null, this);
		game.physics.arcade.overlap(this, town.playerObjsGroup, function(obj1, obj2){
			if(obj2 instanceof House)
			{
				this.validLocation = false;
				this.tint = 0xFF0000;
				collisionFound = true;
			}
		}, null, this);		
		if(!collisionFound)
		{
			this.tint = 0xFFFFFF;
			this.validLocation = true;
		}
		
	}
	
	render()
	{
		game.debug.text('$500', this.position.x, this.position.y);

		//game.debug.body(this);
	}

}

class UnHealthyPotionMenuItem extends MenuBarItem
{
	constructor(game, x, y, key, frame) {
		super(game, x, y, key, frame);
		this.validLocation = false;
		this.targetBar = null;
	}
	
	create()
	{
		super.create();
	}

	onDragStart(sprite, pointer)
	{
	}
	
	onDragEnd(sprite, pointer)
	{
		if(this.targetBar!=null)
		{
			if(gameState.spend(50))
			{
				this.targetBar.addDrink('UnHealthyPotion', 100, 10, 3);			
			}
		} 
		this.x = this.startLocX;
		this.y = this.startLocY;
		this.validLocation = false;
		this.targetBar = null;
	}
	
	onDragUpdate(sprite, pointer)
	{
		var collisionFound = false;
		game.physics.arcade.overlap(this, town.playerObjsGroup, function(obj1, obj2){
			if(obj2 instanceof TikiBar)
			{
				this.validLocation = true;
				this.tint = 0xFFFFFF;
				collisionFound = true;
				this.targetBar = obj2;
			}
		}, null, this);
		if(!collisionFound)
		{
			this.tint = 0xFF0000;
			this.validLocation = false;
		}
		
	}
	
	render()
	{
		game.debug.text('$150', this.position.x, this.position.y-5);

		//game.debug.body(this);
	}	
}