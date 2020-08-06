const express = require("express");
const socket = require("socket.io");
const http = require("http");
const app = express(); // express 객체 생성
const server = http.createServer(app); // express http 서버 생성
const io = socket(server); // 생성된 서버를 socket.io에 바인딩
const fs = require("fs"); // node.js 기본 내장 모듈 불러오기

let curUsers = []; // 현재 접속해있는 유저들 이름 배열 -> 접속자 수 세기 위함
let curUsersId = []; // 현재 접속해있는 유저들 socket id 배열
let rotateUsers = [];
var isFull = false;

let currentStageNum = 0; // 현재 게임 단계(0~4)
let dataToBeSent = []; // curStageNum이 짝수면 그림 in&out, 홀수면 키워드 in&out
let cntOfUsers = 0; // 유저로부터 정보가 잘 들어왔는지 체크

const words = [
  "장병규 의장님", "몰캠 조교 대표 찹쌀떡 김태영", "류석영 교수님","고대 대표 귀요미 박종우>.<","1분반 대표 여신 오수지","정서현","조민규", "최진혁",
  "도라에몽","에어팟","카이스트","알콩달콩",
  "넙죽이","코인노래방","강동원","몰입캠프","똥묻은휴지","참외배꼽","깡"
];
let randomWords = []; // 이번 게임에 선택된 단어 5개
let totalData = [[], [], [], [], []];

// express.static(경로) => 경로에 위치한 파일들을 하나하나 GET으로 묶어줌
app.use(express.static(__dirname + "/static"));

app.get("/", function (request, response) {
  // fs -> 파일과 관련된 처리
  // readFile: 지정된 파일을 읽어서 데이터를 가져옴
  fs.readFile("./index.html", function (err, data) {
    if (err) {
      response.send("Error");
    } else {
      response.writeHead(200, { "Content-Type": "text/html" }); // 클라이언트에게 보낼 파일이 html이라는 것을 알려줌
      response.write(data); // html 데이터
      response.end(); // 데이터가 모두 보내졌으면 완료됐음을 알려줌 -> write을 통해 응답할 경우, 꼭 end를 써줘야함
    }
  });
});

app.get("/refresh", (req, res) => {
  randomWords = []; // 이번 게임에 선택된 단어 5개
  totalData = [[], [], [], [], []];
  curUsers = []; // 현재 접속해있는 유저들 이름 배열 -> 접속자 수 세기 위함
  curUsersId = []; // 현재 접속해있는 유저들 socket id 배열
  rotateUsers = [];
  isFull = false;
  currentStageNum = 0; // 현재 게임 단계(0~4)
  dataToBeSent = []; // curStageNum이 짝수면 그림 in&out, 홀수면 키워드 in&out
  cntOfUsers = 0; // 유저로부터 정보가 잘 들어왔는지 체크
});

io.on("connection", function (socket) {
  console.log("Connected");

  /*
    유저가 입장했을 때
    1. 소켓에 유저 닉네임 저장
    2. 대기 인원 + 1
    3. 5명이면 게임 시작 / 아니면 대기 인원 수 보여주기
    */

  socket.on("enter", function (user) {
    if (curUsers.length == 5 && isFull) {
      io.emit("curUsers", { curUsers: curUsers.length, isFull: isFull });
    } else {
      isFull = false;
      socket.user = user;
      curUsers.push(socket.user);
      curUsersId.push(socket.id);
      console.log(
        socket.user + " 님 입장 => 현재 접속자 수: " + curUsers.length
      );
      // waiting 페이지에 현재 접속자 수를 넘겨줌
      io.emit("curUsers", { curUsers: curUsers.length, isFull: isFull });
      if (curUsers.length == 5) {
        isFull = true; // 5명 다 참
        rotateUsers = curUsers.slice();
        /*
                1. 랜덤한 5개 단어 생성 (나중에 리스트 초기화해야할듯)
                2. 각 유저에게 단어 하나씩 푸쉬
                */
        chooseWords();
        setTimeout(() => {
          for (let userIdx = 0; userIdx < curUsers.length; userIdx++) {
            console.log(
              `curUsers ${curUsers[userIdx]}에게 ${randomWords[userIdx]}에 관한 데이터 보내기`
            );
            io.to(curUsersId[userIdx]).emit("gameStart", randomWords[userIdx]);
            totalData[userIdx].push(randomWords[userIdx]);
            // ex) totalData = [['강아지'],['고양이'],['소'],['말'],['돼지']]
          }
        }, 1000);
      }
    }
  });
  // data로 들어오는 것: stage가 짝수 => 그림, 홀수 => 키워드
  socket.on("gameSend", function (data) {
    cntOfUsers += 1;

    // 어떤 키워드와 관련된 데이턴지 판단
    const whomData = curUsers.indexOf(socket.user);
    const originWhomData = curUsers.indexOf(rotateUsers[whomData]);
    console.log(`hi:` + socket.user + `, ` + originWhomData);
    if(data == null)
      data = " ";
    // 해당 키워드 배열에 데이터를 푸쉬  example) 김치, 김치그림, 김치, 김치그림, ...
    totalData[originWhomData].push(data);
    // 모든 data가 제대로 도착함
    if (cntOfUsers === 5) {
      console.log(`before: ${rotateUsers}`);
      rotateUsers.push(rotateUsers.shift()); // B, C, D, E, A == 1,2,3,4,0
      console.log(`after: ${rotateUsers}`);
      currentStageNum += 1;
      if (currentStageNum === 5) {
        console.log(`Result Send!!!, rotateUser: ${rotateUsers}`);
        setTimeout(() => {
          io.emit("gameResult", {totalData:totalData, curUsers: curUsers});
        }, 3000);
        return;
      }
      for (let i = 0; i < rotateUsers.length; i += 1) {
        const userToSend = curUsers.indexOf(rotateUsers[i]); //rotate에서 순서를 찾음
        console.log(`보낼 데이터: ${totalData[userToSend][0]}`);
        console.log(`받을 사람: ${curUsers[i]}`);
        dataToBeSent.push(totalData[userToSend][currentStageNum]); // 수정: currentStageNum -1 => currentStageNum
      }
      cntOfUsers = 0;
      setTimeout(() => {
        for (let i = 0; i < rotateUsers.length; i += 1) {
          io.to(curUsersId[i]).emit("gameStart", dataToBeSent[i]);
        }
        dataToBeSent = [];
      }, 3000); // dataToBeSent 배열 초기화
    }
  });

  socket.on("everyResult", function(){
    io.emit("everyResultResponse", totalData);
  })

  socket.on("disconnect", function () {    
    console.log("Disconnected");
    curUsers.splice(curUsers.indexOf(socket.user), 1);
    curUsersId.splice(curUsersId.indexOf(socket.id), 1);
    if(isFull){
      io.emit("gameRestart");
      randomWords = []; // 이번 게임에 선택된 단어 5개
      totalData = [[], [], [], [], []];
      rotateUsers = [];
      isFull = false;
      currentStageNum = 0; // 현재 게임 단계(0~4)
      dataToBeSent = []; // curStageNum이 짝수면 그림 in&out, 홀수면 키워드 in&out
      cntOfUsers = 0; // 유저로부터 정보가 잘 들어왔는지 체크
      io.emit("curUsers", { curUsers: curUsers.length, isFull: isFull });
    }
    console.log(socket.user + " 님 퇴장 => 현재 접속자 수: " + curUsers.length);

  });
});

server.listen(8080, function () {
  console.log("Server is running...");
});

function chooseWords() {
  let i = 0;
  let nList = [];
  while (i < 5) {
    let n = Math.floor(Math.random() * words.length);
    if (!sameNum(n)) {
      nList.push(n);
      randomWords.push(words[n]);
      i++;
    }
  }

  // 생성된 랜덤 숫자가 중복인지 아닌지 판단
  function sameNum(n) {
    for (var i = 0; i < nList.length; i++) {
      if (n === nList[i]) {
        return true;
      }
    }
    return false;
  }
}
