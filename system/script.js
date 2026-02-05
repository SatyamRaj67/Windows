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

// 1. HELPER: Function to fetch JSON data
async function loadConfig(path) {
  try {
    const response = await fetch(path);
    return await response.json();
  } catch (error) {
    console.error(`Failed to load config from ${path}:`, error);
    return [];
  }
}

// 2. COMPONENT: Render Desktop Icons
function renderDesktopIcons(apps) {
  const mainGrid = document.getElementById("main-grid");
  const fragment = document.createDocumentFragment();

  apps.forEach((item) => {
    const div = document.createElement("div");
    div.classList.add("main-grid-item");
    // This allows specific positioning based on your JSON "grid_area"
    div.style.gridArea = item.grid_area;
    div.dataset.appName = item.name; // Useful for click events later

    div.innerHTML = `
      <img src="${item.img_src}" alt="${item.name}" />
      <p>${item.name}</p>
    `;
    
    // Add click listener (Placeholder for WindowManager logic)
    div.addEventListener('dblclick', () => {
        console.log(`Opening ${item.name}...`);
    });

    fragment.appendChild(div);
  });

  mainGrid.appendChild(fragment);
}

// 3. MAIN: Initialization Logic
async function initSystem() {
  // Load the desktop configuration
  const desktopApps = await loadConfig("./data/Desktop_Apps.json");

  // Render the interface
  renderDesktopIcons(desktopApps);

  // Handle Page Transition (Remove loading screen)
  // We do this AFTER data is fetched/rendered so it doesn't pop in
  document.body.classList.add("loaded");
}

// Start the system
initSystem();
