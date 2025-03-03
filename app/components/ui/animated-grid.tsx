import { useTheme } from "next-themes";

export const AnimatedGrid = () => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-background">
      <div className="absolute h-full w-full">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${
              isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)"
            } 1.5px, transparent 1.5px), linear-gradient(to right, ${
              isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)"
            } 1.5px, transparent 1.5px)`,
            backgroundSize: "35px 35px",
            animation: "moveGrid 15s linear infinite"
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${
              isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)"
            } 1px, transparent 1px), linear-gradient(to right, ${
              isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)"
            } 1px, transparent 1px)`,
            backgroundSize: "100px 100px",
            animation: "moveGrid 20s linear infinite"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
      </div>
    </div>
  );
}; 