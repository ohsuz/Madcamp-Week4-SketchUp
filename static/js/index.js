var socket = io()

// 서버와 소켓이 연결됐을 때
// id가 test인 요소값(index.html 파일 속 input)을 '접속됨'으로 설정
socket.on('connect', function(){
  var name = prompt('반갑습니다!', '')

  if(!name){
    name = '익명'
  }

  socket.emit('newUser', name)
})

socket.on('update', function(data){
  console.log(`${data.name}: ${data.message}`)
})

/*
id가 test인 요소값을 서버로 전송하는 함수 (버튼이 클릭되면 호출됨)
*/
function send(){
  // 입력된 데이터 가져오기
  var message = document.getElementById('test').value
  // 데이터를 다시 빈 칸으로 변경
  document.getElementById('test').value = ''
  // 서버로 send 이벤트를 데이터와 함께 전달
  socket.emit('message', {type: 'message', message: message}) // on: 수신 vs emit: 송신 (※ 이벤트 명이 동일한 경우에만 송/수신 가능)
}
