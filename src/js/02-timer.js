/* Напиши скрипт таймера, який здійснює зворотний відлік до певної дати.
Такий таймер може використовуватися у блогах та інтернет-магазинах,
сторінках реєстрації подій, під час технічного обслуговування тощо.
 Подивися демо-відео роботи таймера. */
import flatpickr from 'flatpickr';
// Додатковий імпорт стилів
import "flatpickr/dist/flatpickr.min.css";
import { Notify } from 'notiflix/build/notiflix-notify-aio';
//import 'notiflix/dist/notiflix-3.2.6.min.css';

let intervalId;
let ticks = 30000;

const btnStartEl = document.querySelector("button");
btnStartEl.disabled = true;
btnStartEl.addEventListener("click", handleBtnStart);
const valueEls = document.querySelectorAll('.value');

/* об'єкт параметрів для flatpickr(selector, options) */
const options = {
  enableTime: true,
  time_24hr: true,
  defaultDate: new Date(),
  minuteIncrement: 1,

  onClose(selectedDates) {
    console.log(selectedDates);
    ticks = selectedDates[0].getTime() - Date.now();
    if (ticks <= 1000) {
   //   window.alert
      Notify.failure('Please choose a date in the future');
      return;
    }

    btnStartEl.disabled = false;
    intervalId = setInterval(handleTimer, 1000);
    console.log(selectedDates[0], 'Set Id=', intervalId);
  },
};

//const calendar =
flatpickr('#datetime-picker', options);

function handleBtnStart() {
  btnStartEl.disabled = true;
}

function handleTimer() {
  ticks -= 1000;
  if (ticks <= 0) {
    console.log('Cleared Id=', intervalId);
    clearInterval(intervalId);
  }
  const dtObj = convertMs(ticks);
  console.log(dtObj);
  valueEls.forEach(elem => {
    elem.textContent =
      addLeadingZero(dtObj[Object.keys(elem.dataset)[0]].toString());
  })
  console.log(ticks);
}

function addLeadingZero(value) {
  return value.padStart(2, '0');
}

function convertMs(ms) {
  // Number of milliseconds per unit of time
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  // Remaining days
  const days = Math.floor(ms / day);
  // Remaining hours
  const hours = Math.floor((ms % day) / hour);
  // Remaining minutes
  const minutes = Math.floor(((ms % day) % hour) / minute);
  // Remaining seconds
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);

  return { days, hours, minutes, seconds };
}

//console.log(convertMs(2000)); // {days: 0, hours: 0, minutes: 0, seconds: 2}
//console.log(convertMs(140000)); // {days: 0, hours: 0, minutes: 2, seconds: 20}
//console.log(convertMs(24140000)); // {days: 0, hours: 6 minutes: 42, seconds: 20}

