/**
 * Section: Initialize QR Code
 */
let canvas = false;

const qrcode = new QRCode("qrcode", {
    width: 1000,
    height: 1000,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.L
});

/**
 * Section: Code to handle inputs
 */

// Size of QR Code squares
const sizeSlider = document.getElementById("radiusSize");
const sizeOutput = document.getElementById("printSize");
sizeOutput.innerHTML = sizeSlider.value;
let radiusRatio = sizeSlider.value / 200;

// Update the current slider value
sizeSlider.oninput = function () {
    sizeOutput.innerHTML = this.value;
    radiusRatio = this.value / 200;
};

// Level of error correction (low, medium, high) (excluding quartile)
const correctionSlider = document.getElementById("errorCorrection");
const correctionOutput = document.getElementById("printCorrection");
correctionOutput.innerHTML = correctionSlider.value;
let correctionLevel = correctionSlider.value;

const updateCorrectionLevel = (level) => {
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
};
updateCorrectionLevel(correctionLevel);

correctionSlider.oninput = function () {
    correctionOutput.innerHTML = this.value;
    correctionLevel = this.value;
    updateCorrectionLevel(correctionLevel);
};

// Size of white border (quiet zone)
const borderSlider = document.getElementById("borderSize");
const borderOutput = document.getElementById("printBorderSize");
borderOutput.innerHTML = borderSlider.value;
let borderSizeValue = Number(borderSlider.value);

// Update the current slider value
borderSlider.oninput = function () {
    borderOutput.innerHTML = this.value;
    borderSizeValue = Number(this.value);
};

/**
 * Section: Helper functions for visualizing QR code
 */

const isSafeBit = (i, j, QRLength) => {
    const lowerLimit = 7 + borderSizeValue;
    const upperLimit = QRLength - 8 + borderSizeValue;
    return !(i < lowerLimit && j < lowerLimit || i > upperLimit && j < lowerLimit || i < lowerLimit && j > upperLimit);
};

const drawShape = (ctx, i, j, bitLength, radiusRatio, QRLength) => {
    const xCenter = bitLength * (i + 0.5);
    const yCenter = bitLength * (j + 0.5);
    if (!isSafeBit(i, j, QRLength)) {
        radiusRatio = 0.5;
    }
    const radius = bitLength * radiusRatio;
    ctx.fillRect(xCenter - radius, yCenter - radius, 2 * radius, 2 * radius);
};

/**
 * Download the QR code as a PNG
 */
const download = () => {
    if (!canvas) {
        alert("Error: no QR code to download");
        return;
    }
    const link = document.getElementById("link");
    link.setAttribute("download", "qr_image.png");
    link.setAttribute("href", canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
    link.click();
};

/**
 * Make the QR code
 */
const makeCode = () => {
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

    canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");

    const bitLength = 40;
    const canvasLength = bitLength * (QRLength + borderSizeValue * 2);
    canvas.width = canvasLength;
    canvas.height = canvasLength;

    const black = "#000000";
    const white = "#FFFFFF";

    for (let i = 0; i < QRLength; i++) {
        for (let j = 0; j < QRLength; j++) {
            ctx.fillStyle = QRMatrix[i][j] ? black : white;
            drawShape(ctx, j + borderSizeValue, i + borderSizeValue, bitLength, radiusRatio, QRLength);
        }
    }
};
