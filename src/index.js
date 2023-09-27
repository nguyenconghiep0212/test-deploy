import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Footer from "./views/footer";
import Gallery from "./routes/gallery";
import Landing from "./routes/landing";
import Portfolio from "./routes/portfolio";
import ErrorPage from "./routes/error-page";
import { Helmet } from "react-helmet";
// STORE
import { RecoilRoot } from "recoil";

// AUTH
import { GoogleOAuthProvider } from "@react-oauth/google";
import Login from "./routes/login";
const router = createHashRouter([
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/",
    element: <Landing />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/portfolio/:userId",
    element: <Portfolio />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/portfolio/:userId/gallery/:customerId",
    element: <Gallery />,
    errorElement: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
    <React.StrictMode>
      <Helmet>
        <meta charSet="utf-8" />
        <title>On The Desk</title>
      </Helmet>
      <RecoilRoot>
        <div className="flex flex-col h-[100vh]">
          <div className="flex-1 overflow-auto bg-[#18191A] ">
            <RouterProvider router={router} />
          </div>
          <Footer className="flex-[0 0 auto]" />
        </div>
      </RecoilRoot>
    </React.StrictMode>
  </GoogleOAuthProvider>
);
