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
  <script src="./web-gallery/js/priority-queue.min.js"></script>
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
          <!-- Player images -->
        </div>

        <br>
        <br>
        <input type="submit" id="login_button" value="Loading...">
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
