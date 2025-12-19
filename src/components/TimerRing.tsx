import { motion } from 'framer-motion';

interface TimerRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  isWorkPhase?: boolean;
}

export function TimerRing({ 
  progress, 
  size = 280, 
  strokeWidth = 8,
  isWorkPhase = true 
}: TimerRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth={strokeWidth}
      />
      {/* Progress ring */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={isWorkPhase ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          filter: isWorkPhase ? 'drop-shadow(0 0 10px hsl(75 100% 50% / 0.5))' : 'none',
        }}
      />
    </svg>
  );
}
