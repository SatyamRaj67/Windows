export class DesktopManager {
  constructor(windowManager, installedApps) {
    this.wm = windowManager;
    this.apps = installedApps;
    this.grid = document.getElementById("desktop-grid");
    this.cols = [
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
    ];
    this.rows = 6;

    this.init();
  }

  init() {
    this.createGridSlots();
    this.renderIcons();
    this.setupGlobalEvents();
  }

  // Generate the invisible slots (a1 -> n6)
  createGridSlots() {
    this.cols.forEach((col) => {
      for (let row = 1; row <= this.rows; row++) {
        const slot = document.createElement("div");
        const areaName = `${col}${row}`;

        slot.style.gridArea = areaName;
        slot.style.width = "100%";
        slot.style.height = "100%";
        slot.dataset.area = areaName;

        // === Drag Over ===
        slot.addEventListener("dragover", (e) => e.preventDefault());

        // === Drop ===
        slot.addEventListener("drop", (e) => {
          e.preventDefault();
          const appId = e.dataTransfer.getData("text/plain");
          const icon = document.querySelector(
            `.desktop-grid-item[data-id="${appId}"]`,
          );

          if (icon && !slot.hasChildNodes()) {
            slot.appendChild(icon);
          }
        });

        this.grid.appendChild(slot);
      }
    });
  }

  // Place apps into their defined initial slots
  renderIcons() {
    this.apps.forEach((app) => {
      if (!app.grid_area) return;

      const targetSlot = Array.from(this.grid.children).find(
        (slot) => slot.dataset.area === app.grid_area,
      );

      if (!targetSlot) return;

      const div = document.createElement("div");
      div.classList.add("desktop-grid-item");
      div.dataset.id = app.id;
      div.dataset.name = app.name;
      div.draggable = true;
      div.innerHTML = `
        <img src="${app.img_src}" alt="${app.name}" />
        <p contenteditable="true">${app.name}</p>
      `;

      // === Drag Start ===
      div.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", app.id);
        setTimeout(() => div.classList.add("dragging"), 0);
      });

      // === Drag End ===
      div.addEventListener("dragend", () => {
        div.classList.remove("dragging");
      });

      // === Click Selection ===
      div.addEventListener("click", (e) => {
        e.stopPropagation();
        this.deselectAll();
        div.classList.add("active");
      });

      // === Open Window ===
      div.addEventListener("dblclick", () => {
        this.wm.openWindow({
          id: app.id,
          name: app.name,
          app: app.app,
          img_src: app.img_src,
          content: app.content || `Welcome to ${app.name}!`,
        });
      });

      targetSlot.appendChild(div);
    });
  }

  // Handle clicking empty space
  setupGlobalEvents() {
    this.grid.addEventListener("click", (e) => {
      if (
        e.target === this.grid ||
        (e.target.dataset && e.target.dataset.area)
      ) {
        this.deselectAll();
      }
    });
  }

  deselectAll() {
    document
      .querySelectorAll(".desktop-grid-item")
      .forEach((ic) => ic.classList.remove("active"));
  }
}
