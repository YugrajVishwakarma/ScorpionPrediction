// ✅ Check if Brain.js is Loaded
if (typeof brain === "undefined") {
    console.error("⚠️ Brain.js is NOT loaded! Check your script tag.");
} else {
    console.log("✅ Brain.js loaded successfully!");
}

// ✅ Initialize Neural Network
const net = new brain.NeuralNetwork();

// ✅ Prediction History Data
let historyData = [];
let totalWins = 0, totalLosses = 0;
let balance = 100;  // Starting balance

// ✅ Function to Update Timer
function updateTimer() {
    let now = new Date();
    let seconds = now.getUTCSeconds();
    let remainingSeconds = 60 - seconds;
    document.getElementById("timer").innerText = remainingSeconds;
    if (remainingSeconds === 60) updatePrediction();
}
setInterval(updateTimer, 1000);

// ✅ Function to Fetch Game Result
async function fetchGameResult() {
    try {
        const response = await fetch("https://api.bdg88zf.com/api/webapi/GetNoaverageEmerdList", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                pageSize: 10,
                pageNo: 1,
                typeId: 1,
                language: 0,
                random: "4a0522c6ecd8410496260e686be2a57c",
                signature: "334B5E70A0C9B8918B0B15E517E2069C",
                timestamp: Math.floor(Date.now() / 1000)
            })
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        let data = await response.json();
        let latestResult = data?.data?.list?.[0];

        return latestResult ? { period: latestResult.issueNumber, result: latestResult.number } : null;
    } catch (error) {
        console.error("Error fetching game result:", error);
        return null;
    }
}

// ✅ Train AI Model from History
function trainModel() {
    if (historyData.length < 5) return; // Minimum 5 records needed

    let trainingData = historyData.map(h => ({
        input: { num: parseInt(h.result) / 10 },
        output: { big: h.result >= 5 ? 1 : 0, small: h.result < 5 ? 1 : 0 }
    }));

    net.train(trainingData, { iterations: 200, errorThresh: 0.005 });
}

// ✅ AI Based Smart Prediction
function smartPredict() {
    if (historyData.length < 5) {
        return { type: Math.random() > 0.5 ? "BIG" : "SMALL" };
    }

    let lastResult = parseInt(historyData[0].result) / 10;
    let output = net.run({ num: lastResult });

    return output.big > output.small ? { type: "BIG" } : { type: "SMALL" };
}

// ✅ Update Prediction
async function updatePrediction() {
    let apiResult = await fetchGameResult();
    if (!apiResult) return;

    let currentPeriod = (BigInt(apiResult.period) + 1n).toString();
    let prediction = smartPredict();

    document.getElementById("currentPeriod").innerText = currentPeriod;
    document.getElementById("prediction").innerText = prediction.type;

    historyData.unshift({ period: currentPeriod, prediction: prediction.type, result: "-", resultStatus: "Pending" });

    updateHistory();
}

// ✅ Check Results & Update Balance
async function checkAndUpdateResults() {
    let latestResult = await fetchGameResult();
    if (!latestResult) return;

    historyData.forEach((entry) => {
        if (entry.period === latestResult.period && entry.result === "-") {
            entry.result = latestResult.result;
            let actualType = parseInt(latestResult.result) >= 5 ? "BIG" : "SMALL";

            let bettingAmount = balance * 0.02; // 2% Betting Fee
            balance -= bettingAmount;

            if (entry.prediction === actualType) {
                entry.resultStatus = "✅ Win";
                totalWins++;
                balance += bettingAmount * 2;
            } else {
                entry.resultStatus = "❌ Loss";
                totalLosses++;
            }
        }
    });

    document.getElementById("totalWins").innerText = totalWins;
    document.getElementById("totalLosses").innerText = totalLosses;
    document.getElementById("balance").innerText = balance.toFixed(2);

    let accuracy = totalWins + totalLosses > 0 ? (totalWins / (totalWins + totalLosses) * 100).toFixed(2) : "0.00";
    document.getElementById("accuracy").innerText = accuracy + "%";

    trainModel(); // Train AI Model with New Data
    updateHistory();
}

// ✅ Update History UI
function updateHistory() {
    let historyList = document.getElementById("historyList");
    historyList.innerHTML = historyData
        .map(item => `<p>📅 ${item.period} | 🎯 ${item.prediction} | 🎲 ${item.result} | ${item.resultStatus}</p>`)
        .join('');
}

// ✅ Toggle Dark Mode (Fixed Click Event)
document.getElementById("toggleMode").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});

// ✅ Interval for Auto-Checking Results
setInterval(checkAndUpdateResults, 5000);
updatePrediction();
