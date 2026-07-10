const inputDisplay = document.getElementById("inputDisplay");
const costDisplay = document.getElementById("costDisplay");
const priceDisplay = document.getElementById("priceDisplay");
const rateButtons = document.querySelectorAll(".rate-btn");
const keys = document.querySelectorAll(".key");

let currentInput = "0";
let storedValue = null;
let pendingOperator = null;
let shouldResetInput = false;
let selectedRate = 30;

const operators = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => (b === 0 ? NaN : a / b),
};

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return "Error";
  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  return new Intl.NumberFormat("ja-JP", {
    maximumFractionDigits: Number.isInteger(rounded) ? 0 : 2,
  }).format(rounded);
}

function setCurrentInput(value) {
  if (!Number.isFinite(value)) {
    currentInput = "0";
    storedValue = null;
    pendingOperator = null;
    shouldResetInput = true;
    return;
  }
  currentInput = String(Math.round((value + Number.EPSILON) * 100000000) / 100000000);
  shouldResetInput = true;
}

function updateDisplays() {
  const baseValue = toNumber(currentInput);
  inputDisplay.textContent = formatNumber(baseValue);
  const costValue = baseValue * 1.1;
  costDisplay.textContent = formatNumber(costValue);
  priceDisplay.textContent = formatNumber(costValue / (1 - selectedRate / 100));
}

function appendValue(value) {
  if (shouldResetInput) {
    currentInput = value === "." ? "0." : value;
    shouldResetInput = false;
  } else if (value === ".") {
    if (currentInput.includes(".")) return;
    currentInput += ".";
  } else if (currentInput === "0") {
    currentInput = value === "00" ? "0" : value;
  } else {
    currentInput += value;
  }
  if (currentInput.length > 12) currentInput = currentInput.slice(0, 12);
  updateDisplays();
}

function runPendingCalculation() {
  if (pendingOperator === null || storedValue === null) return toNumber(currentInput);
  return operators[pendingOperator](storedValue, toNumber(currentInput));
}

function chooseOperator(operator) {
  setCurrentInput(runPendingCalculation());
  storedValue = toNumber(currentInput);
  pendingOperator = operator;
  updateDisplays();
}

function handleEquals() {
  setCurrentInput(runPendingCalculation());
  storedValue = null;
  pendingOperator = null;
  updateDisplays();
}

function clearInput() {
  currentInput = "0";
  shouldResetInput = false;
  updateDisplays();
}

function allClear() {
  currentInput = "0";
  storedValue = null;
  pendingOperator = null;
  shouldResetInput = false;
  updateDisplays();
}

function backspace() {
  if (shouldResetInput || currentInput.length <= 1) {
    currentInput = "0";
    shouldResetInput = false;
  } else {
    currentInput = currentInput.slice(0, -1);
  }
  updateDisplays();
}

function handleKeyPress(key) {
  const { value, operator, action } = key.dataset;
  if (value !== undefined) return appendValue(value);
  if (operator) return chooseOperator(operator);
  if (action === "equals") handleEquals();
  else if (action === "clear") clearInput();
  else if (action === "all-clear") allClear();
  else if (action === "backspace") backspace();
}

keys.forEach((key) => key.addEventListener("click", () => handleKeyPress(key)));

rateButtons.forEach((button) => {
  button.addEventListener("click", () => {
    rateButtons.forEach((rateButton) => rateButton.classList.remove("active"));
    button.classList.add("active");
    selectedRate = Number(button.dataset.rate);
    updateDisplays();
  });
});

document.addEventListener("keydown", (event) => {
  const key = event.key;
  if (/^[0-9.]$/.test(key)) appendValue(key);
  else if (["+", "-", "*", "/"].includes(key)) chooseOperator(key);
  else if (key === "Enter" || key === "=") {
    event.preventDefault();
    handleEquals();
  } else if (key === "Backspace") backspace();
  else if (key === "Escape") allClear();
});

updateDisplays();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
  });
}
