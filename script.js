
const robuxInput = document.getElementById("robux");
const rateInput = document.getElementById("rate");
const usdOutput = document.getElementById("usd");
const robuxText = document.getElementById("robuxText");

function calculate() {
    const robux = Math.max(0, Number(robuxInput.value) || 0);
    const rate = Math.max(0, Number(rateInput.value) || 0);

    const usd = robux * rate;

    usdOutput.textContent = usd.toLocaleString("en-US", {
        style: "currency",
        currency: "USD"
    });

    robuxText.textContent =
        robux.toLocaleString("en-US") + " Robux";
}

function setRobux(amount) {
    robuxInput.value = amount;
    calculate();
}

robuxInput.addEventListener("input", calculate);
rateInput.addEventListener("input", calculate);

calculate();
