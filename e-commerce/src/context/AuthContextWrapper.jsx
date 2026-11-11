import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const registeredUsers = [];
const AuthContext = createContext(null);
const AuthContextWrapper = ({ children }) => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [userPrinciple, setUserPrinciple] = useState({});
  const login = (email, password) => {
    const [userByEmail] = registeredUsers.filter((u) => u.email === email);
    if (!userByEmail) {
      toast.error("Account Doesn't Exist!");
      throw new Error("Account Doesn't Exist!");
    }
    if (userByEmail.password === password) {
      setLoggedIn(true);
      setUserPrinciple(userByEmail);
    } else {
      toast.error("Invalid Credentials!");
      throw new Error("Invalid Credentials!");
    }
    // Backend API Calling
  };
  const register = (name, email, password) => {
    registeredUsers.push({
      name,
      email,
      password,
      imageUrl:
        "https://media.licdn.com/dms/image/v2/D4D03AQGUA-JV_LJVig/profile-displayphoto-scale_200_200/B4DaDMzbn6JAAc-/0/1790142431283?e=2147483647&v=beta&t=iYk9su1UAKRahl5mUUN5t2v8a1lauzlQWX7ib22viRE",
    });
  };
  const logout = () => {
    setLoggedIn(false);
    setUserPrinciple({});
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, login, logout, userPrinciple, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextWrapper;
export { AuthContext };

// created a Wrapper -> Data Provier
// created a context
// created a custom Hook
