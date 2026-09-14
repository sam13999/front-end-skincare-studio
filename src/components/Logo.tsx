import skinViewLogo from "@/assets/brand/skinview-logo.png";

const Logo = ({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) => {
  const sizeMap = {
    sm: "h-10 w-auto",
    md: "h-12 w-auto",
    lg: "h-16 w-auto",
  };

  return (
    <img
      src={skinViewLogo}
      alt="SkinView — Comprends ta peau avant d’acheter."
      width={610}
      height={190}
      className={"block max-w-[190px] object-contain mix-blend-multiply " + sizeMap[size] + " " + className}
      draggable={false}
    />
  );
};

export default Logo;
