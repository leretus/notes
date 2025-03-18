async function fetchnote() {
    
    const odp = await fetch('/notes');
    const notes = await odp.json();

    const groupedNotes = notes.reduce((acc, note) => {
        if (!acc[note.category]) {
            acc[note.category] = [];
        }
        acc[note.category].push(note);
        return acc;
    }, {});

    
    ['homework', 'todo', 'work'].forEach(category => {
        const categoryElement = document.getElementById(category);
        if (categoryElement) {
            categoryElement.innerHTML = ''; 
        }
    });

    for (const [category, categoryNotes] of Object.entries(groupedNotes)) {
        const categoryElement = document.getElementById(category);
        if (categoryElement) {
            categoryElement.innerHTML = categoryNotes.map(note =>
                `<p>${note.text} <button class="deletebutton" data-id="${note.id}">Usuń</button></p>`
            ).join('');
        }
    }

    document.querySelectorAll('.deletebutton').forEach(button => {
        button.onclick = async function () {
            await deletenote(button.dataset.id);
        };
    });
}
const inp = document.getElementById('text');
inp.addEventListener("keydown", function (e)
 {
    if (e.code === "Enter") 
    {  
        add()
    }
});

async function add() {
    const title = document.getElementById('title');
    const text = document.getElementById('text');
    const category = document.getElementById('categories').value;
    if (text.value.trim() !== "") {
        await fetch('/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text.value, category: category, title: title.value})
        });
        text.value = ''; 
        title.value = ''; 
    }

    fetchnote();
}

async function deletenote(id) {
    await fetch(`/notes/${id}`, { method: 'DELETE' });
    fetchnote(); 
}

window.onload = fetchnote;
