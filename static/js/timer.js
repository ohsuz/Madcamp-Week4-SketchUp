let timer = {
  FULL_DASH_ARRAY: 283,
  WARNING_THRESHOLD: 10,
  ALERT_THRESHOLD: 5,
  COLOR_CODES: {
    info: {
      color: "green",
    },
    warning: {
      color: "orange",
      threshold: 10,
    },
    alert: {
      color: "red",
      threshold: 5,
    },
  },
  emitter: null,
  reset: function () {
    this.clearTimer();
    this.timePassed = 0;
    this.TIME_LIMIT = 60;
    this.timeLeft = this.TIME_LIMIT;
    this.timerInterval = null;
    this.remainingPathColor = this.COLOR_CODES.info.color;
    this._initView();
  },
  restart: function (timeLimit = 60) {
    this.reset();
    this.setTimeLimit(timeLimit);
    this.startTimer();
  },
  init: function (eventEmitter) {
    this.emitter = eventEmitter;
  },
  startTimer: function () {
    console.log(`StartTimer Executed`);
    this.timerInterval = setInterval(() => {
      this.timePassed = this.timePassed += 1;
      this.timeLeft = this.TIME_LIMIT - this.timePassed;
      document.getElementById("base-timer-label").innerHTML = this._formatTime(
        this.timeLeft
      );
      this._setCircleDasharray();
      this._setRemainingPathColor(this.timeLeft);

      if (this.timeLeft === 0) {
        this.onTimesUp();
      }
    }, 1000);
  },
  setTimeLimit: function (settingTime) {
    this.TIME_LIMIT = settingTime;
    this.timePassed = 0;
    this.timeLeft = this.TIME_LIMIT;
  },
  onTimesUp: function () {
    this.clearTimer();
    this.emitter.emit(EVENTS.breaktime);
  },
  clearTimer: function () {
    clearInterval(this.timerInterval);
  },
  _formatTime: function (time) {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;

    if (seconds < 10) {
      seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
  },
  _setCircleDasharray: function () {
    const circleDasharray = `${(
      this._calculateTimeFraction() * this.FULL_DASH_ARRAY
    ).toFixed(0)} 283`;

    document
      .getElementById("base-timer-path-remaining")
      .setAttribute("stroke-dasharray", circleDasharray);
  },
  _setRemainingPathColor: function () {
    const { alert, warning, info } = this.COLOR_CODES;
    if (this.timeLeft <= alert.threshold) {
      document
        .getElementById("base-timer-path-remaining")
        .classList.remove(warning.color);
      document
        .getElementById("base-timer-path-remaining")
        .classList.add(alert.color);
    } else if (this.timeLeft <= warning.threshold) {
      document
        .getElementById("base-timer-path-remaining")
        .classList.remove(info.color);
      document
        .getElementById("base-timer-path-remaining")
        .classList.add(warning.color);
    }
  },
  _calculateTimeFraction: function () {
    const rawTimeFraction = this.timeLeft / this.TIME_LIMIT;
    return rawTimeFraction - (1 / this.TIME_LIMIT) * (1 - rawTimeFraction);
  },

  _initView: function () {
    document.getElementById("status-timer").innerHTML = `
            <div class="base-timer">
              <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <g class="base-timer__circle">
                  <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
                  <path
                    id="base-timer-path-remaining"
                    stroke-dasharray="283"
                    class="base-timer__path-remaining ${
                      this.remainingPathColor
                    }"
                    d="
                      M 50, 50
                      m -45, 0
                      a 45,45 0 1,0 90,0
                      a 45,45 0 1,0 -90,0
                    "
                  ></path>
                </g>
              </svg>
              <span id="base-timer-label" class="base-timer__label">${this._formatTime(
                this.timeLeft
              )}</span>
            </div>
            `;
  },
};
