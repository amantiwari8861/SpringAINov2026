import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContextWrapper";

const useTheme = () => {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error("useTheme must be used within a ThemeContextWrapper.");
  }

  return context;
};

export default useTheme;
