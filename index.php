<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bobba</title>

  <script src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"></script>
  <script>
  WebFont.load({
    google: {
      families: ['Ubuntu:400,700']
    }
  });
  </script>
  <link rel="stylesheet" type="text/css" href="./web-gallery/css/style.css" />
  <script src="./web-gallery/js/priority-queue.min.js?<?php echo time(); ?>"></script>
  <script src="./web-gallery/js/io.js?<?php echo time(); ?>"></script>
  <script src="./web-gallery/js/communication.js?<?php echo time(); ?>"></script>
  <script src="./web-gallery/js/sprites.js?<?php echo time(); ?>"></script>
  <script src="./web-gallery/js/furnitureimager.js?<?php echo time(); ?>"></script>
  <script src="./web-gallery/js/avatarimager.js?<?php echo time(); ?>"></script>
  <script src="./web-gallery/js/furni.js?<?php echo time(); ?>"></script>
  <script src="./web-gallery/js/player.js?<?php echo time(); ?>"></script>
  <script src="./web-gallery/js/chatmanager.js?<?php echo time(); ?>"></script>
  <script src="./web-gallery/js/room.js?<?php echo time(); ?>"></script>
  <script src="./web-gallery/js/game.js?<?php echo time(); ?>"></script>

  <link rel="shortcut icon" href="./favicon.ico">
  <meta name="viewport" content="width=device-width, initial-scale=0.6, minimum-scale=0.6, maximum-scale=0.6, user-scalable=no">
  <meta name="mobile-web-app-capable" content="yes">
</head>
<body>
  <canvas id="game"></canvas>

  <header>
    <h2>Bobba.io</h2>
  </header>

  <section id="lower_bar">
    <ul class="lower_container left">
      <li>
        <a href="#"><img src="./web-gallery/images/big_h.png"></a>
      </li>
      <li>
        <a href="#"><img src="./web-gallery/images/rooms.png"></a>
      </li>
      <li>
        <a href="#"><img src="./web-gallery/images/separator.png"></a>
      </li>
    </ul>

    <section class="form_container">
      <section class="lower_item">
        <form id="chat_form" onsubmit="return false;" autocomplete="off">
          <input type="text" placeholder="Click here to chat..." id="input_chat">
          <input type="submit" value="Say">
        </form>
      </section>
    </section>

    <section class="lower_container right">
      <ul class="lower_container left">
        <li>
          <a href="#"><img src="./web-gallery/images/separator.png"></a>
        </li>
        <li>
          <a href="#" id="wave_submit" onclick="return false;">Wave</a>
        </li>
        <li>
          <a href="#"><img src="./web-gallery/images/separator.png"></a>
        </li>
        <li>
          <section id="status" class="lower_item">-</section>
        </li>
        <li>
          <a href="#"><img src="./web-gallery/images/separator.png"></a>
        </li>
        <li>
          <section id="fps_status" class="lower_item">-</section>
        </li>
      </ul>
    </section>
  </section>

  <section id="main_wrapper">
    <section class="box">
      <img src="./web-gallery/images/grey_logo.png">
      <br>
      <br>
      <form id="login_form" onsubmit="return false;">
        <br>
        <input type="text" placeholder="Username" id="input_username">
        <br>
        <br>
        Player:
        <br>
        <div id="players">
          <div style="display:inline-block;padding: 10px;">
            <img src="https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-190-10.lg-3023-1408.ch-215-91.hr-893-45&direction=2&head_direction=2&action=wlk&gesture=nrm&size=m&frame=0">
            <br>
            <input type="radio" name="look" value="hd-190-10.lg-3023-1408.ch-215-91.hr-893-45" checked>
          </div>
          <div style="display:inline-block;padding: 10px;">
            <img src="https://www.habbo.com/habbo-imaging/avatarimage?figure=hr-828-1407.sh-3089-110.ha-1013-110.ch-3323-110-92.lg-3058-82.hd-180-10&direction=2&head_direction=2&action=wlk&gesture=nrm&size=m&frame=0">
            <br>
            <input type="radio" name="look" value="hr-828-1407.sh-3089-110.ha-1013-110.ch-3323-110-92.lg-3058-82.hd-180-10">
          </div>
          <div style="display:inline-block;padding: 10px;">
            <img src="https://www.habbo.com/habbo-imaging/avatarimage?figure=ch-3050-104-62.ea-987462904-62.sh-305-1185.lg-275-1193.hd-185-1.hr-828-1034&direction=2&head_direction=2&action=wlk&gesture=nrm&size=m&frame=0">
            <br>
            <input type="radio" name="look" value="ch-3050-104-62.ea-987462904-62.sh-305-1185.lg-275-1193.hd-185-1.hr-828-1034">
          </div>
          <div style="display:inline-block;padding: 10px;">
            <img src="https://www.habbo.com/habbo-imaging/avatarimage?figure=sh-725-68.he-3258-1410-92.hr-3012-45.ch-665-110.lg-3006-110-110.hd-600-28&direction=4&head_direction=4&action=wlk&gesture=nrm&size=m&frame=0">
            <br>
            <input type="radio" name="look" value="sh-725-68.he-3258-1410-92.hr-3012-45.ch-665-110.lg-3006-110-110.hd-600-28">
          </div>
          <div style="display:inline-block;padding: 10px;">
            <img src="https://www.habbo.com/habbo-imaging/avatarimage?figure=ha-1003-85.ch-665-92.lg-3328-1338-1338.hd-3105-10.sh-3035-64.hr-3012-1394.ea-3169-110.cc-3008-110-110&direction=4&head_direction=4&action=wlk&gesture=nrm&size=m&frame=0">
            <br>
            <input type="radio" name="look" value="ha-1003-85.ch-665-92.lg-3328-1338-1338.hd-3105-10.sh-3035-64.hr-3012-1394.ea-3169-110.cc-3008-110-110">
          </div>
          <div style="display:inline-block;padding: 10px;">
            <img src="https://www.habbo.com/habbo-imaging/avatarimage?figure=ca-1811-62.lg-3018-81.hr-836-45.ch-669-1193.hd-600-10&direction=4&head_direction=4&action=wlk&gesture=nrm&size=m&frame=0">
            <br>
            <input type="radio" name="look" value="ca-1811-62.lg-3018-81.hr-836-45.ch-669-1193.hd-600-10">
          </div>
        </div>

        <br>
        <br>
        <input type="submit" value="Join">
      </form>
      <br>
    </section>
    <section class="invisible_box">
      bobba.io
    </section>
  </section>
  <footer>
  </footer>
</body>
</html>
