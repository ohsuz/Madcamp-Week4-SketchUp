socket.on("curUsers", function (data) {
  console.log(`curUsers 호출됨`);
  if (!data.isFull) {
    console.log(`curUsers isFull:${data.isFull}`);
    if (data.curUsers != 5 && (currentState != EVENTS.myresultSet && currentState != EVENTS.resultSet)) {
      console.log(`curUsers curUsers != 5`);
      console.log("현재 접속자 수: " + data.curUsers);
      document.getElementById("curUsers").innerHTML =
      "<h3 id='textDeco'>접속 인원</h3><h3 id='textDeco'>"+data.curUsers+" / 5 </h3>";
    } else {
      console.log(`curUsers curUsers ==5`);
      document
        .getElementById("infoview-content")
        .setAttribute("style", "display: none;");
      document.getElementById("curUsers").innerHTML =
      "<img src ='/images/start2.gif'width='550dp'/>";
    }
  } else {
    console.log(`curUsers isFull:${data.isFull}`);
    document.getElementById("curUsers").innerHTML =
      "<h3 id='textDeco'> 게임이 진행 중입니다. </h3>";
  }
});
