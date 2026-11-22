
/* =====================================
   ROBLOX ROBUX CALCULATOR
   DEVEX + PURCHASE CALCULATOR
===================================== */

// HTML elements

const robuxInput = document.getElementById("robux");
const rateInput = document.getElementById("rate");

const devexResult = document.getElementById("devexResult");
const purchaseResult = document.getElementById("purchaseResult");
const devexSettings = document.getElementById("devexSettings");

const devexUsd = document.getElementById("devexUsd");
const devexRobux = document.getElementById("devexRobux");
const rateText = document.getElementById("rateText");

const purchaseUsd = document.getElementById("purchaseUsd");
const purchaseRobux = document.getElementById("purchaseRobux");
const receivedRobux = document.getElementById("receivedRobux");

const packageList = document.getElementById("packageList");

// Current calculator mode

let currentMode = "devex";

// Maximum supported purchase calculation

const MAX_ROBUX = 2000000;

// US Roblox website package price assumptions.
// Prices are stored in cents.

const packages = [
    { robux: 270, price: 299 },
    { robux: 500, price: 499 },
    { robux: 1000, price: 999 },
    { robux: 1500, price: 1499 },
    { robux: 2000, price: 1999 },
    { robux: 3625, price: 3499 },
    { robux: 5250, price: 4999 },
    { robux: 11000, price: 9999 },
    { robux: 24000, price: 19999 }
];


// =====================================
// PARSE ROBUX INPUT
// Supports K and M
// =====================================

function parseRobux(value) {

    const input = value
        .trim()
        .replace(/,/g, "")
        .toUpperCase();

    if (input === "") return 0;

    const match = input.match(
        /^(\d+(?:\.\d+)?|\.\d+)\s*([KM]?)$/
    );

    if (!match) return null;

    let number = parseFloat(match[1]);

    if (!Number.isFinite(number)) return null;

    if (match[2] === "K") {
        number *= 1000;
    }

    if (match[2] === "M") {
        number *= 1000000;
    }

    return number;
}


// =====================================
// FORMAT NUMBERS
// =====================================

function formatNumber(number) {

    return Math.round(number).toLocaleString("en-US");

}


function formatUSD(cents) {

    return (cents / 100).toLocaleString("en-US", {
        style: "currency",
        currency: "USD"
    });

}


// =====================================
// DEVEX CALCULATOR
// =====================================

function calculateDevEx(robux) {

    const rate = Number(rateInput.value);

    if (
        rateInput.value.trim() === "" ||
        !Number.isFinite(rate) ||
        rate < 0
    ) {

        devexUsd.textContent = "Invalid rate";
        devexRobux.textContent = "";
        rateText.textContent = "";

        return;
    }

    const usd = robux * rate;

    devexUsd.textContent = usd.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    devexRobux.textContent =
        formatNumber(robux) + " Robux";

    rateText.textContent =
        "$" + rate.toFixed(4) + " / Robux";

}


// =====================================
// PURCHASE CALCULATOR
// Finds cheapest package combination
// =====================================

function calculatePurchase(target) {

    if (target === 0) {

        purchaseUsd.textContent = "$0.00";
        purchaseRobux.textContent = "0 Robux";
        receivedRobux.textContent = "0 received";

        packageList.textContent =
            "Enter an amount to see the packages.";

        return;
    }

    if (target > MAX_ROBUX) {

        purchaseUsd.textContent = "Amount too large";

        purchaseRobux.textContent = "";
        receivedRobux.textContent = "";

        packageList.textContent =
            "Maximum supported amount is 2M Robux.";

        return;
    }

    // Find maximum package size

    const maxPackage = Math.max(
        ...packages.map(pack => pack.robux)
    );

    // Only need to search up to target + max package - 1

    const limit = target + maxPackage - 1;

    // Dynamic programming arrays

    const costs = new Float64Array(limit + 1);
    const counts = new Int32Array(limit + 1);
    const previous = new Int8Array(limit + 1);

    costs.fill(Infinity);
    counts.fill(Infinity);
    previous.fill(-1);

    costs[0] = 0;
    counts[0] = 0;

    // Calculate cheapest exact package combinations

    for (let amount = 1; amount <= limit; amount++) {

        for (let i = 0; i < packages.length; i++) {

            const pack = packages[i];

            if (amount < pack.robux) {
                continue;
            }

            const previousAmount = amount - pack.robux;

            if (!Number.isFinite(costs[previousAmount])) {
                continue;
            }

            const newCost =
                costs[previousAmount] + pack.price;

            const newCount =
                counts[previousAmount] + 1;

            if (
                newCost < costs[amount] ||
                (
                    newCost === costs[amount] &&
                    newCount < counts[amount]
                )
            ) {

                costs[amount] = newCost;
                counts[amount] = newCount;
                previous[amount] = i;

            }

        }

    }

    // Find cheapest amount that reaches the target

    let bestAmount = -1;
    let bestCost = Infinity;
    let bestCount = Infinity;

    for (
        let amount = target;
        amount <= limit;
        amount++
    ) {

        if (
            costs[amount] < bestCost ||
            (
                costs[amount] === bestCost &&
                counts[amount] < bestCount
            )
        ) {

            bestAmount = amount;
            bestCost = costs[amount];
            bestCount = counts[amount];

        }

    }

    if (bestAmount === -1) {

        purchaseUsd.textContent = "Calculation error";
        packageList.textContent =
            "Please try another amount.";

        return;
    }

    // Reconstruct package combination

    const combination = new Array(packages.length).fill(0);

    let remaining = bestAmount;

    while (remaining > 0) {

        const packageIndex = previous[remaining];

        if (packageIndex < 0) {

            purchaseUsd.textContent = "Calculation error";
            packageList.textContent =
                "Could not calculate package combination.";

            return;
        }

        combination[packageIndex]++;

        remaining -= packages[packageIndex].robux;

    }

    // Display total cost

    purchaseUsd.textContent = formatUSD(bestCost);

    purchaseRobux.textContent =
        formatNumber(target) + " Robux requested";

    receivedRobux.textContent =
        formatNumber(bestAmount) + " received";

    // Clear previous package list

    packageList.replaceChildren();

    // Display individual packages

    packages.forEach((pack, index) => {

        const quantity = combination[index];

        if (quantity === 0) return;

        const item = document.createElement("div");

        item.className = "package-item";

        const name = document.createElement("span");

        name.textContent =
            quantity + " × " +
            formatNumber(pack.robux) + " Robux";

        const price = document.createElement("span");

        price.textContent =
            formatUSD(quantity * pack.price);

        item.appendChild(name);
        item.appendChild(price);

        packageList.appendChild(item);

    });

    // Total row

    const total = document.createElement("div");

    total.className = "package-item";

    const totalName = document.createElement("span");

    totalName.textContent = "TOTAL";

    const totalPrice = document.createElement("span");

    totalPrice.textContent = formatUSD(bestCost);

    total.appendChild(totalName);
    total.appendChild(totalPrice);

    packageList.appendChild(total);

}


// =====================================
// MAIN CALCULATOR
// =====================================

function calculate() {

    const robux = parseRobux(robuxInput.value);

    // Invalid input

    if (
        robux === null ||
        !Number.isFinite(robux)
    ) {

        if (currentMode === "devex") {

            devexUsd.textContent = "Invalid amount";
            devexRobux.textContent = "Check your input";
            rateText.textContent = "";

        } else {

            purchaseUsd.textContent = "Invalid amount";
            purchaseRobux.textContent = "Check your input";
            receivedRobux.textContent = "";

            packageList.textContent = "";

        }

        return;
    }

    // Purchase packages must reach a whole Robux amount

    const amount = Math.ceil(robux);

    if (currentMode === "devex") {

        calculateDevEx(robux);

    } else {

        calculatePurchase(amount);

    }

}


// =====================================
// SWITCH CALCULATOR MODES
// =====================================

function setMode(mode) {

    currentMode = mode;

    // Update active button

    document.querySelectorAll(".mode-button").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.mode === mode
        );

    });

    // Show correct result

    devexResult.classList.toggle(
        "hidden",
        mode !== "devex"
    );

    purchaseResult.classList.toggle(
        "hidden",
        mode !== "purchase"
    );

    // Show settings only in DevEx mode

    devexSettings.classList.toggle(
        "hidden",
        mode !== "devex"
    );

    calculate();

}


// =====================================
// CONNECT MODE BUTTONS
// =====================================

document.querySelectorAll(".mode-button").forEach(button => {

    button.addEventListener("click", () => {

        setMode(button.dataset.mode);

    });

});


// =====================================
// PRESET BUTTONS
// =====================================

document.querySelectorAll("[data-amount]").forEach(button => {

    button.addEventListener("click", () => {

        robuxInput.value = button.dataset.amount;

        calculate();

    });

});


// =====================================
// INPUT LISTENERS
// =====================================

robuxInput.addEventListener("input", calculate);

rateInput.addEventListener("input", calculate);


// =====================================
// START CALCULATOR
// =====================================

calculate();
