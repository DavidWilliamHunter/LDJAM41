class Town 
{
	constructor()
	{
		this.noHouses = 10;
		this.created = false;
	}
	
	preload()
	{
		game.load.image('baseMap','assets/backGround.png');
		game.load.image('TownHouseTL','assets/house_TR.png');
		game.load.image('TownHouseTR','assets/house_TR.png');
		game.load.image('TownHouseBL','assets/house_BL.png');
		game.load.image('TownHouseBR','assets/house_BR.png');
		game.load.image('RuinHouseTL','assets/ruin_house_TR.png');
		game.load.image('RuinHouseTR','assets/ruin_house_TR.png');
		game.load.image('RuinHouseBL','assets/ruin_house_BL.png');
		game.load.image('RuinHouseBR','assets/ruin_house_BR.png');
		
	}
	
	create()
	{
		this.background = game.add.tileSprite(0, 0, 800,600, 'baseMap');
		//this.background.scale.setTo(0.5,0.5);
		this.background.sendToBack();
		
		this.houseObjs = new Array()
		this.houseGroup = game.add.group();
		this.houseGroup.enableBody = true;
		this.houseGroup.physicsBodyType = Phaser.Physics.ARCADE;
		this.houseGroup.classType = House;

		for (var i = 0; i < this.noHouses; i++)
		{
			var c = this.houseGroup.create(Math.random() * (game.world.width*0.9) + 25, Math.random() * (game.world.height/2.0) + (game.world.height/2.0) - 50, 'TownHouseTL');
			c.name = 'TownHouse' + i;
			c.create()
			this.houseObjs[i] = c;
		}
		
		this.playerObjs = new Array()
		this.playerObjsGroup = game.add.group();
		this.playerObjsGroup.enableBody = true;
		this.playerObjsGroup.physicsBodyType = Phaser.Physics.ARCADE;
		
		/*for (var i = 0; i < this.noHouses; i++)
		{
			var c = this.playerObjsGroup.create(game.world.randomX, Math.random() * 500, 'TownHouse1');
			c.name = 'PlayerObj' + i;
			this.playerObjs[i] = c;
		}*/
		
		this.created = true;
	}
	
	update()
	{
		this.playerObjs.forEach(function(e) {
			e.update();
		});
	}
	
	render() {
		for (var i = 0; i < this.noHouses; i++)
		{
			this.houseObjs[i].render()
		}
		this.playerObjs.forEach(function(e) { e.render(); });
	}

	destroy()
	{
		for (var i = 0; i < this.noZombies; i++)
		{
			this.houseObjs[i].destroy()
		}
		this.houseGroup.destroy();
		this.houseObjs = new Array();
	}
	
	addTikiBar(x, y)
	{
		var newTikiBar = new TikiBar(game, x, y, 'TikiBar');
		this.playerObjsGroup.add(newTikiBar);
		this.playerObjs.push(newTikiBar);
		newTikiBar.create()
	}
	
	addDanceFloor(x, y)
	{
		var newDanceFloor = new DanceFloor(game, x, y, 'DanceFloor');
		this.playerObjsGroup.add(newDanceFloor);
		this.playerObjs.push(newDanceFloor);
		newDanceFloor.create()
	}	
	
	nearByBuilding(x ,y) {
		var closestDist = 1000000;
		var closestObj = null;
		for(var i=0; i<this.playerObjs.length; ++i)
		{
			if(this.playerObjs[i].isWorking())
			{
				var dist = Phaser.Math.distance(this.playerObjs[i].position.x,
												this.playerObjs[i].position.y,
												x,
												y);
				if(dist <= this.playerObjs[i].effectiveRange)
					if(dist < closestDist)
					{
						closestDist = dist;
						closestObj = this.playerObjs[i];					
					}
			}
		}
		return closestObj;
	}
	
	findNearestHouse(x ,y, distroyed = true) {
		var closestDist = 1000000;
		var closestObj = null;
		for(var i=0; i<this.houseObjs.length; ++i)
		{
			if(this.houseObjs[i].state != this.houseObjs[i].stateEnum.Destroyed)
			{
				var dist = Phaser.Math.distance(this.houseObjs[i].position.x,
												this.houseObjs[i].position.y,
												x,
												y);
			
				if(dist < closestDist)
				{
					closestDist = dist;
					closestObj = this.houseObjs[i];					
				}
			}
		}
		return closestObj;
	}
				
	
}

class House extends Phaser.Sprite
{
	constructor(game, x, y, key, frame) {
		super(game, x, y, key, frame);
		
		this.stateEnum = {
			Safe : 0,
			UnderAttack : 1,
			BeingDestroyed : 2,
			Destroyed: 3
		};
		this.state = this.stateEnum.Safe;
		this.occupants = frame;
		this.attackers = new Set();
		this.health = 10.0;
		this.maxHealth = this.health;
		this.healRate = 1.0;
		this.attackRate = -1.0;
		this.minAttackers = 5;
		this.healthBar = null;
	}
	
	create()
	{
		this.body.immovable = true;
		this.anchor.x = 0.5;
		this.anchor.y = 0.5;
		this.body.setSize(32, 32, 16, 16);

		gameState.houseRemaining+=1;
	}
	
	collide(obj2)
	{
			
	}
	
	canBeAttacked()
	{
		return this.state!=this.stateEnum.Destroyed;
	}
	
	startingAttack(obj2)
	{
		if(this.healthBar==null)
			this.healthBar = new HealthBar(game, this.position.x, this.position.y, 'HealthBar');

		switch(this.state)
		{
		case this.stateEnum.Safe :
			this.attackers = new Set();
		case this.stateEnum.UnderAttack :
			this.attackers.add(obj2);
			this.enterState(this.stateEnum.UnderAttack);
			break;
		}
	}
	
	stoppingAttack(obj2)
	{
		this.attackers.delete(obj2);
		if(this.attackers.size==0)
			this.enterState(this.stateEnum.Safe);
	}
	
	enterState(targetState, param1)
	{
		switch(this.state)
		{
			case this.stateEnum.Destroyed:
				return; /// no value transition from this
		}
		switch(targetState)
		{
			case this.stateEnum.Destroyed:
				if(this.state!=this.stateEnum.Destroyed)
				{
					this.attackers.forEach(function(e) {
						e.stopAttack(this);
					});
					this.loadTexture('RuinHouseTL');
					gameState.houseRemaining--;
				}
				break;
		}
		this.state = targetState;

	}
	
	
	update() {
		if(this.healthBar)
		{
			this.healthBar.update();
			this.healthBar.currentHealth = this.healthBar.maxHealth * this.maxHealth / this.health;
		}
		switch(this.state)
		{
			case this.stateEnum.Safe:
				this.health += this.healRate * (game.time.elapsed / 1000.0);
				if(this.health > this.maxHealth)
					this.health = this.maxHealth;
				break;
			case this.stateEnum.UnderAttack:
		
				if(this.attackers.size >= this.minAttackers)
				{
					this.enterState(this.stateEnum.BeingDestroyed,0);
				}
				break;
			case this.stateEnum.BeingDestroyed:
				this.health += this.attackRate * (game.time.elapsed / 1000.0);
				if(this.health < 0.0)
					this.enterState(this.stateEnum.Destroyed,0);
				break;
		}
		
		
		
	}
	
	render()
	{
		
		//game.debug.body(this);
	}
			
}


class Building extends Phaser.Sprite
{
	constructor(game, x, y, key, frame) {
		super(game, x, y, key, frame);
		game.add.existing(this);
	}
}

class Boom extends Phaser.Sprite
{
	constructor(game, x, y, key, frame){
		super(game, x, y, key, frame)
		game.add.existing(this)
		this.circRad = [1.0];
		this.maxRad = 4;
		this.alpha = 0.2;
	};
	
	create()
	{
		this.anchor.x = 0.5;
		this.anchor.y = 0.5;
		
	}
	
	update()
	{
		for(var i=0; i<this.circRad.length; ++i)
		{
			this.circRad[i]+= 1 * (game.time.elapsed/1000.0);
			if(this.circRad[i] > this.maxRad)
				this.circRad[i] = 0;
			this.scale.x = this.circRad[i];
			this.scale.y = this.circRad[i];
		}
	}
}

class HealthBar extends Phaser.Sprite
{
	constructor(game, x, y, key, frame){
		super(game, x, y, key, frame)
		game.add.existing(this)
		this.maxHealth = 100.0;
		this.currentHealth = 100.0;
		this.anchor.x = 0.5;
		this.anchor.y = 10.0;		
		this.scale.x = (this.maxHealth / this.currentHealth) * 0.5;

	}
		
	update()
	{
		this.scale.x = (this.maxHealth / this.currentHealth) * 0.5;
	}		
}

class Venue extends Phaser.Sprite
{
	constructor(game, x, y, key, frame) {
		super(game, x, y, key, frame);
	}
}

class TikiBar extends Venue
{
	constructor(game, x, y, key, frame) {
		super(game, x, y, key, frame);
		this.reset();
	}
	
	create() {
		//var tikiBar = game.add.image(game.width/2+45, game.height-5, 'TikiBar');
		this.anchor.x = 0.5;
		this.anchor.y = 0.5;
		this.scale.x = 0.9;
		this.scale.y = 0.9;
		this.bringToTop();
		
		this.inputEnabled = true;
		this.game.physics.arcade.enable(this);
		this.enableBody = true;
		this.body.immovable = true;
		
		this.healthBar = new HealthBar(game, this.position.x, this.position.y, 'HealthBar');
		
		this.boom = new Boom(game, this.position.x, this.position.y, 'Praxis');
		this.boom.create();
		//this.addChild(this.boom);
		this.boom.bringToTop();
		

	}
	
	update()
	{
		this.boom.update()
		this.healthBar.update();
	}
	
	render()
	{
		//game.debug.body(this.boom);
		//game.debug.body(this);
	}
	
	reset()
	{
		this.effectiveRange = 250;
		this.drinksCapacity = 25;
		this.drinksRemaining = 25;
		this.drinkName = 'BrainDamage';
		this.drinkDamage = 10;
		this.resellValue = 5;
	}
		
	hasDrinks()
	{
		return this.drinksRemaining > 0;
	}
	
	drink(zombie)
	{
		if(this.hasDrinks())
		{
			if(gameState.sell(this.resellValue))
			{
				this.drinksRemaining-=1;
				if(this.drinksRemaining<=0)
					this.outOfDrinks();
				zombie.damage(this.drinkDamage);
				console.log("Zombie Drank: " , zombie.health);
				this.healthBar.currentHealth = this.healthBar.maxHealth * this.drinksCapacity / this.drinksRemaining;
			}
		}
	}
	
	outOfDrinks()
	{
		this.tint = 0xFF0000;
	}
	
	addDrink(name, amount, damage, resellValue)
	{
		this.drinkName = name;
		this.drinksRemaining += amount;
		this.drinkDamage = damage;
		this.resellValue = resellValue;
		
		this.healthBar.currentHealth = this.healthBar.maxHealth * this.drinksCapacity / this.drinksRemaining;
		
		this.tint = 0xFFFFFF;
		
		console.log("Added Drink :" + name);
		console.log("Added Drink new drinksRemaining :" + this.drinksRemaining);
	}
	
	isWorking()
	{
		return this.hasDrinks();
	};
	
	collide(obj2){}
}
	
class DanceFloor extends Venue
{
	constructor(game, x, y, key, frame) {
		super(game, x, y, key, frame);
		this.reset();
	}
	
	create() {
		//var tikiBar = game.add.image(game.width/2+45, game.height-5, 'TikiBar');
		this.anchor.x = 0.5;
		this.anchor.y = 0.5;
		this.scale.x = 0.9;
		this.scale.y = 0.9;
		this.bringToTop();
		
		this.inputEnabled = true;
		this.game.physics.arcade.enable(this);
		this.enableBody = true;
		this.body.immovable = true;
		
		this.healthBar = new HealthBar(game, this.position.x, this.position.y, 'HealthBar');
		
		this.boom = new Boom(game, this.position.x, this.position.y, 'Praxis');
		this.boom.create();
		//this.addChild(this.boom);
		this.boom.bringToTop();
		
		this.noSongCoolDownTime = 25000;
		this.restartTunes = 0;

	}
	
	update()
	{
		this.songTimeRemaining -= game.time.elapsed;
		if(this.songTimeRemaining<0)
		{
			this.songTimeRemaining = 0;
			if(this.restartTunes==0)
			{
				this.boom.kill();
				this.restartTunes = game.time.now + this.noSongCoolDownTime;
			} else {
				if(this.restartTunes <= game.time.now)
				{
					this.boom.Revive();
					this.reset();
				}
			}				
		}
		
		this.healthBar.currentHealth = this.healthBar.maxHealth * this.songCapacity / this.songTimeRemaining;

		this.boom.update()
		this.healthBar.update();
	}
	
	render()
	{
		//game.debug.body(this.boom);
		//game.debug.body(this);
	}
	
	reset()
	{
		this.effectiveRange = 350;
		this.songCapacity = 100000;
		this.songTimeRemaining = 100000;
		this.resellValue = 0.25;
		this.danceDamage = 2.5;
		this.restartTunes = 0;
		
	}
		
	hasDrinks()
	{
		return this.songTimeRemaining > 0;
	}
	
	drink(zombie)
	{
		if(this.hasDrinks())
		{
			gameState.sell(this.resellValue);
			zombie.damage(this.danceDamage);
			console.log("Zombie Drank: " , zombie.health);			
		}
	}
	
	outOfDrinks()
	{
		this.tint = 0xFF0000;
	}
	
	
	isWorking()
	{
		return this.hasDrinks();
	};
	
	collide(obj2){}
}


class PlayerObj extends Phaser.Sprite
{
	constructor(game, x, y, key, frame) {
		super(game, x, y, key, frame);
	}
	
	preload()
	{
		this.kill();
	}
}
	