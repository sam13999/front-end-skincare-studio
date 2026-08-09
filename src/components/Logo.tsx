const Logo = ({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) => {
  const sizeMap = {
    sm: "text-[1.85rem]",
    md: "text-[2.2rem]",
    lg: "text-[2.8rem]",
  };

  return (
    <span className={`font-serif leading-none tracking-[-0.035em] text-foreground ${sizeMap[size]} ${className}`}>
      SkinView
    </span>
  );
};

export default Logo;
