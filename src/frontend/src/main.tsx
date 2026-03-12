import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App from "./App";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import "../index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

// Automatically apply dark class based on device preference
const mq = window.matchMedia("(prefers-color-scheme: dark)");
const applyTheme = (dark: boolean) =>
  document.documentElement.classList.toggle("dark", dark);
applyTheme(mq.matches);
mq.addEventListener("change", (e) => applyTheme(e.matches));

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <InternetIdentityProvider>
      <App />
    </InternetIdentityProvider>
  </QueryClientProvider>,
);
