AvatarImager.LOCAL_RESOURCES_URL = "//images.bobba.io/resource/";

function AvatarSprite(uniqueName, action, type, isSmall, partId, direction, frame, color) {
  let resDirection = direction;
  //r63 self alias
  if(type == "hd" && isSmall) partId = 1;
  if(type == "ey" && action == "std" && partId == 1 && direction == 3) action = "sml";
  if(type == "fa" && action == "std" && partId == 2 && (direction == 2 || direction == 4)) resDirection = 1;
  if(type == "he" && action == "std" && partId == 1) {
    if(direction == 2) {
      resDirection = 0;
    }
    //if(direction >= 4 && direction <= 6) {
    //return false;
    //}
  }
  if(type == "he" && action == "std" && partId == 8) resDirection = direction % 2 == 0 ? 1 : resDirection;
  if(type == "he" && action == "std" && (partId == 2131 || partId == 2132) && (direction >= 2 && direction <= 6)) resDirection = 1;
  if(type == "ha" && action == "std" && partId == 2518) resDirection = direction % 2 == 0 ? 2 : 1;
  if(type == "ha" && action == "std" && partId == 2519) resDirection = direction % 2 == 0 ? 2 : 3;
  if(type == "ha" && action == "std" && partId == 2588) resDirection = 7;
  if(type == "ha" && action == "std" && partId == 2589) resDirection = 3;
  //if(type == "lg" && action == "std" && partId == 2) action = "wlk";

  this.lib = uniqueName;
  this.isFlip = false;
  this.action = action;
  this.resAction = action;
  this.type = type;
  this.resType = type;
  this.isSmall = isSmall;
  this.partId = partId;
  this.direction = direction;
  this.resDirection = resDirection;
  this.frame = frame;
  this.color = color;
  this.resourceName = this.getResourceName();
};

AvatarSprite.prototype.getResourceName = function() {
  let resourceName = this.isSmall ? "sh" : "h";
  resourceName += "_";
  resourceName += this.resAction;
  resourceName += "_";
  resourceName += this.resType;
  resourceName += "_";
  resourceName += this.partId;
  resourceName += "_";
  resourceName += this.resDirection;
  resourceName += "_";
  resourceName += this.frame;
  return resourceName;
};

AvatarSprite.prototype.downloadAsync = function() {
  let img = new Image();
  let d = new Promise(function (resolve, reject) {
    img.onload = function () {
      this.resource = img;
      //console.log("downloaded " + this.lib + " -> " + this.getResourceName());
      resolve(img);
    }.bind(this);

    img.onerror = function () {
      console.log("NOT DOWNLOADED "  + this.lib + " -> " + this.getResourceName());
      reject('Could not load image: ' + img.src);
    }.bind(this);
  }.bind(this));
  img.crossOrigin = "anonymous";
  img.src = AvatarImager.LOCAL_RESOURCES_URL + this.lib + "/" + this.lib + "_" + this.getResourceName() + ".png";
  return d;
};

function AvatarImage(figure, direction, headDirection, action, gesture, frame, isHeadOnly, scale) {
  this.isLarge = false;
  this.isSmall = false;
  this.rectWidth = 64;
  this.rectHeight = 110;
  switch (scale) {
    case "l":
    this.isLarge = true;
    this.rectWidth = 128;
    this.rectHeight = 220;
    break;
    case "s":
    this.isSmall = true;
    this.rectWidth = 32;
    this.rectHeight = 55;
    break;
    case "n":
    default:
    break;
  }
  this.isHeadOnly = isHeadOnly === true;
  this.figure = [];

  for (part of figure.split('.')) {
    let data = part.split('-');
    let figurePart = {"type" : data[0], "id" : data[1], "colors" : [ data[2] ]};
    if (data[3] != null) {
      figurePart.colors.push(data[3]);
    }
    this.figure.push(figurePart);
  }

  this.frame = Array.isArray(frame) ? frame : [ frame ];
  this.drawAction = {"body" : "std", "wlk" : false, "sit" : false, "gesture" : false, "eye" : false, "speak" : false, "itemRight": false, "handRight" : false, "handLeft": false, "swm" : false}; //std, sit, lay, wlk, wav, sit-wav, swm
  this.handItem = false;
  this.drawOrder = "std";
  this.ok = false;
  this.gesture = gesture; //std, agr, sml, sad, srp, spk, eyb
  this.direction = this.isValidDirection(direction) ? direction : 0;
  this.headDirection = this.isValidDirection(headDirection) ? headDirection : 0;

  switch(this.gesture) {
    case "spk":
    this.drawAction['speak'] = this.gesture;
    break;
    case "eyb":
    this.drawAction['eye'] = this.gesture;
    break;
    case "":
    this.drawAction['gesture'] = "std";
    break;
    default:
    this.drawAction['gesture'] = this.gesture;
    break;
  }

  this.action = Array.isArray(action) ? action : [ action ];
  for (value of this.action) {
    let actionParams = value.split('=');
    switch (actionParams[0]) {
      case "wlk":
      case "sit":
      this.drawAction[actionParams[0]] = actionParams[0];
      break;

      case "lay":
      this.drawAction['body']	= actionParams[0];
      this.drawAction['eye'] = actionParams[0];

      let temp = this.rectWidth;
      this.rectWidth = this.rectHeight;
      this.rectHeight = temp;

      switch (this.gesture) {
        case "spk":
        this.drawAction['speak'] = "lsp";
        this.frame['lsp'] = this.frame[this.gesture];
        break;

        case "eyb":
        this.drawAction['eye'] = "ley";
        break;

        case "std":
        this.drawAction['gesture'] = actionParams[0];
        break;

        default:
        this.drawAction['gesture'] = "l" + this.gesture.substr(0, 2);
        break;
      }
      break;

      case "wav":
      this.drawAction['handLeft'] = actionParams[0];
      break;

      case "crr":
      case "drk":
      this.drawAction['handRight'] = actionParams[0];
      this.drawAction['itemRight'] = actionParams[0];
      this.handItem = actionParams[1];
      break;

      case "swm":
      this.drawAction[actionParams[0]] = actionParams[0];
      if (this.gesture == "spk") {
        this.drawAction['speak'] = "sws";
      }
      break;

      case "":
      this.drawAction['body'] = "std";
      break;

      default:
      this.drawAction['body'] = actionParams[0];
      break;
    }
  }

  if (this.drawAction['sit'] == "sit") {
    if (this.direction >= 2 && this.direction <= 4) {
      this.drawOrder = "sit";
      if (this.drawAction['handRight'] == "drk" && this.direction >= 2 && this.direction <= 3) {
        this.drawOrder += ".rh-up";
      } else if (this.drawAction['handLeft'] && this.direction == 4) {
        this.drawOrder += ".lh-up";
      }
    }
  } else if (this.drawAction['body'] == "lay") {
    this.drawOrder = "lay";
  } else if (this.drawAction['handRight'] == "drk" && this.direction >= 0 && this.direction <= 3) {
    this.drawOrder = "rh-up";
  } else if (this.drawAction['handLeft'] && this.direction >= 4 && this.direction <= 6) {
    this.drawOrder = "lh-up";
  }

  this.ok = true;
};

AvatarImage.prototype.isValidDirection = function(direction) {
  return (Number.isInteger(direction) && direction >= 0 && direction <= 7);
};

function AvatarImager() {
  this.ready = false;
  this.offsets = {};
};

AvatarImager.prototype.initialize = function(onReady) {
  let p = this.loadFiles();
  return Promise.all(p);
};

AvatarImager.prototype.getPartUniqueName = function(type, partId) {
  let uniqueName = this.figuremap[type][partId];
  if (uniqueName == null && type == "hrb") {
    uniqueName = this.figuremap["hr"][partId];
  }
  if (uniqueName == null) {
    uniqueName = this.figuremap[type][1];
  }
  if (uniqueName == null) {
    uniqueName = this.figuremap[type][0];
  }
  return uniqueName;
};

AvatarImager.prototype.getFrameNumber = function(type, action, frame) {
  const translations = {"wav": "Wave", "wlk": "Move", "spk": "Talk"};
  if (translations[action] != null) {
    if (this.animation[translations[action]].part[type] != null) {
      const count = this.animation[translations[action]].part[type].length;
      if (this.animation[translations[action]].part[type][frame % count] != null) {
        return this.animation[translations[action]].part[type][frame % count].number;
      }
    }
  }
  return 0;
};

AvatarImager.prototype.getActivePartSet = function(partSet) {
  //let ret = [];
  let activeParts = this.partsets['activePartSet'][partSet]['activePart'];
  if (activeParts == null || activeParts.length == 0) {
    return false;
  }
  return activeParts;
  //let partSetData = this.partsets['partSet'];
  //activeParts.forEach(type => {
  //ret.push(type);
  //});
  //return ret;
};

AvatarImager.prototype.getPartResource = function(uniqueName, action, type, isSmall, partId, direction, frame, color) {
  let partFrame = this.getFrameNumber(type, action, frame);
  let resource = new AvatarSprite(uniqueName, action, type, isSmall, partId, direction, partFrame, color);
  return resource;
};

AvatarImager.prototype.getDrawOrder = function(action, direction) {
  let drawOrder = this.draworder[action][direction];
  if (drawOrder == null || drawOrder.length == 0) {
    return false;
  }
  return drawOrder;
};

AvatarImager.prototype.getColorByPaletteId = function(paletteId, colorId) {
  if (this.figuredata['palette'][paletteId] != null && this.figuredata['palette'][paletteId][colorId] != null && this.figuredata['palette'][paletteId][colorId]['color'] != null) {
    return this.figuredata['palette'][paletteId][colorId]['color'];
  }
  return null;
};

AvatarImager.prototype.getPartColor = function(figure) {
  let parts = {};
  let partSet = this.figuredata['settype'][figure.type];
  if (partSet['set'][figure.id] != null && partSet['set'][figure.id]['part'] != null) {
    partSet['set'][figure.id]['part'].forEach(part => {
      //console.log(figure);
      //console.log(part);
      //console.log("paletteid: " + partSet.paletteid + " colors: " + figure.colors[part.colorindex - 1]);
      let element = {"index" : part.index, "id" : part.id, "colorable" : part.colorable };
      if (part.colorable) {
        element.color = this.getColorByPaletteId(partSet.paletteid, figure.colors[part.colorindex - 1]);
      }
      if (parts[part.type] == null) {
        parts[part.type] = [element];
      } else {
        parts[part.type].push(element);
      }

    });
  }
  //r63 ?

  parts.hidden = [];
  if (partSet['set'][figure.id] != null && Array.isArray(partSet['set'][figure.id]['hidden'])) {
    for (partType of partSet['set'][figure.id]['hidden']) {
      parts.hidden.push(partType);
    }
  }
  return parts;
};

AvatarImager.prototype.generateGhost = function(avatarImage, canvasCallback) {
  return this.generateGeneric(avatarImage, canvasCallback, true);
};

AvatarImager.prototype.generate = function(avatarImage, canvasCallback) {
  return this.generateGeneric(avatarImage, canvasCallback, false);
};

AvatarImager.prototype.generateGeneric = function(avatarImage, canvasCallback, isGhost) {
  if (!avatarImage.ok) {
    return null;
  }
  let tempCanvas = document.createElement('canvas');
  let tempCtx = tempCanvas.getContext('2d');
  tempCanvas.width = avatarImage.rectWidth;
  tempCanvas.height = avatarImage.rectHeight;

  let activeParts = {};
  activeParts.rect = this.getActivePartSet(avatarImage.isHeadOnly ? "head" : "figure");
  activeParts.head = this.getActivePartSet("head");
  activeParts.eye = this.getActivePartSet("eye");
  activeParts.gesture = this.getActivePartSet("gesture");
  activeParts.speak = this.getActivePartSet("speak");
  activeParts.walk	= this.getActivePartSet("walk");
  activeParts.sit = this.getActivePartSet("sit");
  activeParts.itemRight = this.getActivePartSet("itemRight");
  activeParts.handRight = this.getActivePartSet("handRight");
  activeParts.handLeft = this.getActivePartSet("handLeft");
  activeParts.swim = this.getActivePartSet("swim");

  let drawParts = this.getDrawOrder(avatarImage.drawOrder, avatarImage.direction);
  if (drawParts === false) {
    drawParts = this.getDrawOrder("std", avatarImage.direction);
  }

  let setParts = {};
  for (partSet of avatarImage.figure) {
    const parts = this.getPartColor(partSet);
    for (type in parts) {
      if (setParts[type] == null) {
        setParts[type] = [];
      }
      setParts[type] = parts[type].concat(setParts[type]);
    }
  }

  if (avatarImage.handItem !== false) {
    setParts["ri"] = [ {"index" : 0, "id" : avatarImage.handItem} ];
  }

  let chunks = [];
  let offsetsPromises = [];

  for (type of drawParts) {
    let drawableParts = setParts[type];
    if (drawableParts != null) {
      for (drawablePart of drawableParts) {
        let uniqueName = this.getPartUniqueName(type, drawablePart["id"]);
        if (uniqueName != null) {
          //console.log(type + " -> " + drawablePart["id"] + " -> " + uniqueName);

          if (setParts.hidden.includes(type)) {
            continue;
          }

          if (!activeParts.rect.includes(type)) {
            continue;
          }

          if (isGhost && (activeParts.gesture.includes(type) || activeParts.eye.includes(type))) {
            continue;
          }

          let drawDirection = avatarImage.direction;
          let drawAction = false;
          if (activeParts.rect.includes(type)) {
            drawAction = avatarImage.drawAction['body'];
          }
          if (activeParts.head.includes(type)) {
            drawDirection = avatarImage.headDirection;
          }
          if (activeParts.speak.includes(type) && avatarImage.drawAction['speak']) {
            drawAction = avatarImage.drawAction['speak'];
          }
          if (activeParts.gesture.includes(type) && avatarImage.drawAction['gesture']) {
            drawAction = avatarImage.drawAction['gesture'];
          }
          if (activeParts.eye.includes(type)) {
            drawablePart.colorable = false;
            if (avatarImage.drawAction['eye']) {
              drawAction = avatarImage.drawAction['eye'];
            }
          }
          if (activeParts.walk.includes(type) && avatarImage.drawAction['wlk']) {
            drawAction = avatarImage.drawAction['wlk'];
          }
          if (activeParts.sit.includes(type) && avatarImage.drawAction['sit']) {
            drawAction = avatarImage.drawAction['sit'];
          }
          if (activeParts.handRight.includes(type) && avatarImage.drawAction['handRight']) {
            drawAction = avatarImage.drawAction['handRight'];
          }
          if (activeParts.itemRight.includes(type) && avatarImage.drawAction['itemRight']) {
            drawAction = avatarImage.drawAction['itemRight'];
          }
          if (activeParts.handLeft.includes(type) && avatarImage.drawAction['handLeft']) {
            drawAction = avatarImage.drawAction['handLeft'];
          }
          if (activeParts.swim.includes(type) && avatarImage.drawAction['swim']) {
            drawAction = avatarImage.drawAction['swim'];
          }

          if (!drawAction) {
            continue;
          }

          if (this.offsets[uniqueName] == null) {
            this.offsets[uniqueName] = { 'promise': this.downloadOffsetAsync(uniqueName), 'data' : {} };
          }
          offsetsPromises.push(this.offsets[uniqueName].promise);

          let color = drawablePart.colorable ? drawablePart.color : null;
          let drawPartChunk = this.getPartResource(uniqueName, drawAction, type, avatarImage.isSmall, drawablePart["id"], drawDirection, avatarImage.frame, color);
          chunks.push(drawPartChunk);
        }
      }
    }
  }

  Promise.all(offsetsPromises).then(function() {
    //console.log("offsets ok!");

    let chunksPromises = [];

    for (chunk of chunks) {
      //console.log(chunk);

      if (this.offsets[chunk.lib].data != null && this.offsets[chunk.lib].data[chunk.getResourceName()] != null && !this.offsets[chunk.lib].data[chunk.getResourceName()].flipped) {
        //console.log("Found sprite: " + chunk.getResourceName());
        chunksPromises.push(chunk.downloadAsync());
      } else {
        let flippedType = this.partsets.partSet[chunk.type]['flipped-set-type'];
        if (flippedType != "") {
          chunk.resType = flippedType;
        }
        if (this.offsets[chunk.lib].data == null || this.offsets[chunk.lib].data[chunk.getResourceName()] == null || this.offsets[chunk.lib].data[chunk.getResourceName()].flipped && chunk.action == "std") {
          //console.log("Not found... " + chunk.getResourceName());
          //chunk.resType = chunk.type;
          chunk.resAction = "spk";
        }
        if (this.offsets[chunk.lib].data == null || this.offsets[chunk.lib].data[chunk.getResourceName()] == null || this.offsets[chunk.lib].data[chunk.getResourceName()].flipped) {
          //console.log("Not found... " + chunk.getResourceName());
          chunk.isFlip = true;
          chunk.resAction = chunk.action;
          //chunk.resType = chunk.type;
          chunk.resDirection = 6 - chunk.direction;
        }
        if (this.offsets[chunk.lib].data == null || this.offsets[chunk.lib].data[chunk.getResourceName()] == null || this.offsets[chunk.lib].data[chunk.getResourceName()].flipped) {
          //console.log("Not found... " + chunk.getResourceName());
          chunk.resAction = chunk.action;
          chunk.resType = flippedType;
          chunk.resDirection = chunk.direction;
        }
        if (this.offsets[chunk.lib].data == null || this.offsets[chunk.lib].data[chunk.getResourceName()] == null || this.offsets[chunk.lib].data[chunk.getResourceName()].flipped && chunk.artion == "std") {
          //console.log("Not found... " + chunk.getResourceName());
          chunk.resAction = "spk";
          chunk.resType = chunk.type;
        }
        if (this.offsets[chunk.lib].data != null && this.offsets[chunk.lib].data[chunk.getResourceName()] != null && !this.offsets[chunk.lib].data[chunk.getResourceName()].flipped) {
          //console.log("Found sprite: " + chunk.getResourceName());
          chunksPromises.push(chunk.downloadAsync());
        } else {
          //console.log("Not found... " + chunk.getResourceName());
        }
      }
    }

    Promise.all(chunksPromises).catch(function(a) {
    }).then(function () {
      //console.log("drawing...");

      for (chunk of chunks) {
        if (this.offsets[chunk.lib].data != null && this.offsets[chunk.lib].data[chunk.getResourceName()] != null) {
          //console.log(chunk);
          if (chunk.resource != null) {
            let posX = -this.offsets[chunk.lib].data[chunk.getResourceName()].x;
            let posY = (avatarImage.rectHeight / 2) - this.offsets[chunk.lib].data[chunk.getResourceName()].y + avatarImage.rectHeight / 2.5;
            //console.log("x: " + posX + " - y: " + posY + " - color: " + chunk.color );

            let img = chunk.resource;
            if (chunk.color != null) {
              img = this.tintSprite(img, chunk.color, (isGhost ? 170 : 255));
            }
            if (chunk.isFlip) {
              posX = -(posX + img.width - avatarImage.rectWidth + 1);
              img = this.flipSprite(img);
            }
            tempCtx.drawImage(img, posX, posY);
          } else {
            //console.log("Missing resource: " + chunk.getResourceName());
          }
        }
      }

      canvasCallback(tempCanvas);
    }.bind(this));
  }.bind(this));
};

AvatarImager.prototype.hex2rgb = function(hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

AvatarImager.prototype.flipSprite = function(img) {
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

AvatarImager.prototype.tintSprite = function(img, color, alpha) {
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
}

AvatarImager.prototype.downloadJsonAsync = function(key, url) {
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

AvatarImager.prototype.downloadOffsetAsync = function(uniqueName) {
  return new Promise(function (resolve, reject) {
    let r = new XMLHttpRequest();
    r.open("GET", AvatarImager.LOCAL_RESOURCES_URL + uniqueName + "/offset.json", true);
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

AvatarImager.prototype.loadFiles = function() {
  return [
    this.downloadJsonAsync("figuremap", AvatarImager.LOCAL_RESOURCES_URL + "map.json"),
    this.downloadJsonAsync("figuredata", AvatarImager.LOCAL_RESOURCES_URL + "figuredata.json"),
    this.downloadJsonAsync("partsets", AvatarImager.LOCAL_RESOURCES_URL + "partsets.json"),
    this.downloadJsonAsync("draworder", AvatarImager.LOCAL_RESOURCES_URL + "draworder.json"),
    this.downloadJsonAsync("animation", AvatarImager.LOCAL_RESOURCES_URL + "animation.json")
  ];
};
