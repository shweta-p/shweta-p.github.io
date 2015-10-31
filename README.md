Notes App
Shweta Panditrao
November 2015

Access the app here: http://shweta-p.github.io/

This app has been optimized for the mobile web. It depends on havng access to the internet (since I'm loading jquery, bootstrap, moment, etc as dependencies).


Features:

1) Ability to add notes
   Add notes by typing in the textarea at the top of the screen and clicking add. These notes can be multi-lined.
2) Ability to delete notes
   Click the trash icon to delete any note.
3) Ability to edit notes
   Click on a note and start typing in the textarea to edit it. Edits will save automatically.
4) Filters to search notes by word/phrase or by created/ updated date
   Enter words/phrases into the search box to filter notes (note: this is not case sensitive). Also select either updated or created from the dropdown to sort notes by created (oldest to newest) or updated (newest to oldest).


To Do (Enhancements)

1) 'Are you sure you want to delete?' Button
   This one would be simple to do, perhaps with an icon change/slide effect that asks the user to confirm their delete action. Another simple way to do this would be through a popup dialog, but that's a little obtrusive/ annoying.
2) Animations when users click on a note to edit.
   Use webkit to create a "slide" animation that allows a smooth expansion of a note when it is clicked.
2) When a user updates/edits the note, should the notes rerender so that the newly updated note is up top?
   Pros to this approach: The updated order persists when edits are made. Users don't have to resort all notes (that's a little unintuitive).
   Cons to this approach: It's disorienting to see notes jump around on the page when they're updated.
   Currently in production: Notes currently don't sort upon editing, though that would be a small/easy change to make (just call the rerenderNotes function on edit). Overall, the UX seems to deteriorate when notes jump around on edit.
3) Ability to add images into the notes.
   Possible way to implement this: Use contenteditable div rather than textarea. I tried doing this briefly, but it brings a host of other problems, such as users being able to insert break tags in the divs, and then having to sanitize this input.