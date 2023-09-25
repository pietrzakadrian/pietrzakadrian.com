const getDefaultColorMode = (): "dark" | "light" => {
  if (typeof window === "undefined") {
    return "dark";
  }

  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const hasMediaQueryPreference = typeof mql.matches !== "undefined";
  if (hasMediaQueryPreference) {
    return mql.matches ? "dark" : "light";
  }

  return "dark";
};

export default getDefaultColorMode;
