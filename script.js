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
  if (!Number.isFinite(value)) {
    return "エラー";
  }

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

function calculateCost(baseValue) {
  return baseValue * 1.1;
}

function calculatePrice(costValue) {
  const markupRate = selectedRate / 100;
  return costValue / (1 - markupRate);
}

function updateDisplays() {
  const baseValue = toNumber(currentInput);
  inputDisplay.textContent = formatNumber(baseValue);

  const costValue = calculateCost(baseValue);
  const priceValue = calculatePrice(costValue);
  costDisplay.textContent = formatNumber(costValue);
  priceDisplay.textContent = formatNumber(priceValue);
}

function appendValue(value) {
  if (shouldResetInput) {
    currentInput = value === "." ? "0." : value;
    shouldResetInput = false;
  } else if (value === ".") {
    if (currentInput.includes(".")) {
      return;
    }
    currentInput += ".";
  } else if (currentInput === "0") {
    currentInput = value === "00" ? "0" : value;
  } else {
    currentInput += value;
  }

  if (currentInput.length > 12) {
    currentInput = currentInput.slice(0, 12);
  }

  updateDisplays();
}

function runPendingCalculation() {
  if (pendingOperator === null || storedValue === null) {
    return toNumber(currentInput);
  }

  const nextValue = toNumber(currentInput);
  return operators[pendingOperator](storedValue, nextValue);
}

function chooseOperator(operator) {
  const result = runPendingCalculation();
  setCurrentInput(result);
  storedValue = toNumber(currentInput);
  pendingOperator = operator;
  updateDisplays();
}

function handleEquals() {
  const result = runPendingCalculation();
  setCurrentInput(result);
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
  const value = key.dataset.value;
  const operator = key.dataset.operator;
  const action = key.dataset.action;

  if (value !== undefined) {
    appendValue(value);
    return;
  }

  if (operator) {
    chooseOperator(operator);
    return;
  }

  if (action === "equals") {
    handleEquals();
  } else if (action === "clear") {
    clearInput();
  } else if (action === "all-clear") {
    allClear();
  } else if (action === "backspace") {
    backspace();
  }
}

keys.forEach((key) => {
  key.addEventListener("click", () => handleKeyPress(key));
});

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

  if (/^[0-9.]$/.test(key)) {
    appendValue(key);
  } else if (["+", "-", "*", "/"].includes(key)) {
    chooseOperator(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    handleEquals();
  } else if (key === "Backspace") {
    backspace();
  } else if (key === "Escape") {
    allClear();
  }
});

updateDisplays();
