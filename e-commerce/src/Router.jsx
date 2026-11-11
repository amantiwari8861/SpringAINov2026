import { createBrowserRouter } from "react-router";
import Layout from "./Layout";
import LandingPage from "./pages/LandingPage";
import NotFound from "./components/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import LearnUseEffect from "./components/LearnUseEffect";
import WrappingChild from "./components/WrappingChild";
import Dashboard from "./pages/admin/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ProductDetails from "./components/ProductDetails";
import Cart from "./pages/Cart";
import LearnUseRef from "./components/LearnUseRef";
import Memoization from "./components/Memoization";
import DataTable from './pages/DataTable'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        index: true,
        element: <LandingPage />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "services",
        element: <Services />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "wrapping",
        element: <WrappingChild />,
      },
      {
        path: "cart",
        element: <Cart />,
      },
      {
        path: "product/:prodId",
        element: <ProductDetails />,
      },
      {
        path: "learn-ref",
        element: <LearnUseRef />,
      },
      {
        path: "data-table",
        element: <DataTable />,
      },
      {
        path: "learn-memo",
        element: <Memoization />,
      },
      {
        path: "dashboard/admin",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default router;
