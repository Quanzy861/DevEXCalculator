
/* ==============================
   ROBLOX DEVEX CALCULATOR
   CALCULATION SYSTEM
============================== */

const robuxInput = document.getElementById("robux");
const rateInput = document.getElementById("rate");

const usdOutput = document.getElementById("usd");
const robuxText = document.getElementById("robuxText");
const rateText = document.getElementById("rateText");

// Convert K and M into normal numbers

function parseRobux(value) {
    const input = value
        .trim()
        .replace(/,/g, "")
        .toUpperCase();

    if (input === "") return 0;

    const match = input.match(/^(\d+(?:\.\d+)?|\.\d+)\s*([KM]?)$/);

    if (!match) return null;

    let number = parseFloat(match[1]);
    const suffix = match[2];

    if (suffix === "K") {
        number *= 1000;
    }

    if (suffix === "M") {
        number *= 1000000;
    }

    return number;
}

// Format numbers

function formatNumber(number) {
    return Math.round(number).toLocaleString("en-US");
}

// Calculate DevEx value

function calculate() {
    const robux = parseRobux(robuxInput.value);
    const rate = Number(rateInput.value);

    if (robux === null || !Number.isFinite(robux)) {
        usdOutput.textContent = "Invalid amount";
        robuxText.textContent = "Check your input";
        rateText.textContent = "";
        return;
    }

    if (!Number.isFinite(rate) || rate < 0) {
        usdOutput.textContent = "Invalid rate";
        robuxText.textContent = formatNumber(robux) + " Robux";
        rateText.textContent = "";
        return;
    }

    const usd = robux * rate;

    usdOutput.textContent = usd.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    robuxText.textContent = formatNumber(robux) + " Robux";

    rateText.textContent =
        "$" + rate.toFixed(4) + " / Robux";
}

// Preset buttons

function setRobux(amount) {
    robuxInput.value = amount.toString();
    calculate();
}

// Listen for input changes

robuxInput.addEventListener("input", calculate);

rateInput.addEventListener("input", calculate);

// Connect preset buttons

document.querySelectorAll("[data-amount]").forEach(button => {
    button.addEventListener("click", () => {
        setRobux(button.dataset.amount);
    });
});

// Initial calculation

calculate();
