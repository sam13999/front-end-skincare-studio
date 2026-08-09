import skinViewLogo from "@/assets/brand/skinview-logo.png";

const Logo = ({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) => {
  const sizeMap = {
    sm: "h-9 w-auto",
    md: "h-11 w-auto",
    lg: "h-14 w-auto",
  };

  return (
    <img
      src={skinViewLogo}
      alt="SkinView"
      width={610}
      height={190}
      className={`block object-contain ${sizeMap[size]} ${className}`}
      draggable={false}
    />
  );
};

export default Logo;
