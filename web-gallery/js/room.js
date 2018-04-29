PrepareQueue.MAX_CONCURRENT_PROMISES = 3;

function PrepareQueue() {
  this.queue = [];
  this.currentPromises = 0;
}

PrepareQueue.prototype.push = function(promise, params) {
  //promise(params);
  this.queue.push({promise, params});
  if (this.currentPromises <= PrepareQueue.MAX_CONCURRENT_PROMISES) {
    this.moveNext();
  }
};

PrepareQueue.prototype.moveNext = function(){
  if (this.currentPromises <= PrepareQueue.MAX_CONCURRENT_PROMISES && this.queue.length > 0) {
    const currentPromise = this.queue.shift();
    this.currentPromises++;
    currentPromise.promise(currentPromise.params).then(() => {
      this.currentPromises--;
      this.moveNext();
    });
  }
};

function Camera(room) {
  this.room = room;
  this.reset();
}

Camera.prototype.reset = function() {
  this.width = this.room.game.canvas.width;
  this.height = this.room.game.canvas.height;
  this.x = Math.round((this.width - (Game.TILE_H * (this.room.cols - this.room.rows + 3))) / 2);
  this.y = Math.round((this.height - ((this.room.cols + this.room.rows) * Game.TILE_H / 2) + 114) / 2);
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
  this.selectedPixel = [0, 0, 0];
  this.mouseOverPlayer = null;
  this.selectedPlayer = null;
  this.players = {};
  this.selectableSprites = {};
  this.roomItems = {};
  this.wallItems = {};
  this.sprites = new Sprites();
  this.camera = new Camera(this);
  this.chatManager = new ChatManager(this);
  this.drawQueue = new PriorityQueue({
    comparator: function(a, b) {
      if (a.priority != b.priority) {
        return a.priority - b.priority;
      }
      return a.getComparableItem() - b.getComparableItem();
    }.bind(this)
  });
  this.prepareQueue = new PrepareQueue();
}

Room.prototype.getPlayer = function(id) {
  return (id in this.players) ? this.players[id] : null;
};

Room.prototype.getPlayerFromSelectId = function(id) {
  return (id in this.selectableSprites) && this.selectableSprites[id] instanceof Player ? this.selectableSprites[id] : null;
};

Room.prototype.getFurni = function(id) {
  return this.getRoomItem(id) || this.getWallItem(id);
};

Room.prototype.getRoomItem = function(id) {
  return (id in this.roomItems) ? this.roomItems[id] : null;
};

Room.prototype.getWallItem = function(id) {
  return (id in this.wallItems) ? this.wallItems[id] : null;
};

Room.prototype.getFurniFromSelectId = function(id) {
  return (id in this.selectableSprites) && this.selectableSprites[id] instanceof Furni ? this.selectableSprites[id] : null;
};

Room.prototype.setPlayer = function(id, x, y, z, rot, name, look) {
  var player = this.getPlayer(id);
  if (player == null) {
    var p = new Player(id, x, y, z, rot, name, look);
    this.prepareQueue.push(p.prepare.bind(p), this.game.avatarImager);
    //p.prepare(this.game.avatarImager);
    this.players[id] = p;
    this.selectableSprites[p.sprites.colorId] = p;
  } else {
    player.updateParams(x, y, z, rot, name, look);
  }
};

Room.prototype.setFurniState = function(itemId, state) {
  var furni = this.getFurni(itemId);
  if (furni != null) {
    furni.setState(state);
  }
};

Room.prototype.setRoomItem = function(id, x, y, z, rot, baseId, state) {
  if (this.game.furnitureImager.isValidIdRoom(baseId)) {
    var furni = this.getRoomItem(id);
    if (furni == null) {
      var f = new Furni(Furni.ROOMITEM, id, x, y, z, rot, baseId, state);
      this.prepareQueue.push(f.prepare.bind(f), this.game.furnitureImager);
      //f.prepare(this.game.furnitureImager);
      this.roomItems[id] = f;
      this.selectableSprites[f.sprites.colorId] = f;
    } else {
      furni.updateParams(x, y, z, rot, baseId, state);
    }
  }
};

Room.prototype.setWallItem = function(id, x, y, rot, baseId, state) {
  if (this.game.furnitureImager.isValidIdWall(baseId)) {
    var furni = this.getWallItem(id);
    if (furni == null) {
      var f = new Furni(Furni.WALLITEM, id, x, y, 0, rot, baseId, state);
      this.prepareQueue.push(f.prepare.bind(f), this.game.furnitureImager);
      this.wallItems[id] = f;
      this.selectableSprites[f.sprites.colorId] = f;
    } else {
      //TODO: updateParams
    }
  }
};

Room.prototype.removeFurni = function(id) {
  if (id in this.roomItems) {
    if (this.roomItems[id].sprites.colorId in this.selectableSprites) {
      delete(this.selectableSprites[this.roomItems[id].sprites.colorId]);
    }
    delete(this.roomItems[id]);
  }
  if (id in this.wallItems) {
    if (this.wallItems[id].sprites.colorId in this.selectableSprites) {
      delete(this.selectableSprites[this.wallItems[id].sprites.colorId]);
    }
    delete(this.wallItems[id]);
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
    p.push(this.chatManager.loadSprites());

    Promise.all(p).then(function (loaded) {
      updateStatus("Sprites loaded (Room)");
      this.ready = true;
      resolve();
    }.bind(this),

    function (error) {
      reject("Error loading room: " + error);
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
    this.sprites.loadImage('furni_placeholder', Sprites.LOCAL_RESOURCES_URL + 'furni_placeholder.png'),
    this.sprites.loadImage('sign_left', Sprites.LOCAL_RESOURCES_URL + 'sign_left.png'),
    this.sprites.loadImage('sign_right', Sprites.LOCAL_RESOURCES_URL + 'sign_right.png'),
    this.sprites.loadImage('sign_center', Sprites.LOCAL_RESOURCES_URL + 'sign_center.png'),
    this.sprites.loadImage('sign_bite', Sprites.LOCAL_RESOURCES_URL + 'sign_bite.png'),
    this.sprites.loadAllGenericGhost(this.game.avatarImager),
  ];
};

Room.prototype.addChat = function(userId, text) {
  var player = this.getPlayer(userId);
  if (player != null) {
    this.chatManager.addChat(player, text);
    player.speak(1.5);
  }
};

Room.prototype.addWave = function(userId, text) {
  var player = this.getPlayer(userId);
  if (player != null) {
    player.wave(3);
  }
};

Room.prototype.drawWall = function() {
  for (var i = 0; i < this.rows; i++) {
    if (i + 1 == this.doorY) {
      this.drawQueue.queue(new IsometricDrawableSprite(this.sprites.getImage('room_door_extended'), null, 1, i, 0, -40, -119, DrawableSprite.PRIORITY_WALL));
    }
    else if (i != this.doorY && i + 1) {
      this.drawQueue.queue(new IsometricDrawableSprite(this.sprites.getImage('room_wall_l'), null, 1, i, 0, -8, -119, DrawableSprite.PRIORITY_WALL));
    }
  }
  for (var i = 1; i < this.cols; i++) {
    this.drawQueue.queue(new IsometricDrawableSprite(this.sprites.getImage('room_wall_r'), null, i, 1, 0, 64, -135, DrawableSprite.PRIORITY_WALL));
  }
};

Room.prototype.drawFloor = function() {
  // loop through our map and draw out the image represented by the number.
  for (var i = 0; i < this.cols; i++) {
    for (var j = 0; j < this.rows; j++) {
      var tile = this.heightmap[i][j];
      // Draw the represented image number, at the desired X & Y coordinates followed by the graphic width and height.
      if (tile > 0) {
        var prio = ((this.doorX == i && this.doorY == j) ? DrawableSprite.PRIORITY_DOOR_FLOOR : DrawableSprite.PRIORITY_FLOOR);
        this.drawQueue.queue(new IsometricDrawableSprite(this.sprites.getImage('room_tile'), null, i, j, tile - 1, 0, 0, prio));
      }
    }
  }
};

Room.prototype.drawSelectedTile = function() {
  var offsetX = this.camera.x;
  var offsetY = this.camera.y;

  var xminusy = (this.selectedScreenX - 32 - offsetX) / Game.TILE_H;
  var xplusy =  (this.selectedScreenY - offsetY) * 2 / Game.TILE_H;

  var tileX = Math.floor((xminusy + xplusy) / 2);
  var tileY = Math.floor((xplusy - xminusy) / 2);

  if (this.isValidTile(tileX, tileY)) {
    var prio = ((this.doorX == tileX && this.doorY == tileY) ? DrawableSprite.PRIORITY_DOOR_FLOOR_SELECT : DrawableSprite.PRIORITY_FLOOR_SELECT);
    this.drawQueue.queue(new IsometricDrawableSprite(this.sprites.getImage('selected_tile'), null, tileX, tileY, this.heightmap[tileX][tileY] - 1, 0, -3, prio));
  }
};

Room.prototype.drawPlayers = function () {
  for (key in this.players) {
    if (this.players[key] != null) {
      this.drawPlayer(this.players[key]);
    }
  }
};

Room.prototype.drawPlayer = function(player) {
  var prio = DrawableSprite.PRIORITY_PLAYER;
  var shadowPrio = DrawableSprite.PRIORITY_PLAYER_SHADOW;

  if (Math.round(player.x) == this.doorX && Math.round(player.y) == this.doorY) {
    prio = DrawableSprite.PRIORITY_DOOR_FLOOR_PLAYER;
    shadowPrio = DrawableSprite.PRIORITY_DOOR_FLOOR_PLAYER_SHADOW;
  }

  this.drawQueue.queue(new IsometricDrawableSprite(this.sprites.getImage('shadow_tile'), null, player.x, player.y, this.heightmap[Math.floor(player.x)][Math.floor(player.y)] - 1, 0, 0, shadowPrio));
  var offsetX = (player.rot == 6 || player.rot == 5 || player.rot == 4) ? 3 : 0;
  if (player.ready) {
    this.drawQueue.queue(new IsometricDrawableSprite(player.currentSprite(), player.currentSilhouette(), player.x, player.y, player.z, offsetX, -85, prio));
  } else {
    this.drawQueue.queue(new IsometricDrawableSprite(this.sprites.getImage(player.getCurrentAvatarSpriteKey()), null, player.x, player.y, player.z, offsetX, -85, prio));
  }
  if (player.shouldShowSign()) {
    this.drawSign(player);
  }
};

Room.prototype.drawRoomItems = function() {
  for (key in this.roomItems) {
    if (this.roomItems[key] != null) {
      if (this.roomItems[key].ready && this.roomItems[key].getCurrentBaseSprite() != null) {
        let baseSprite = this.roomItems[key].getCurrentBaseSprite();

        let i = 0;
        for (layer of baseSprite.layers) {
          this.drawQueue.queue(new DrawableFurniChunk(layer.img, layer.ignoreMouse ? null : this.roomItems[key].getCurrentSelectableLayer(i), layer.additive, this.roomItems[key].x, this.roomItems[key].y, this.roomItems[key].z, i++, layer.zIndex, layer.posX + baseSprite.offsetX +32, layer.posY + baseSprite.offsetY +16, DrawableSprite.PRIORITY_ROOM_ITEM));
        }
      } else {
        this.drawQueue.queue(new IsometricDrawableSprite(this.sprites.getImage('furni_placeholder'), null, this.roomItems[key].x, this.roomItems[key].y, this.roomItems[key].z, -2, -33, DrawableSprite.PRIORITY_ROOM_ITEM));
      }
    }
  }
};

Room.prototype.drawWallItems = function() {
  for (key in this.wallItems) {
    if (this.wallItems[key] != null) {
      if (this.wallItems[key].ready && this.wallItems[key].getCurrentBaseSprite() != null) {
        let baseSprite = this.wallItems[key].getCurrentBaseSprite();
        let drawableSprite = new DrawableSprite(baseSprite.sprite, this.wallItems[key].currentSilhouette(), this.wallItems[key].x + baseSprite.offsetX, this.wallItems[key].y + baseSprite.offsetY, DrawableSprite.PRIORITY_WALL_ITEM);
        this.drawQueue.queue(drawableSprite);
        if (baseSprite.additiveSprite != null) {
          this.drawQueue.queue(new DrawableAdditiveSprite(baseSprite.additiveSprite, this.wallItems[key].currentSilhouette(), this.wallItems[key].x + baseSprite.offsetX, this.wallItems[key].y + baseSprite.offsetY, DrawableSprite.PRIORITY_WALL_ITEM));
        }
      } else {
        this.drawQueue.queue(new DrawableSprite(this.sprites.getImage('furni_placeholder'), null, this.wallItems[key].x - 32, this.wallItems[key].y - 16, DrawableSprite.PRIORITY_WALL_ITEM));
      }
    }
  }
};

Room.prototype.drawSign = function(player) {
  var tempCanvas = document.createElement('canvas');
  var tempCtx = tempCanvas.getContext('2d');

  tempCtx.font = Game.FONT;
  tempCtx.textBaseline = "top";
  tempCtx.fillStyle = "white";

  var textWidth = Math.round(tempCtx.measureText(player.name).width) - 13;
  var currentWidth = 0;

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

  tempCtx.fillText(player.name, 20, 6);

  var centeredX = Math.floor((Math.max(textWidth, 0) + 40) / 2);

  this.drawQueue.queue(new IsometricDrawableSprite(tempCanvas, null, player.x, player.y, 0, 22 - centeredX, -107, DrawableSprite.PRIORITY_SIGN));
};

Room.prototype.tickSelectedUserSign = function() {
  var selectedPlayer = this.mouseOverPlayer;
  if (selectedPlayer != null) {
    selectedPlayer.showSign(0.2);
  }
};

Room.prototype.draw = function() {
  this.drawWall();
  this.drawFloor();
  this.drawPlayers();
  this.drawSelectedTile();
  this.drawWallItems();
  this.drawRoomItems();

  var ctx = this.game.ctx;
  var auxCtx = this.game.auxCtx;
  while (this.drawQueue.length > 0) {
    var drawable = this.drawQueue.dequeue();
    drawable.draw(ctx, auxCtx, this.camera.x, this.camera.y);

    /*
    var screenX = Math.round(drawable.getScreenX() + this.camera.x);
    var screenY = Math.round(drawable.getScreenY() + this.camera.y);

    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(drawable.sprite, screenX, screenY);
    if (drawable.additiveSprite != null) {
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(drawable.additiveSprite, screenX, screenY);
    }
    if (drawable.selectableSprite != null) {
      auxCtx.drawImage(drawable.selectableSprite, screenX, screenY);
    }
    */
  }
  ctx.globalCompositeOperation = "source-over";
  for (chatSprite of this.chatManager.getDrawableSprites()) {
    chatSprite.draw(ctx, auxCtx, this.camera.x, this.camera.y);
  }
};

Room.prototype.tickPlayers = function(delta) {
  for (key in this.players) {
    if (this.players[key] != null) {
      this.players[key].tick(delta);
    }
  }
};

Room.prototype.tickRoomItems = function(delta) {
  for (key in this.roomItems) {
    if (this.roomItems[key] != null && this.roomItems[key].ready) {
      this.roomItems[key].tick(delta);
    }
  }
};

Room.prototype.tickWallItems = function(delta) {
  for (key in this.wallItems) {
    if (this.wallItems[key] != null && this.wallItems[key].ready) {
      this.wallItems[key].tick(delta);
    }
  }
};

Room.prototype.tick = function(delta) {
  this.tickPlayers(delta);
  this.tickRoomItems(delta);
  this.tickWallItems(delta);
  this.tickSelectedUserSign();
  this.chatManager.tick(delta);
};

Room.prototype.onSelectPlayer = function(player) {
  this.game.communication.requestLookAt(player.id);
  player.showSign(5);
};

Room.prototype.onSelectFurni = function(furni) {
  this.game.communication.requestInteractFurni(furni.id);
};

Room.prototype.trySelectPlayer = function(x, y) {
  var selectedPlayer = this.getPlayerFromSelectId(Sprites.rgb2int(this.selectedPixel[0], this.selectedPixel[1], this.selectedPixel[2]));
  if (selectedPlayer != null) {
    return selectedPlayer;
  }
  return null;
};

Room.prototype.trySelectFurni = function(x, y) {
  var selectedFurni = this.getFurniFromSelectId(Sprites.rgb2int(this.selectedPixel[0], this.selectedPixel[1], this.selectedPixel[2]));
  if (selectedFurni != null) {
    return selectedFurni;
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

    var xminusy = (x - 32 - offsetX) / Game.TILE_H;
    var xplusy =  (y - offsetY) * 2 / Game.TILE_H;

    var tileX = Math.floor((xminusy + xplusy) / 2);
    var tileY = Math.floor((xplusy - xminusy) / 2);

    if (this.isValidTile(tileX, tileY)) {
      this.game.communication.requestMovement(tileX, tileY);
    }
  }
};

Room.prototype.onMouseDoubleClick = function(x, y) {
  var selectedFurni = this.trySelectFurni(x, y);
  if (selectedFurni != null) {
    this.onSelectFurni(selectedFurni);
  } else {
    var offsetX = this.camera.x;
    var offsetY = this.camera.y;

    var xminusy = (x - 32 - offsetX) / Game.TILE_H;
    var xplusy =  (y - offsetY) * 2 / Game.TILE_H;

    var tileX = Math.floor((xminusy + xplusy) / 2);
    var tileY = Math.floor((xplusy - xminusy) / 2);

    if (!this.isValidTile(tileX, tileY)) {
      this.camera.reset();
    }
  }
};

Room.prototype.onMouseMove = function(x, y, isDrag) {
  if (isDrag) //Move camera
  {
    var diffX = Math.round( this.selectedScreenX - x);
    var diffY = Math.round(this.selectedScreenY - y);
    this.camera.x -= diffX;
    this.camera.y -= diffY;
  } else {
    this.selectedPixel = this.game.auxCtx.getImageData(x, y, 1, 1).data;
    new Promise((resolve, reject) => {
      this.mouseOverPlayer = this.trySelectPlayer(this.selectedScreenX, this.selectedScreenY);
    });
  }
  this.selectedScreenX = Math.round(x);
  this.selectedScreenY = Math.round(y);
};

Room.prototype.onTouchStart = function(x, y) {
  this.onMouseMove(x, y, false);
};

Room.prototype.onTouchMove = function(x, y) {
  this.onMouseMove(x, y, true);
};
