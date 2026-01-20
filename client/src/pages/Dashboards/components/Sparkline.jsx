export default function Sparkline({ points = [] }) {
  if (!points.length) return <div style={{ height: 36 }} />;

  const w = 120;
  const h = 36;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const norm = (v) => (max === min ? h / 2 : h - ((v - min) / (max - min)) * h);
  const step = w / (points.length - 1);

  const d = points.map((v, i) => `${i === 0 ? "M" : "L"}${i * step},${norm(v)}`).join(" ");

  return (
    <svg width={w} height={h} role="img" aria-label="trend">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
