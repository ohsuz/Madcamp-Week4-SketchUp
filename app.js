const express = require('express')
const socket = require('socket.io')
const http = require('http')
const app = express() // express 객체 생성
const server = http.createServer(app) // express http 서버 생성
const io = socket(server) // 생성된 서버를 socket.io에 바인딩
const fs = require('fs') // node.js 기본 내장 모듈 불러오기

app.use('/css', express.static('./static/css'))
app.use('/js', express.static('./static/js'))
/*
get(경로, 함수): 서버의 경로를 get 방식으로 접속하면 함수가 호출됨
- request 객체: 클라이언트에서 전달된 데이터와 정보
- response 객체: 클라이언트에게 응답을 위한 정보
*/
app.get('/', function(request, response){
  // fs -> 파일과 관련된 처리
  // readFile: 지정된 파일을 읽어서 데이터를 가져옴
  fs.readFile('./static/index.html', function(err, data){
    if(err){
      response.send('Error')
    }else{
      response.writeHead(200, {'Content-Type':'text/html'}) // 클라이언트에게 보낼 파일이 html이라는 것을 알려줌
      response.write(data) // html 데이터
      response.end() // 데이터가 모두 보내졌으면 완료됐음을 알려줌 -> write을 통해 응답할 경우, 꼭 end를 써줘야함
    }
  })
  /*
  console.log('유저가 / 으로 접속하였습니다!')
  response.send('Hello, Express Server!') // response.send(전달 데이터)
  */
})

// connection이란 이벤트가 발생하면 콜백함수가 실행됨
// io.sockets: 접속되는 모든 소켓들 vs socket: 접속된 해당 소켓
// 콜백 함수 안의 함수들: 해당 소켓과 통신할 코드
io.sockets.on('connection', function(socket){

  /*
  새로운 유저가 접속한 이벤트
  */
  socket.on('newUser', function(name){
    console.log(name+' 님이 접속하였습니다.')

    socket.name = name // 소켓에 이름 저장

    // 모든 소켓에게 전송
    // io.sockets.emit('이벤트명', {type: 메세지 유형(서버 알림, 유저 메세지), message: 전달된 메세지 데이터, name: 메세지를 전달한 유저 or 서버 이름})
    io.sockets.emit('update', {type:'connect', name:'SERVER', message: name+' 님이 접속하였습니다.'})
  })

  /*
  메세지를 받은 이벤트
  */
  socket.on('message', function(data){
    data.name = socket.name // 받은 데이터에 발신자를 추가
    console.log(data)

    // 보낸 사람을 제외한 나머지 유저에게 메세지 전송
    // socket.broadcast.emit('이벤트명', 전송할 데이터)
    socket.broadcast.emit('update', data)
  })

  /*
  연결이 종료된 이벤트
  */
  socket.on('disconnect', function(){
    console.log(socket.name + ' 님이 나가셨습니다.')

    // 나가는 사람을 제외한 나머지 유저에게 메세지 전송
    socket.broadcast.emit('update', {type:'disconnect', name:'SERVER', message: socket.name + ' 님이 나가셨습니다.'})
  })
})

// 원하는 포트번호로 서버 실행
// 지정한 포트(ex.8080)로 서버를 실행하면 리스너가 호출됨
server.listen(8080, function(){
  console.log('Server is running...')
})
