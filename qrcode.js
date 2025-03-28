document.addEventListener("DOMContentLoaded", () => {
    const urlInput = document.getElementById("urlInput");
    const generateBtn = document.getElementById("generateBtn");
    const qrContainer = document.getElementById("qrContainer");

// 🛑 Right Click Disable
document.addEventListener("contextmenu", (event) => event.preventDefault());

// 🛑 Keyboard Shortcuts Disable
document.addEventListener("keydown", (event) => {
    if (
        event.ctrlKey && 
        (event.key === "u" || event.key === "U" ||   // Ctrl+U (View Source)
        event.key === "s" || event.key === "S" ||   // Ctrl+S (Save Page)
        event.key === "i" || event.key === "I" ||   // Ctrl+I (DevTools)
        event.key === "j" || event.key === "J") ||  // Ctrl+J (Console)
        event.key === "F12" ||                      // F12 (DevTools)
        event.key === "PrintScreen"                 // PrintScreen (Screenshot)
    ) {
        event.preventDefault();
    }
});

// 🛑 Developer Console Detection
setInterval(() => {
    if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
        document.body.innerHTML = `<h2 style="color:red;text-align:center;margin-top:20%;">DevTools Detected! Please Close It.</h2>`;
    }
}, 1000);
    
    function generateQRCode() {
        let url = urlInput.value.trim();
        if (url === "") {
            alert("⚠️ Please enter a valid URL!");
            return;
        }

        // Auto-detect missing "http://" or "https://"
        if (!/^https?:\/\//i.test(url)) {
            url = "https://" + url;
        }

        // Remove previous QR code
        qrContainer.innerHTML = "";

        // Generate QR code using QRious
        let qr = new QRious({
            element: document.createElement("canvas"),
            value: url,
            size: 250
        });

        // Append QR code as an image
        const qrImage = document.createElement("img");
        qrImage.src = qr.toDataURL();
        qrContainer.appendChild(qrImage);
        qrContainer.classList.add("show");
    }

    // Event Listener
    generateBtn.addEventListener("click", generateQRCode);
});
          
