(function () {
  return $(document).ready(function () {

    var notesContainer = $('#notesContainer');
    var newNoteForm = $('#newNoteForm');
    var newNoteContent = $('#newNoteText');
    var filterFormElements = $('#notesOrder, #notesOrderDirection');
    var notesSearchFilter = $('#notesSearchFilter');

    var activeNoteId = null;

    function resizeTextArea(textarea) {
      textarea.css('overflowY', 'hidden');
      textarea.height('initial');
      textarea.height(Math.min(textarea.prop('scrollHeight'), 214) + 'px');
    }

    $(document).on('keyup', '.note-content', function (e) {
      resizeTextArea($(e.target));
    });

    // Constructor for a note
    function Note (noteText, createdAt, updatedAt) {
      this.noteText = noteText;
      this.createdAt = createdAt || (new Date()).getTime();
      this.id = generateId();
      this.updatedAt = updatedAt || (new Date()).getTime();
      this.update = function () {
        this.updatedAt = (new Date()).getTime();
        return this.updatedAt;
      }
    }

    // Unique id generator function
    var generateId = (function () {
      var counter = 0;
      return function () {
        counter++;
        return counter.toString();
      };
    })();

    // Pretty-fies a javascript date object
    function prettyDate(date) {
      return moment(date).calendar();
    }

    // Adds a note to html page
    var addNote = function (note) {
      var updatedDate = prettyDate(note.updatedAt);
      var createdDate = prettyDate(note.createdAt);
      var notePreview = note.noteText.split('\n')[0];
      notesContainer.prepend('<div class="note edit-note" id="' + note.id + '"><div class="note-preview"><button class="delete-note note-actions" title="Delete"><span class="glyphicon glyphicon-trash" aria-label="Edit"></span></button><div class="note-title">' + notePreview + '</div></div><div class="dates"><span class="updated-date">' + updatedDate +  '</span><span class="created-date">' + createdDate + '</span></div><textarea class="note-content" rows="2" disabled>' + note.noteText + '</textarea>' + '</div>');
    }

    // Saves all notes to local storage
    var saveNotes = function () {
      localStorage['notes'] = JSON.stringify(notes);
    };

    // Loads all notes from local storage to an array of Note objects and populates them on the html page
    var notes = (function initApplication (data) {
      var notes = data ? JSON.parse(data) : [];
      var notesObjects = [];
      var noteObject;
      var i;
      for (i = 0; i < notes.length; i++) {
        noteObject = new Note(notes[i].noteText, notes[i].createdAt, notes[i].updatedAt);
        notesObjects.push(noteObject);
      }
      renderNotes(notesObjects);
      return notesObjects;
    })(localStorage['notes']);

    // Rerenders all notes in the html page
    function renderNotes(notes) {
      notesContainer.empty();
      var asc;

      var orderBy = $('#notesOrder').val() === "created" ? 'createdAt' : 'updatedAt';

      // This is statement only applies if the "newest to oldest" filtering feature is turned on
      if ($('#notesOrderDirection').val()) {
        asc = $('#notesOrderDirection').val() === "asc";
      } else {
        asc = orderBy === 'updatedAt'; 
      }

      var searchTerm = notesSearchFilter.val().toLowerCase();

      var filteredNotes = notes.filter(function (note) {
        return searchTerm ? note.noteText.toLowerCase().indexOf(searchTerm) > -1 : true;
      });

      var filteredNotes = filteredNotes.sort(function (note1, note2) {
        return asc ? note1[orderBy] > note2[orderBy] : note1[orderBy] < note2[orderBy];
      });

      var i;
      for (i = 0; i < filteredNotes.length; i++) {
        addNote(filteredNotes[i]);
      }
    }

    // Handles the creation of a new note
    newNoteForm.submit(function (e) {
      e.preventDefault();

      var note = new Note(newNoteContent.val());
      notes.unshift(note);
      addNote(note);
      saveNotes();
      newNoteContent.val(null);
      resizeTextArea(newNoteContent);
    });

    // Handles the edit note action by enabling the editing of a note and displaying the save button
    notesContainer.on('click', '.edit-note', function(e) {
      var note = $(e.target).closest('.note');
      var noteId = note.attr('id');
      if (activeNoteId) {
        // close and save the currently open note
        $('#' + activeNoteId).find('.note-content').prop('disabled', true);
        var activeNoteContent = $('#' + activeNoteId).find('.note-content').val();
        for (i = 0; i < notes.length; i++) {
          if (activeNoteId === notes[i].id) {
            notes[i].noteText = activeNoteContent;
            updatedDate = notes[i].update();
          }
        }
        $('#' + activeNoteId).find('.note-title').text(activeNoteContent.split('\n')[0]);
        saveNotes();
      }
      // if user clicks on a note header for a note that's already open then we close that note
      if (activeNoteId != noteId || $(e.target).prop('tagName').toLowerCase() === 'textarea') {
        activeNoteId = noteId;
        note.find('.note-content').prop('disabled', false);
        resizeTextArea(note.find('.note-content'));
      } else {
        activeNoteId = null;
      }
    });

    // Deletes a node; TODO: "are you sure you wanna delete?"
    notesContainer.on('click', '.delete-note', function(e) {
      var note = $(e.target).closest('.note');
      notes = notes.filter(function (aNote) {
        return aNote.id != note.attr('id');
      });
      note.toggle();
      saveNotes();
    });

    // Filters and sorts the notes
    filterFormElements.change(function () {
      renderNotes(notes);
    });
    notesSearchFilter.keyup(function () {
      renderNotes(notes);
    })

  });
})();