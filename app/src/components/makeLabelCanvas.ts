import QRious from "qrious";
import { Material } from "../types";

export async function makeLabelCanvas(material: Material): Promise<HTMLCanvasElement | null> {
    const parsedData = material
    if (!parsedData) return null;
    const qrcodeContainer = document.getElementById("qrcode");
    if (!qrcodeContainer) return null;
    while (qrcodeContainer.firstChild) qrcodeContainer.removeChild(qrcodeContainer.firstChild);
    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.maxWidth = '420px';
    wrapper.style.margin = '0 auto';
    wrapper.style.position = 'relative';
    qrcodeContainer.appendChild(wrapper);
    const labelWidth = 420,
        labelHeight = 420,
        borderRadius = 0,
        borderColor = '#22223b',
        borderWidth = 0,
        headerHeight = 56,
        qrSize = 300,
        accentColor = '#1e293b',
        headerText = '#22223b', sectionTitleFont = 'bold 24px Arial';
    const canvas = document.createElement('canvas');
    canvas.width = labelWidth;
    canvas.height = labelHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(borderRadius, 0);
    ctx.lineTo(labelWidth - borderRadius, 0);
    ctx.quadraticCurveTo(labelWidth, 0, labelWidth, borderRadius);
    ctx.lineTo(labelWidth, labelHeight - borderRadius);
    ctx.quadraticCurveTo(labelWidth, labelHeight, labelWidth - borderRadius, labelHeight);
    ctx.lineTo(borderRadius, labelHeight);
    ctx.quadraticCurveTo(0, labelHeight, 0, labelHeight - borderRadius);
    ctx.lineTo(0, borderRadius);
    ctx.quadraticCurveTo(0, 0, borderRadius, 0);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = borderColor;
    ctx.stroke();
    ctx.fillRect(0, 0, labelWidth, headerHeight);
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = headerText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${parsedData.humanId || ''}`, labelWidth / 2, headerHeight / 2);
    const qrTempCanvas = document.createElement('canvas');
    new QRious({ element: qrTempCanvas, value: parsedData._id, size: qrSize, background: 'transparent', padding: 0 });
    ctx.save();
    ctx.fillStyle = '#fff';
    const qrX = (labelWidth - qrSize) / 2;
    const qrY = headerHeight + 32;
    const qrBgRadius = 16;
    ctx.beginPath();
    ctx.moveTo(qrX + qrBgRadius, qrY);
    ctx.lineTo(qrX + qrSize - qrBgRadius, qrY);
    ctx.quadraticCurveTo(qrX + qrSize, qrY, qrX + qrSize, qrY + qrBgRadius);
    ctx.lineTo(qrX + qrSize, qrY + qrSize - qrBgRadius);
    ctx.quadraticCurveTo(qrX + qrSize, qrY + qrSize, qrX + qrSize - qrBgRadius, qrY + qrSize);
    ctx.lineTo(qrX + qrBgRadius, qrY + qrSize);
    ctx.quadraticCurveTo(qrX, qrY + qrSize, qrX, qrY + qrSize - qrBgRadius);
    ctx.lineTo(qrX, qrY + qrBgRadius);
    ctx.quadraticCurveTo(qrX, qrY, qrX + qrBgRadius, qrY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.drawImage(qrTempCanvas, qrX, qrY, qrSize, qrSize);
    ctx.font = sectionTitleFont;
    ctx.fillStyle = accentColor;
    ctx.textAlign = 'left';
    wrapper.appendChild(canvas);
    return canvas;
}
