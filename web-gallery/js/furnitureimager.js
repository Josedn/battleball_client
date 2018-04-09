FurnitureImager.LOCAL_RESOURCES_URL = "/web-gallery/hof_furni/";
FurnitureImager.INTERNAL_DRAWING_OFFSET_X = -132;
FurnitureImager.INTERNAL_DRAWING_OFFSET_Y = -116;
FurnitureImager.INTERNAL_DRAWING_OFFSET_X_FLIP = 264;

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
  this.bases = {};
  this.offsets = {};
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

FurnitureImager.prototype.downloadOffsetAsync = function(uniqueName) {
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
      this.offsets[uniqueName].data = JSON.parse(r.responseText);
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

FurnitureImager.prototype.isValidId = function(itemId) {
  return this.furnidata.roomitemtypes[itemId] != null;
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

FurnitureImager.prototype.generateAll = function(itemId, size) {
  let itemName = this.getRoomItemName(itemId);
  let colorId = 0;

  this.bases[itemId] = new FurniBase(itemId, itemName, size);

  if (itemName.includes("*")) {
    const longFurniName = itemName.split("*");
    itemName = longFurniName[0];
    colorId = parseInt(longFurniName[1]);
  }

  let offsetPromise = null;

  if (this.offsets[itemId] == null) {
    this.offsets[itemName] = { 'promise': this.downloadOffsetAsync(itemName), 'data': {} };
    offsetPromise = this.offsets[itemName].promise;
  } else if (this.offsets[itemName].data != {}) {
    offsetPromise = this.offsets[itemName].promise;
  }

  return new Promise((resolve, reject) => {
    offsetPromise.catch(() => {
      reject("Error downloading offset");
    }).then(() => {
      const visualization = this.offsets[itemName].data.visualization[64];
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
      this.bases[itemId].states = states;
      const promises = [];

      for (direction of visualization.directions) {
        for (stateId in states) {
          const frames = states[stateId];
          for (let frame = 0; frame < frames; frame++) {
            promises.push(this.generateRoomItem(itemId, direction, stateId, frame, size, this.getFurnitureSpriteKey(itemId, direction, stateId, frame, size)));
          }
        }
      }

      Promise.all(promises).catch(() => {
        reject();
      } ).then(() => {
        resolve(this.bases[itemId]);
      })
    });
  });
};

FurnitureImager.prototype.getFurnitureSpriteKey = function(itemId, direction, stateId, frame, size) {
  return itemId + "_" + size + "_" + direction + "_" + stateId + "_" + frame;
};

FurnitureImager.prototype.generateRoomItem = function(itemId, direction, state, frame, size, key) {
  let tempCanvas = document.createElement('canvas');
  let tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = 350;
  tempCanvas.height = 350;

  //tempCtx.fillStyle = "#ffffff";
  //tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

  let itemName = this.getRoomItemName(itemId);
  let colorId = 0;
  if (itemName.includes("*")) {
    const longFurniName = itemName.split("*");
    itemName = longFurniName[0];
    colorId = parseInt(longFurniName[1]);
  }

  let offsetPromise = null;

  if (this.offsets[itemName] == null) {
    this.offsets[itemName] = { 'promise': this.downloadOffsetAsync(itemName), 'data': {} };
    offsetPromise = this.offsets[itemName].promise;
  } else if (this.offsets[itemName].data != {}) {
    offsetPromise = this.offsets[itemName].promise;
  }

  return new Promise((resolve, reject) => {
    offsetPromise.then(() => {
      let chunksPromises = [];
      let chunks = [];

      const visualization = this.offsets[itemName].data.visualization[size];
      const assets = this.offsets[itemName].data.assets;
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
        for (chunk of chunks) {
          if (chunk.resource != null) {
            let posX = -FurnitureImager.INTERNAL_DRAWING_OFFSET_X - parseInt(chunk.asset.x);
            let posY = -FurnitureImager.INTERNAL_DRAWING_OFFSET_Y - parseInt(chunk.asset.y);
            let img = chunk.resource;
            if (tempCanvas.width < posX + img.width) {
              tempCanvas.width = posX + img.width;
            }
            if (tempCanvas.height < posY + img.height) {
              tempCanvas.height = posY + img.height;
            }
            if (chunk.asset.flipH != null && chunk.asset.flipH == "1") {
              img = this.flipSprite(img);
              posX = -(posX + img.width - FurnitureImager.INTERNAL_DRAWING_OFFSET_X_FLIP);
            }
            if (chunk.layerData.alpha != null) {
              img = this.tintSprite(img, "ffffff", chunk.layerData.alpha);
            }
            if (chunk.layerData.ink != null && chunk.layerData.ink == "ADD") {
              tempCtx.globalCompositeOperation = "lighter";
            } else {
              tempCtx.globalCompositeOperation = "source-over";
            }
            if (chunk.color != null) {
              img = this.tintSprite(img, chunk.color, 255);
            }
            tempCtx.drawImage(img, posX, posY);
          }
        }

        this.bases[itemId].sprites[key] = tempCanvas;
        resolve(tempCanvas);
      });

    });
  });

};
