/* src/index.js */
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // This ensures Tailwind CSS is imported
import App from "./App"; // Your main component

// Get the element with id "root" from public/index.html
const rootElement = document.getElementById("root");
if (!rootElement) {
console.error("No element with id 'root' found in public/index.html");
}
const root = ReactDOM.createRoot(rootElement);
root.render(
<React.StrictMode>

</React.StrictMode>
);