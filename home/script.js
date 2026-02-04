const app_icons = [
  {
    name: "Visual Studio Code",
    img_src: "../public/vscode.svg",
  },
  {
    name: "Whatsapp",
    img_src: "../public/whatsapp.svg",
  },
  {
    name: "File Explorer",
    img_src: "../public/File Explorer.ico",
  },
  {
    name: "Task Manager",
    img_src: "../public/task-manager.png",
  },
  {
    name: "Brave Browser",
    img_src: "../public/Brave.ico",
  },
  {
    name: "Settings",
    img_src: "../public/Settings.ico",
  },
];

// Page Transition Logic
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// Render app icons in the app tray
const fragment = document.createDocumentFragment();
const app_tray = document.getElementById("app-tray");

app_icons.forEach((app) => {
  const li = document.createElement("li");
  li.classList.add("app");
  li.innerHTML = `
    <img src="${app.img_src}" alt="${app.name}" />
    `;
  fragment.appendChild(li);
});
app_tray.appendChild(fragment);

const grid_items = [
  {
    name: "This PC",
    img_src: "../public/Computer.ico",
    grid_area: "a1",
  },
  {
    name: "VS Code",
    img_src: "../public/vscode.svg",
    grid_area: "a2",
  },
  {
    name: "Recycle Bin",
    img_src: "../public/Trash Empty.ico",
    grid_area: "a3",
  },
  {
    name: "Control Panel",
    img_src: "../public/Control Panel.ico",
    grid_area: "a4",
  },
  {
    name: "Brave",
    img_src: "../public/Brave.ico",
    grid_area: "b1",
  }
];

// Main Grid Logic
const main_grid = document.getElementById("main-grid");
const grid_fragment = document.createDocumentFragment();

grid_items.forEach((item) => {
  const div = document.createElement("div");
  div.classList.add("main-grid-item");
  div.style.gridArea = item.grid_area;
  div.innerHTML = `
    <img src="${item.img_src}" alt="${item.name}" />
    <p>${item.name}</p>
    `;
  grid_fragment.appendChild(div);
});
main_grid.appendChild(grid_fragment);
