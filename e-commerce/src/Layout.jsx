import { Outlet, useLocation } from "react-router";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import FloatingChatbot from "./components/FloatingChatbot";

const withoutFooter = ["/login", "/register"];

const Layout = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-canvas font-sans text-body">
      <ToastContainer position="top-right" theme="colored" />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <FloatingChatbot/>
      {withoutFooter.includes(location.pathname) ? null : <Footer />}
    </div>
  );
};

export default Layout;
