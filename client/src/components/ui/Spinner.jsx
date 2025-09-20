export default function Spinner({
  size = 20,
  stroke = 3,
  variant = "default", // "default" | "inverted" | "mono"
  color,               // optional CSS color for the moving arc
  trackColor           // optional CSS color for the base ring
}) {
  const className = `pv-spinner${variant === "inverted" ? " inverted" : ""}${variant === "mono" ? " mono" : ""}`;
  const style = {
    width: size,
    height: size,
    borderWidth: stroke,
    ...(trackColor ? { borderColor: trackColor } : {}),
    ...(color ? { borderTopColor: color } : {}),
  };
  return <span className={className} style={style} role="status" aria-label="Loading" />;
}
