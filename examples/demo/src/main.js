import { formatStatus } from "./status.js";

const unusedMessage = "This is intentionally unused";
const status = document.querySelector("#status");

// TODO: Add a way to update the status from the page.
status.textContent = formatStatus("Ready to explore Ruins");
console.log("Demo loaded");
