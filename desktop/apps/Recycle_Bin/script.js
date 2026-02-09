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

const RecycleBin_Data = await loadJSON("data/Recycle.json");
// {
//     "id": number,
//     "name": string,
//     "img_src": Path to image,
//     "type": "folder" / "file",
//   }

// ====================
// ===   MAIN FUNCTION ===
// ====================
const folder_list = document.getElementById("folder-list");

const listFragment = document.createDocumentFragment();

RecycleBin_Data.forEach((item) => {
  const li = document.createElement("li");

  if (item.id === "4") li.classList.add("active");
  li.innerHTML = `
      <div class="icon">
        <img src="${item.img_src}" alt="${item.name}">
        </div>
        <p>${item.name}</p>
    `;
  listFragment.appendChild(li);
});

folder_list.appendChild(listFragment);
