var Notes = Notes || {};

Notes.dataContext = (function ($) {
    "use strict";
    var notesList = [];
    var notesListStorageKey;

    function init(storageKey) {

        notesListStorageKey=storageKey;    
        loadNotesFromLocalStorage(notesListStorageKey);
    }

    function createBlankNote() {

        var dateCreated = new Date();
        var id = new String(dateCreated.getTime()) + new String(getRandomInt(0, 100));
        var noteModel = new Notes.NoteModel({
            id: id,
            dateCreated: dateCreated,
            title: "",
            narrative: ""
        });

        return noteModel;
    }

    function getNotesList() {
        return notesList;
    }

    function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function loadNotesFromLocalStorage(notesListStorageKey) {

        var storedNotes = $.jStorage.get(notesListStorageKey);

        if (storedNotes !== null) {
            notesList = storedNotes;
        }

    }   

    var saveNote = function (noteModel) {

    var found = false;
    var i;

    for (i = 0; i < notesList.length; i += 1) {
        if (notesList[i].id === noteModel.id) {
            notesList[i] = noteModel;
            found = true;
            i = notesList.length;
        }
    }

    if (!found) {
        notesList.splice(0, 0, noteModel);
    }

    saveNotesToLocalStorage();
  };

  var saveNotesToLocalStorage = function () {
    $.jStorage.set(notesListStorageKey, notesList);
};

var deleteNote = function (noteModel) {
    var i;
    for (i = 0; i < notesList.length; i += 1) {
        if (notesList[i].id === noteModel.id) {
            notesList.splice(i, 1);
            i = notesList.length;
        }
    }
    saveNotesToLocalStorage();
};

var pub = {
    init: init,
    createBlankNote: createBlankNote,
    getNotesList: getNotesList,
    saveNote: saveNote,
    deleteNote: deleteNote
};

    return pub;

}(jQuery));





