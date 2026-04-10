const Logo = ({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) => {
  const sizeMap = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className={sizeMap[size]}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="46" stroke="hsl(var(--gold))" strokeWidth="0.8" />
        {/* Face profile */}
        <path
          d="M42 20 C42 20, 38 30, 38 38 C38 42, 39 46, 42 50 C44 53, 43 56, 40 60 C38 63, 38 67, 40 72 C42 76, 44 78, 46 80"
          stroke="hsl(var(--gold))"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
        />
        {/* Leaf */}
        <path
          d="M55 35 C58 42, 62 50, 58 60 C56 64, 52 66, 50 65"
          stroke="hsl(var(--green-deep))"
          strokeWidth="1"
          fill="hsl(var(--green-deep) / 0.15)"
          strokeLinecap="round"
        />
        <path
          d="M56 37 C56 37, 55 50, 53 60"
          stroke="hsl(var(--green-deep))"
          strokeWidth="0.6"
          strokeLinecap="round"
        />
        <path
          d="M60 30 C63 38, 67 48, 62 58"
          stroke="hsl(var(--green-secondary))"
          strokeWidth="0.8"
          fill="hsl(var(--green-secondary) / 0.1)"
          strokeLinecap="round"
        />
      </svg>
      <div className="text-center">
        <div className="font-serif text-foreground tracking-[0.3em] text-sm font-medium">
          SKINCARE
        </div>
        <div className="font-sans text-warm tracking-[0.5em] text-[9px] font-light mt-0.5">
          STUDIO
        </div>
      </div>
    </div>
  );
};

export default Logo;
