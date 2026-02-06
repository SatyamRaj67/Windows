export class DesktopManager {
  constructor(windowManager, installedApps) {
    this.wm = windowManager;
    this.apps = installedApps;
    this.grid = document.getElementById("desktop-grid");
    if (!this.grid) {
      throw new Error("Desktop grid element not found");
    }
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
        slot.classList.add("desktop-slot");

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

      const img = document.createElement("img");
      img.src = app.img_src;
      img.alt = app.name;

      const p = document.createElement("p");
      p.textContent = app.name;
      p.contentEditable = "true";

      div.appendChild(img);
      div.appendChild(p);

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

    // Delegated Dragover
    this.grid.addEventListener("dragover", (e) => {
      if (e.target.closest(".desktop-slot")) {
        e.preventDefault();
      }
    });

    // Delegated Drop
    this.grid.addEventListener("drop", (e) => {
      e.preventDefault();
      const slot = e.target.closest(".desktop-slot");
      if (!slot) return;

      const appId = e.dataTransfer.getData("text/plain");
      const icon = document.querySelector(
        `.desktop-grid-item[data-id="${appId}"]`,
      );

      if (icon && !slot.hasChildNodes()) {
        slot.appendChild(icon);
      }
    });
  }

  deselectAll() {
    document
      .querySelectorAll(".desktop-grid-item")
      .forEach((ic) => ic.classList.remove("active"));
  }
}
