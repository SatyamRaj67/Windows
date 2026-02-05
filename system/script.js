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

// ====================
// ===      TASKBAR APPS     ===
// ====================

const Taskbar_App_Fragment = document.createDocumentFragment();
const Taskbar_App_Tray = document.getElementById("taskbar-app-tray");

const Taskbar_Apps = await loadJSON("data/Taskbar_Apps.json");

Taskbar_Apps.forEach((app) => {
  const li = document.createElement("li");
  li.classList.add("app");
  li.dataset.id = app.id;
  li.dataset.name = app.name;
  li.dataset.pinned = "true";
  li.innerHTML = `
    <img src="${app.img_src}" alt="${app.name}" />
    `;

  li.addEventListener("click", () => {
    if (li.classList.contains("open")) {
      wm.toggleWindow(app.id);
    } else {
      wm.openWindow({ id: app.id, name: app.name, img_src: app.img_src });
    }
  });

  Taskbar_App_Fragment.appendChild(li);
});
Taskbar_App_Tray.appendChild(Taskbar_App_Fragment);

// ====================
// ===      DESKTOP ICONS  ===
// ====================
const Desktop_Apps = await loadJSON("data/Desktop_Apps.json");

const Desktop_Grid = document.getElementById("desktop-grid");
const Desktop_Grid_Fragment = document.createDocumentFragment();

Desktop_Apps.forEach((item) => {
  if (!item.grid_area) return;
  const div = document.createElement("div");
  div.classList.add("desktop-grid-item");
  div.style.gridArea = item.grid_area;
  div.dataset.id = item.id;
  div.dataset.name = item.name;
  div.innerHTML = `
    <img src="${item.img_src}" alt="${item.name}" />
    <p>${item.name}</p>
    `;
  Desktop_Grid_Fragment.appendChild(div);
});
Desktop_Grid.appendChild(Desktop_Grid_Fragment);

// ======================
// === DESKTOP ICON EVENTS ===
// ======================
const Desktop_Icons = document.querySelectorAll(".desktop-grid-item");

Desktop_Icons.forEach((icon) => {
  icon.addEventListener("click", () => {
    Desktop_Icons.forEach((ic) => ic.classList.remove("active"));
    icon.classList.add("active");
  });

  icon.addEventListener("dblclick", () => {
    const appName = icon.querySelector("p").textContent;
    const imgSrc = icon.querySelector("img").getAttribute("src");

    wm.openWindow({ id: icon.dataset.id, name: appName, img_src: imgSrc });
  });
});
