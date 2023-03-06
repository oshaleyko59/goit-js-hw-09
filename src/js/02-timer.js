/* Напиши скрипт таймера, який здійснює зворотний відлік до певної дати.
Такий таймер може використовуватися у блогах та інтернет-магазинах,
сторінках реєстрації подій, під час технічного обслуговування тощо.
 Подивися демо-відео роботи таймера. */
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import '../css/timer.css';

// helper object (incl. some settings)
const DAY = 24 * 60 * 60 * 1000;
const HLP = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY,
  ALLOW_TODAY: true,
  MIN_FUTURE_DAYS: 1, //0,
  FINAL_COUNT_MS: DAY, //=last day
  BEEP: false, //beep during last count //true, //
  VALUE_ZERO: '--',
  msgShown: false,

  doDays(ticks) {
    return Math.floor(ticks / this.DAY);
  },

  isDateValid(selected) {
    const nowMs = Date.now();
    if (selected <= nowMs) { //selected time in the past
      return false;
    }
    //today time is allowed
    if (HLP.ALLOW_TODAY) {
      return true;
    }
    //check if date is in the future
    const timerDays = this.doDays(selected)- this.doDays(nowMs) ;
    return timerDays >= this.MIN_FUTURE_DAYS;
  },

  reportFailure() {
    Notify.failure('Please choose a date in the future');
  },

  warnFinalCount() {
    Notify.warning('It\'s final count!', {
      closeButton: true,
    });
    this.msgShown = true;
  },

  infoTimerStopped() {
    Notify.info('The time has ended...', {
      closeButton: true,
    });
    this.msgShown = true;
  },

  removeMsgs() {
    if (!this.msgShown) {
      return;
    }

    this.msgShown = false;
    Notify.info('', {
      showOnlyTheLastOne: true,
      timeout: 0,
      width: 0,
    });
    Notify.warning('', {
      showOnlyTheLastOne: true,
      timeout: 0,
      width: 0,
    });
  }
};


const btnStartEl = document.querySelector('button[data-start]');
btnStartEl.disabled = true;
btnStartEl.addEventListener('click', handleBtnStart);
btnStartEl.classList.add('timer-btn');
const valueEls = document.querySelectorAll('.value');

let intervalId = null; //interval timer not activated
let targetMs = 0; //target date not selected

/* об'єкт параметрів для flatpickr(selector, options) */
const options = {
  enableTime: true,
  time_24hr: true,
  dateFormat: 'Y-m-d H:i',
  defaultDate: new Date(),
  minuteIncrement: 1,

  onClose(selectedDates) {
    if (!selectedDates[0]) return;

    targetMs = selectedDates[0].valueOf();
    if (!HLP.isDateValid(targetMs)) {
      HLP.reportFailure();
      return;
    }

    btnStartEl.disabled = false;
  },
};

//initialize flatpickr
flatpickr('#datetime-picker', options);
let isFinalCount = false;

/* ****************** event handling functions ************************* */

function handleBtnStart() {
  btnStartEl.disabled = true;
  if (!HLP.isDateValid(targetMs)) {
    HLP.reportFailure();
    return;
  }
  isFinalCount = false;
  intervalId = setInterval(handleTimer, 1000);
}

function handleTimer() {
  let ticks = targetMs - Date.now();
  if (ticks <= 0) {
    completeCounting();
    return;
  }

  updateTimer(ticks);

  if (ticks < HLP.FINAL_COUNT_MS) {
    countFinal();
  }
}

/* ****************** auxilary function ************************* */

function updateTimer(ticks) {
  const timeToTarget = convertToStr(convertMs(ticks));
  for (const valueEl of valueEls) {
    const txt = timeToTarget[Object.keys(valueEl.dataset)[0]];
    valueEl.textContent = txt ? txt : HLP.VALUE_ZERO;
  }
}

function completeCounting() {
  clearInterval(intervalId);

  valueEls.forEach((el) => {
    el.classList.remove('final-count');
    el.textContent = '00';
  });

  if (HLP.BEEP) {
    beep();
  }

  HLP.infoTimerStopped();
  window.addEventListener('mousemove', handleMouseMove);
}

function handleMouseMove() {
  window.removeEventListener('mousemove', handleMouseMove);
  HLP.removeMsgs();
}

function countFinal() {
  if (!isFinalCount) {
    isFinalCount = true;

    const { days, hours, minutes} = convertMs(HLP.FINAL_COUNT_MS);
    let pos = days ? 0 : hours ? 1 : minutes ? 2 : 3;
    for (let i = 3; i >= pos; i -= 1) {
      valueEls[i].classList.add('final-count');
    }

    HLP.warnFinalCount();
  }

  if (HLP.BEEP) {
    beep();
  }
}

function addLeadingZero(value) {
  return value.padStart(2, '0');
}

function convertToStr({ days, hours, minutes, seconds }) {
  let result = {};
  if (days !== 0) {
    result = { days, hours, minutes, seconds };
  } else if (hours !== 0) {
    result = { hours, minutes, seconds };
  } else if (minutes != 0) {
    result = { minutes, seconds };
  } else {
    result = { seconds };
  }
  for (const key in result) {
    result[key] = addLeadingZero(result[key].toString());
  }
  return result;
}

function convertMs(ms) {
  // Remaining days
  const days = Math.floor(ms / HLP.DAY);
  ms %= HLP.DAY;
  // Remaining hours
  const hours = Math.floor(ms / HLP.HOUR);
  ms %= HLP.HOUR;
  // Remaining minutes
  const minutes = Math.floor(ms / HLP.MINUTE);
  ms %= HLP.MINUTE;
  // Remaining seconds
  const seconds = Math.floor(ms / HLP.SECOND);

  return { days, hours, minutes, seconds };
}

//play() sometimes it fails for unknown reason :(
const snd = new Audio(
  'data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU='
);
function beep() {
  snd.play();
} 
