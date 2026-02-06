export class TaskbarManager {
  constructor(windowManager, installedApps) {
    this.wm = windowManager;
    this.apps = installedApps;
    this.taskbarTray = document.getElementById("taskbar-app-tray");
    this.startMenu = document.getElementById("start-menu");

    if (!this.taskbarTray || !this.startMenu) {
      throw new Error("TaskbarManager: Required DOM elements not found");
    }

    this.init();
  }

  init() {
    this.renderPinnedApps();
    this.setupStartMenu();
    this.updateTime();
  }

  renderPinnedApps() {
    const fragment = document.createDocumentFragment();

    // 1. Create Start Button (Fixed position)
    const startBtn = document.createElement("li");
    startBtn.classList.add("app", "start-btn");
    startBtn.innerHTML = `<img src="../public/windows.svg" alt="windows" />`;
    startBtn.addEventListener("click", (e) => this.toggleStartMenu(e));
    this.startBtn = startBtn;
    fragment.appendChild(startBtn);

    // 2. Render Pinned Apps
    this.apps.forEach((app) => {
      if (!app.pinned) return;

      const img = document.createElement("img");
      img.className = "icon";
      img.src = app.img_src;
      img.alt = app.name;
      li.appendChild(img);      li.classList.add("app");
      li.dataset.id = app.id;
      li.dataset.name = app.name;
      li.title = app.name;
      li.innerHTML = `<img class="icon" src="${app.img_src}" alt="${app.name}" />`;

      li.addEventListener("click", () => {
        if (li.classList.contains("open")) {
          this.wm.toggleWindow(app.id);
        } else {
          this.wm.openWindow(app);
        }
      });

      fragment.appendChild(li);
    });

    this.taskbarTray.innerHTML = "";
    this.taskbarTray.appendChild(fragment);
  }

  setupStartMenu() {
    this._onDocumentKeydown = (e) => {
      if (e.key === "Meta") this.toggleStartMenu();
    };
    document.addEventListener("keydown", this._onDocumentKeydown);

    this._onDocumentClick = (e) => {
      if (
        !this.startMenu.contains(e.target) &&
        !this.startBtn?.contains(e.target)
      ) {
        this.startMenu.classList.remove("open");
      }
    };
    document.addEventListener("click", this._onDocumentClick);
  }

  /**
   * Cleans up event listeners to prevent memory leaks when TaskbarManager is destroyed.
   */
  destroy() {
    if (this._onDocumentKeydown) {
      document.removeEventListener("keydown", this._onDocumentKeydown);
    }
    if (this._onDocumentClick) {
      document.removeEventListener("click", this._onDocumentClick);
    }
  }

  toggleStartMenu() {
    this.startMenu.classList.toggle("open");
  }

  updateTime() {
    // TODO: Implement time update logic here (e.g., render clock in taskbar)
  }
}
