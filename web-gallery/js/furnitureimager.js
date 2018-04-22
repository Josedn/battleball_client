FurnitureImager.LOCAL_RESOURCES_URL = "/web-gallery/hof_furni/";

function FurniSprite(itemName, size, layer, direction, frame, color, layerData) {
  this.itemName = itemName;
  this.size = size;
  this.layer = layer;
  this.direction = direction;
  this.frame = frame;
  this.color = color;
  this.layerData = layerData;
  this.resourceName = this.buildResourceName();
};

FurniSprite.prototype.setAsset = function(asset) {
  this.asset = asset;
  if (asset.source != null) {
    this.resourceName = asset.source;
  }
};

FurniSprite.prototype.downloadAsync = function() {
  let img = new Image();
  let d = new Promise(function (resolve, reject) {
    img.onload = function () {
      this.resource = img;
      //console.log("downloaded " + this.itemName + " -> " + this.resourceName);
      resolve(img);
    }.bind(this);

    img.onerror = function () {
      //console.log("NOT DOWNLOADED " + this.itemName + " -> " + this.resourceName);
      resolve();
      reject('Could not load image: ' + img.src);
    }.bind(this);
  }.bind(this));

  img.src = FurnitureImager.LOCAL_RESOURCES_URL + this.itemName + "/" + this.resourceName + ".png";
  return d;
};

FurniSprite.prototype.getLayerName = function(layerId) {
  if (layerId == -1) {
    return "sd";
  }
  return String.fromCharCode(97 + layerId);
};

FurniSprite.prototype.buildResourceName = function() {
  let resourceName = this.itemName + "_" + this.size + "_" + this.getLayerName(this.layer) + "_" + this.direction + "_" + this.frame;
  return resourceName;
};

function FurnitureImager() {
  this.ready = false;
  this.bases = { roomitem: {}, wallitem: {} };
  this.offsets = { roomitem: {}, wallitem: {} };
};

FurnitureImager.prototype.initialize = function() {
  let p = this.loadFiles();
  return Promise.all(p);
};

FurnitureImager.prototype.downloadJsonAsync = function(key, url) {
  return new Promise(function (resolve, reject) {
    let r = new XMLHttpRequest();
    r.open("GET", url, true);
    r.onreadystatechange = function () {
      if (r.readyState != 4 || r.status != 200) {
        if (r.status == 404) {
          reject("Error downloading " + url);
        }
        return;
      }
      this[key] = JSON.parse(r.responseText);
      resolve();
    }.bind(this);
    r.send();
  }.bind(this));
};

FurnitureImager.prototype.downloadOffsetAsync = function(type, uniqueName) {
  return new Promise(function (resolve, reject) {
    let r = new XMLHttpRequest();
    r.open("GET", FurnitureImager.LOCAL_RESOURCES_URL + uniqueName + "/furni.json", true);
    r.onreadystatechange = function () {
      if (r.readyState != 4 || r.status != 200) {
        if (r.status == 404) {
          reject("Error downloading " + url);
        }
        return;
      }
      this.offsets[type][uniqueName].data = JSON.parse(r.responseText);
      resolve();
    }.bind(this);
    r.send();
  }.bind(this));
};

FurnitureImager.prototype.loadFiles = function() {
  return [
    this.downloadJsonAsync("furnidata", FurnitureImager.LOCAL_RESOURCES_URL + "furnidata.json")
  ];
};

FurnitureImager.prototype.getRoomItemName = function(itemId) {
  if (this.furnidata.roomitemtypes[itemId] != null){
    return this.furnidata.roomitemtypes[itemId].classname;
  }
  return null;
};

FurnitureImager.prototype.getWallItemName = function(itemId) {
  if (this.furnidata.wallitemtypes[itemId] != null){
    return this.furnidata.wallitemtypes[itemId].classname;
  }
  return null;
};

FurnitureImager.prototype.getItemName = function(type, itemId) {
  if (type == "roomitem") {
    return this.getRoomItemName(itemId);
  } else {
    return this.getWallItemName(itemId);
  }
};

FurnitureImager.prototype.isValidIdRoom = function(itemId) {
  return this.furnidata.roomitemtypes[itemId] != null;
};

FurnitureImager.prototype.isValidIdWall = function(itemId) {
  return this.furnidata.wallitemtypes[itemId] != null;
};

FurnitureImager.prototype.flipSprite = function(img) {
  let element = document.createElement('canvas');
  let c = element.getContext("2d");

  let width = img.width;
  let height = img.height;
  element.width = width;
  element.height = height;

  c.save();
  c.scale(-1, 1);
  c.drawImage(img,0,0,width*-1,height);
  c.restore();

  return element;
};

FurnitureImager.prototype.hex2rgb = function(hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

FurnitureImager.prototype.tintSprite = function(img, color, alpha) {
  let element = document.createElement('canvas');
  let c = element.getContext("2d");

  let rgb = this.hex2rgb(color);

  let width = img.width;
  let height = img.height;

  element.width = width;
  element.height = height;

  c.drawImage(img, 0, 0);
  let imageData = c.getImageData(0, 0, width, height);
  for (let y = 0; y < height; y++) {
    let inpos = y * width * 4;
    for (let x = 0; x < width; x++) {
      let pr = imageData.data[inpos++];
      let pg = imageData.data[inpos++];
      let pb = imageData.data[inpos++];
      let pa = imageData.data[inpos++];
      if (pa != 0) {
        imageData.data[inpos - 1] = alpha; //A
        imageData.data[inpos - 2] = Math.round(rgb.b * imageData.data[inpos - 2] / 255); //B
        imageData.data[inpos - 3] = Math.round(rgb.g * imageData.data[inpos - 3] / 255); //G
        imageData.data[inpos - 4] = Math.round(rgb.r * imageData.data[inpos - 4] / 255); //R
      }
    }
  }
  c.putImageData(imageData, 0, 0);
  return element;
};

FurnitureImager.prototype.tintSpriteAdd = function(img, color, alpha) {
  let element = document.createElement('canvas');
  let c = element.getContext("2d");

  let rgb = this.hex2rgb(color);

  let width = img.width;
  let height = img.height;

  element.width = width;
  element.height = height;

  c.drawImage(img, 0, 0);
  let imageData = c.getImageData(0, 0, width, height);
  for (let y = 0; y < height; y++) {
    let inpos = y * width * 4;
    for (let x = 0; x < width; x++) {
      let pr = imageData.data[inpos++];
      let pg = imageData.data[inpos++];
      let pb = imageData.data[inpos++];
      let pa = imageData.data[inpos++];
      if (pa != 0) {
        imageData.data[inpos - 1] = alpha; //A
        imageData.data[inpos - 2] = Math.round((rgb.b + imageData.data[inpos - 2]) / 2); //B
        imageData.data[inpos - 3] = Math.round((rgb.g + imageData.data[inpos - 3]) / 2); //G
        imageData.data[inpos - 4] = Math.round((rgb.r + imageData.data[inpos - 4]) / 2); //R
      }
    }
  }
  c.putImageData(imageData, 0, 0);
  return element;
};


function FurniBase(itemId, itemName, size) {
  this.itemId = itemId;
  this.itemName = itemName;
  this.size = size;
  this.sprites = {};
};

FurnitureImager.prototype.generateWallItem = function(itemId, size) {
  return this.generateAll("wallitem", itemId, size);
};

FurnitureImager.prototype.generateRoomItem = function(itemId, size) {
  return this.generateAll("roomitem", itemId, size);
};

FurnitureImager.prototype.generateAll = function(type, itemId, size) {
  let itemName = this.getItemName(type, itemId);
  let colorId = 0;

  this.bases[type][itemId] = new FurniBase(itemId, itemName, size);

  if (itemName.includes("*")) {
    const longFurniName = itemName.split("*");
    itemName = longFurniName[0];
    colorId = parseInt(longFurniName[1]);
  }

  let offsetPromise = null;

  if (this.offsets[type][itemName] == null) {
    this.offsets[type][itemName] = { 'promise': this.downloadOffsetAsync(type, itemName), 'data': {} };
    offsetPromise = this.offsets[type][itemName].promise;
  } else if (this.offsets[type][itemName].data != {}) {
    offsetPromise = this.offsets[type][itemName].promise;
  }

  return new Promise((resolve, reject) => {
    offsetPromise.catch(() => {
      reject("Error downloading offset");
    }).then(() => {
      const visualization = this.offsets[type][itemName].data.visualization[64];
      let states = { "0": 1 };
      let frames = 0;
      if (visualization.animations != null) {
        for (stateId in visualization.animations) {
          let count = 1;
          for (animation of visualization.animations[stateId]) {
            if (animation.frameSequence != null) {
              if (count < animation.frameSequence.length) {
                count = animation.frameSequence.length;
              }
            }
          }
          states[stateId] = count;
        }
      }
      this.bases[type][itemId].states = states;
      const promises = [];

      for (direction of visualization.directions) {
        for (stateId in states) {
          const frames = states[stateId];
          for (let frame = 0; frame < frames; frame++) {
            promises.push(this.generateItem(type, itemId, direction, stateId, frame, size, this.getFurnitureSpriteKey(itemId, direction, stateId, frame, size)));
          }
        }
      }

      Promise.all(promises).catch(() => {
        reject();
      } ).then(() => {
        resolve(this.bases[type][itemId]);
      })
    });
  });
};

FurnitureImager.prototype.getFurnitureSpriteKey = function(itemId, direction, stateId, frame, size) {
  return itemId + "_" + size + "_" + direction + "_" + stateId + "_" + frame;
};

FurnitureImager.prototype.generateItem = function(type, itemId, direction, state, frame, size, key) {
  let itemName = this.getItemName(type, itemId);
  let colorId = 0;
  if (itemName.includes("*")) {
    const longFurniName = itemName.split("*");
    itemName = longFurniName[0];
    colorId = parseInt(longFurniName[1]);
  }

  let offsetPromise = null;

  if (this.offsets[type][itemName] == null) {
    this.offsets[type][itemName] = { 'promise': this.downloadOffsetAsync(itemName), 'data': {} };
    offsetPromise = this.offsets[type][itemName].promise;
  } else if (this.offsets[type][itemName].data != {}) {
    offsetPromise = this.offsets[type][itemName].promise;
  }

  return new Promise((resolve, reject) => {
    offsetPromise.then(() => {
      let chunksPromises = [];
      let chunks = [];

      const visualization = this.offsets[type][itemName].data.visualization[size];
      const assets = this.offsets[type][itemName].data.assets;
      for (let i = -1; i < visualization.layerCount; i++) {
        let color = null;
        let spriteFrame = 0;
        let layerData = {};

        if (i == -1) {
          layerData.alpha = 77;
        }

        if (visualization.colors != null && visualization.colors[colorId] != null) {
          for (colorLayer of visualization.colors[colorId]) {
            if (colorLayer.layerId == i) {
              color = colorLayer.color;
            }
          }
        }

        if (visualization.animations != null && visualization.animations[state] != null) {
          for (animation of visualization.animations[state]) {
            if (animation.layerId == i && animation.frameSequence != null) {
              spriteFrame = animation.frameSequence[frame % animation.frameSequence.length];
            }
          }
        }

        if (visualization.layers != null) {
          for (layer of visualization.layers) {
            if (layer.id == i) {
              layerData = layer;
            }
          }
        }

        let sprite = new FurniSprite(itemName, size, i, direction, spriteFrame, color, layerData);
        let asset = assets[sprite.resourceName];
        if (asset != null) {
          sprite.setAsset(asset);
          chunksPromises.push(sprite.downloadAsync());
          chunks.push(sprite);
        }
      }

      Promise.all(chunksPromises).then(() => {
        let lefterX = 1000;
        let lefterFlippedX = 1000;
        let righterX = 0;
        let upperY = 1000;
        let lowerY = 0;
        for (chunk of chunks) {
          if (chunk.resource != null) {
            let posX = -parseInt(chunk.asset.x);
            let posY = -parseInt(chunk.asset.y);
            let img = chunk.resource;
            if (chunk.asset.flipH != null && chunk.asset.flipH == "1") {
              let flippedPosX = parseInt(chunk.asset.x) - img.width;
              if (lefterFlippedX > flippedPosX) {
                lefterFlippedX = flippedPosX;
              }
            }
            if (lefterX > posX) {
              lefterX = posX;
            }
            if (upperY > posY) {
              upperY = posY;
            }
            if (righterX < posX + img.width) {
              righterX = posX + img.width;
            }
            if (lowerY < posY + img.height) {
              lowerY = posY + img.height;
            }
          }
        }

        let tempCanvas = document.createElement('canvas');
        let tempCtx = tempCanvas.getContext('2d');

        let tempCanvasAdd = document.createElement('canvas');
        let tempCtxAdd = tempCanvasAdd.getContext('2d');

        tempCanvas.width = righterX - lefterX;
        tempCanvas.height = lowerY - upperY;
        tempCanvasAdd.width = righterX - lefterX;
        tempCanvasAdd.height = lowerY - upperY;
        tempCtxAdd.globalCompositeOperation = "lighter";

        let useAdd = false;
        let useFlipX = false;

        for (chunk of chunks) {
          if (chunk.resource != null) {
            let posX = -lefterX - parseInt(chunk.asset.x);
            let posY = -upperY - parseInt(chunk.asset.y);
            let img = chunk.resource;
            if (chunk.asset.flipH != null && chunk.asset.flipH == "1") {
              img = this.flipSprite(img);
              posX = parseInt(chunk.asset.x) - img.width - lefterFlippedX;
              useFlipX = true;
            }
            if (chunk.layerData.alpha != null) {
              img = this.tintSprite(img, "ffffff", chunk.layerData.alpha);
            }
            if (chunk.color != null) {
              img = this.tintSprite(img, chunk.color, 255);
            }
            if (chunk.layerData.ink != null && chunk.layerData.ink == "ADD") {
              useAdd = true;
              //tempCtxAdd.globalCompositeOperation = "lighter";
              tempCtxAdd.drawImage(img, posX, posY);
            } else {
              //tempCtx.globalCompositeOperation = "source-over";
              tempCtx.drawImage(img, posX, posY);
            }
          }
        }
        if (useFlipX) {
          lefterX = lefterFlippedX;
        }

        this.bases[type][itemId].sprites[key] = { sprite : tempCanvas, offsetX: lefterX, offsetY: upperY };
        if (useAdd) {
          this.bases[type][itemId].sprites[key].additiveSprite = tempCanvasAdd;
        }
        resolve(tempCanvas);
      });

    });
  });

};
