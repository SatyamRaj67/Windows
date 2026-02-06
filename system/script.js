// ====================
// ===          IMPORTS          ===
// ====================
import { WindowManager } from "./core/WindowManager.js";
import { DesktopManager } from "./core/DesktopManager.js";
import { TaskbarManager } from "./core/TaskbarManager.js";

// ====================
// ===   PAGE TRANSITION  ===
// ====================
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// ====================
// ===   HELPER FUNCTION ===
// ====================
async function loadJSON(path) {
  try {
    const response = await fetch(path);
    return await response.json();
  } catch (error) {
    console.error(`Error loading JSON from ${path}:`, error);
    return [];
  }
}

// ====================
// ===   INITIALIZATION   ===
// ====================
// Top-level await is supported in modules
const Installed_Apps = await loadJSON("data/Installed_Apps.json");

// 1. Initialize Window Manager
const wm = new WindowManager();

// 2. Initialize Taskbar (Needs WM to open apps)
const tm = new TaskbarManager(wm, Installed_Apps);

// 3. Initialize Desktop Force (Needs WM to open apps, Apps List for icons)
const dm = new DesktopManager(wm, Installed_Apps);
