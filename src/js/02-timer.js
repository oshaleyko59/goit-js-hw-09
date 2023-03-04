/* Напиши скрипт таймера, який здійснює зворотний відлік до певної дати.
Такий таймер може використовуватися у блогах та інтернет-магазинах,
сторінках реєстрації подій, під час технічного обслуговування тощо.
 Подивися демо-відео роботи таймера. */
import flatpickr from 'flatpickr';
// Додатковий імпорт стилів
import "flatpickr/dist/flatpickr.min.css";
import { Notify } from 'notiflix/build/notiflix-notify-aio';

// Number of milliseconds per unit of time
const MS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000
}

//selected time shall be at least 1 minute ahead of current
const MIN_FUTURE_MS = 30 * MS.SECOND;

const btnStartEl = document.querySelector('button[data-start]');
//console.log(btnStartEl);
btnStartEl.disabled = true;
btnStartEl.addEventListener("click", handleBtnStart);
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

  onChange(selectedDates) {
    targetMs = selectedDates[0].valueOf();
    const nowMs = Date.now().valueOf();
    if (targetMs - nowMs < MIN_FUTURE_MS) {
      Notify.warning('Run time must be at least 30 seconds!', {
        timeout: 1000,
        showOnlyTheLastOne: true,
      });
    } else {
      Notify.info('Ok', {
        timeout: 1000,
        showOnlyTheLastOne: true,
      });
    }
  },

  onClose(selectedDates) {
    const nowMs = Date.now().valueOf();
    if (!selectedDates[0]) return;

    targetMs = selectedDates[0].valueOf();
    //if from now till selected time is less than minimum time->return with error message
    if (targetMs - nowMs < MIN_FUTURE_MS) {
      //if interval less than minimum
      Notify.failure('Please choose a date in the future');
      return;
    }

    btnStartEl.disabled = false;
    //TODO: we could skip start button...  intervalId = setInterval(handleTimer, 1000);
  },
};

//initialize flatpickr
flatpickr('#datetime-picker', options);
let isLastMinute = false;

/* ****************** event handling functions ************************* */
function handleBtnStart() {
  btnStartEl.disabled = true;
  if (targetMs <= Date.now().valueOf()) {
    Notify.failure('The selected moment passed. Start over');
    return;
  }
  isLastMinute = false;
  intervalId = setInterval(handleTimer, 1000);

}

function handleTimer() {
  let ticks = targetMs - Date.now().valueOf();
  if (ticks <= 0) {
    completeCounting();
    return;
  }

  updateTimer(ticks);

 //last minute beep every second
  if (ticks < 60000) {
    countFinal();
    beep();
  }
}

/* ****************** auxilary function ************************* */

const VALUE_ZERO = '--';

function updateTimer(ticks) {
  const timeToTarget = convertToStr(convertMs(ticks));
//  console.log('timeToTarget', timeToTarget);
  for (const valueEl of valueEls) {
    const txt = timeToTarget[Object.keys(valueEl.dataset)[0]];
    valueEl.textContent = txt ? txt : VALUE_ZERO;
  }
}

function completeCounting() {
  clearInterval(intervalId);
  const lastValueEl = valueEls[valueEls.length - 1];
  lastValueEl.classList.remove('last-minute');
  lastValueEl.textContent = VALUE_ZERO;
 // beep();
  Notify.success('Your timer reached the selected moment', {timeout: 6000});
}

function countFinal() {
  if (!isLastMinute) {
    isLastMinute = true;
    valueEls[valueEls.length - 1].classList.add('last-minute');
    //Notify.warning('Last minute count!');
  }
 // beep();
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
  }
  else if (minutes != 0) {
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
  const days = Math.floor(ms / MS.DAY);
  ms %= MS.DAY;
  // Remaining hours
  const hours = Math.floor(ms / MS.HOUR);
  ms %= MS.HOUR;
  // Remaining minutes
  const minutes = Math.floor(((ms % MS.DAY) % MS.HOUR) / MS.MINUTE);
  ms %= MS.MINUTE;
  // Remaining seconds
  const seconds = Math.floor(ms / MS.SECOND);

  return { days, hours, minutes, seconds };
}

//TODO: it fails sometimes for unknown reason :(
const snd = new Audio(
    'data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU='
  );
function beep() {

  snd.play();
}
