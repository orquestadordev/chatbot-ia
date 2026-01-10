import clsx from "clsx";

interface ConnectionBadgeProps {
  state: "ready" | "responding" | "error";
  label: string;
}

export const ConnectionBadge = ({ state, label }: ConnectionBadgeProps) => {
  return (
    <span className={clsx("connection-badge", `connection-badge--${state}`)}>
      <span className="connection-badge__dot" aria-hidden />
      <span className="connection-badge__label">{label}</span>
    </span>
  );
};
