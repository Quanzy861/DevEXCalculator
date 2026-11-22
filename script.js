
const robuxInput = document.getElementById("robux");
const rateInput = document.getElementById("rate");
const purchaseRateInput = document.getElementById("purchaseRate");

const inputLabel = document.getElementById("inputLabel");
const inputSymbol = document.getElementById("inputSymbol");

const resultLabel = document.getElementById("resultLabel");
const usdOutput = document.getElementById("usd");
const robuxText = document.getElementById("robuxText");
const rateBreakdown = document.getElementById("rateBreakdown");

const purchaseSettings = document.getElementById("purchaseSettings");

const devexButton = document.getElementById("devexMode");
const buyButton = document.getElementById("buyMode");

let currentMode = "devex";

// Supports regular numbers and K/M suffixes
function parseAmount(value) {
    if (!value) return 0;

    const cleaned = value
        .toString()
        .trim()
        .replace(/[$,\s]/g, "")
        .toUpperCase();

    const match = cleaned.match(/^(\d*\.?\d+)(K|M)?$/);

    if (!match) return 0;

    let amount = parseFloat(match[1]);

    if (match[2] === "K") amount *= 1000;
    if (match[2] === "M") amount *= 1000000;

    return amount;
}

function formatNumber(number) {
    return Math.floor(number).toLocaleString("en-US");
}

function formatMoney(number) {
    return number.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function switchMode(mode) {
    currentMode = mode;

    devexButton.classList.toggle("active", mode === "devex");
    buyButton.classList.toggle("active", mode === "buy");

    const devexSettings = rateInput.parentElement;

    if (mode === "devex") {
        inputLabel.textContent = "Earned Robux";
        inputSymbol.textContent = "R$";
        resultLabel.textContent = "You receive";
        robuxInput.placeholder = "Enter Robux amount";

        devexSettings.style.display = "";
        purchaseSettings.style.display = "none";
    } else {
        inputLabel.textContent = "Robux amount";
        inputSymbol.textContent = "R$";
        resultLabel.textContent = "Estimated cost";
        robuxInput.placeholder = "Enter Robux amount";

        devexSettings.style.display = "none";
        purchaseSettings.style.display = "";
    }

    calculate();
}

function calculate() {
    const robux = parseAmount(robuxInput.value);

    if (currentMode === "devex") {
        const rate = parseFloat(rateInput.value) || 0.0038;
        const result = robux * rate;

        usdOutput.textContent = formatMoney(result);
        robuxText.textContent = `${formatNumber(robux)} Robux`;
        rateBreakdown.textContent =
            `${formatNumber(robux)} × $${rate.toFixed(4)} per Robux`;
    } else {
        const purchaseRate = parseFloat(purchaseRateInput.value) || 0.0125;
        const result = robux * purchaseRate;

        usdOutput.textContent = formatMoney(result);
        robuxText.textContent = `${formatNumber(robux)} Robux`;
        rateBreakdown.textContent =
            `${formatNumber(robux)} × $${purchaseRate.toFixed(4)} per Robux`;
    }
}

// Quick amount buttons
function setRobux(amount) {
    robuxInput.value = amount;
    calculate();
}

// Mode buttons
devexButton.addEventListener("click", () => {
    switchMode("devex");
});

buyButton.addEventListener("click", () => {
    switchMode("buy");
});

// Recalculate when inputs change
robuxInput.addEventListener("input", calculate);
rateInput.addEventListener("input", calculate);
purchaseRateInput.addEventListener("input", calculate);

// Quick buttons using data-amount attributes
document.querySelectorAll("[data-amount]").forEach(button => {
    button.addEventListener("click", () => {
        setRobux(button.dataset.amount);
    });
});

// Initial setup
switchMode("devex");
