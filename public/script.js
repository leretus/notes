async function fetchnote() {
  const odp = await fetch("/notes");
  const notes = await odp.json();

  const groupedNotes = notes.reduce((acc, note) => {
    if (!acc[note.category]) {
      acc[note.category] = [];
    }
    acc[note.category].push(note);
    return acc;
  }, {});

  ["homework", "todo", "work"].forEach((category) => {
    const categoryElement = document.getElementById(category);
    if (categoryElement) {
      categoryElement.innerHTML = "";
    }
  });

  for (const [category, categoryNotes] of Object.entries(groupedNotes)) {
    const categoryElement = document.getElementById(category);
    if (categoryElement) {
      categoryElement.innerHTML = categoryNotes
        .map(
          (note) =>
            `<p>${note.text} <button class="deletebutton" data-id="${note.id}">Usuń</button>
                <button class="showbutton" data-id="${note.id}">Pokaż</button></p>`
        )
        .join("");
    }
  }

  document.querySelectorAll(".deletebutton").forEach((button) => {
    button.onclick = async function () {
      await deletenote(button.dataset.id);
    };
  });
  document.querySelectorAll(".showbutton").forEach((button) => {
    button.onclick = async function () {
      await show(button.dataset.id);
    };
  });
}
async function show(id) {
  try {
    const odp = await fetch("/notes");
    const notes = await odp.json();

    const note = notes.find((n) => n.id == id);

    if (!note) {
      console.error("Note not found");
      return;
    }

    let displayContainer = document.getElementById("note-display");
    if (!displayContainer) {
      displayContainer = document.createElement("div");
      displayContainer.id = "note-display";
      document.body.appendChild(displayContainer);
    }

    const closeButton = document.createElement("button");
    closeButton.classList.add("close");
    closeButton.textContent = "Zamknij";
    closeButton.onclick = () => displayContainer.remove();
    displayContainer.innerHTML = `<p>${note.text}</p>`;
    displayContainer.appendChild(closeButton);
  } catch (error) {
    console.error("Error fetching note:", error);
  }
}

const inp = document.getElementById("text");
inp.addEventListener("keydown", function (e) {
  if (e.code === "Enter") {
    add();
  }
});

async function add() {
  const title = document.getElementById("title");
  const text = document.getElementById("text");
  const category = document.getElementById("categories").value;
  if (text.value.trim() !== "") {
    await fetch("/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text.value,
        category: category,
        title: title.value,
      }),
    });
    text.value = "";
    title.value = "";
  }

  fetchnote();
}

async function deletenote(id) {
  await fetch(`/notes/${id}`, { method: "DELETE" });
  fetchnote();
}

window.onload = fetchnote;
