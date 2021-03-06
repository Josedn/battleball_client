Sprites.LOCAL_RESOURCES_URL = "./web-gallery/assets/";
Sprites.EXTERNAL_FURNITURE_URL = "./hof_furni/";
Sprites.EXTERNAL_IMAGER_URL = "./avatarimage.php?figure=";

DrawableSprite.PRIORITY_DOOR_FLOOR = 1;
DrawableSprite.PRIORITY_DOOR_FLOOR_SELECT = 2;
DrawableSprite.PRIORITY_DOOR_FLOOR_PLAYER_SHADOW = 3;
DrawableSprite.PRIORITY_DOOR_FLOOR_PLAYER = 4;
DrawableSprite.PRIORITY_DOOR_WALL = 5;
DrawableSprite.PRIORITY_WALL = 6;
DrawableSprite.PRIORITY_FLOOR = 7;
DrawableSprite.PRIORITY_WALL_ITEM = 8;
DrawableSprite.PRIORITY_PLAYER_SHADOW = 9;
DrawableSprite.PRIORITY_FLOOR_SELECT = 11;
DrawableSprite.PRIORITY_PLAYER = 11;
DrawableSprite.PRIORITY_ROOM_ITEM = 11;
DrawableSprite.PRIORITY_SIGN = 12;
DrawableSprite.PRIORITY_CHAT = 13;

DrawableSprite.COMPARABLE_X_Y = 1000000;
DrawableSprite.COMPARABLE_Z = 10000;

DrawableFurniChunk.DEBUG_ENABLED = false;
DrawableFurniChunk.DEBUG_FLAG = false;

Sprites.rgb2int = function(r, g, b) {
  return (r << 16) + (g << 8) + (b);
};

function Sprites() {
  this.images = {};
  this.silhouettes = {};
  this.colorR = this.random(0, 255);
  this.colorG = this.random(0, 255);
  this.colorB = this.random(0, 255);
  this.colorId = Sprites.rgb2int(this.colorR, this.colorG, this.colorB);
};

Sprites.prototype.random = function(min, max) {
  var num = Math.floor(Math.random()*(max-min)) + min;
  return num;
};

Sprites.prototype.loadImage = function (key, src) {
    var img = new Image();
    var d = new Promise(function (resolve, reject) {
        img.onload = function () {
            this.images[key] = img;
            this.silhouettes[key] = this.generateSilhouette(img, this.colorR, this.colorG, this.colorB);
            resolve(img);
        }.bind(this);

        img.onerror = function () {
            reject('Could not load image: ' + src);
        };
    }.bind(this));
    img.crossOrigin = "anonymous";
    img.src = src;
    return d;
};

Sprites.prototype.convertToImg = function(img) {
  if (img instanceof HTMLCanvasElement) {
    var imgFoo = document.createElement('img');
    imgFoo.src = img.toDataURL();
    return imgFoo;
  }
  return img;
};

Sprites.prototype.loadLocalImage = function(key, img) {
  this.images[key] = this.convertToImg(img);
  this.silhouettes[key] = this.convertToImg(this.generateSilhouette(img, this.colorR, this.colorG, this.colorB));
};

Sprites.prototype.getImage = function (key) {
    return (key in this.images) ? this.images[key] : null;
};

Sprites.prototype.getSilhouette = function (key) {
    return (key in this.silhouettes) ? this.silhouettes[key] : null;
};

Sprites.prototype.loadFurniAsset = function(asset, key) {
  var totalUrl = Sprites.EXTERNAL_FURNITURE_URL + asset + "/" + key + ".png";
  return this.loadImage(key, totalUrl);
};

Sprites.prototype.getFurnitureSpriteKey = function(itemId, direction, stateId, frame) {
  return itemId + "_64_" + direction + "_" + stateId + "_" + frame;
};

//KEY = DIRECTION_HEADDIRECTION_ACTIONS_GESTURE_FRAME
Sprites.prototype.getAvatarSpriteKey = function(direction, headDirection, action, gesture, frame) {
  let actionText = action[0];
  if (action.length > 1) {
    actionText += "-" + action[1];
  }
  return direction + "_" + headDirection + "_" + actionText + "_" + gesture + "_" + frame;
};

Sprites.prototype.loadGenericGhost = function(avatarImager, look, direction, headDirection, action, gesture, frame) {
  const p = new Promise((resolve, reject) => {
    avatarImager.generateGhost(new AvatarImage(look, direction, headDirection, action, gesture, frame, false, "n")).then((img) => {
      this.loadLocalImage(this.getAvatarSpriteKey(direction, headDirection, action, gesture, frame), img);
      resolve();
    });
  });
  return p;
};

Sprites.prototype.loadAllGenericGhost = function(avatarImager) {
  const look = "hd-180-1021";
  const promises = [];
  //std
  for (let i = 0; i <= 7; i++) {
    promises.push(this.loadGenericGhost(avatarImager, look, i, i, ["std"], "std", 0));
    //eyb
    promises.push(this.loadGenericGhost(avatarImager, look, i, i, ["std"], "eyb", 0));
    //spk
    for (let j = 0; j <= 1; j++) {
      promises.push(this.loadGenericGhost(avatarImager, look, i, i, ["std"], "spk", j));
    }
  }
  //wlk
  for (let i = 0; i <= 7; i++) {
    for (let j = 0; j <= 3; j++) {
      promises.push(this.loadGenericGhost(avatarImager, look, i, i, ["wlk"], "std", j));
      promises.push(this.loadGenericGhost(avatarImager, look, i, i, ["wlk"], "spk", j));
    }
  }
  //wav
  for (let i = 0; i <= 7; i++) {
    for (let j = 0; j <= 1; j++) {
      promises.push(this.loadGenericGhost(avatarImager, look, i, i, ["wav"], "std", j));
      promises.push(this.loadGenericGhost(avatarImager, look, i, i, ["wav"], "spk", j));
    }
  }
  //wlk-wav
  for (let i = 0; i <= 7; i++) {
    for (let j = 0; j <= 3; j++) {
      promises.push(this.loadGenericGhost(avatarImager, look, i, i, ["wlk", "wav"], "std", j));
      promises.push(this.loadGenericGhost(avatarImager, look, i, i, ["wlk", "wav"], "spk", j));
    }
  }
  //sit
  for (let i = 0; i <= 7; i++) {
    promises.push(this.loadGenericGhost(avatarImager, look, i, i, ["sit"], "std", 0));
    //eyb
    promises.push(this.loadGenericGhost(avatarImager, look, i, i, ["sit"], "eyb", 0));
    //spk
    for (let j = 0; j <= 1; j++) {
      promises.push(this.loadGenericGhost(avatarImager, look, i, i, ["sit"], "spk", j));
    }
  }
  //sit-wav
  for (let i = 0; i <= 7; i++) {
    for (let j = 0; j <= 1; j++) {
      promises.push(this.loadGenericGhost(avatarImager, look, i, i, ["sit", "wav"], "std", j));
      promises.push(this.loadGenericGhost(avatarImager, look, i, i, ["sit", "wav"], "spk", j));
    }
  }
  return Promise.all(promises);
};

Sprites.prototype.loadGenericAvatar = function(avatarImager, look, direction, headDirection, action, gesture, frame) {
  const p = new Promise((resolve, reject) => {
    avatarImager.generate(new AvatarImage(look, direction, headDirection, action, gesture, frame, false, "n")).then((img) => {
      this.loadLocalImage(this.getAvatarSpriteKey(direction, headDirection, action, gesture, frame), img);
      resolve();
    });
  });
  return p;
};

Sprites.prototype.loadAllGenericAvatar = function(look, avatarImager) {
  const promises = [];
  //std
  for (let i = 0; i <= 7; i++) {
    promises.push(this.loadGenericAvatar(avatarImager, look, i, i, ["std"], "std", 0));
    //eyb
    promises.push(this.loadGenericAvatar(avatarImager, look, i, i, ["std"], "eyb", 0));
    //spk
    for (let j = 0; j <= 1; j++) {
      promises.push(this.loadGenericAvatar(avatarImager, look, i, i, ["std"], "spk", j));
    }
  }
  //wlk
  for (let i = 0; i <= 7; i++) {
    for (let j = 0; j <= 3; j++) {
      promises.push(this.loadGenericAvatar(avatarImager, look, i, i, ["wlk"], "std", j));
      promises.push(this.loadGenericAvatar(avatarImager, look, i, i, ["wlk"], "spk", j));
    }
  }
  //wav
  for (let i = 0; i <= 7; i++) {
    for (let j = 0; j <= 1; j++) {
      promises.push(this.loadGenericAvatar(avatarImager, look, i, i, ["wav"], "std", j));
      promises.push(this.loadGenericAvatar(avatarImager, look, i, i, ["wav"], "spk", j));
    }
  }
  //wlk-wav
  for (let i = 0; i <= 7; i++) {
    for (let j = 0; j <= 3; j++) {
      promises.push(this.loadGenericAvatar(avatarImager, look, i, i, ["wlk", "wav"], "std", j));
      promises.push(this.loadGenericAvatar(avatarImager, look, i, i, ["wlk", "wav"], "spk", j));
    }
  }
  //sit
  for (let i = 0; i <= 7; i++) {
    promises.push(this.loadGenericAvatar(avatarImager, look, i, i, ["sit"], "std", 0));
    //eyb
    promises.push(this.loadGenericAvatar(avatarImager, look, i, i, ["sit"], "eyb", 0));
    //spk
    for (let j = 0; j <= 1; j++) {
      promises.push(this.loadGenericAvatar(avatarImager, look, i, i, ["sit"], "spk", j));
    }
  }
  //sit-wav
  for (let i = 0; i <= 7; i++) {
    for (let j = 0; j <= 1; j++) {
      promises.push(this.loadGenericAvatar(avatarImager, look, i, i, ["sit", "wav"], "std", j));
      promises.push(this.loadGenericAvatar(avatarImager, look, i, i, ["sit", "wav"], "spk", j));
    }
  }
  return Promise.all(promises);
};

Sprites.prototype.loadHeadAvatar = function(key, look, avatarImager) {
  return avatarImager.generate(new AvatarImage(look, 2, 2, "std", "std", 0, true, "d")).then((img) => {
    this.loadLocalImage(key, img);
  });
};

Sprites.prototype.generateSilhouette = function(img, r, g, b) {
  var element = document.createElement('canvas');
  var c = element.getContext("2d");

  var width = img.width;
  var height = img.height;

  element.width = width;
  element.height = height;

  c.drawImage(img, 0, 0);
  var imageData = c.getImageData(0, 0, width, height);
  for (var y = 0; y < height; y++) {
    var inpos = y * width * 4;
    for (var x = 0; x < width; x++) {
      var pr = imageData.data[inpos++];
      var pg = imageData.data[inpos++];
      var pb = imageData.data[inpos++];
      var pa = imageData.data[inpos++];
      if (pa != 0) {
        imageData.data[inpos - 2] = b; //B
        imageData.data[inpos - 3] = g; //G
        imageData.data[inpos - 4] = r; //R
      }
    }
  }
  c.putImageData(imageData, 0, 0);
  return element;
};

function DrawableSprite(sprite, selectableSprite, screenX, screenY, priority) {
  this.sprite = sprite;
  this.selectableSprite = selectableSprite;
  this.screenX = screenX;
  this.screenY = screenY;
  this.priority = priority;
}

DrawableSprite.prototype.getScreenX = function() {
  return this.screenX;
};

DrawableSprite.prototype.getScreenY = function() {
  return this.screenY;
};

DrawableSprite.prototype.getComparableItem = function() {
  return this.screenY;
};

DrawableSprite.prototype.draw = function(ctx, auxCtx, cameraX, cameraY) {
  ctx.globalCompositeOperation = "source-over";
  ctx.drawImage(this.sprite, cameraX + this.getScreenX(), cameraY + this.getScreenY());
  if (this.selectableSprite != null) {
    auxCtx.drawImage(this.selectableSprite, cameraX + this.getScreenX(), cameraY + this.getScreenY());
  }
};

function DrawableAdditiveSprite(sprite, selectableSprite, screenX, screenY, priority) {
  this.sprite = sprite;
  this.selectableSprite = selectableSprite;
  this.screenX = screenX;
  this.screenY = screenY;
  this.priority = priority;
}

DrawableAdditiveSprite.prototype.getScreenX = function() {
  return this.screenX;
};

DrawableAdditiveSprite.prototype.getScreenY = function() {
  return this.screenY;
};

DrawableAdditiveSprite.prototype.getComparableItem = function() {
  return this.screenY;
};

DrawableAdditiveSprite.prototype.draw = function(ctx, auxCtx, cameraX, cameraY) {
  ctx.globalCompositeOperation = "lighter";
  ctx.drawImage(this.sprite, cameraX + this.getScreenX(), cameraY + this.getScreenY());
  if (this.selectableSprite != null) {
    auxCtx.drawImage(this.selectableSprite, cameraX + this.getScreenX(), cameraY + this.getScreenY());
  }
};

function IsometricDrawableSprite(sprite, selectableSprite, mapX, mapY, mapZ, offsetX, offsetY, priority) {
  DrawableSprite.call(this, sprite, selectableSprite, 0, 0, priority);
  this.mapX = mapX;
  this.mapY = mapY;
  this.mapZ = mapZ;
  this.offsetX = offsetX;
  this.offsetY = offsetY;
}

IsometricDrawableSprite.prototype.getScreenX = function() {
  return (this.mapX - this.mapY) * (Game.TILE_W / 2) + this.offsetX;
};

IsometricDrawableSprite.prototype.getScreenY = function() {
  return (this.mapX + this.mapY) * (Game.TILE_H / 2) + this.offsetY - (this.mapZ * Game.TILE_H);
};

IsometricDrawableSprite.prototype.getComparableItem = function() {
  return (Math.floor(this.mapX) + Math.floor(this.mapY)) * (DrawableSprite.COMPARABLE_X_Y) + (this.mapZ * (DrawableSprite.COMPARABLE_Z));
};

IsometricDrawableSprite.prototype.draw = function(ctx, auxCtx, cameraX, cameraY) {
  if (this.sprite != null) {
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(this.sprite, cameraX + this.getScreenX(), cameraY + this.getScreenY());
  }
  if (this.selectableSprite != null) {
    auxCtx.drawImage(this.selectableSprite, cameraX + this.getScreenX(), cameraY + this.getScreenY());
  }
};


function DrawablePlayer(sprite, selectableSprite, mapX, mapY, mapZ, seatZ, offsetX, offsetY, priority) {
  DrawableSprite.call(this, sprite, selectableSprite, 0, 0, priority);
  this.mapX = mapX;
  this.mapY = mapY;
  this.mapZ = mapZ;
  this.seatZ = seatZ;
  this.offsetX = offsetX;
  this.offsetY = offsetY;
}

DrawablePlayer.prototype.getScreenX = function() {
  return (this.mapX - this.mapY) * (Game.TILE_W / 2) + this.offsetX;
};

DrawablePlayer.prototype.getScreenY = function() {
  return (this.mapX + this.mapY) * (Game.TILE_H / 2) + this.offsetY - ((this.mapZ + this.seatZ) * Game.TILE_H);
};

DrawablePlayer.prototype.getComparableItem = function() {
  return (Math.floor(this.mapX) + Math.floor(this.mapY)) * (DrawableSprite.COMPARABLE_X_Y) + ((this.mapZ + 0.001) * (DrawableSprite.COMPARABLE_Z));
};

DrawablePlayer.prototype.draw = function(ctx, auxCtx, cameraX, cameraY) {
  if (DrawableFurniChunk.DEBUG_FLAG) {
    console.log("player_" + this.getComparableItem());
    console.log("x: " + this.mapX);
    console.log("y: " + this.mapY);
  }
  if (this.sprite != null) {
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(this.sprite, cameraX + this.getScreenX(), cameraY + this.getScreenY());
  }
  if (this.selectableSprite != null) {
    auxCtx.drawImage(this.selectableSprite, cameraX + this.getScreenX(), cameraY + this.getScreenY());
  }
};

function DrawableFurniChunk(sprite, selectableSprite, additive, mapX, mapY, mapZ, layerId, zIndex, offsetX, offsetY, priority, baseItem) {
  this.sprite = sprite;
  this.selectableSprite = selectableSprite;
  this.additive = additive;
  this.mapX = mapX;
  this.mapY = mapY;
  this.mapZ = mapZ;
  this.compareX = 0;
  this.compareY = 0;
  this.compareZ = 0;
  this.layerId = parseInt(layerId);
  this.zIndex = parseInt(zIndex);
  //this.compareZ = (this.zIndex % 100) / 100;
  this.compareY = (Math.trunc(this.zIndex / 100)) / 10;
  this.offsetX = offsetX;
  this.offsetY = offsetY;
  this.priority = priority;
  this.baseItem = baseItem;
}

DrawableFurniChunk.prototype.getScreenX = function() {
  return (this.mapX - this.mapY) * (Game.TILE_W / 2) + this.offsetX;
};

DrawableFurniChunk.prototype.getScreenY = function() {
  return (this.mapX + this.mapY) * (Game.TILE_H / 2) + this.offsetY - (this.mapZ * Game.TILE_H);
};

DrawableFurniChunk.prototype.getComparableItem = function() {
  return ((this.mapX + this.mapY + this.compareY) * (DrawableSprite.COMPARABLE_X_Y)) + ((this.mapZ + this.compareZ) * DrawableSprite.COMPARABLE_Z) + this.layerId;
};

DrawableFurniChunk.prototype.draw = function(ctx, auxCtx, cameraX, cameraY) {
  if (DrawableFurniChunk.DEBUG_FLAG) {
    console.log(this.baseItem.itemName + "_" + this.getComparableItem());
    console.log("zIndex: " + this.zIndex);
    console.log("ActualZ: " + this.mapZ + " CompareZ: " + this.compareZ);
    console.log("ActualY: " + this.mapY + " CompareY: " + this.compareY);
    console.log("layerId: " + this.layerId);
  }
  ctx.globalCompositeOperation = "source-over";
  if (this.additive) {
    ctx.globalCompositeOperation = "lighter";
  }
  this.drawCtx(ctx, auxCtx, cameraX, cameraY);
  if (this.selectableSprite != null) {
    this.drawAux(ctx, auxCtx, cameraX, cameraY);
  }
};

DrawableFurniChunk.prototype.drawCtx = function(ctx, auxCtx, cameraX, cameraY) {
  ctx.drawImage(this.sprite, cameraX + this.getScreenX(), cameraY + this.getScreenY());
};

DrawableFurniChunk.prototype.drawAux = function(ctx, auxCtx, cameraX, cameraY) {
  auxCtx.drawImage(this.selectableSprite, cameraX + this.getScreenX(), cameraY + this.getScreenY());
};
