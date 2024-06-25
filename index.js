/**
 * Section: Uploading Images
 */

const imageLoader = document.getElementById("imageLoader");
const uploadCanvas = document.getElementById("imageCanvas");
const uploadContext = uploadCanvas.getContext("2d");
const uploadWidth = 1000;
const uploadHeight = 1000;
let img = false;

imageLoader.addEventListener("change", handleImage, false);

function handleImage(e) {
    const reader = new FileReader();
    reader.onload = (event) => {
        img = new Image();
        img.onload = () => {
            uploadCanvas.style.display = "block";
            uploadCanvas.width = uploadWidth;
            uploadCanvas.height = uploadHeight;
            uploadContext.clearRect(0, 0, uploadWidth, uploadHeight);
            uploadContext.drawImage(img, 0, 0, uploadWidth, uploadHeight);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(e.target.files[0]);
}

/**
 * Section: Initialize QR code and canvas
 */

let canvas = false;

const qrcode = new QRCode("qrcode", {
    width: 1000,
    height: 1000,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.L,
});

/**
 * Section: Code to handle inputs (e.g., sliders)
 */

// Size of QR Code squares
const sizeSlider = document.getElementById("radiusSize");
const sizeOutput = document.getElementById("printSize");
let radiusRatio = sizeSlider.value / 200;

// Display the default slider value
sizeOutput.innerHTML = sizeSlider.value;

sizeSlider.oninput = function () {
    sizeOutput.innerHTML = this.value;
    radiusRatio = this.value / 200;
};

// Level of error correction (low, medium, high) (excluding quartile)
const correctionSlider = document.getElementById("errorCorrection");
const correctionOutput = document.getElementById("printCorrection");
let correctionLevel = correctionSlider.value;

correctionOutput.innerHTML = correctionLevel;
updateCorrectionLevel(correctionLevel);

correctionSlider.oninput = function () {
    correctionLevel = this.value;
    correctionOutput.innerHTML = correctionLevel;
    updateCorrectionLevel(correctionLevel);
};

function updateCorrectionLevel(level) {
    switch (level) {
        case "1":
            qrcode._htOption.correctLevel = QRCode.CorrectLevel.L;
            break;
        case "2":
            qrcode._htOption.correctLevel = QRCode.CorrectLevel.M;
            break;
        case "3":
            qrcode._htOption.correctLevel = QRCode.CorrectLevel.H;
            break;
    }
}

// Size of white border (quiet zone)
const borderSlider = document.getElementById("borderSize");
const borderOutput = document.getElementById("printBorderSize");
let borderSizeValue = Number(borderSlider.value);

// Display the default slider value
borderOutput.innerHTML = borderSizeValue;

borderSlider.oninput = function () {
    borderSizeValue = Number(this.value);
    borderOutput.innerHTML = borderSizeValue;
};

/**
 * Section: Helper functions for visualizing QR code
 */

function isSafeBit(i, j, QRLength) {
    const lowerLimit = 7 + borderSizeValue;
    const upperLimit = QRLength - 8 + borderSizeValue;
    return !((i < lowerLimit && j < lowerLimit) ||
        (i > upperLimit && j < lowerLimit) ||
        (i < lowerLimit && j > upperLimit));
}

function drawShape(ctx, i, j, bitLength, radiusRatio, QRLength) {
    const xCenter = bitLength * (i + 0.5);
    const yCenter = bitLength * (j + 0.5);
    const radius = bitLength * (isSafeBit(i, j, QRLength) ? radiusRatio : 0.5);
    ctx.fillRect(xCenter - radius, yCenter - radius, 2 * radius, 2 * radius);
}

/**
 * Download the QR code as a PNG
 */
function download() {
    if (!canvas) {
        alert("Error: no QR code to download");
        return;
    }
    const link = document.getElementById("link");
    link.setAttribute("download", "qr_image.png");
    link.setAttribute("href", canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
    link.click();
}

/**
 * Make the QR code
 */
function makeCode() {
    const elementText = document.getElementById("text");
    const url = elementText.value;

    if (!url) {
        alert("Error: empty input");
        elementText.focus();
        return;
    }

    qrcode.makeCode(url);

    const QRMatrix = qrcode._oQRCode.modules;
    const QRLength = QRMatrix.length;
    const bitLength = 40;
    const canvasLength = bitLength * (QRLength + borderSizeValue * 2);
    canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = canvasLength;
    canvas.height = canvasLength;

    if (img) {
        ctx.drawImage(img, bitLength * borderSizeValue, bitLength * borderSizeValue, bitLength * QRLength, bitLength * QRLength);
    }

    const black = "#000000";
    const white = "#FFFFFF";

    for (let i = 0; i < QRLength; i++) {
        for (let j = 0; j < QRLength; j++) {
            ctx.fillStyle = QRMatrix[i][j] ? black : white;
            drawShape(ctx, j + borderSizeValue, i + borderSizeValue, bitLength, radiusRatio, QRLength);
        }
    }
}
