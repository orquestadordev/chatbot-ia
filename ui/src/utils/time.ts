export const formatTime = (timestamp: number): string => {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  }).format(timestamp);
};
