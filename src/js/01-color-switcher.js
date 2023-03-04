/* Напиши скрипт, який після натискання кнопки «Start», раз на секунду
змінює колір фону < body > на випадкове значення, використовуючи інлайн стиль.
Натисканням на кнопку «Stop» зміна кольору фону повинна зупинятися.
Зроби так, щоб доки зміна теми запущена, кнопка «Start» була неактивною (disabled)
*/

/* Для генерування випадкового кольору */
function getRandomHexColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

const [btnStartEl, btnStopEl] = document.querySelectorAll("button");
/* кнопка «Start» неактивна */
btnStopEl.disabled = true;

btnStartEl.addEventListener("click", handleBtnStartClick);
btnStopEl.addEventListener('click', handleBtnStopClick);
let intervalId = null;

function handleBtnStartClick({ target }) {
  /* кнопка «Start» неактивна */
  btnStartEl.disabled = true;
  /* кнопка «Stop» активна */
  btnStopEl.disabled = false;

  intervalId =
    /* раз на секунду змінює колір фону <body> на випадкове значення через інлайн стиль */
    setInterval(
      () => (target.parentElement.style.backgroundColor = getRandomHexColor()),
      1000
    );
}

function handleBtnStopClick() {
  /* кнопка «Start» активна */
  btnStartEl.disabled = false;
  /* кнопка «Stop» неактивна */
  btnStopEl.disabled = true;

  /* зупинити зміну кольору фону */
  clearInterval(intervalId);
}
