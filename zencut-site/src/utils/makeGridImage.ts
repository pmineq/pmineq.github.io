import { loadImage } from './loadImage';

type StoryCutOptions = {
  width?: number;
  height?: number;
  background?: string;
};

export async function makeStoryCutImageDataUrl(
  dataUrls: string[],
  opts: StoryCutOptions = {}
) {
  const selected = dataUrls.slice(0, 4);
  const {
    width = 1080,
    height = 1920,
    background = '#ffe4f2',
  } = opts;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  drawPinkPlaidBackground(ctx, width, height, background);

  const margin = 72;
  const gap = 18;
  const cellWidth = (width - margin * 2 - gap) / 2;
  const cellHeight = Math.round(cellWidth * 1.44);
  const top = 164;
  const images = await Promise.all(selected.map(loadImage));

  images.forEach((img, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + col * (cellWidth + gap);
    const y = top + row * (cellHeight + gap);
    drawPhotoSlot(ctx, img, x, y, cellWidth, cellHeight);
  });

  return canvas.toDataURL('image/png');
}

function drawPinkPlaidBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fallback: string
) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#fff8fb');
  gradient.addColorStop(0.38, fallback);
  gradient.addColorStop(0.72, '#ffd6e9');
  gradient.addColorStop(1, '#fff1f8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  drawPlaidLines(ctx, width, height, 36, 'rgba(255, 255, 255, 0.72)', 2);
  drawPlaidLines(ctx, width, height, 72, 'rgba(242, 108, 169, 0.22)', 5);
  drawPlaidLines(ctx, width, height, 144, 'rgba(111, 90, 130, 0.26)', 3);
  drawPlaidLines(ctx, width, height, 288, 'rgba(70, 61, 86, 0.18)', 8);
  ctx.restore();

  drawHologramWash(ctx, width, height);
  drawLaceTrim(ctx, width, height);
  drawStoryCharms(ctx, width, height);
}

function drawPhotoSlot(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  ctx.save();
  roundRect(ctx, x, y, width, height, 8);
  ctx.clip();
  drawImageCover(ctx, img, x, y, width, height);

  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = 'rgba(255, 173, 214, 0.18)';
  ctx.fillRect(x, y, width, height);
  ctx.globalCompositeOperation = 'source-over';
  drawNoise(ctx, x, y, width, height);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = 5;
  roundRect(ctx, x, y, width, height, 8);
  ctx.stroke();
  ctx.restore();
}

function drawPlaidLines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  step: number,
  color: string,
  lineWidth: number
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  for (let x = 0; x <= width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

function drawHologramWash(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const bands = [
    { x: -width * 0.15, y: height * 0.08, w: width * 1.3, h: 62, color: 'rgba(193, 235, 255, 0.24)', angle: -12 },
    { x: -width * 0.10, y: height * 0.58, w: width * 1.18, h: 78, color: 'rgba(255, 255, 255, 0.30)', angle: -10 },
    { x: width * 0.18, y: height * 0.78, w: width * 0.92, h: 52, color: 'rgba(215, 198, 255, 0.20)', angle: -14 },
  ];

  for (const band of bands) {
    ctx.save();
    ctx.translate(band.x + band.w / 2, band.y + band.h / 2);
    ctx.rotate((band.angle * Math.PI) / 180);
    ctx.fillStyle = band.color;
    ctx.fillRect(-band.w / 2, -band.h / 2, band.w, band.h);
    ctx.restore();
  }

  ctx.restore();
}

function drawLaceTrim(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.62)';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.34)';
  ctx.lineWidth = 3;

  for (let x = 70; x <= width - 70; x += 42) {
    ctx.beginPath();
    ctx.arc(x, 50, 12, 0, Math.PI, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, height - 50, 12, Math.PI, 0, false);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, 50, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, height - 50, 3.8, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let y = 86; y <= height - 86; y += 42) {
    ctx.beginPath();
    ctx.arc(50, y, 12, -Math.PI / 2, Math.PI / 2, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width - 50, y, 12, Math.PI / 2, -Math.PI / 2, false);
    ctx.stroke();
  }

  ctx.restore();
}

function drawStoryCharms(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const sparkles = [
    { x: 96, y: 110, size: 18 },
    { x: width - 126, y: 112, size: 15 },
    { x: width - 72, y: 774, size: 12 },
    { x: 66, y: 940, size: 13 },
    { x: 176, y: height - 128, size: 16 },
    { x: width - 184, y: height - 118, size: 18 },
  ];

  for (const sparkle of sparkles) {
    drawSparkle(ctx, sparkle.x, sparkle.y, sparkle.size);
  }

  drawHeartCharm(ctx, 128, height - 160, 32, -10);
  drawHeartCharm(ctx, width - 168, 92, 28, 8);
  drawPearlCluster(ctx, width - 126, height - 174);
}

function drawSparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.82)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size);
  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);
  ctx.moveTo(x - size * 0.52, y - size * 0.52);
  ctx.lineTo(x + size * 0.52, y + size * 0.52);
  ctx.moveTo(x + size * 0.52, y - size * 0.52);
  ctx.lineTo(x - size * 0.52, y + size * 0.52);
  ctx.stroke();
  ctx.restore();
}

function drawHeartCharm(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(size / 32, size / 32);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.86)';
  ctx.fillStyle = 'rgba(255, 156, 205, 0.22)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 9);
  ctx.bezierCurveTo(-16, -4, -26, 14, -8, 28);
  ctx.bezierCurveTo(-3, 32, 0, 34, 0, 34);
  ctx.bezierCurveTo(0, 34, 3, 32, 8, 28);
  ctx.bezierCurveTo(26, 14, 16, -4, 0, 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawPearlCluster(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
) {
  ctx.save();
  const dots = [
    [0, 0, 7],
    [20, 10, 5],
    [38, -4, 6],
    [58, 9, 4],
    [76, -2, 5],
  ];
  ctx.fillStyle = 'rgba(255, 255, 255, 0.58)';
  for (const [dx, dy, radius] of dots) {
    ctx.beginPath();
    ctx.arc(x + dx, y + dy, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
  const sw = width / scale;
  const sh = height / scale;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, width, height);
}

function drawNoise(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const density = 5200;
  ctx.save();
  ctx.globalAlpha = 0.07;
  for (let i = 0; i < density; i += 1) {
    const nx = x + Math.random() * width;
    const ny = y + Math.random() * height;
    const value = Math.random() > 0.5 ? 255 : 120;
    ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
    ctx.fillRect(nx, ny, 1.2, 1.2);
  }
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}
