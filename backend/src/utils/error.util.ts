export const isAbortError = (error: unknown): boolean => {
  if (!error) return false;

  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }

  if ((error as { name?: string }).name === "AbortError") {
    return true;
  }

  return false;
};
