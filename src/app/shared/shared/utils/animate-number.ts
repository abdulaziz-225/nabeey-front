// Raqamni `from` dan `to` gacha silliq sanab chiqadi (ease-out). Bekor qilish funksiyasini qaytaradi.
// "Kamroq harakat" sozlamasi yoqilgan bo'lsa, darhol yakuniy qiymatni beradi.
export function animateNumber(from: number, to: number, durationMs: number, onUpdate: (value: number) => void): () => void {
  const reduceMotion = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || durationMs <= 0 || from === to) {
    onUpdate(to);
    return () => {};
  }

  let frame = 0;
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = 1 - Math.pow(1 - t, 3);
    onUpdate(Math.round(from + (to - from) * eased));
    if (t < 1) {
      frame = requestAnimationFrame(step);
    }
  };
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
}
