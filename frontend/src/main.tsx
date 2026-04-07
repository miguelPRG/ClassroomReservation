import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AppRouter } from "@/routes/app-router";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

document.documentElement.classList.add("dark");

createRoot(document.getElementById("app")!).render(
  <StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
    <ToastContainer
      position="bottom-right"
      autoClose={2600}
      theme="dark"
      hideProgressBar
    />
  </StrictMode>,
);
