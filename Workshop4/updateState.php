<?php
  define("DB_HOST", "mydb");
  define("USERNAME", "dummy");
  define("PASSWORD", "c3322b");
  define("DB_NAME", "db3322");
  $conn=mysqli_connect(DB_HOST, USERNAME, PASSWORD, DB_NAME) or die('Error! '. mysqli_connect_error($conn));

	// Implement the code here.
  $getid = $_GET['id'];
  $newval = $_GET['value'];
  $query = "update attendancelist set attendOrNot = '$newval' where id = '$getid'";
  $result = mysqli_query($conn, $query) or die('Error! '.mysqli_error($conn));
  if ($result) {
    echo "change";
  } else {
    echo "not change";
  }

  mysqli_free_result($result);
  mysqli_close($conn);
	
?>