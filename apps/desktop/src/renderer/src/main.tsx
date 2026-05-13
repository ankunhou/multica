import ReactDOM from "react-dom/client";
import App from "./App";
// Inter variable font covers all weights (100-900) in a single file.
// globals.css composes it after Chinese-first UI families in --font-sans.
import "@fontsource-variable/inter";
// Editorial serif — matches web's next/font Source_Serif_4. Loaded app-wide so
// onboarding headings and any future editorial surface can use `font-serif`
// (see tokens.css @theme inline). Variable font = one file covers all weights.
import "@fontsource-variable/source-serif-4";
import "@fontsource-variable/source-serif-4/wght-italic.css";
import "@fontsource/geist-mono/400.css";
import "@fontsource/geist-mono/700.css";
import "./globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
