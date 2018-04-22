
class Zombies {
	
	constructor() {
		this.created = false;
		this.noZombies = 50;

	}
	
	preload() {
		/**
		 * Teh Zombies
		 */
		game.load.spritesheet('ZombieJoe', 'assets/zombieJoe_walk.png', 32, 32, 171);
	}
	
	create() {
		this.spriteObjs = new Array()
		this.phaserGroup = game.add.group();
		this.phaserGroup.enableBody = true;
		this.phaserGroup.physicsBodyType = Phaser.Physics.ARCADE;
		
		for (var i = 0; i < this.noZombies; i++)
		{
			/*var c = this.phaserGroup.create(game.world.randomX, Math.random() * 500, 'ZombieJoe', game.rnd.integerInRange(0, 2));
			c.body.angle = 45; game.rnd.frac() * 360;
			c.body.allowRotation = true;
			//c.body.angularVelocity = 15;
			c.name = 'ZombieJoe' + i;
			c.body.immovable = true;
			c.body.velocity.x = -150;
			c.body.setCircle(30);
			c.body.collideWorldBounds = true;*/
			this.phaserGroup.classType = Zombie;
			var c = this.phaserGroup.create(Math.random() * game.world.width, Math.random() * game.world.height, 'ZombieJoe', game.rnd.integerInRange(0, 28));;
		    c.body.setSize(8, 8, 12, 12);

			this.spriteObjs[i] = c;
		}
		this.created = true;
	}
	
	newZombieWave()
	{
		for (var i = 0; i < this.noZombies; i++)
		{
			if(!this.spriteObjs[i].alive)
			{
				this.spriteObjs[i].resurrect();
			}
		}
	}
	
	update(){
		game.physics.arcade.overlap(this.phaserGroup, this.phaserGroup, this.collisionHandler, null, this);
		for (var i = 0; i < this.noZombies; i++)
		{
			if(this.spriteObjs[i].alive)
				this.spriteObjs[i].update()
		}
	}
	
	render() {
		for (var i = 0; i < this.noZombies; i++)
		{
			this.spriteObjs[i].render()
		}
		//if(this.result instanceof Phaser.Sprite)
			//game.debug.spriteInfo(this.result, 32, 32);
		//game.debug.text(this.spriteObjs[0].direction, 32, 32);
//game.debug.text(this.result, 32, 32);
	}
	
	enterState(obj, targetState, param1)
	{
		switch(targetState) {
			case this.stateEnum.Static:
				obj.body.velocity.x = 0;
				obj.body.velocity.y = 0;
				obj.body.angularVelocity = 0;
				
				obj.zombieData.state = targetState;
				break;
			case this.stateEnum.Disorientated:
				obj.body.velocity.x = 0;
				obj.body.velocity.y = 0;
				obj.body.angularVelocity = 15;
				obj.zombieData.state = targetState;
				obj.zombieData.coolDown = game.time.now + param1;
			case this.stateEnum.Shambling:
				obj.body.velocity.x = 0;
				obj.body.velocity.y = 0;
				obj.body.angularVelocity = 0;
				game.physics.arcade.velocityFromAngle(obj.angle, 30, obj.body.velocity)				
				obj.zombieData.state = targetState;			
		}
	}
	
	collisionHandler (obj1, obj2) {
		
		if(obj1!=obj2)
		{
			obj1.collide(obj2);
			obj2.collide(obj1);
		}
	}
	
	click(pointer)
	{
		//	You can hitTest against an array of Sprites, an array of Phaser.Physics.P2.Body objects, or don't give anything
		//	in which case it will check every Body in the whole world.

		this.phaserGroup.forEach(function(e) {
			if(e.getBounds().contains(pointer.x, pointer.y))
				this.result = e;		
			}, this, false);
	}
	
	destroy()
	{
		for (var i = 0; i < this.noZombies; i++)
		{
			this.spriteObjs[i].destroy()
		}
		this.phaserGroup.destroy();
		this.spriteObjs = new Array();
	}
	
	zombieCount() {
		var count = 0;
		for (var i = 0; i < this.noZombies; i++)
		{
			if(this.spriteObjs[i].alive)
				count++;
		}
		return count;
	}
}

function range(start, count) {
  return Array.apply(0, Array(count))
	.map(function (element, index) { 
	  return index + start;  
  });
}

class Zombie extends Phaser.Sprite
{
	constructor(game, x, y, key, frame) {
		super(game, x, y, key, frame);
		this.stateEnum = {
			Static : 0,
			Disorientated : 1,
			Shambling : 2,
			OnRoad : 3,
			ToTarget : 4,
			Attacking : 5,
			Drinking : 6
		};
		this.state = this.stateEnum.Static;
		//this.animations.add('walk');
		//this.animations.play('walk',171, true);
		
		this.animations.add('Static_BR', range(0,8), 30, true);
		this.animations.add('Static_BL', range(43,8), 30, true);
		this.animations.add('Static_TL', range(86,8), 30, true);
		this.animations.add('Static_TR', range(129,8), 30, true);
		
		this.animations.add('Disorientated_BR', range(0,8), 30, true);
		this.animations.add('Disorientated_BL', range(43,8), 30, true);
		this.animations.add('Disorientated_TL', range(86,8), 30, true);
		this.animations.add('Disorientated_TR', range(129,8), 30, true);

		this.animations.add('Shambling_BR', range(0,8), 30, true);
		this.animations.add('Shambling_BL', range(43,8), 30, true);
		this.animations.add('Shambling_TL', range(86,8), 30, true);
		this.animations.add('Shambling_TR', range(129,8), 30, true);

		this.animations.add('Attacking_BR', range(20,8), 30, true);
		this.animations.add('Attacking_BL', range(63,8), 30, true);
		this.animations.add('Attacking_TL', range(106,8), 30, true);
		this.animations.add('Attacking_TR', range(149,8), 30, true);
		
		this.animations.add('ToTarget_BR', range(10,8), 30, true);
		this.animations.add('ToTarget_BL', range(53,8), 30, true);
		this.animations.add('ToTarget_TL', range(96,8), 30, true);
		this.animations.add('ToTarget_TR', range(139,8), 30, true);
		
		this.animations.add('OnRoad_BR', range(10,8), 30, true);
		this.animations.add('OnRoad_BL', range(53,8), 30, true);
		this.animations.add('OnRoad_TL', range(96,8), 30, true);
		this.animations.add('OnRoad_TR', range(139,8), 30, true);
		
		this.animations.add('Drinking_BR', range(0,8), 30, true);
		this.animations.add('Drinking_BL', range(43,8), 30, true);
		this.animations.add('Drinking_TL', range(86,8), 30, true);
		this.animations.add('Drinking_TR', range(129,8), 30, true);
		
		
		this.animName = 'Static_BR'
		this.animations.play('Static_BR',14, true);

				
		this.direction = game.rnd.frac() * 360;
		this.speed = 30;
		this.angularVelocity = 0;
		this.coolDown = 0;
		
		this.nextAICheck = 0;
		
		this.health = 25;

	}
	
	preload()
	{

		this.body.angle = 0; //game.rnd.frac() * 360;
		this.body.allowRotation = false;
		this.body.angularVelocity = 0;
		this.name = 'ZombieJoe' + i;
		this.body.immovable = true;
		this.body.velocity.x = -150;
		//this.body.setCircle(1);
		this.body.collideWorldBounds = true;
	    this.body.setSize(8, 8, 12, 12);

	}
	
	update()
	{
		if(!this.alive)
			return;
		//this.game.debug.text('Elapsed seconds: ' + this.game.time.totalElapsedSeconds(), 32, 32);
		if(this.nextAICheck < game.time.now)
		{
			this.doAI();
			this.nextAICheck = game.time.now + 1000;
		}
		if(this.angularVelocity > 0.00001)
		{
			this.direction += this.angularVelocity * (this.game.time.elapsed / (1000.0));
		}
		if(this.direction > 180)
			this.direction -= 360;
		if(this.direction < -180)
			this.direction += 360;		
		if(this.direction<-90)
			this.walkSuffix = 'TL';
		else if(this.direction>=-90 && this.direction<0)
			this.walkSuffix = 'TR';
		else if(this.direction>=0 && this.direction <90)
			this.walkSuffix = 'BR';
		else if(this.direction>90)
			this.walkSuffix = 'BL';
		
		this.doAnimation();
		
		game.physics.arcade.velocityFromAngle(this.direction, this.speed, this.body.velocity);
		
		if(this.coolDown <= game.time.now)
			switch(this.state)
			{
			case this.stateEnum.Disorientated:
				this.enterState(this.stateEnum.Shambling);
				break;
			case this.stateEnum.Drinking:
				this.drink();
				this.coolDown = game.time.now + 1000;
				break;
			}
		game.world.wrap(this, 0, true);
		
	}
	
	resurrect()
	{
		this.reset(Math.random() * 150, Math.random() * 150, 'ZombieJoe', game.rnd.integerInRange(0, 28));
				this.state = this.stateEnum.Static;
		//this.animations.add('walk');
		//this.animations.play('walk',171, true);
		this.animName = 'Static_BR'
		this.animations.play('Static_BR',14, true);

				
		this.direction = game.rnd.frac() * 360;
		this.speed = 30;
		this.angularVelocity = 0;
		this.coolDown = 0;
		this.angry = false;
		this.nextAICheck = 0;
		
		this.health = 25;
	}
	
	render()
	{
		//game.debug.body(this);
	}
	
	collide(obj2)
	{
		if(!(this.alive && obj2.alive))
			return;
		if(obj2 instanceof Zombie)
		{
			if(this.state != this.stateEnum.Drinking && obj2.state != this.stateEnum.Drinking && !this.isAngry && !obj2.isAngry)
				this.collideWithZombie(obj2);
			return;
		}
		if(obj2 instanceof House)
			if(obj2.canBeAttacked() && this.state != this.stateEnum.Attacking)
				this.attack(obj2);
		if(obj2 instanceof Venue)
			this.startDrinking(obj2);
	}
	collideWithZombie(obj2)
	{
		if(this.state!=this.stateEnum.Disorientated)
		{
			this.direction = (game.physics.arcade.angleBetween(this, obj2) * 57.295779513082320876798154814105) + 180;
			game.physics.arcade.velocityFromAngle(this.direction, 300, this.body.velocity);
		}		
		this.enterState(this.stateEnum.Disorientated, 2000);
	}
	
	enterState(targetState, param1)
	{
		/*
		 * Leave current state
		 */
		switch(this.state)
		{
			case this.stateEnum.Attacking :
				this.attackTarget.stoppingAttack(this);
				this.attackTarget = null;
				break;
			case this.stateEnum.Drinking :
				console.log("Stopped Drinking to" + targetState);
		}				
		/*
		 * Enter new state
		 */
		switch(targetState) {
			case this.stateEnum.Static:
				this.speed = 0.0;
				this.body.angularVelocity = 0;
				
				this.state = targetState;
				break;
			case this.stateEnum.Disorientated:
				this.speed = 2;	
				if(game.rnd.frac()>0.05)
					this.angularVelocity = 15;
				else
					this.angularVelocity = -15;
				if(this.state!=this.stateEnum.Disorientated)
					this.coolDown = game.time.now + param1 + game.rnd.integerInRange(0, param1);
				this.state = targetState;
				break;
			case this.stateEnum.Shambling:
				this.speed = 15;
				this.angularVelocity = 0;
				this.state = targetState;	
				break;
			case this.stateEnum.Attacking:
				this.speed = 0;
				this.body.angularVelocity = 0;
				this.state = targetState;
				this.attackTarget = param1;
				param1.startingAttack(this);
				break;
			case this.stateEnum.ToTarget:
				this.speed = 20;
				this.walkTarget = param1;
				this.body.angularVelocity = 0;
				this.direction = (game.physics.arcade.angleBetween(this, param1) * 57.295779513082320876798154814105) ;
				game.physics.arcade.velocityFromAngle(this.direction, 300, this.body.velocity);
				this.state = targetState;
				break;
			case this.stateEnum.Drinking:
				this.speed = 0;
				this.angularVelocity = 0;
				this.state = targetState;
				this.coolDown = game.time.now + 1 + game.rnd.integerInRange(0, 1);
				if(!(param1 instanceof Venue))
					thisisntafunction()
				this.tavern = param1;
				break;
				

		}

	}
	
	attack(obj)
	{
		this.enterState(this.stateEnum.Attacking, obj);
	}
	
	stopAttack(obj)
	{
		this.enterState(this.stateEnum.Disorientated,0);
	}
	
	doAnimation()
	{
		var animBaseName = '';
		switch(this.state)
		{
		case this.stateEnum.Static:
			animBaseName = 'Static';
			break;
		case this.stateEnum.Disorientated:
			animBaseName = 'Disorientated';
			break;
		case this.stateEnum.Shambling:
			animBaseName = 'Shambling';
			break;
		case this.stateEnum.Attacking:
			animBaseName = 'Attacking';
			break;
		case this.stateEnum.OnRoad:
			animBaseName = 'OnRoad';
			break;
		case this.stateEnum.ToTarget:
			animBaseName = 'ToTarget';
			break;			
		case this.stateEnum.Drinking:
			animBaseName = 'Drinking';
			break;						
			
		}
		var animName = animBaseName + '_' + this.walkSuffix;
		
		if(animName != this.animName)
		{
			this.animations.play(animName,14, true);
			this.animName = animName;
		}
	}
	
	headToTarget(loc)
	{
		this.enterState(this.stateEnum.ToTarget, loc);
		return true;
	}
	
	doShamble()
	{
		this.enterState(this.stateEnum.Shambling);
	}
	
	doDisorientated()
	{
		this.enterState(this.stateEnum.Disorientated, 2000);
	}
	
	damage(amount)
	{
		this.health -= amount;
		if(this.health <= 0)
			this.die();
	}
	
	die()
	{
		this.kill();
		this.x = game.width*2;
		this.y = game.height*2;
	}
	
	startDrinking(tavern)
	{
		if(this.state!=this.stateEnum.Attacking && this.state!=this.stateEnum.Drinking)
		{
			if(tavern.hasDrinks())
			{
				console.log("startDrinking");
				this.enterState(this.stateEnum.Drinking, tavern);
			} else {
				this.getAngry();
			}
		}
	}
	
	drink()
	{
		if(this.tavern!=null)
		{
			if(this.tavern.hasDrinks())
			{
				console.log("drink");
				this.tavern.drink(this)
				this.stopAnger();
			} else {
				console.log("getAngry");
				this.getAngry();
			}
		}
	}
	
	doAI()
	{
		if(this.state != this.stateEnum.Drinking || this.isAngry)
		{
			// first check for town amenities
			var loc = town.nearByBuilding(this.x, this.y);
			if(loc!=null)
			{
				if(this.headToTarget(loc.position))
					return;
			}
			
			if(this.isAngry)
			{
				loc = town.findNearestHouse(this.x, this.y);
				if(loc!=null)
				{
					if(this.headToTarget(loc))
						return;
				}
			}			
			
			
			if(game.rnd.frac() < 0.5)
			{
				if(this.doShamble())
					return true;
			}
			else
			{
				if(this.doDisorientated())
					return true;
			}
			return false;
		} else
			return true;
	}

	getAngry()
	{
		if(!this.isAngry)
		{
			console.log("Get Angry");
			this.isAngry = true;
			this.enterState(this.stateEnum.Disorientated, 1000);
			this.doAI();
			this.tint = 0xFF0000;
		}
	}
	
	stopAnger()
	{
		console.log("Stop Angry");
		this.isAngry = false;
		this.tint = 0xFFFFFF;
	}

}

/*	
Zombie = function(game, x, y, key, frame)
{
	Phaser.Sprite.call(this, game, x,y,key,frame);
	this.body.angle = 45; game.rnd.frac() * 360;
	this.body.allowRotation = true;
	this.body.angularVelocity = 15;
	this.name = 'ZombieJoe' + i;
	this.body.immovable = true;
	this.body.velocity.x = -150;
	this.body.setCircle(30);
	this.body.collideWorldBounds = true;
	this.game = game;
	
	game.add.existing(this);
}

Zombie.update = function()
{
	this.game.debug.text('Elapsed seconds: ' + this.game.time.totalElapsedSeconds(), 32, 32);
	console.log('Hello world!');
}

Zombie.prototype = Object.create(Phaser.Sprite.prototype);
Zombie.prototype.constructor = Zombie;
Zombie.prototype.update = Zombie.update();
*/