function view_PresetResultView(data) {
  // data = [['강아지','강아지그림','멍멍이','댕댕이그림',...],['고양이',...],...]
  data.forEach((element, index) => {
    createViewCarousel(element.length, index);
  });
}
function view_PresetResultViewAll(data) {
  document
  .getElementById("myresultContainer").innerHTML = ``;  
  // data = [['강아지','강아지그림','멍멍이','댕댕이그림',...],['고양이',...],...]
  data.forEach((element, index) => {
    createViewCarouselAll(element.length, index);
  });
}

const createViewStartElement = (index) => {
  const startElement = `<div class="row justify-content-md-center"><div id="carousel_${index}"
              class="carousel slide"
              data-ride="carousel"
              data-interval="false"
            >
              <ol class="carousel-indicators">
                <li
                  data-target="#carousel_${index}"
                  data-slide-to="0"
                  class="active"
                ></li>
                <li data-target="#carousel_${index}" data-slide-to="1"></li>
                <li data-target="#carousel_${index}" data-slide-to="2"></li>
                <li data-target="#carousel_${index}" data-slide-to="3"></li>
                <li data-target="#carousel_${index}" data-slide-to="4"></li>
                <li data-target="#carousel_${index}" data-slide-to="5"></li>
              </ol>
              <div class="carousel-inner">`;
  return startElement;
};

const createViewTailElement = (index) => {
  const tailElement = `</div>
              <a
                class="carousel-control-prev"
                href="#carousel_${index}"
                role="button"
                data-slide="prev"
              >
                <span
                  class="carousel-control-prev-icon"
                  aria-hidden="true"
                ></span>
                <span class="sr-only">Previous</span>
              </a>
              <a
                class="carousel-control-next"
                href="#carousel_${index}"
                role="button"
                data-slide="next"
              >
                <span
                  class="carousel-control-next-icon"
                  aria-hidden="true"
                ></span>
                <span class="sr-only">Next</span>
              </a>
            </div></div>`;

  return tailElement;
};
function createViewCanvasList(index, innerDataLength) {
  let middleElement = ``;
  for (let elemIdx = 0; elemIdx < innerDataLength; elemIdx += 1) {
    middleElement += createViewCanvas(index, elemIdx);
  }
  return middleElement;
}
function createViewCanvas(index, elemIdx) {
  const isActive = elemIdx === 0 ? "active" : "";
  return `<div class="carousel-item ${isActive}">
              <canvas id="canvas_${index}_${elemIdx}" class="canvas-item"></canvas>
            </div>
            `;
}

function createViewCarousel(innerDataLength, index){
  console.log(`createCarousel: ${index}`);
  const headElement = createViewStartElement(index);
  const middleElement = createViewCanvasList(index, innerDataLength);
  const tailElement = createViewTailElement(index);
  const carousel = headElement + middleElement + tailElement;
  document
    .getElementById("myresultContainer")
    .insertAdjacentHTML("beforeend", carousel);
}
function createViewCarouselAll(innerDataLength, index){
  console.log(`createCarousel: ${index}`);
  const headElement = createViewStartElement(index);
  const middleElement = createViewCanvasList(index, innerDataLength);
  const tailElement = createViewTailElement(index);
  const carousel = headElement + middleElement + tailElement;
  document
    .getElementById("resultContainer")
    .insertAdjacentHTML("beforeend", carousel);
}


function model_SetCanvasText(element, index, elemIdx) {
  const canvas = document.getElementById(`canvas_${index}_${elemIdx}`);
  fitCanvas(canvas);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "30px Helvetica";
  ctx.strokeText(element, 450, 265);
}
function model_SetCanvasImage(element, index, elemIdx) {
  const image = new Image();
  const canvas = document.getElementById(`canvas_${index}_${elemIdx}`);
  fitCanvas(canvas);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  image.onload = () => {
    ctx.drawImage(image, 0, 0);
  };
  image.src = element;
}

function fitCanvas(canvas) {
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.width = 1000;
  canvas.height = 530;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
