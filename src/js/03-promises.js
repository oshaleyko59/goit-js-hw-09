import { Notify } from 'notiflix/build/notiflix-notify-aio';
import '../css/promises.css';

/* HTML містить розмітку форми, в поля якої користувач буде вводити
  - першу затримку в мілісекундах,
  - крок збільшення затримки для кожного промісу після першого
  - кількість промісів, яку необхідно створити.
*/
const form = document.forms[0];
form.addEventListener('submit', handleSubmit);

/*   Напиши скрипт, який на момент сабміту форми викликає функцію
  createPromise(position, delay) стільки разів, скільки ввели в
  поле amount. Під час кожного виклику передай їй номер промісу
  (position), що створюється, і затримку, враховуючи
  першу затримку (delay), введену користувачем, і крок (step) */
function handleSubmit(e) {
  e.preventDefault();

  const promises = [];
  for (let i = 0; i < form.elements.amount.value; i += 1) {
    promises.push(createPromise(i, calculateDelay(i)));
  }

  for (let i = 0; i < form.elements.amount.value; i += 1) {
    promises[i]
      .then(({ position, delay }) => {
        Notify.success(`✅ Fulfilled promise ${position} in ${delay}ms`);
      })
      .catch(({ position, delay }) => {
        Notify.failure(`❌ Rejected promise ${position} in ${delay}ms`);
      });
  }
}

function calculateDelay(position) {
  return Number(form.elements.delay.value) + position * form.elements.step.value;
}

/* createPromise має повертати проміс, що виконується або відхиляється
  через delay мс. Значенням промісу повинен бути об'єкт,
  з властивостями position і delay.
  Використовуй початковий код функції для вибору
  того,що зробити з промісом-виконати чи відхилити.  */
function createPromise(position, delay) {
  return new Promise((resolve, reject) => {
    const shouldResolve = Math.random() > 0.3;

    setTimeout(() => {
      if (shouldResolve) {
        resolve({ position, delay });
      }
      reject({ position, delay });
    }, delay);
  });
}

