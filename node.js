const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const port = 3000;
const SERVER = path.join(__dirname, 'notes.json');
const notepath = path.join(__dirname, 'notes');

app.use(express.json());
app.use(express.static('public'));


fs.mkdir(notepath, { recursive: true }, (err) => {
    if (err) {
        console.error("Error creating notes directory:", err);
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const saveNotes = (notes, callback) => {
    fs.writeFile(SERVER, JSON.stringify(notes, null, 2), (err) => {
        if (err) {
            console.error("Error writing to notes.json:", err);
            callback(err);
        } else {
            callback(null);
        }
    });
};

const loadNotes = (callback) => {
    fs.readFile(SERVER, (err, data) => {
        if (err) {
            console.error("Error reading notes.json:", err);
            callback(err, []);
        } else {
            callback(null, JSON.parse(data));
        }
    });
};


app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

app.get('/notes', (req, res) => {
    loadNotes((err, notes) => {
        if (err) {
            res.status(500).json({ message: 'Error loading notes' });
        } else {
            res.json(notes);
        }
    });
});


app.post('/notes', (req, res) => {
    const { text, category,title } = req.body;

    if (!text || !category) {
        return res.status(400).json({ message: 'Text and category are required' });
    }

    const folder = path.join(notepath, category);
    fs.mkdir(folder, { recursive: true }, (err) => {
        if (err) {
            console.error("Error creating category folder:", err);
            
        };
        let filename = `${Date.now()}.txt`;
      if(title)
        {
            filename = `${title}.txt`;
        }
            
        
              
        
        
        fs.writeFile(path.join(folder, filename), text, (err) => {
            

            
            loadNotes((err, notes) => {
                
                const newNote = { id: Date.now(), text, category, filename };
                notes.push(newNote);

                saveNotes(notes, (err) => {
                    
                    res.status(201).json({ message: 'Note added successfully', note: newNote });
                });
            });
        });
    });
});


app.delete('/notes/:id', (req, res) => {
    const noteId = parseInt(req.params.id);

    loadNotes((err, notes) => {
        if (err) {
            return res.status(500).json({ message: 'Error loading notes' });
        }

        const noteIndex = notes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) {
            return res.status(404).json({ message: 'Note not found' });
        }

        const [deletedNote] = notes.splice(noteIndex, 1);

        
        if (!deletedNote.category || !deletedNote.filename) {
            return res.status(500).json({ message: 'Note data is incomplete' });
        }

        
        const filePath = path.join(notepath, deletedNote.category, deletedNote.filename);

        
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Error deleting file:", err);
                return res.status(500).json({ message: 'Error deleting note file' });
            }

            
            saveNotes(notes, (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error saving notes after deletion' });
                }
                res.status(200).json({ message: 'Note deleted successfully' });
            });
        });
    });
});