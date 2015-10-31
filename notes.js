(function () {
  return $(document).ready(function () {

    var notesContainer = $('#notesContainer');
    var newNoteForm = $('#newNoteForm');
    var newNoteContent = $('#newNoteText');
    var filterFormElements = $('#notesOrder, #notesOrderDirection');
    var notesSearchFilter = $('#notesSearchFilter');
    var activeNoteId = null;

    // resizes a text area's height based on how many lines have been typed inside of it
    function resizeTextArea(textarea) { 
      textarea.height('initial');
      var maxHeight = textarea.height() * 5;
      if (textarea.prop('scrollHeight') > maxHeight) {
        textarea.css('overflowY', 'scroll');
      } else {
        textarea.css('overflowY', 'hidden');
      }
      textarea.height(Math.min(textarea.prop('scrollHeight'), maxHeight) + 'px');
    }

    // when a user edits a note's content, the associated textarea's height may need to be adjusted using resizeTextArea function
    $(document).on('keyup', '.note-content', function (e) {
      resizeTextArea($(e.target));
    });

    // Constructor for a note. A note contains text, createdAt time, updatedAt time, and an update function that should be called when the updatedAt time needs to be set to now
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

    // Unique id generator function for each note
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

    // Adds a note to html page, and updates the "no-notes" class used by the filter depending on if there is at least 1 note or not
    function addNote (note) {
      $('#filtersDiv').removeClass('no-notes');
      var updatedDate = prettyDate(note.updatedAt);
      var createdDate = prettyDate(note.createdAt);
      var notePreview = note.noteText.split('\n')[0];
      notesContainer.prepend('<div class="note edit-note" id="' + note.id + '"><div class="note-preview"><button class="delete-note note-actions" title="Delete"><span class="glyphicon glyphicon-trash delete-note" aria-label="Trash"></span></button><div class="note-title">' + notePreview + '</div></div><div class="dates"><span class="updated-date">' + updatedDate +  '</span><span class="created-date">' + createdDate + '</span></div><textarea class="note-content" rows="2" disabled>' + note.noteText + '</textarea>' + '</div>');
    }

    // Saves all notes to local storage
    var saveNotes = function () {
      localStorage['notes'] = JSON.stringify(notes);
    };

    // Loads all notes from local storage to an array of Note objects and populates them on the html page using the renderNotes function
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

    // Rerenders all notes in the html page. Expects as input an array of Notes. Applies appropriate filters before rendering the notes
    function renderNotes(notes) {
      notesContainer.empty();
      var asc;

      var orderBy = $('#notesOrder').val() === "created" ? 'createdAt' : 'updatedAt';

      // This is statement only applies if the "newest to oldest" filtering feature is turned on
      if ($('#notesOrderDirection').val()) {
        asc = $('#notesOrderDirection').val() === "asc";
      } else {
        asc = (orderBy === 'updatedAt'); 
      }

      var searchTerm = notesSearchFilter.val().toLowerCase();

      var filteredNotes = notes.filter(function (note) {
        return searchTerm ? note.noteText.toLowerCase().indexOf(searchTerm) > -1 : true;
      });

      filteredNotes = filteredNotes.sort(function (note1, note2) {
        return asc ? note1[orderBy] - note2[orderBy] : note2[orderBy] - note1[orderBy];
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

    // Saves the currently active note
    function saveActiveNote () {
      var updatedDate;
      var note = $('#' + activeNoteId);
      var noteContent = note.find('.note-content').val();
      var i;
      for (i = 0; i < notes.length; i++) {
        if (activeNoteId === notes[i].id) {
          notes[i].noteText = noteContent;
          updatedDate = notes[i].update();
        }
      }
      note.find('.note-title').text(noteContent.split('\n')[0]);
      note.find('.updated-date').text(prettyDate(updatedDate));
      saveNotes();
    }

    // When a user clicks on a note, we're in "edit mode" for that note, meaning we change the currently active note to the note the user has clicked on
    notesContainer.on('click', '.edit-note', function(e) {
      if (!$(e.target).hasClass('delete-note')) {
        var note = $(e.target).closest('.note');
        var noteId = note.attr('id');
        if (activeNoteId) {
          // close the currently open note
          $('#' + activeNoteId).find('.note-content').prop('disabled', true);
        }
        // if user clicks on a note header for a note that's already open then we close that note
        if (activeNoteId != noteId || $(e.target).prop('tagName').toLowerCase() === 'textarea') {
          activeNoteId = noteId;
          note.find('.note-content').prop('disabled', false);
          resizeTextArea(note.find('.note-content'));
        } else {
          activeNoteId = null;
        }
      }
    });

    // Saves a note each time a change is made. Note that only the active note would need to be saved as it's currently the one being edited
    notesContainer.on('change', '.note-content', function () {
      saveActiveNote();
    });

    // Deletes a node; TODO: "are you sure you wanna delete?"
    notesContainer.on('click', '.delete-note', function(e) {
      var note = $(e.target).closest('.note');
      notes = notes.filter(function (aNote) {
        return aNote.id != note.attr('id');
      });
      note.remove();
      saveNotes();

      // if we've deleted all the notes, then add the "no notes" class to the filter div
      if (notes.length === 0) {
        $('#filtersDiv').addClass('no-notes');
      }

      activeNoteId = null;  
    });

    // Filters and sorts the notes
    filterFormElements.change(function () {
      renderNotes(notes);
    });
    notesSearchFilter.keyup(function () {
      renderNotes(notes);
    });

  });
})();