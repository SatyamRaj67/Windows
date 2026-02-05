// ====================
// ===          IMPORTS          ===
// ====================
import { WindowManager } from "./core/WindowManager.js";

// Intializing Window Manager
const wm = new WindowManager();

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

// Load all installed apps once
const Installed_Apps = await loadJSON("data/Installed_Apps.json");

// ====================
// ===      TASKBAR APPS     ===
// ====================

const Taskbar_App_Fragment = document.createDocumentFragment();
const Taskbar_App_Tray = document.getElementById("taskbar-app-tray");

Installed_Apps.forEach((app) => {
  if (!app.pinned) return;

  const li = document.createElement("li");
  li.classList.add("app");
  li.dataset.id = app.id;
  li.dataset.name = app.name;
  li.dataset.pinned = "true";
  li.innerHTML = `
    <img class="icon" />
    `;

  const img = li.querySelector(".icon");
  img.src = app.img_src;
  img.alt = app.name;

  li.addEventListener("click", () => {
    if (li.classList.contains("open")) {
      wm.toggleWindow(app.id);
    } else {
      wm.openWindow({
        id: app.id,
        name: app.name,
        img_src: app.img_src,
        content: app.content || `Welcome to ${app.name}!`,
      });
    }
  });

  Taskbar_App_Fragment.appendChild(li);
});
Taskbar_App_Tray.appendChild(Taskbar_App_Fragment);

// ====================
// ===      DESKTOP ICONS  ===
// ====================

const Desktop_Grid = document.getElementById("desktop-grid");
const Desktop_Grid_Fragment = document.createDocumentFragment();

Installed_Apps.forEach((app) => {
  // Only process apps with a grid_area for the desktop
  if (!app.grid_area) return;

  const div = document.createElement("div");
  div.classList.add("desktop-grid-item");
  div.style.gridArea = app.grid_area;
  div.dataset.id = app.id;
  div.dataset.name = app.name;
  div.innerHTML = `
    <img src="${app.img_src}" alt="${app.name}" />
    <p>${app.name}</p>
    `;

  // Add event listeners directly here since we have the scope of 'app'
  div.addEventListener("click", () => {
    document
      .querySelectorAll(".desktop-grid-item")
      .forEach((ic) => ic.classList.remove("active"));
    div.classList.add("active");
  });

  div.addEventListener("dblclick", () => {
    wm.openWindow({
      id: app.id,
      name: app.name,
      img_src: app.img_src,
      content: app.content || `Welcome to ${app.name}!`,
    });
  });

  Desktop_Grid_Fragment.appendChild(div);
});

Desktop_Grid.appendChild(Desktop_Grid_Fragment);

// === On Clicking outside desktop icons, remove active state ===
Desktop_Grid.addEventListener("click", (e) => {
  if (e.target === Desktop_Grid) {
    document
      .querySelectorAll(".desktop-grid-item")
      .forEach((ic) => ic.classList.remove("active"));
  }
});
