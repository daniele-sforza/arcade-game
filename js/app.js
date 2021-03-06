// Base entity class
class Entity {
  constructor(spriteUrl, x, y) {
    // Variables applied to each of our instances go here,

    // The image/sprite for our entities, this uses
    // a helper we've provided to easily load images
    this.sprite = spriteUrl;
    this.x = x;
    this.y = y;
  }

  // reset coordinates to values provided
  reset(x, y) {
    this.x = x;
    this.y = y;
  }

  // Draw the entity on the screen
  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
}


// Selector to choose a player
class Selector extends Entity {
  constructor() {
    super('images/Selector.png', 0, 83);
    this.selected = {
      idx: 0,
      url: 'images/char-boy.png'
    };
  }

  // check key pressed: left or right move the selector, return true when pressing enter to start the game
  handleInput(key) {
    $('#results').modal('hide');
    switch (key) {
      case 'left':
        this.x === 0 ? this.x : (this.x -= 101, this.selected.idx--);
        break;
      case 'right':
        this.x === 404 ? this.x : (this.x += 101, this.selected.idx++);
        break;
      case 'enter':
        return true;
        break;
    }
    this.update();
    return false;
  }

  // draw the character selection screen
  update(newGame = false) {
    // if called with the flag set to true then reset the variable to start a new game
    if (newGame) {
      player = null;
      allGems = [];
      document.querySelector('.score').style.display = 'none';
      document.querySelector('.instructions').style.display = 'block';
    }
    let characters = [
      'images/char-boy.png',
      'images/char-cat-girl.png',
      'images/char-horn-girl.png',
      'images/char-pink-girl.png',
      'images/char-princess-girl.png'
    ];
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    selector.render();
    this.selected.url = characters[this.selected.idx];
    for (let col = 0; col < 5; col++) {
      ctx.drawImage(Resources.get(characters[col]), col * 101, 83);
    }
  }
}


// Enemies our player must avoid
class Enemy extends Entity {
  constructor() {
    // create enemy with random y position and speed
    super('images/enemy-bug.png', 0, getRandomItemFromArray([60, 140, 220]));
    this.speed = getRandomArbitrary(150, 404);
  }

  // Update the enemy's position, required method for game
  // Parameter: dt, a time delta between ticks
  update(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    // Move the enemy along the x axis and check if it reached the end of the canvas
    this.x > 505 ? this.reset() : this.x += Math.round(this.speed * dt, 0);
  }

  // Move the enemy back to the start randomly changing the stone path and the speed
  reset() {
    super.reset(0, getRandomItemFromArray([60, 140, 220]));
    this.speed = getRandomArbitrary(150, 404);
  }

  // Check collision with the provided player
  // if it collide decrease wins counter, remove a life and reset player position
  checkCollisions(player) {
    if ((this.x + 50 >= player.x) && (this.x <= player.x + 101) &&
      (this.y === player.y)) {
      loseSound.play();
      player.lives.pop();
      player.reset();
      // if there are no hearts(lives) remaining then show the endgame dialog
      if (player.lives.length === 0) {
        player.lost = true;
        document.querySelector('.total-wins').innerText = player.wins;
        document.querySelector('.total-score').innerText = player.score;
        $('#results').modal();
        // when closing the dialog resets player properties
        $('#results').on('hidden.bs.modal', function(e) {
          player.lost = false;
          player.updateScore(0, 0);
        })
      }
    }
  }
}


// Our Player
class Player extends Entity {
  constructor(spriteUrl) {
    // create a player with default coordinates, set wins counter and lost-game flag
    super(spriteUrl, 202, 380);
    this.lives = [heart1, heart2, heart3];
    this.wins = 0;
    this.score = 0;
    this.lost = false;
  }

  // Prevent the player going outside the boundaries
  update() {
    this.x < 0 ? this.x += 101 : this.x > 404 ? this.x -= 101 : this.x;
    this.y < -20 ? this.y += 80 : this.y > 380 ? this.y -= 80 : this.y;
  }

  // Move the player back to the starting position
  reset() {
    super.reset(202, 380);
  }

  // Update the player position based on the key pressed
  handleInput(key) {
    switch (key) {
      case 'left':
        this.x -= 101;
        break;
      case 'right':
        this.x += 101;
        break;
      case 'up':
        this.y -= 80;
        break;
      case 'down':
        this.y += 80;
        break;
    }
    // if the player reaches the water increment wins and reset position
    if (this.y === -20) {
      winSound.play();
      this.updateScore(++this.wins, this.score);
      let myTimer = setInterval(() => {
        this.reset();
        clearInterval(myTimer);
      }, 1000);
    }
  }

  // update number of wins on the page
  updateScore(wins, score) {
    this.wins = wins;
    document.querySelector('.wins').innerText = this.wins;
    this.score = score;
    document.querySelector('.points').innerText = this.score;
  }
}


// Collectible Gem class
class Gem extends Entity {
  constructor(spriteUrl, points) {
    super(spriteUrl, getRandomItemFromArray([0, 101, 202, 303, 404]), getRandomItemFromArray([60, 140, 220]));
    this.points = points;
  }

  checkCollisions(player) {
    if ((this.x === player.x) && (this.y === player.y)) {
        gemSound.play();
        allGems.pop();
        player.updateScore(player.wins, player.score + this.points);
        this.reset();
      }
  }

  reset() {
    super.reset(getRandomItemFromArray([0, 101, 202, 303, 404]), getRandomItemFromArray([60, 140, 220]));
  }
}


// Instantiate the objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
// Place the selector in a variable called selector
const enemy1 = new Enemy();
const enemy2 = new Enemy();
const enemy3 = new Enemy();
const gem1 = new Gem('images/Gem Green.png', 10);
const gem2 = new Gem('images/Gem Blue.png', 30);
const gem3 = new Gem('images/Gem Orange.png', 60);
const heart1 = new Entity('images/Heart.png', 0, 505);
const heart2 = new Entity('images/Heart.png', 101, 505);
const heart3 = new Entity('images/Heart.png', 202, 505);
let allEnemies = [enemy1, enemy2, enemy3],
    allGems = [],
    selector = new Selector(),
    player,
    winSound = document.querySelector('#win-sound'),
    loseSound = document.querySelector('#lose-sound'),
    gemSound = document.querySelector('#gem-sound');


// This listens for key presses and sends the keys to
// Player.handleInput() method.
document.addEventListener('keyup', function(e) {
  var allowedKeys = {
    13: 'enter',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  // create the player with the selected character
  if (!player && selector.handleInput(allowedKeys[e.keyCode])) {
    player = new Player(selector.selected.url);
    document.querySelector('.score').style.display = 'block';
    document.querySelector('.instructions').style.display = 'none';
  }
  // if player is created then handle the key press
  if (player && player.y !== -20) {
    player.handleInput(allowedKeys[e.keyCode]);
  }
});

// Function from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// get a random number beetween 2 values
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

// Based on Select Random Item from an Array @ https://css-tricks.com/snippets/javascript/select-random-item-array/
// Randomly select a y position corresponding to a different stone path for the enemy
function getRandomItemFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
