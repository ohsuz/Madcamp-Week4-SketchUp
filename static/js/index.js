var socket = io(); // 소켓 연결 -> io.on('connection') 이벤트 발생

let myKeyword = "";
let myImage;
let whoAmI;

let totalData = [[], [], [], [], []];

const EVENTS = {
  newUser: "newUser",
  login: "login",
  waiting: "waiting",
  game: "game",
  breaktime: "breaktime",
  result: "result",
  resultSet: "resultSet",
  myresultSet: "myresultSet",
  restart:"restart",
};

const REQ = {
  GAME: "gameSend",
};

const isValidProcedure = (event) => {
  console.log(`Handle ${event} is Called`);
  if (currentState === event) {
    console.log(`Duplicated Handler: ${event}`);
    return false;
  } else {
    return true;
  }
};

class MyEventEmitter {
  constructor() {
    this._events = {};
  }
  on(evt, listener) {
    (this._events[evt] || (this._events[evt] = [])).push(listener);
    return this;
  }
  emit(name, data) {
    if (!this._events[name]) {
      throw new Error(`Can't Emit an event. Event "${name}" doesn't exists`);
    }
    const fireCallbacks = (callback) => {
      callback(data);
    };

    this._events[name].forEach(fireCallbacks);
  }
  removeListener(name, listenerToRemove) {
    if (!this._events[name]) {
      throw new Error(
        `Can't remove a listener. Event "${name}" doesn't exists. `
      );
    }
    const fileterListeners = (listener) => listener !== listenerToRemove;

    this._events[name] = this._events[name].filter(fileterListeners);
  }
}

/* -----------------------------------------------
 * Page Handlers. 페이지 전환관련.
 ------------------------------------------------- */
const handleLogin = (data) => {
  if (!isValidProcedure(EVENTS.login)) return;
  currentState = EVENTS.login;
  timer.reset();
  tmpGameTurn = 0;
  alert("새로고침해주세요");
};
const handleWaiting = (data) => {
  if (!isValidProcedure(EVENTS.waiting)) return;
  currentState = EVENTS.waiting;
  // coverCard를 내려주고, LoginView는 disposal
  view_ShowCoverCard();
  view_HideLoginView();
};

let tmpGameTurn = 0; // 0 -> Drawing, 1 -> Guessing, 5 -> 마지막라운드
const handleGame = (data) => {
  if (!isValidProcedure(EVENTS.game)) return;
  currentState = EVENTS.game;

  timer.restart(15); // Timer Ticking
  // Canvas 초기 세팅
  canvas.clear(); // Canvas Reset

  console.log(`DATA: ${data}`);
  if (data == null) {
    console.log(`TURN[${tmpGameTurn}], data가 넘어오지 않았어요.ㅠㅜ`);
  }
  // Data Setting. Data에 따라서(turn에 따라서) View 변화
  // 이게 몇번째 라운드인지, 내 단어가 무엇인지, +상황판
  if (tmpGameTurn % 2 === 0) {
    // Drawing Turn일 경우
    myKeyword = data;
    view_SetGameDrawing(myKeyword);
  } else if (tmpGameTurn % 2 === 1) {
    // Guessing Turn일 경우
    myImage = data;
    view_SetGameGuessing(myImage);
  } else {
    throw new Error("여기도착불가능");
  }

  tmpGameTurn += 1;
  // 장막 올리기
  view_HideCoverCard();
};

const handleBreakTime = () => {
  if (!isValidProcedure(EVENTS.breaktime)) return;
  currentState = EVENTS.breaktime;

  // Canvas Data Sending

  // 그림그렸으니 그림보내기
  if ((tmpGameTurn - 1) % 2 === 0) {
    const outputImage = getCanvasImage();
    console.log(`output Image:${outputImage}`);
    socket.emit(REQ.GAME, outputImage);
  }
  // 단어썼으니 단어보내기
  if ((tmpGameTurn - 1) % 2 === 1) {
    myKeyword = document.getElementById("keywordInput").value;
    socket.emit(REQ.GAME, myKeyword);
  }

  // Canvas 지워봐
  canvas.clear(); // Canvas Reset

  if (tmpGameTurn === 5) {
    myEventEmitter.emit(EVENTS.result);
    return;
  } else {
    // coverCard 내용을 설정하고, coverCard를 보여준다.
    view_SetCoverCard(`지금은 breakTime입니다.`);
    view_ShowCoverCard();
  }
};

const handleResult = (data) => {
  if (!isValidProcedure(EVENTS.result)) return;
  currentState = EVENTS.result;
  timer.reset();
  view_SetCoverCard(
    //CoverCard 내용 설정하기
    `<h2>게임 종료!</h2><br><h5>곧 결과가 공유됩니다.</h5>`
  );
  view_ShowCoverCard(); // CoverCard 보여주기
  setTimeout(view_HideGameView, 1000); //CoverCard로 가려진 후 GameView는 Hide
  // view_HideCoverCard(); // CoverCard 올리기

  // Server와 연결 끊어버리고 다시 Login화면으로 redirect시켜도 될 듯.
};

const handleMyResultSet = (data) => {
  if (!isValidProcedure(EVENTS.myresultSet)) return;
  currentState = EVENTS.myresultSet;
  view_ShowMyResultView(); // ResultView visible로 바꾸기

  view_SetMyResultView(data);
  view_HideCoverCard();
};

const handleResultSet = (data) => {
  if (!isValidProcedure(EVENTS.resultSet)) return;
  currentState = EVENTS.resultSet;
  view_ShowResultView(); // ResultView visible로 바꾸기

  view_SetResultView(data);
  view_HideMyResultView(); // 내 결과 창 숨김
};
const handleRestart = () =>{
  // restart할때 필요한 동작들.
  if (!isValidProcedure(EVENTS.restart)) return;
  currentState = EVENTS.restart;
  timer.reset();
  // coverCard를 내려주고, covercard 내용을 restart의내용으로 바꿔줌.
  view_restartCoverCard();
  view_ShowCoverCard();
  tmpGameTurn=0;
}

/*--------------------------------
 * View 관련 함수들
 --------------------------------*/
const view_ShowCoverCard = () => {
  const cardCover = document.getElementsByClassName("cover-card")[0];
  if (!cardCover.classList.contains("visib")) {
    cardCover.classList.add("visib");
  }
};
const view_HideCoverCard = () => {
  const cardCover = document.getElementsByClassName("cover-card")[0];
  if (cardCover.classList.contains("visib")) {
    cardCover.classList.remove("visib");
  }
};

const view_HideLoginView = () => {
  setTimeout(() => {
    document
      .getElementById("splashview")
      .setAttribute("style", "display: none;");
  }, 1000);
};

const view_ShowLoginView = () => {
  setTimeout(() => {
    document
      .getElementById("splashview")
      .setAttribute("style", "display:visible;");
  }, 1000);
};

const view_SetCoverCard = (content) => {
  document
    .getElementById("infoview-content")
    .setAttribute("style", "display: visible;");
  document.getElementById("curUsers").setAttribute("style", "display: none;");
  document.getElementById("infoview-content").innerHTML = content;
};
const view_restartCoverCard = () => {
  document
    .getElementById("infoview-content")
    .setAttribute("style", "display: none;");
  document.getElementById("curUsers").setAttribute("style", "display: visible;");
  
}
const view_SetGameDrawing = (keyword) => {
  initCanvasMouse();
  disableKeywordInput(keyword);
};
const view_SetGameGuessing = (image) => {
  disableCanvasMouse(image);
  enableKeywordInput();
  /**
   * data{
   *  data: "Kimchi",
   * }
   */
};

const view_SetMyResultView = (data) => {
  const curUsers = data.curUsers;
  totalData = data.totalData;

  const myIdxInCurUsers = curUsers.indexOf(whoAmI);

  totalData[myIdxInCurUsers].forEach((element,elemIdx)=>{
      if (elemIdx % 2 === 0) model_SetCanvasText(element, 0, elemIdx);
      else model_SetCanvasImage(element, 0, elemIdx);
  });

  document.getElementById("carousel_1").setAttribute("style", "display: none;");
  document.getElementById("carousel_2").setAttribute("style", "display: none;");
  document.getElementById("carousel_3").setAttribute("style", "display: none;");
  document.getElementById("carousel_4").setAttribute("style", "display: none;");
};

const view_SetResultView = (data) => {
  data.forEach((datum, index) => {
    datum.forEach((element, elemIdx) => {
      if (elemIdx % 2 === 0) model_SetCanvasText(element, index, elemIdx);
      else model_SetCanvasImage(element, index, elemIdx);
    });
  });
};

const view_HideGameView = () => {
  document.getElementById("gameview").setAttribute("style", "display: none;");
};
const view_ShowGameView = () => {
  document.getElementById("gameview").setAttribute("style", "display: ;");
};

const view_ShowMyResultView = () => {
  document.getElementById("myresultview").setAttribute("style", "display: ;");
};

const view_HideMyResultView = () => {
  document.getElementById("myresultview").setAttribute("style", "display: none;");
};

const view_ShowResultView = () => {
  document.getElementById("resultview").setAttribute("style", "display: ;");
};

const view_HideResultView = () => {
  document.getElementById("resultview").setAttribute("style", "display: none;");
};

const disableKeywordInput = (keyword) => {
  document.getElementById("keywordInput").disabled = true;
  document.getElementById("keywordInput").value = `${keyword}`;
};
const enableKeywordInput = () => {
  document.getElementById("keywordInput").value = ``;
  document.getElementById("keywordInput").disabled = false;
};
/*--------------------------------
 * Main Controller.(대충)
 --------------------------------*/
let currentState = "";
let myEventEmitter = null;

window.onload = () => {
  // page controll 부분.
  myEventEmitter = new MyEventEmitter();
  currentState = EVENTS.login;
  myEventEmitter.on(EVENTS.login, handleLogin);
  myEventEmitter.on(EVENTS.waiting, handleWaiting);
  myEventEmitter.on(EVENTS.game, handleGame);
  myEventEmitter.on(EVENTS.breaktime, handleBreakTime);
  myEventEmitter.on(EVENTS.result, handleResult);
  myEventEmitter.on(EVENTS.resultSet, handleResultSet);
  myEventEmitter.on(EVENTS.restart, handleRestart);

  myEventEmitter.on(EVENTS.myresultSet, handleMyResultSet);

  view_PresetResultView(resultViewData); // resultView에 대한 내용

  // Canvas 관련 세팅
  canvas.setup(); // canvas 만들기
  initCanvasMouse(); // 마우스 연동하기
  document.getElementById("myCanvasButton").addEventListener("click", () => {
    canvas.clear();
  }); // clear 버튼 연결하기 TODO: 글 쓸때도 지우기누르면 지워지는거 수정하기.

  // Timer 관련 세팅
  timer.init(myEventEmitter);

  // env=develop, 게임페이지로 바로 넘어가게 설정.
  // handleWaiting();

  // 메인 페이지에서 '시작하기' 버튼 클릭 시
  document.getElementById("button-login").addEventListener("click", () => {
    if($.trim($("#username").val())){
      return;
    }
  if(currentState === EVENTS.waiting){
    console.log('Merong');
    return;
  }
    socket.emit("enter", $("#username").val());
    whoAmI = $("#username").val();
    $("#username").val("");

    myEventEmitter.emit(EVENTS.waiting);

    socket.on("gameStart", function (data) {
      tmpGameTurn = 0;
      if (data == null) console.log(`gameStart Data is NULL!!!`);
      myEventEmitter.emit(EVENTS.game, data);
    });
  
    socket.on("gameResult", function (data) {
      myEventEmitter.emit(EVENTS.myresultSet, data);
    });
    
    socket.on("gameRestart",function () {
      tmpGameTurn = 0;
      myEventEmitter.emit(EVENTS.restart);
    });

    socket.on("goLogin", ()=>{
      tmpGameTurn = 0;
      myEventEmitter.emit(EVENTS.login)
    })

    socket.emit("heartbeat");
    socket.on('heartbeat', (data) => {
      console.log('heart Beated')
      setTimeout(()=>{socket.emit('heartbeat')},1000);
    })
  });

  /*
  // Result View 관련 세팅
  document.getElementById("paletteButton").addEventListener("click", () => {
    console.log("Herererererere");
    myEventEmitter.emit(EVENTS.resultSet);
  });
  */

};

function paletteButton_click(){
  view_PresetResultViewAll(resultViewData);

  socket.emit("everyResult");

  socket.on("everyResultResponse", function (data) {
    myEventEmitter.emit(EVENTS.resultSet, data);
  });
}

// Debugging 용
function printCurrentState() {
  console.log(`currentState: ${currentState}이 중복으로 호출됐습니다.`);
}
let resultViewData = [
  // dummy Data;
  ["강아지", "강아지그림", "갱애쥐", "갱애쥐그림", "멍멍이", "멍멍이그림"],
  ["고양이", "고양이그림", "고냥이", "고냥이그림", "냥냥이", "냥냥이그림"],
  ["다람쥐", "다람쥐그림", "대뢤쥐", "대뢤쥐그림", "다람이", "다람이그림"],
  ["뚱이", "뚱이그림", "별이", "별이그림", "스폰지밥", "스폰지밥그림"],
  [
    "집게사장",
    "집게사장그림",
    "플랑크톤",
    "플랑크톤그림",
    "징징이",
    "징징이그림",
  ],
];
