import { createInertiaApp } from "@inertiajs/react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { resolve } from "./pages";

void createInertiaApp({
  resolve,
  setup({ el, App, props }) {
    if (el.hasAttribute("data-server-rendered")) {
      hydrateRoot(el, <App {...props} />);
    } else {
      createRoot(el).render(<App {...props} />);
    }
  },
});
