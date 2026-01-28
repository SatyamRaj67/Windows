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
    img_src: "../public/folder.svg",
  },
  {
    name: "Task Manager",
    img_src: "../public/task-manager.png",
  },
  {
    name: "Brave Browser",
    img_src: "../public/brave.svg",
  },
  {
    name: "Settings",
    img_src: "../public/settings.svg",
  }
];

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
