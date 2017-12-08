<?php

$inputFigure		= strtolower($_GET["figure"]);
$inputAction		= isset($_GET["action"]) ? strtolower($_GET["action"]) : 'std';
$inputDirection		= isset($_GET["direction"]) ? (int)$_GET["direction"] : 4;
$inputHeadDirection	= isset($_GET["head_direction"]) ? (int)$_GET["head_direction"] : $inputDirection;
$inputGesture		= isset($_GET["gesture"]) ? strtolower($_GET["gesture"]) : 'std';
$inputSize			= isset($_GET["size"]) ? strtolower($_GET["size"]) : 'n';
$inputFormat		= isset($_GET["img_format"]) ? strtolower($_GET["img_format"]) : 'png';
$inputFrame			= isset($_GET["frame"]) ? strtolower($_GET["frame"]) : '0';
$inputHeadOnly		= isset($_GET["headonly"]) ? (bool)$_GET["headonly"] : false;

// Create a stream
$opts = [
    "http" => [
        'method' => 'GET',
        'header'=>"Accept-language: en\r\n" .
              "User-Agent: Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B334b Safari/531.21.102011-10-16 20:23:10\r\n" // i.e. An iPad
    ]
];

$context = stream_context_create($opts);
header('Content-type: image/png');
echo file_get_contents("https://www.habbo.com/habbo-imaging/avatarimage?figure=" . $inputFigure . "&action=" . $inputAction . "&direction=" . $inputDirection . "&head_direction=" . $inputHeadDirection . "&gesture=" . $inputGesture . "&size=" . $inputSize . "&frame=" . $inputFrame . "&headonly=" . $inputHeadOnly, false, $context);
?>
