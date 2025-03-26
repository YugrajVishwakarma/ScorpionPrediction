// ✅ Check if Brain.js is Loaded
if (typeof brain === "undefined") {
    console.error("⚠️ Brain.js is NOT loaded! Check your script tag.");
} else {
    console.log("✅ Brain.js loaded successfully!");
}

// ✅ Initialize Neural Network with Deep Learning Config
const net = new brain.NeuralNetwork({
    hiddenLayers: [10, 20, 10], // Deep Learning Layers
    iterations: 1000, // More Iterations for Accuracy
    errorThresh: 0.002 // Lower Error Threshold
});

// ✅ Prediction History Data
let historyData = [];
let totalWins = 0, totalLosses = 0;
let balance = 100;  // Starting balance

// ✅ KNN Hybrid Model Function
function knnPredict() {
    if (historyData.length < 3) return Math.random() > 0.5 ? "BIG" : "SMALL";
    
    let bigCount = historyData.slice(0, 5).filter(h => h.result >= 5).length;
    let smallCount = 5 - bigCount;
    
    return bigCount > smallCount ? "BIG" : "SMALL";
}

// ✅ Smart Betting Strategy (Dynamic Bet Sizing)
function calculateBetAmount() {
    let riskFactor = totalLosses / (totalWins + 1);
    return Math.min(20, 10 + riskFactor * 5);
}

// ✅ Reinforcement Learning – AI Learns from Mistakes
function trainModel() {
    if (historyData.length < 5) return;

    let trainingData = historyData.map(h => ({
        input: { num: parseInt(h.result) / 10 },
        output: { big: h.result >= 5 ? 1 : 0, small: h.result < 5 ? 1 : 0 }
    }));

    net.train(trainingData, { iterations: 500, errorThresh: 0.002 });
}

// ✅ AI Based Hybrid Prediction (Neural + KNN)
function smartPredict() {
    if (historyData.length < 5) return { type: Math.random() > 0.5 ? "BIG" : "SMALL" };

    let knnPrediction = knnPredict();
    let lastResult = parseInt(historyData[0].result) / 10;
    let nnOutput = net.run({ num: lastResult });

    return nnOutput.big > nnOutput.small ? { type: knnPrediction } : { type: "SMALL" };
}

// ✅ Fetch Game Result
async function fetchGameResult() {
    try {
        const response = await fetch("https://api.bigdaddygame.cc/api/webapi/GetNoaverageEmerdList", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=UTF-8",
                "Accept": "application/json, text/plain, */*",
                "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "Ar-Origin": "https://bdgab.com"
            },
            body: JSON.stringify({
                pageSize: 10,
                pageNo: 1,
                typeId: 30,
                language: 0,
                random: "3ee683f5d5014cf29714726429be4670",
                signature: "4ECD87B5B1BA526C1A5D020E26A153B7",
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

// ✅ Update Prediction Every 30 Seconds
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

            let bettingAmount = calculateBetAmount();
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

    trainModel();
    updateHistory();
}

// ✅ Update History UI
function updateHistory() {
    let historyList = document.getElementById("historyList");
    historyList.innerHTML = historyData
        .map(item => `<p>📅 ${item.period} | 🎯 ${item.prediction} | 🎲 ${item.result} | ${item.resultStatus}</p>`)
        .join('');
}

// ✅ Toggle Dark Mode
document.getElementById("toggleMode").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});

// ✅ Timer Update Every Second
function updateTimer() {
    let now = new Date();
    let seconds = now.getUTCSeconds();
    let remainingSeconds = 30 - (seconds % 30);
    document.getElementById("timer").innerText = remainingSeconds;
    if (remainingSeconds === 30) updatePrediction();
}
setInterval(updateTimer, 1000);

// ✅ Auto-Check Results Every 5 Seconds
setInterval(checkAndUpdateResults, 5000);
