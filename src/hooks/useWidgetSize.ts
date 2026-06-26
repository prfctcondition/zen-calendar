import { useEffect, useState } from 'react';

interface WidgetSize {
  width: number;
  height: number;
  fontSize: number;
}

function calcSize(screenW: number, screenH: number): WidgetSize {
  const scale = Math.min(screenW / 1920, screenH / 1080);
  return {
    width: Math.round(Math.min(Math.max(320 * scale, 320), 560)),
    height: Math.round(Math.min(Math.max(460 * scale, 440), 700)),
    fontSize: Math.round(Math.min(Math.max(14 * scale, 11), 18)),
  };
}

export function useWidgetSize() {
  const [size, setSize] = useState<WidgetSize>({ width: 400, height: 560, fontSize: 14 });

  useEffect(() => {
    const update = async () => {
      if (window.electronAPI) {
        const { width, height } = await window.electronAPI.getScreenSize();
        setSize(calcSize(width, height));
      }
    };
    update();
    const onResize = () => update();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return size;
}
