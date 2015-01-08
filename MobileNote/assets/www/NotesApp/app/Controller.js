
Notes.controller= (function ($, dataContext,document){
   "use strict";
    var notesListStorageKey = "Notes.NotesList";
    var defaultDlgTrsn = { transition: "slideup" };

	var notesListSelector = "#notes-list-content";
	var noNotesCachedMsg = "<div>No notes cached</div>";
    var notesListPageId = "notes-list-page";
    var currentNote = null;

    var noteEditorPageId = "note-editor-page";
    var noteTitleEditorSel = "[name=note-title-editor]";
    var noteNarrativeEditorSel = "[name=note-narrative-editor]";
	 
    var saveNoteButtonSel = "#save-note-button";
    var invalidNoteDlgSel = "#invalid-note-dialog";
    
    var deleteNoteButtonSel = "#delete-note-button";
    var confirmDeleteNoteDlgSel = "#confirm-delete-note-dialog";
    var deleteNoteContentPlaceholderSel = "#delete-note-content-placeholder";
    var okToDeleteNoteButtonSel = "#ok-to-delete-note-button";

    var init =function(){

        dataContext.init(notesListStorageKey);
        var d = $(document);
       
        d.bind("pagebeforechange", onPageBeforeChange);// In order to build up queryString property and set to data.options object.
 		d.bind("pagechange", onPageChange);
        d.delegate(saveNoteButtonSel, "tap", onSaveNoteButtonTapped);         
        d.delegate(deleteNoteButtonSel, "tap", onDeleteNoteButtonTapped);
        d.delegate(okToDeleteNoteButtonSel, "tap", onOKToDeleteNoteButtonTapped);
    };

    var onPageChange= function (event, data) {

        var toPageId = data.toPage.attr("id");
        var fromPageId = null;

    if (data.options.fromPage) {
        fromPageId = data.options.fromPage.attr("id");
    }

        switch (toPageId) {
            case notesListPageId:
                resetCurrentNote(); // Reset reference to the note being edited.
                renderNotesList();
                break;
            
            case noteEditorPageId:
            if (fromPageId === notesListPageId) {
                renderSelectedNote(data);
            }
            break;
        }
    };

var onPageBeforeChange = function (event, data) {

    if (typeof data.toPage === "string") {

        var url = $.mobile.path.parseUrl(data.toPage);

        if ($.mobile.path.isEmbeddedPage(url)) {

            data.options.queryString = $.mobile.path.parseUrl(url.hash.replace(/^#/, "")).search.replace("?", "");
        }
    }
};

var onSaveNoteButtonTapped = function () {

    // Validate note.
    var titleEditor = $(noteTitleEditorSel);
    var narrativeEditor = $(noteNarrativeEditorSel);
    var tempNote = dataContext.createBlankNote();

    tempNote.title = titleEditor.val();
    tempNote.narrative = narrativeEditor.val();

    if (tempNote.isValid()) {

        if (null !== currentNote) {

            currentNote.title = tempNote.title;
            currentNote.narrative = tempNote.narrative;
        } else {

            currentNote = tempNote;
        }

        dataContext.saveNote(currentNote);
        returnToNotesListPage();
       

    } else {
        // TODO: Inform the user the note is invalid.
        $.mobile.changePage(invalidNoteDlgSel, defaultDlgTrsn);
    }
};

var onDeleteNoteButtonTapped = function () {
    if (currentNote) {
        // Render selected note in confirmation dlg.
        // Deletion will be handled elsewhere, after user confirms it's ok to delete.
        var noteContentPlaceholder = $(deleteNoteContentPlaceholderSel);
        noteContentPlaceholder.empty();
        $("<p><h3>" + currentNote.title + "</h3>" +
         currentNote.narrative + "</p>").appendTo(noteContentPlaceholder);
        $.mobile.changePage(confirmDeleteNoteDlgSel, defaultDlgTrsn);
    }
};

var onOKToDeleteNoteButtonTapped = function () {
    dataContext.deleteNote(currentNote);
    returnToNotesListPage();
};
    var renderNotesList = function () {

    var notesList = dataContext.getNotesList();
    var view = $(notesListSelector);

    view.empty();

    if (notesList.length === 0) {
        $(noNotesCachedMsg).appendTo(view);
    } else {

        var liArray = [],
            notesCount = notesList.length,
            note,
            dateGroup,
            noteDate,
            i;

        var ul = $("<ul id=\"notes-list\" data-role=\"listview\"></ul>").appendTo(view);

        for (i = 0; i < notesCount; i += 1) {

            note = notesList[i];

            noteDate = (new Date(note.dateCreated)).toDateString();

            if (dateGroup !== noteDate) {
                liArray.push("<li data-role=\"list-divider\">" + noteDate + "</li>");
                dateGroup = noteDate;
            }

            liArray.push("<li>"
                + "<a data-url=\"index.html#note-editor-page?noteId=" + note.id + "\" href=\"index.html#note-editor-page?noteId=" + note.id + "\">"
                + "<div class=\"list-item-title\">" + note.title + "</div>"
                + "<div class=\"list-item-narrative\">" + note.narrative + "</div>"
                + "</a>"
                + "</li>");

        }

        var listItems = liArray.join("");
        $(listItems).appendTo(ul);

        ul.listview();
    }
};

   /* function renderNotesList() {

		var notesList = dataContext.getNotesList();
		var view = $(notesListSelector);

		view.empty();

		if (notesList.length === 0) {

			$(noNotesCachedMsg).appendTo(view);
			
		} else {



			var notesCount = notesList.length;
			var note;
			var ul = $("<ul id=\"notes-list\" data-role=\"listview\"></ul>").appendTo(view);
			for (var i = 0; i < notesCount; i++) {
				note = notesList[i];
				$("<li>"
				+ "<a data-url=\"index.html#note-editor-page?noteId=" + note.id + "\" href=\"index.html#note-editor-page?noteId=" + note.id + "\">"
				+ "<div>" + note.title + "</div>"
				+ "<div class=\"list-item-narrative\">" + note.narrative + "</div>"
				+ "</a>"
				+ "</li>").appendTo(ul);
			}

			ul.listview();
		}
	}*/


	var renderSelectedNote = function (data) {

    var u = $.mobile.path.parseUrl(data.options.fromPage.context.URL);
    var re = "^#" + noteEditorPageId;

    if (u.hash.search(re) !== -1) {

        var queryStringObj = queryStringToObject(data.options.queryString);

        var titleEditor = $(noteTitleEditorSel);
        var narrativeEditor = $(noteNarrativeEditorSel);

        var noteId = queryStringObj["noteId"];

        if (typeof noteId !== "undefined") {

            // We were passed a note id => We're editing an existing note.
            var notesList = dataContext.getNotesList();
            var notesCount = notesList.length;
            var note;

            for (var i = 0; i < notesCount; i++) {

                note = notesList[i];

                if (noteId === note.id) {

                    titleEditor.val(note.title);
                    narrativeEditor.val(note.narrative);
                    currentNote = note;
                }
            }
        } else {
            // We're creating a note. Reset the fields.
            titleEditor.val("");
            narrativeEditor.val("");
        }

        titleEditor.focus();
    }
};

var queryStringToObject = function (queryString) {

    var queryStringObj = {};
    var e;
    var a = /\+/g;  // Replace + symbol with a space
    var r = /([^&;=]+)=?([^&;]*)/g;
    var d = function (s) { return decodeURIComponent(s.replace(a, " ")); };

    e = r.exec(queryString);
    while (e) {
        queryStringObj[d(e[1])] = d(e[2]);
        e = r.exec(queryString);

    }

    return queryStringObj;
};


var returnToNotesListPage = function () {

    $.mobile.changePage("#" + notesListPageId,
        { transition: "slide", reverse: true });
};

var resetCurrentNote = function () {
    currentNote = null;
};

    return {

        init:init
    };

})(jQuery,Notes.dataContext,document);

$(document).bind("mobileinit", function () {

    //Notes.testHelper.createDummyNotes();

    Notes.controller.init();
});
