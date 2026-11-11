import { Navigate } from "react-router";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();

  return isLoggedIn === true ? children : <Navigate to={"/login"} />;
};

export default ProtectedRoute;
