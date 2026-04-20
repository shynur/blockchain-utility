## Git

### Commit Message

A changeset you commit should contain a description of the changes in its commit message.
Here is an example commit message (indented):

```
Deactivate shifted region

Do not silently extend a region that is not highlighted;
this can happen after a shift (Bug#19003).
* doc/emacs/mark.texi (Shift Selection): Document the change.
* lisp/window.el (handle-select-window):
* src/frame.c (Fhandle_switch_frame, Fselected_frame): Deactivate the mark.
```

Here are guidelines for formatting them:

- Start with a single unindented summary line (commit log message line) explaining the change;
  don’t end this line with a period.
  If possible, try to keep the summary line to 50 characters or fewer;
  it must be shorter than 79 characters.

  Summary line starting with a semicolon and a space `; ` means it’s a small change.

- After the summary line, there should be an empty line.

- If the commit couldn’t be properly summarized in the brief summary line,
  you can put one or more paragraphs (after the empty line and before the individual ChangeLog entries) that further describe(s) the commit.

- If only a single file is changed,
  the summary line can be the normal first line of a ChangeLog entry (starting with the asterisk).
  Then there will be no individual ChangeLog entries beyond the one in the summary line.

- If the commit adds new files, the file names must not begin with `-`
  and must consist of digits, English letters,
  and characters of the set `[-+./_]`.

- If the commit has more than one author,
  the commit message should contain separate lines to mention the other authors,
  like the following:

  ```
  Co-authored-by: Your Name <your email>
  ```

- Commit messages should contain only printable UTF-8 characters.

- Preferred form for several entries with the same content:

  ```
  * lisp/menu-bar.el (clipboard-yank, clipboard-kill-ring-save, clipboard-kill-region):
  * lisp/eshell/esh-io.el (eshell-virtual-targets, eshell-clipboard-append): Replace option gui-select-enable-clipboard with select-enable-clipboard; renamed October 2014.  (Bug#25145)
  ```

  (Rather than anything involving “ditto” and suchlike.)
