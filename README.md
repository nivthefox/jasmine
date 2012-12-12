Nodem
-----
A NodeJS MUD server.

## How Commands are Handled
All commands pass through the Interpreter, which consists of a series of
regular expression command lists.  The Interpreter goes through each command
list, testing until it finds a match.  When a match is found, the Interpreter
hands off evaluation of the command to the appropriate handler, then stops
searching.

Each command list has an collective rule which determines whether that list
should be tested at all, as well as a priority to determine in what order
the list should be tested.  Lower numbered priorities are more important.

An individual command is, therefore, tested according to the following set
of rules (in order):
  1. If the session is in CONNECTING status, the login command list is
      checked.
  2. If any custom command lists have been defined (see below), they are
      checked by ascending priority.
  3. The general command list is checked.
  4. The command is treated as an unhandled command, and the session receives
      a "failed" event.

Once a command is matched, the interpreter will determine whether that expects
the parser to be invoked (default: false).  If it should invoke the parser, it
does so, then passes the tokenized stream to the handler as an array.  If it
should not, then the untokenized stream is passed to the handler as an array of
a single string.

### Custom Command Lists
```javascript
Interpreter.getList(<name>[, <priority>, <test>]);
```

  * **name** (String) The name of the command list (can be used to fetch a
      command list which already exists)
  * **priority** (Integer) The list's priority.  A lower number means it will
      be checked sooner.
  * **test** (Function) A boolean to determine whether the command list is
      appropriate for the current situation.

Some additional command lists which might make sense:
  * "Personal" lists. (Aliases, Channel Aliases, etc.)
  * "Local" or "Room" lists.
  * "Nearby" lists.
  * "Zone" lists.