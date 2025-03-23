let historyData = [];
let lastFetchedPeriod = 0;
let totalWins = 0, totalLosses = 0;
let balance = 100;  // Starting balance
let betAmount = 10; // Auto bet amount
let platformFee = 0.02; // 2% fee

function updateTimer() {
    let now = new Date();
    let seconds = now.getUTCSeconds();
    let remainingSeconds = 60 - seconds;
    document.getElementById("timer").innerText = remainingSeconds;
    if (remainingSeconds === 60) updatePrediction();
}

setInterval(updateTimer, 1000);

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

function smartPredict() {
    if (historyData.length < 5) {
        return { type: Math.random() > 0.5 ? "BIG" : "SMALL" };
    }

    let lastResults = historyData.slice(0, 5).map(h => parseInt(h.result));
    let bigCount = lastResults.filter(num => num >= 5).length;
    let smallCount = lastResults.filter(num => num < 5).length;

    let bigProbability = bigCount / 5;
    let smallProbability = smallCount / 5;

    return bigProbability > smallProbability ? { type: "BIG" } : { type: "SMALL" };
}

async function updatePrediction() {
    let apiResult = await fetchGameResult();
    if (!apiResult || apiResult.period === lastFetchedPeriod) return;

    lastFetchedPeriod = apiResult.period;
    let currentPeriod = (BigInt(apiResult.period) + 1n).toString();
    let prediction = smartPredict();

    document.getElementById("currentPeriod").innerText = currentPeriod;
    document.getElementById("prediction").innerText = prediction.type;

    // **Auto Betting System**
    let fee = betAmount * platformFee; // 2% fee calculation
    let finalBetAmount = betAmount - fee; // ₹9.80 if ₹10 bet
    balance -= betAmount; // Deduct ₹10 from balance

    historyData.unshift({ period: currentPeriod, prediction: prediction.type, result: "-", resultStatus: "Pending", betAmount: finalBetAmount });
    updateHistory();
}

async function checkAndUpdateResults() {
    let latestResult = await fetchGameResult();
    if (!latestResult) return;

    historyData.forEach((entry) => {
        if (entry.period === latestResult.period && entry.result === "-") {
            entry.result = latestResult.result;
            let actualType = parseInt(latestResult.result) >= 5 ? "BIG" : "SMALL";

            if (entry.prediction === actualType) {
                entry.resultStatus = "✅ Win";
                totalWins++;

                let winAmount = entry.betAmount * 2; // ₹9.80 * 2 = ₹19.60
                balance += winAmount;
            } else {
                entry.resultStatus = "❌ Loss";
                totalLosses++;
            }
        }
    });

    document.getElementById("totalWins").innerText = totalWins;
    document.getElementById("totalLosses").innerText = totalLosses;
    let accuracy = totalWins + totalLosses > 0 ? (totalWins / (totalWins + totalLosses) * 100).toFixed(2) : "0.00";
    document.getElementById("accuracy").innerText = accuracy + "%";
    document.getElementById("balance").innerText = balance.toFixed(2);
    updateHistory();
}

function updateHistory() {
    let historyList = document.getElementById("historyList");
    historyList.innerHTML = historyData
        .map(item => `<p>📅 ${item.period} | 🎯 ${item.prediction} | 🎲 ${item.result} | ${item.resultStatus}</p>`)
        .join('');
}

document.getElementById("toggleMode").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});

setInterval(checkAndUpdateResults, 5000);
updatePrediction();
              
