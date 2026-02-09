// ====================
// ===   HELPER FUNCTION ===
// ====================
async function loadJSON(path) {
  try {
    const response = await fetch(path);
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

const folderData = await loadJSON("data/Explorer.json");

const els = {
  folderList: document.getElementById("folder-list"), // Sidebar Nav
  fileList: document.getElementById("item-list"),     // Main Area
  previewInfo: document.querySelector("aside")        // Right Sidebar
};

function renderFolders() {
  els.folderList.innerHTML = "";
  
  folderData.forEach(folder => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="icon"><img src="${folder.img_src}"></div>
      <p>${folder.name}</p>
    `;
    
    li.addEventListener("click", () => {
      [...els.folderList.children].forEach(c => c.classList.remove("active"));
      li.classList.add("active");
      renderFiles(folder.files || []); 
    });

    els.folderList.appendChild(li);
  });
}

function renderFiles(files) {
  els.fileList.innerHTML = "";

  if(files.length === 0) {
    els.fileList.innerHTML = "<p style='opacity:0.5; width:100%;'>This folder is empty.</p>";
    return;
  }

  files.forEach(file => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="icon"><img src="${file.img_src || file.content}"></div>
      <p>${file.name}</p>
    `;

    li.addEventListener("click", () => {
       renderProperties(file);
    });

    els.fileList.appendChild(li);
  });
}

function renderProperties(file) {
  let previewHTML = "";
  if (file.type === "image") {
    previewHTML = `<img src="${file.content}" style="width:100%; border-radius: 0.5em; margin-bottom: 1em;">`;
  } else if (file.type === "text") {
    previewHTML = `<div style="background: white; color: black; padding: 1em; border-radius: 0.5em; margin-bottom: 1em; font-family: monospace;">${file.content}</div>`;
  } else if (file.type === "audio") {
     previewHTML = `<audio controls src="${file.content}" style="width:100%; margin-bottom: 1em;"></audio>`;
  }

  const propList = Object.entries(file.properties || {})
    .map(([key, val]) => `<div style="display:flex; justify-content:space-between; font-size:0.8em; margin-bottom:0.25em;"><span style="opacity:0.6">${key}:</span> <span>${val}</span></div>`)
    .join("");

  els.previewInfo.innerHTML = `
    <h2>${file.name}</h2>
    <hr style="margin: 1em 0; opacity: 0.2;">
    ${previewHTML}
    <h3>Properties</h3>
    <div style="margin-top: 0.5em;">
      ${propList}
    </div>
  `;
}

renderFolders();
