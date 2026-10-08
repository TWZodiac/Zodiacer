import { SIGN_PROFILES, ELEMENT_COLOR } from "@/domain/signs";

/** 星座連線圖；locked 時只顯示暗淡的星點 */
export function ConstellationArt({
  sign,
  size = 120,
  locked = false,
  className = "",
}: {
  sign: number;
  size?: number;
  locked?: boolean;
  className?: string;
}) {
  const profile = SIGN_PROFILES[sign];
  const { stars, lines } = profile.constellation;
  const color = locked ? "var(--ink-soft)" : ELEMENT_COLOR[profile.element];
  return (
    <svg viewBox="-6 -6 112 112" width={size} height={size} className={className} role="img" aria-label={`${profile.name}座星圖`}>
      {!locked &&
        lines.map(([a, b], i) => (
          <line
            key={i}
            x1={stars[a][0]}
            y1={stars[a][1]}
            x2={stars[b][0]}
            y2={stars[b][1]}
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.75}
          />
        ))}
      {stars.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={locked ? 3 : 5}
          fill={locked ? "var(--ink-soft)" : "var(--star)"}
          stroke={locked ? "none" : "var(--line)"}
          strokeWidth={2}
          opacity={locked ? 0.35 : 1}
        />
      ))}
    </svg>
  );
}
