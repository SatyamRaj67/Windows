export class TaskbarManager {
  constructor(windowManager, installedApps) {
    this.wm = windowManager;
    this.apps = installedApps;
    this.taskbarTray = document.getElementById("taskbar-app-tray");
    this.startMenu = document.getElementById("start-menu");

    this.init();
  }

  init() {
    this.renderPinnedApps();
    this.setupStartMenu();
    this.updateTime()
  }

  renderPinnedApps() {
    const fragment = document.createDocumentFragment();

    // 1. Create Start Button (Fixed position)
    const startBtn = document.createElement("li");
    startBtn.classList.add("app", "start-btn");
    startBtn.innerHTML = `<img src="../public/windows.svg" alt="windows" />`;
    startBtn.addEventListener("click", (e) => this.toggleStartMenu(e));
    fragment.appendChild(startBtn);

    // 2. Render Pinned Apps
    this.apps.forEach((app) => {
      if (!app.pinned) return;

      const li = document.createElement("li");
      li.classList.add("app");
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
    document.addEventListener("keydown", (e) => {
      if (e.key === "Meta") this.toggleStartMenu();
    });

    document.addEventListener("click", (e) => {
      const startBtn = this.taskbarTray.querySelector(".start-btn");
      if (!this.startMenu.contains(e.target) && !startBtn.contains(e.target)) {
        this.startMenu.classList.remove("open");
      }
    });
  }

  toggleStartMenu() {
    this.startMenu.classList.toggle("open");
  }

  updateTime() {}
}
