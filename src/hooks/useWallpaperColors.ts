import { useState, useEffect } from 'react';

interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textSecondary: string;
  muted: string;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
}

function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function extractColors(imageData: ImageData): ColorScheme {
  const data = imageData.data;
  const pixels: number[][] = [];
  const step = 4; // sample every 4th pixel for speed

  for (let i = 0; i < data.length; i += 4 * step) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r + g + b > 20) pixels.push([r, g, b]);
  }

  if (pixels.length === 0) return defaultScheme();

  // Simple k-means clustering with 2 clusters
  const clusters = kmeans(pixels, 3, 10);

  // Sort clusters by size (descending)
  clusters.sort((a, b) => b.items.length - a.items.length);

  const dominant = clusters[0].center;
  const second = clusters.length > 1 ? clusters[1].center : dominant;
  const lum = luminance(dominant[0], dominant[1], dominant[2]);

  // Determine if background should be light or dark
  const isDark = lum < 0.5;

  const primary = rgbToHex(dominant[0], dominant[1], dominant[2]);
  const secondary = rgbToHex(second[0], second[1], second[2]);

  // Accent: complementary of dominant
  const accent = rgbToHex(255 - dominant[0], 255 - dominant[1], 255 - dominant[2]);

  // Text colors with contrast
  const text = isDark ? '#F8FAFC' : '#0F172A';
  const textSecondary = isDark ? '#CBD5E1' : '#475569';
  const muted = isDark ? '#64748B' : '#94A3B8';

  return { primary, secondary, accent, text, textSecondary, muted };
}

function kmeans(pixels: number[][], k: number, maxIter: number): Array<{ center: number[]; items: number[][] }> {
  // Initialize centers randomly
  const centers: number[][] = [];
  for (let i = 0; i < k; i++) {
    centers.push([pixels[i][0], pixels[i][1], pixels[i][2]]);
  }

  const clusters: Array<{ center: number[]; items: number[][] }> = [];
  for (let iter = 0; iter < maxIter; iter++) {
    // Assign pixels to nearest center
    clusters.length = 0;
    for (let i = 0; i < k; i++) clusters.push({ center: centers[i], items: [] });

    for (const px of pixels) {
      let minDist = Infinity;
      let minIdx = 0;
      for (let i = 0; i < k; i++) {
        const d = (px[0] - centers[i][0]) ** 2 + (px[1] - centers[i][1]) ** 2 + (px[2] - centers[i][2]) ** 2;
        if (d < minDist) { minDist = d; minIdx = i; }
      }
      clusters[minIdx].items.push(px);
    }

    // Recalculate centers
    for (let i = 0; i < k; i++) {
      if (clusters[i].items.length === 0) continue;
      const sum = [0, 0, 0];
      for (const px of clusters[i].items) { sum[0] += px[0]; sum[1] += px[1]; sum[2] += px[2]; }
      const n = clusters[i].items.length;
      centers[i] = [sum[0] / n, sum[1] / n, sum[2] / n];
    }
  }

  return clusters;
}

function defaultScheme(): ColorScheme {
  return { primary: '#000000', secondary: '#1A1A1A', accent: '#FFFFFF', text: '#F0F0F0', textSecondary: '#A0A0A0', muted: '#606060' };
}

export function useWallpaperColors(): ColorScheme {
  const [scheme, setScheme] = useState<ColorScheme>(defaultScheme);

  useEffect(() => {
    (async () => {
      try {
        const wallpaper = await window.electronAPI.getWallpaper();
        if (!wallpaper || !wallpaper.dataUri) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = wallpaper.dataUri;
        });

        const canvas = document.createElement('canvas');
        canvas.width = 80;
        canvas.height = Math.round(80 * (img.height / img.width));
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Extract dominant brightness and map to grayscale
        const colors = extractColors(imageData);
        const gray = colors.primary;
        // Convert hex to grayscale value
        const r = parseInt(gray.slice(1, 3), 16);
        const g = parseInt(gray.slice(3, 5), 16);
        const b = parseInt(gray.slice(5, 7), 16);
        const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        const bg = lum < 128 ? '#0A0A0A' : '#1A1A1A';
        const textMain = lum < 128 ? '#E8E8E8' : '#F0F0F0';
        const textSec = lum < 128 ? '#909090' : '#A0A0A0';
        const mutedCol = lum < 128 ? '#505050' : '#606060';
        setScheme({ primary: bg, secondary: '#141414', accent: '#FFFFFF', text: textMain, textSecondary: textSec, muted: mutedCol });
      } catch (_) {}
    })();
  }, []);

  return scheme;
}
