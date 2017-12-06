Sprites.LOCAL_RESOURCES_URL = "./web-gallery/assets/";
Sprites.EXTERNAL_IMAGER_URL = "https://www.habbo.com/habbo-imaging/avatarimage?figure=";

function Sprites() {
  this.images = {};
}

Sprites.prototype.loadImage = function (key, src) {
    var img = new Image();
    var d = new Promise(function (resolve, reject) {
        img.onload = function () {
            this.images[key] = img;
            resolve(img);
        }.bind(this);

        img.onerror = function () {
            reject('Could not load image: ' + src);
        };
    }.bind(this));

    img.src = src;
    return d;
};

Sprites.prototype.getImage = function (key) {
    return (key in this.images) ? this.images[key] : null;
};

Sprites.prototype.loadSimpleAvatar = function (key, look, direction) {
  var totalUrl = Sprites.EXTERNAL_IMAGER_URL + look + '&direction=' + direction + '&head_direction=' + direction;
  return this.loadImage(key, totalUrl);
};

Sprites.prototype.loadWalkingAvatar = function (key, look, direction, walkFrame) {
  var totalUrl = Sprites.EXTERNAL_IMAGER_URL + look + '&direction=' + direction + '&head_direction=' + direction + '&action=wlk&frame=' + (walkFrame);
  return this.loadImage(key, totalUrl);
};

Sprites.prototype.loadAllSimpleAvatar = function (key, look) {
  var p = [];
  for (var i = 0; i <= 7; i++) {
      p.push(this.loadSimpleAvatar(key + "_" + i, look, i));
  }
  return Promise.all(p);
}

Sprites.prototype.loadAllWalkingAvatar = function (key, look) {
  var p = [];
  for (var i = 0; i <= 7; i++) {
    for (var j = 0; j <= 3; j++) {
      p.push(this.loadWalkingAvatar(key + "_" + i + "_" + j, look, i, j));
    }
  }
  return Promise.all(p);
}
