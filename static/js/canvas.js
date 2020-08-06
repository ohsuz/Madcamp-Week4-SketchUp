let canvas = {
  isDrawing: false,
  surface: null,
  points: [],
  accuPoints: [],
  myCanvas: null,
  memCanvas: null,
  setup: function () {
    this.myCanvas = document.getElementById("myCanvas");
    this.memCanvas = document.createElement("canvas");
    this.myCanvas.width = this.memCanvas.width = 1000;
    this.myCanvas.height = this.memCanvas.height = 530;

    this.surface = this.myCanvas.getContext("2d");

    this.memSurface = this.memCanvas.getContext("2d");
    this.surface.lineWidth = 5;
    this.surface.lineJoin = "round";
    this.surface.lineCap = "round";
  },

  beginDraw: function (x, y) {
    this.points.push({
      x: x,
      y: y,
    });
    this.isDrawing = true;
  },

  draw: function (x, y) {
    this.surface.clearRect(0, 0, this.myCanvas.width, this.myCanvas.height);
    this.surface.drawImage(this.memCanvas, 0, 0);
    this.points.push({ x, y });
    this._drawPoints();
  },
  endDraw: function () {
    this.isDrawing = false;
    this.memSurface.clearRect(
      0,
      0,
      this.memCanvas.width,
      this.memCanvas.height
    );
    this.memSurface.drawImage(this.myCanvas, 0, 0);
    this.accuPoints.push(this.points);
    this.points = [];
  },
  clear: function () {
    this.accuPoints = [];
    this.points = [];
    this.surface.clearRect(0, 0, this.myCanvas.width, this.myCanvas.height);
    this.memSurface.clearRect(
      0,
      0,
      this.memCanvas.width,
      this.memCanvas.height
    );
  },
  preDrawPoint: function (pointArray) {
    // [][]
    if (pointArray == null) return;
    pointArray.forEach((points) => {
      this.points = points;
      this._drawPoints();
    });
    this.points = [];
  },
  preDraw: function (data) {
    const image = new Image();
    console.log(`여기까지 왔음. 즉, 데이터가 존재한다는 뜻.`);
    image.onload = () => {
      this.surface.drawImage(image, 0, 0);
      this.memSurface.drawImage(image, 0, 0);
    };
    image.src = data;
  },
  _drawPoints: function () {
    if (this.points.length < 6) {
      const b = this.points[0];
      this.surface.beginPath();
      this.surface.arc(
        b.x,
        b.y,
        this.surface.lineWidth / 2,
        0,
        Math.PI * 2,
        !0
      );
      this.surface.closePath();
      this.surface.fill();
      return;
    }
    this.surface.beginPath();
    this.surface.moveTo(this.points[0].x, this.points[0].y);
    let i = 0;
    for (i = 1; i < this.points.length - 2; i++) {
      const c = (this.points[i].x + this.points[i + 1].x) / 2,
        d = (this.points[i].y + this.points[i + 1].y) / 2;
      this.surface.quadraticCurveTo(this.points[i].x, this.points[i].y, c, d);
    }
    this.surface.quadraticCurveTo(
      this.points[i].x,
      this.points[i].y,
      this.points[i + 1].x,
      this.points[i + 1].y
    );
    this.surface.stroke();
  },
};

const disableCanvasMouse = (images) => {
  const myCanvas = document.getElementById("myCanvas");
  canvas.preDraw(images);
  myCanvas.onmousedown = myCanvas.ontouchstart = (e) => {
    e.preventDefault();
  };
  myCanvas.onmousemove = myCanvas.ontouchmove = (e) => {
    e.preventDefault();
  };
  myCanvas.onmouseup = myCanvas.ontouchend = (e) => {
    e.preventDefault();
  };
};

const initCanvasMouse = () => {
  const myCanvas = document.getElementById("myCanvas");

  myCanvas.onmousedown = myCanvas.ontouchstart = function (e) {
    const xy = getMouse(e, myCanvas);
    canvas.beginDraw(xy.x, xy.y);
    //   socketIo.EmitInitLine(xy.x, xy.y);
  };

  myCanvas.onmousemove = myCanvas.ontouchmove = function (e) {
    if (canvas.isDrawing === true) {
      const xy = getMouse(e, myCanvas);
      canvas.draw(xy.x, xy.y);
      // socketIo.EmitLine(xy.x, xy.y);
    }
  };

  myCanvas.onmouseup = myCanvas.ontouchend = function (e) {
    if (canvas.isDrawing === true) {
      canvas.endDraw();
    }
    //   socketIo.EmitEndLine();
  };
  function getMouse(e, canvas) {
    let elem = canvas;
    let offsetX = 0,
      offsetY = 0,
      mx,
      my;
    if (elem.offsetParent !== undefined) {
      do {
        offsetX += elem.offsetLeft;
        offsetY += elem.offsetTop;
      } while ((elem = elem.offsetParent));
    }
    mx = e.pageX - offsetX;
    my = e.pageY - offsetY;
    return { x: mx, y: my };
  }
};
const getCanvasImage = () => {
  const image = document.getElementById("myCanvas").toDataURL("image/jpg");
  return image;
};
