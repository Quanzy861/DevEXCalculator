
const robuxInput = document.getElementById("robux");
const rateInput = document.getElementById("rate");
const usdOutput = document.getElementById("usd");
const robuxText = document.getElementById("robuxText");

function parseRobux(value) {
    const input = value.trim().replace(/,/g, "").toUpperCase();

    const match = input.match(/^(\d*\.?\d+)\s*([KM]?)$/);

    if (!match) return 0;

    let number = parseFloat(match[1]);
    const suffix = match[2];

    if (suffix === "K") number *= 1000;
    if (suffix === "M") number *= 1000000;

    return Math.max(0, number);
}

function calculate() {
    const robux = parseRobux(robuxInput.value);
    const rate = Math.max(0, Number(rateInput.value) || 0);

    const usd = robux * rate;

    usdOutput.textContent = usd.toLocaleString("en-US", {
        style: "currency",
        currency: "USD"
    });

    robuxText.textContent =
        Math.round(robux).toLocaleString("en-US") + " Robux";
}

function setRobux(amount) {
    robuxInput.value = amount;
    calculate();
}

robuxInput.addEventListener("input", calculate);
rateInput.addEventListener("input", calculate);

calculate();
