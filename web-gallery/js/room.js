Room.TILE_H = 32;
Room.TILE_W = 64;

Room.PRIORITY_DOOR_FLOOR = 1;
Room.PRIORITY_DOOR_FLOOR_SELECT = 2;
Room.PRIORITY_DOOR_FLOOR_PLAYER_SHADOW = 3;
Room.PRIORITY_DOOR_FLOOR_PLAYER = 4;
Room.PRIORITY_DOOR_WALL = 5;
Room.PRIORITY_WALL = 6;
Room.PRIORITY_FLOOR = 7;
Room.PRIORITY_PLAYER_SHADOW = 8;
Room.PRIORITY_FLOOR_SELECT = 9;
Room.PRIORITY_PLAYER = 10;
Room.PRIORITY_SIGN = 11;
Room.PRIORITY_CHAT = 12;

function DrawableSprite(sprite, selectableSprite, x, y, priority) {
  this.sprite = sprite;
  this.selectableSprite = selectableSprite;
  this.x = x;
  this.y = y;
  this.priority = priority;
}

function Camera(room) {
  this.room = room;
  this.reset();
}

Camera.prototype.reset = function() {
  this.width = this.room.game.canvas.width;
  this.height = this.room.game.canvas.height;
  this.x = Math.round((this.width - (Room.TILE_H * (this.room.cols - this.room.rows + 3))) / 2);
  this.y = Math.round((this.height - ((this.room.cols + this.room.rows) * Room.TILE_H / 2) + 114) / 2);
};

function Room(cols, rows, doorX, doorY, heightmap, game) {
  this.cols = cols;
  this.rows = rows;
  this.heightmap = heightmap;
  this.doorX = doorX;
  this.doorY = doorY;
  this.game = game;
  this.ready = false;
  this.selectedScreenX = 0;
  this.selectedScreenY = 0;
  this.players = {};
  this.selectableSprites = {};
  this.sprites = new Sprites();
  this.camera = new Camera(this);
  this.drawQueue = new PriorityQueue({
    comparator: function(a, b) {
      if (a.priority != b.priority) {
        return a.priority - b.priority;
      }
      return a.y - b.y;
    }.bind(this)
  });
}

Room.prototype.getPlayer = function(id) {
  return (id in this.players) ? this.players[id] : null;
};

Room.prototype.getPlayerFromSelectId = function(id) {
  return (id in this.selectableSprites) ? this.selectableSprites[id] : null;
};

Room.prototype.setPlayer = function(id, x, y, z, rot, name, look) {
  var player = this.getPlayer(id);
  if (player == null) {
    var p = new Player(id, x, y, z, rot, name, look);
    p.prepare();
    this.players[id] = p;
    this.selectableSprites[p.sprites.colorId] = p;
  } else {
    player.updateParams(x, y, z, rot, name, look);
  }
};

Room.prototype.removePlayer = function(id) {
  if (id in this.players) {
    if (this.players[id].sprites.colorId in this.selectableSprites) {
      delete(this.selectableSprites[this.players[id].sprites.colorId]);
    }
    delete(this.players[id]);
  }
};

Room.prototype.movePlayer = function(userId, x, y, rot) {
  var player = this.getPlayer(userId);
  if (player != null) {
    player.setMovement(x, y, rot);
  }
};

Room.prototype.prepare = function() {
  return new Promise(function (resolve, reject) {

    var p = this.loadSprites();

    Promise.all(p).then(function (loaded) {
      console.log("Sprites loaded (Room)");
      this.ready = true;
      resolve();
    }.bind(this),

    function (error) {
      console.log("Error loading sprites: " + error);
      reject("Error loading sprites: " + error);
    }.bind(this));

  }.bind(this));
};

Room.prototype.isValidTile = function(x, y) {
  return (x >= 0 && x < this.cols && y >= 0 && y < this.rows && this.heightmap[x][y] != 0);
};

Room.prototype.onResize = function() {
  this.camera.reset();
};

Room.prototype.loadSprites = function() {
  return [
    this.sprites.loadImage('room_tile', Sprites.LOCAL_RESOURCES_URL + 'room_tile.png'),
    this.sprites.loadImage('shadow_tile', Sprites.LOCAL_RESOURCES_URL + 'shadow_tile.png'),
    this.sprites.loadImage('selected_tile', Sprites.LOCAL_RESOURCES_URL + 'selected_tile.png'),
    this.sprites.loadImage('room_wall_l', Sprites.LOCAL_RESOURCES_URL + 'room_wall_l.png'),
    this.sprites.loadImage('room_wall_r', Sprites.LOCAL_RESOURCES_URL + 'room_wall_r.png'),
    this.sprites.loadImage('room_door_extended', Sprites.LOCAL_RESOURCES_URL + 'room_door_extended.png'),
    this.sprites.loadImage('ghost0', Sprites.LOCAL_RESOURCES_URL + 'ghost0.png'),
    this.sprites.loadImage('ghost1', Sprites.LOCAL_RESOURCES_URL + 'ghost1.png'),
    this.sprites.loadImage('ghost2', Sprites.LOCAL_RESOURCES_URL + 'ghost2.png'),
    this.sprites.loadImage('ghost3', Sprites.LOCAL_RESOURCES_URL + 'ghost3.png'),
    this.sprites.loadImage('ghost4', Sprites.LOCAL_RESOURCES_URL + 'ghost4.png'),
    this.sprites.loadImage('ghost5', Sprites.LOCAL_RESOURCES_URL + 'ghost5.png'),
    this.sprites.loadImage('ghost6', Sprites.LOCAL_RESOURCES_URL + 'ghost6.png'),
    this.sprites.loadImage('ghost7', Sprites.LOCAL_RESOURCES_URL + 'ghost7.png'),
    this.sprites.loadImage('sign_left', Sprites.LOCAL_RESOURCES_URL + 'sign_left.png'),
    this.sprites.loadImage('sign_right', Sprites.LOCAL_RESOURCES_URL + 'sign_right.png'),
    this.sprites.loadImage('sign_center', Sprites.LOCAL_RESOURCES_URL + 'sign_center.png'),
    this.sprites.loadImage('sign_bite', Sprites.LOCAL_RESOURCES_URL + 'sign_bite.png'),
    this.sprites.loadImage('chat_left', Sprites.LOCAL_RESOURCES_URL + 'chat_left.png'),
    this.sprites.loadImage('chat_right', Sprites.LOCAL_RESOURCES_URL + 'chat_right.png'),
    this.sprites.loadImage('chat_arrow', Sprites.LOCAL_RESOURCES_URL + 'chat_arrow.png'),
    this.sprites.loadImage('chat_bite', Sprites.LOCAL_RESOURCES_URL + 'chat_bite.png')
  ];
};

Room.prototype.drawWall = function() {
  // mapX and mapY are offsets to make sure we can position the map as we want.
  var offsetX = this.camera.x;
  var offsetY = this.camera.y;

  for (var i = 0; i < this.rows; i++) {
    if (i + 1 == this.doorY) {
      this.drawQueue.queue(new DrawableSprite(this.sprites.getImage('room_door_extended'), null, (1 - i) * (Room.TILE_W / 2) + offsetX - 40, (i + 1) * (Room.TILE_H / 2) + offsetY - 119, Room.PRIORITY_WALL));
    }
    else if (i != this.doorY && i + 1) {
      this.drawQueue.queue(new DrawableSprite(this.sprites.getImage('room_wall_l'), null, (1 - i) * (Room.TILE_W / 2) + offsetX - 8, (i + 1) * (Room.TILE_H / 2) + offsetY - 119, Room.PRIORITY_WALL));
    }
  }

  for (var i = 1; i < this.cols; i++) {
    this.drawQueue.queue(new DrawableSprite(this.sprites.getImage('room_wall_r'), null, (i - 1) * (Room.TILE_W / 2) + offsetX + 64, (i + 1) * (Room.TILE_H / 2) + offsetY - 135, Room.PRIORITY_WALL));
  }
};

Room.prototype.drawFloor = function() {
  // mapX and mapY are offsets to make sure we can position the map as we want.
  var offsetX = this.camera.x;
  var offsetY = this.camera.y;

  // loop through our map and draw out the image represented by the number.
  for (var i = 0; i < this.cols; i++) {
    for (var j = 0; j < this.rows; j++) {
      var tile = this.heightmap[i][j];
      // Draw the represented image number, at the desired X & Y coordinates followed by the graphic width and height.
      if (tile > 0) {
        if (this.doorX == i && this.doorY == j) {
          this.drawQueue.queue(new DrawableSprite(this.sprites.getImage('room_tile'), null, (i - j) * (Room.TILE_W / 2) + offsetX, (i + j) * (Room.TILE_H / 2) + offsetY - ((tile - 1) * Room.TILE_H), Room.PRIORITY_DOOR_FLOOR));
        } else {
          this.drawQueue.queue(new DrawableSprite(this.sprites.getImage('room_tile'), null, (i - j) * (Room.TILE_W / 2) + offsetX, (i + j) * (Room.TILE_H / 2) + offsetY - ((tile - 1) * Room.TILE_H), Room.PRIORITY_FLOOR));
        }
      }
    }
  }
};

Room.prototype.drawSelectedTile = function() {
  var offsetX = this.camera.x;
  var offsetY = this.camera.y;

  var xminusy = (this.selectedScreenX - 32 - offsetX) / Room.TILE_H;
  var xplusy =  (this.selectedScreenY - offsetY) * 2 / Room.TILE_H;

  var tileX = Math.floor((xminusy + xplusy) / 2);
  var tileY = Math.floor((xplusy - xminusy) / 2);

  if (this.isValidTile(tileX, tileY)) {
    var prio = Room.PRIORITY_FLOOR_SELECT;
    if (this.doorX == tileX && this.doorY == tileY) {
      prio = Room.PRIORITY_DOOR_FLOOR_SELECT;
    }
    this.drawQueue.queue(new DrawableSprite(this.sprites.getImage('selected_tile'), null, (tileX - tileY) * (Room.TILE_W / 2) + offsetX, (tileX + tileY) * (Room.TILE_H / 2) + offsetY - 3, prio));
  }
};

Room.prototype.drawPlayers = function () {
  Object.keys(this.players).forEach(key => {
    if (this.players[key] != null) {
      this.drawPlayer(this.players[key]);
    }
  });
};

Room.prototype.drawPlayer = function(player) {
  var offsetX = this.camera.x;
  var offsetY = this.camera.y;

  var mapPositionX = (player.x - player.y) * Room.TILE_H + offsetX;
  var mapPositionY = (player.x + player.y) * Room.TILE_H / 2 + offsetY;

  var prio = Room.PRIORITY_PLAYER;
  var shadowPrio = Room.PRIORITY_PLAYER_SHADOW;

  if (Math.round(player.x) == this.doorX && Math.round(player.y) == this.doorY) {
    prio = Room.PRIORITY_DOOR_FLOOR_PLAYER;
    shadowPrio = Room.PRIORITY_DOOR_FLOOR_PLAYER_SHADOW;
  }

  this.drawQueue.queue(new DrawableSprite(this.sprites.getImage('shadow_tile'), null, mapPositionX, mapPositionY - ((this.heightmap[Math.floor(player.x)][Math.floor(player.y)] - 1) * Room.TILE_H), shadowPrio));
  if (player.ready) {
    if (player.rot == 6 || player.rot == 5 || player.rot == 4) {
      mapPositionX += 3;
    }
    this.drawQueue.queue(new DrawableSprite(player.currentSprite(), player.currentSilhouette(), mapPositionX, mapPositionY - 85 - (player.z * Room.TILE_H), prio));
    this.drawChat("Lawyer", "ghjhgjhgjgh", player.headSprite(), mapPositionX + 22, mapPositionY - 207);
  } else {
    this.drawQueue.queue(new DrawableSprite(this.sprites.getImage('ghost' + player.rot), null, mapPositionX + 17, mapPositionY - 58 - (player.z * Room.TILE_H), prio));
  }
  if (player.shouldShowSign()) {
    this.drawSign(player.name, mapPositionX + 22, mapPositionY - 107);
  }
};

Room.prototype.drawChat = function(username, text, headSprite, x, y) {
  var tempCanvas = document.createElement('canvas');
  var tempCtx = tempCanvas.getContext('2d');

  tempCtx.font = "bold 12px Ubuntu";
  tempCtx.textBaseline = "top";
  tempCtx.fillStyle = "black";

  var usernameWidth = Math.round(tempCtx.measureText(username + ": ").width);
  tempCtx.font = "12px Ubuntu";
  var textWidth = Math.round(tempCtx.measureText(text).width);

  var currentWidth = 0;
  var centeredX = x - Math.floor((textWidth + 41) / 2);

  tempCtx.drawImage(this.sprites.getImage('chat_left'), currentWidth, 0);
  currentWidth += 31;

  for (var i = 0; i < usernameWidth + textWidth; i++) {
    tempCtx.drawImage(this.sprites.getImage('chat_bite'), currentWidth++, 0);
  }

  tempCtx.drawImage(this.sprites.getImage('chat_right'), currentWidth, 0);

  tempCtx.font = "bold 12px Ubuntu";
  tempCtx.fillText(username + ": ", 31, 5);

  tempCtx.font = "12px Ubuntu";
  tempCtx.fillText(text, 31 + usernameWidth, 5);

  tempCtx.drawImage(this.sprites.getImage('chat_arrow'), 80, 23);
  tempCtx.drawImage(headSprite, 1, -3);

  this.drawQueue.queue(new DrawableSprite(tempCanvas, null, centeredX, y, Room.PRIORITY_CHAT));
};

Room.prototype.drawSign = function(text, x, y) {
  var tempCanvas = document.createElement('canvas');
  var tempCtx = tempCanvas.getContext('2d');

  tempCtx.font = "12px Ubuntu";
  tempCtx.textBaseline = "top";
  tempCtx.fillStyle = "white";

  var textWidth = Math.round(tempCtx.measureText(text).width) - 13;
  var currentWidth = 0;

  var centeredX = x - Math.floor((Math.max(textWidth, 0) + 40) / 2);

  tempCtx.drawImage(this.sprites.getImage('sign_left'), currentWidth, 0);
  currentWidth += 20;

  for (var i = 0; i < textWidth / 2; i++) {
    tempCtx.drawImage(this.sprites.getImage('sign_bite'), currentWidth++, 0);
  }

  tempCtx.drawImage(this.sprites.getImage('sign_center'), currentWidth, 0);
  currentWidth += 13;

  for (var i = 0; i < textWidth / 2; i++) {
    tempCtx.drawImage(this.sprites.getImage('sign_bite'), currentWidth++, 0);
  }

  tempCtx.drawImage(this.sprites.getImage('sign_right'), currentWidth, 0);

  tempCtx.fillText(text, 20, 6);

  this.drawQueue.queue(new DrawableSprite(tempCanvas, null, centeredX, y, Room.PRIORITY_SIGN));
};

Room.prototype.checkSelectedUserSign = function() {
  var selectedPlayer = this.trySelectPlayer(this.selectedScreenX, this.selectedScreenY);
  if (selectedPlayer != null ) {
    selectedPlayer.showSign(0.2);
  }
}

Room.prototype.draw = function() {
  this.drawWall();
  this.drawFloor();
  this.drawPlayers();
  this.drawSelectedTile();

  var ctx = this.game.ctx;
  var auxCtx = this.game.auxCtx;
  while (this.drawQueue.length > 0) {
    var drawable = this.drawQueue.dequeue();
    ctx.drawImage(drawable.sprite, drawable.x, drawable.y);
    if (drawable.selectableSprite != null) {
      auxCtx.drawImage(drawable.selectableSprite, drawable.x, drawable.y);
    }
  }
};

Room.prototype.tick = function(delta) {
  Object.keys(this.players).forEach(key => {
    if (this.players[key] != null) {
      this.players[key].tick(delta);
    }
  });
  this.checkSelectedUserSign();
};

Room.prototype.onSelectPlayer = function(player) {
  this.game.communication.requestLookAt(player.id);
  player.showSign(5);
};

Room.prototype.trySelectPlayer = function(x, y) {
  var p = this.game.auxCtx.getImageData(x, y, 1, 1).data;
  var selectedPlayer = this.getPlayerFromSelectId(Sprites.rgb2int(p[0], p[1], p[2]));
  if (selectedPlayer != null) {
    return selectedPlayer;
  }
  return null;
};

Room.prototype.onMouseClick = function(x, y) {
  var selectedPlayer = this.trySelectPlayer(x, y);
  if (selectedPlayer != null ) {
    this.onSelectPlayer(selectedPlayer);
  } else {
    var offsetX = this.camera.x;
    var offsetY = this.camera.y;

    var xminusy = (x - 32 - offsetX) / Room.TILE_H;
    var xplusy =  (y - offsetY) * 2 / Room.TILE_H;

    var tileX = Math.floor((xminusy + xplusy) / 2);
    var tileY = Math.floor((xplusy - xminusy) / 2);

    if (this.isValidTile(tileX, tileY)) {
      this.game.communication.requestMovement(tileX, tileY);
    }
  }
};

Room.prototype.onMouseMove = function(x, y, isDrag) {
  if (isDrag) //Move camera
  {
    var diffX = this.selectedScreenX - x;
    var diffY = this.selectedScreenY - y;
    this.camera.x -= diffX;
    this.camera.y -= diffY;
  }

  this.selectedScreenX = x;
  this.selectedScreenY = y;
};
