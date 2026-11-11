import { useContext } from "react";
import { AuthContext } from "../context/AuthContextWrapper";

const useAuth = () => {
  const context = useContext(AuthContext);
  // 100 lines of codes
  if (context === null) {
    throw new Error("useAuth must be used within an AuthContextWrapper.");
  }

  return context;
};

export default useAuth;
