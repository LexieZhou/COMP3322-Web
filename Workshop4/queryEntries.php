<?php
  
  define("DB_HOST", "mydb");
  define("USERNAME", "dummy");
  define("PASSWORD", "c3322b");
  define("DB_NAME", "db3322");
  $conn=mysqli_connect(DB_HOST, USERNAME, PASSWORD, DB_NAME) or die('Error! '. mysqli_connect_error($conn));

  
  if($_POST['show'] =='add') {
    // add code here
    $query = 'insert into attendancelist (studentname, major, course, coursedate, attendOrNot) values ("'.$_POST['studentname'].'", "'.$_POST['major'].'", "'.$_POST['course'].'", "'.$_POST['coursedate'].'", "'.$_POST['attendOrNot'].'")';
    $result = mysqli_query($conn, $query) or die ('Failed to query '.mysqli_error($conn));
    $query = 'select * from attendancelist';
    $result = mysqli_query($conn, $query) or die ('Failed to query '.mysqli_error($conn));
    while($row = mysqli_fetch_array($result)) {
      print "<div id=".$row['id'].">";
      print "<span onclick=changeState(this)>".$row['attendOrNot']."</span>";
      print "<h3>".$row['studentname']." (".$row['major'].")</h3>";
      print "<h5>[".$row['course']."] on ".$row['coursedate']."</h5>";
      print "</div>";
    }
  } elseif ($_POST['show'] == 'all') {
    $query = 'select * from attendancelist';
    $result = mysqli_query($conn, $query) or die ('Failed to query '.mysqli_error($conn));
    while($row = mysqli_fetch_array($result)) {
      print "<div id=".$row['id'].">";
      print "<span onclick=changeState(this)>".$row['attendOrNot']."</span>";
      print "<h3>".$row['studentname']." (".$row['major'].")</h3>";
      print "<h5>[".$row['course']."] on ".$row['coursedate']."</h5>";
      print "</div>";
    }
    
  } elseif ($_POST['show'] == 'major') {
    // add code here
    $query = 'select * from attendancelist where major = "'.$_POST['bymajor'].'"';
    $result = mysqli_query($conn, $query) or die ('Failed to query '.mysqli_error($conn));
    while($row = mysqli_fetch_array($result)) {
      print "<div id=".$row['id'].">";
      print "<span onclick=changeState(this)>".$row['attendOrNot']."</span>";
      print "<h3>".$row['studentname']." (".$row['major'].")</h3>";
      print "<h5>[".$row['course']."] on ".$row['coursedate']."</h5>";
      print "</div>";
    }
  } elseif ($_POST['show'] == 'course') {
    // add code here
    $query = 'select * from attendancelist where course = "'.$_POST['bycourse'].'"';
    $result = mysqli_query($conn, $query) or die ('Failed to query '.mysqli_error($conn));
    while($row = mysqli_fetch_array($result)) {
      print "<div id=".$row['id'].">";
      print "<span onclick=changeState(this)>".$row['attendOrNot']."</span>";
      print "<h3>".$row['studentname']." (".$row['major'].")</h3>";
      print "<h5>[".$row['course']."] on ".$row['coursedate']."</h5>";
      print "</div>";
    }
  }
  mysqli_free_result($result);
  mysqli_close($conn);    
  

?>