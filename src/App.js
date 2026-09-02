import { useEffect, useState } from "react";
import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import {
  Moon,
  Sun,
} from "lucide-react";

import Home from "./pages/Home";
import EditorPage from "./pages/EditorPage";

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "light"
        ? "dark"
        : "light"
    );
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background:
              theme === "dark"
                ? "#1b2230"
                : "#ffffff",

            color:
              theme === "dark"
                ? "#f8fafc"
                : "#1e293b",

            border:
              theme === "dark"
                ? "1px solid #30394a"
                : "1px solid #dce3ee",
          },
        }}
      />

      <button
        className="themeToggle"
        onClick={toggleTheme}
        title={
          theme === "light"
            ? "Switch to Dark Mode"
            : "Switch to Light Mode"
        }
        aria-label="Toggle theme"
      >
        {theme === "light" ? (
          <Moon size={21} />
        ) : (
          <Sun size={21} />
        )}
      </button>

      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/editor/:roomId"
            element={
              <EditorPage theme={theme} />
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;