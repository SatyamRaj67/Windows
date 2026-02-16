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
    els.fileList.innerHTML = "<p class='empty-msg'>This folder is empty.</p>";
    return;
  }

  files.forEach(file => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="icon"><img src="${file.img_src}"></div>
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
  
  // Now using 'content' uniformly based on 'type'
  if (file.type === "image") {
    previewHTML = `<img src="${file.content}" class="preview-img">`;
  } else if (file.type === "text" || file.type === "archive") {
    previewHTML = `<div class="preview-text">${file.content}</div>`;
  } else if (file.type === "audio") {
     previewHTML = `<audio controls src="${file.content}" class="preview-audio"></audio>`;
  }

  const propList = Object.entries(file.properties || {})
    .map(([key, val]) => `
      <div class="prop-row">
        <span class="prop-key">${key}:</span> 
        <span>${val}</span>
      </div>`)
    .join("");

  els.previewInfo.innerHTML = `
    <h2>${file.name}</h2>
    <hr class="preview-hr">
    ${previewHTML}
    <h3>Properties</h3>
    <div class="prop-list">
      ${propList}
    </div>
  `;
}

renderFolders();
