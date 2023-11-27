<?php
    // connect db
    define("DB_HOST", "mydb");
    define("USERNAME", "dummy");
    define("PASSWORD", "c3322b");
    define("DB_NAME", "db3322");
    $conn=mysqli_connect(DB_HOST, USERNAME, PASSWORD, DB_NAME) or die('Error! '. mysqli_connect_error($conn));

    $htmlHeadings = "<html>
    <head>
      <meta charset='UTF-8'>
      <title>Financial Dashboard</title>
      <link rel='stylesheet' href='index.css'>
      <script src='index.js'></script>
    </head>
    <body>
        <div id='outmost'>
        <h1>Financial Dashboard</h1>
        <div id='container'>";
    $htmlFootings = "</div></div></body></html>";
    $htmlBlocks = [
        "<div class='block' id='block1'>
            <h2>Block 1 - SP500</h2>
            <p><img src='images/SP500.png' alt='SP500' style='width: 250px;'>
            </p>
        </div>",
        "<div class='block' id='block2'>
            <h2>Block 2 - FTSE 100</h2>
            <p><img src='images/FTSE100.png' alt='FTSE 100'>
            </p>
        </div>",
        "<div class='block' id='block3'>
            <h2>Block 3 - Hang Seng Index</h2>
            <p><img src='images/HSI.png' alt='Hang Seng Index' style='width: 900px;'>
            </p>
        </div>",
        "<div class='block' id='block4'>
            <h2>Block 4 - Nasdaq Composite index</h2>
            <p><img src='images/nasdaq.png' alt='NASDAQ' style='width: 600px;'>
            </p>
        </div>",
        "<div class='block' id='block5'>
            <h2>Block 5 - USD Exchange Rate</h2>
            <p><img src='images/ex_rate.png' alt='USD Rate' style='width: 250px;'>
            </p>
        </div>",
        "<div class='block' id='block6'>
            <h2>Block 6 - Currency Converter</h2>
            <p><img src='images/Convert-Currency.png' alt='Currency Converter' style='width: 300px;'>
            </p>
        </div>",
        "<div class='block' id='block7'>
            <h2>Block 7 - Crypto Index</h2>
            <p><img src='images/Crypto.png' alt='Crypto Index' style='width: 500px;'>
            </p>
        </div>",
        "<div class='block' id='block8'>
            <h2>Block 8 - USD vs. HKD</h2>
            <p><img src='images/USD-HKD.png' alt='USD vs. HKD' style='width: 400px;'>
            </p>
        </div>"
    ];
    removeOutdatedData();

    // GET method
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        removeOutdatedData();

        if (!isset($_COOKIE['user_id'])) {  // CASE 1: client haven't visited the site before
            $user_id = generateUserId();
            $expiry_time = time() + (5 * 60);
            setcookie('user_id', $user_id, $expiry_time, '/');
            // $dashboard_content = renderDefault();
            // echo $dashboard_content;
            renderDefault();

            $defaultVisible = "block1,block2,block3,block4,block5,block6,block7,block8";
            storeToDB($user_id, $defaultVisible, $expiry_time);
        } 
        else{
            $user_id = $_COOKIE['user_id'];
            if (isValid($user_id)) {  // CASE 2: If a GET request carries a valid user ID, check if the user has customized the dashboard
                $settings = getCustomSettings($user_id);
                if ($settings && $settings !== "block1,block2,block3,block4,block5,block6,block7,block8,") { // CASE 2.1: If the user has customized the dashboard, display the customized dashboard
                    renderCustom($settings);
                } else { // CASE 2.2: If the user has not customized the dashboard, display the default dashboard
                    // $dashboard_content = renderDefault();
                    // echo $dashboard_content;
                    renderDefault();
                }
            } else {   // CASE 3: If a GET request carries an invalid user ID, generate a new user ID and display the default dashboard
                $new_userId = generateUserId();
                $expiry_time = time() + (5 * 60);
                setcookie('user_id', $new_userId, $expiry_time, '/');
                // echo $user_id;
                // echo "userid invalid";
                // echo "generate new user id";
                // echo $new_userId;

                // $dashboard_content = renderDefault();
                // echo $dashboard_content;
                renderDefault();

                $defaultVisible = "block1,block2,block3,block4,block5,block6,block7,block8";
                storeToDB($new_userId, $defaultVisible, $expiry_time);
            }
        }
    }

    // PUT method
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        removeOutdatedData();
        $data = json_decode(file_get_contents('php://input'), true);
        $userId = $data['user_id'] ?? null;
        $visibleBlocks = $data['visible'] ?? null;

        if (empty($userId) || empty($visibleBlocks)) {
            http_response_code(400);
            // echo "empty";
        } else {
            if (isValid($userId)) {
                storeToDB($userId, $visibleBlocks, time() + (5 * 60));
            } else {
                $new_userId = generateUserId();
                $expiry_time = time() + (5 * 60);
                setcookie('user_id', $new_userId, $expiry_time, '/');
                storeToDB($userId, $visibleBlocks, time() + (5 * 60));
            }
        }
    }

    function generateUserId() {
        $timestamp = substr(strval(time()), -2);
        $random_string = substr(str_shuffle('0123456789'), 2, 7);
        $user_id = "idd" . $timestamp . $random_string;
        return $user_id;
    }
    function isValid($user_id) {   // check whether has this user_id in db
        global $conn;
        $query = "SELECT * FROM user WHERE uid = '$user_id'";
        $result = mysqli_query($conn, $query) or die("<p>Query Error!<br>".mysqli_error($conn)."</p>");
        if (mysqli_num_rows($result) > 0) {
            return true;
        } else {
            return false;
        }
    }
    // render default dashboard content
    function renderDefault() {  
        global $htmlHeadings;
        global $htmlFootings;
        global $htmlBlocks;

        echo $htmlHeadings;
        for ($i = 0; $i < 8; $i++) {
            echo $htmlBlocks[$i];
        }
        echo $htmlFootings;
    }
    function getCustomSettings($user_id) {
        global $conn;
        $query = "SELECT * FROM user WHERE uid = '$user_id'";
        $result = mysqli_query($conn, $query) or die("<p>Query Error!<br>".mysqli_error($conn)."</p>");
        while($row = mysqli_fetch_array($result)) {
            $settings = $row['visible'];
            return $settings;
        }
    }
    // render customized dashboard content
    function renderCustom($visible) {
        global $htmlHeadings;
        global $htmlFootings;
        global $htmlBlocks;

        echo $htmlHeadings;
        if ($visible !== "none") {
            $visibleBlocks = explode(',', $visible);
            foreach ($visibleBlocks as $block) {
                echo renderVisibleBlock($block);
            }

            for ($i = 0; $i < 8; $i++) { # render the invisible blocks
                if (!in_array('block' . ($i + 1), $visibleBlocks)) {
                    echo renderInvisibleBlock('block' . ($i + 1));
                }
            }
        } else {
            for ($i = 0; $i < 8; $i++) {
                echo renderInvisibleBlock('block' . ($i + 1));
            }
        }
        echo $htmlFootings;
    }
    // store preference to db
    function storeToDB($user_id, $preference, $timestamp) {
        global $conn;

        if (isValid($user_id)) {
            $query = "UPDATE user SET visible = '$preference' WHERE uid = '$user_id'";
            $result = mysqli_query($conn, $query);
            if ($result) {
                http_response_code(200);
                // echo $result;
                // echo "success update";
            } else {
                http_response_code(500);
                header('HTTP/1.1 500 Internal Server Error');
                // echo $result;
                // echo "fail update";
            }
        } else {
            $query = "INSERT INTO user (uid, visible, timestamp) VALUES ('$user_id', '$preference', '$timestamp')";
            $result = mysqli_query($conn, $query);
            if ($result) {
                http_response_code(200);
                // echo $result;
                // echo "success insert";
            } else {
                http_response_code(500);
                header('HTTP/1.1 500 Internal Server Error');
                // echo $result;
                // echo "fail update";
            }
        }
        // return $result;
    }

    function removeOutdatedData() {
        global $conn;
        $now = time();
        $query = "DELETE FROM user WHERE timestamp < '$now'";
        $result = mysqli_query($conn, $query) or die("<p>Query Error!<br>".mysqli_error($conn)."</p>");
    }
    function renderVisibleBlock($blockID) {
        global $htmlBlocks;
        $index = intval($blockID[strlen($blockID) - 1]);
        return $htmlBlocks[$index - 1];
    }
    function renderInvisibleBlock($blockID) {
        global $htmlBlocks;
        $index = $blockID[strlen($blockID) - 1];
        $block = $htmlBlocks[$index - 1];
        $block = str_replace("<div class='block'", "<div class='block hidden'", $block);
        return $block;
    }

    // free memory and close db
    mysqli_close($conn);
?>


<!DOCTYPE html>