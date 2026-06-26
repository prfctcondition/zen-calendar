import { useEffect, useRef } from 'react';
import { GoogleEvent } from '../types';

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

function playRemindSound() {
  playTone(880, 0.15, 'sine', 0.25);
  setTimeout(() => playTone(1100, 0.2, 'sine', 0.25), 180);
}

function playStartSound() {
  playTone(523, 0.15, 'sine', 0.3);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.3), 160);
  setTimeout(() => playTone(784, 0.25, 'sine', 0.3), 320);
}

export function useNotifications(events: GoogleEvent[]) {
  const notified = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!events.length) return;

    const check = () => {
      const now = Date.now();
      const fiveMin = 5 * 60 * 1000;

      for (const event of events) {
        const dt = event.start.dateTime;
        if (!dt) continue;

        const start = new Date(dt).getTime();
        const diff = start - now;

        const remindKey = `${event.id}::remind`;
        const startKey = `${event.id}::start`;

        if (diff > 0 && diff <= fiveMin && !notified.current.has(remindKey)) {
          notified.current.add(remindKey);
          playRemindSound();
        }

        if (diff <= 0 && diff > -60_000 && !notified.current.has(startKey)) {
          notified.current.add(startKey);
          playStartSound();
        }
      }
    };

    check();
    const interval = setInterval(check, 30_000);
    return () => clearInterval(interval);
  }, [events]);
}
