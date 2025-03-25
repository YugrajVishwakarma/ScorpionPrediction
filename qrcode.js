document.addEventListener("DOMContentLoaded", () => {
    const urlInput = document.getElementById("urlInput");
    const generateBtn = document.getElementById("generateBtn");
    const qrContainer = document.getElementById("qrContainer");

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
          
