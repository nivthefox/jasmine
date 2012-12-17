JaSMINE
=====
JavaScript Mass Interactive Narrative Environment.

How Commands are Handled
-----
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

### Custom Command Lists
Custom command lists can be defined at any time.  Calling this method more
than once updates the settings for the command list in question, allowing
commands to be assigned to a list that doesn't yet exist.
```javascript
Interpreter.configure(<list>, <priority>[, <test>]);
```

  * **list** (String) The name of the command list (can be used to fetch a
      command list which already exists)
  * **priority** (Integer) The list's priority, defined as the order in which
      it will be tested. E.g. priority 1 is tested before priority 2.
  * **test** (Function) A boolean to determine whether the command list is
      appropriate for the current situation. This method takes two arguments:
      * **session** (Session) The session which initiated the command.
      * **phrase** (String) The phrase which is going to be handled by a
          command.
      If no test is specified, the list will default to TRUE.

By default, the following command lists are defined:
  * _login_: Handles commands while Session.CONNECTING === TRUE.
  * _general_: Generic command list while Session.CONNECTED === TRUE.

Some additional command lists which might make sense, but are not defined by
default:
  * "Personal" lists. (Aliases, Channel Aliases, etc.)
  * "Local" or "Room" lists.
  * "Nearby" lists.
  * "Zone" lists.

#### Adding a command to a list
Commands are added to lists as a regex and a handler.
```javascript
Interpreter.addCommand(<list>, <command>);
```

  * **list** (String) The name of the command list to place the command on.
      If the specified list does not already exist, it will be created using
      the default priority and test.
  * **command** (Command) An implementation of the Command interface, which
      defines the command's structure as well as handles any calls to the
      command.

### Implemented Commands
When fully implemented, a Command will have a Regular Expression which is
tested by the Interpreter to determine if the Command is appropriate, and a
handler which is called by the Interpreter when a match is found.
```javascript
// Internal code in the Interpreter.
if (Command.test(<phrase>)) {
    Command.handle(<Session>, <phrase>, <callback>);
}
```

  * **<phrase>** The command phrase which needs to be handled.
  * **<Session>** The session which created the phrase.
  * **<callback>** A callback to run when the command has been fully handled.
      This method takes one argument:
      * **instructions** (Instruction[]) The Instruction Set (see below) to be
          followed to generate output, manipulate objects, etc.

These arguments are actually first passed to the Interpreter when it is Invoked:
```javascript
Interpreter.interpret(<Session>, <phrase>, <callback>)
```

When input is received from a session, the initial callback will iterate
through the resulting Instruction Set and perform each Instruction in
sequence.
```javascript
// Internal code in the Session interpret callback
for (var i in instructions) {
    instructions[i].perform();
}
```

### Evaluation
Some commands may have input which is intended to be parsed as code. For
example, most commands which create output will respect substitution codes
such as new line (%r) or tab (%t).

Although any module can add additional parsers, it is generally encouraged
that evaluation of phrases as softcode be done using the default parser.
```javascript
var out = Parser.parse(<session>, <phrase>[, <parser>])
```

  * **session** (Session) The session which created the phrase.
  * **phrase** (Phrase) The phrase which needs to be evaluated.
  * **parser** (String) The name of the parser to invoke. (default: 'default')

Modules can easily extend the softcode parser:
```javascript
Parser.addRule(<rule>[, <parser>])
```

  * **rule** (Rule) The rule to be added.  Rules are an instance of the Rule
      struct found in src/Parser.js:
      * **name** (String) The name of the rule.
      * **test** (RegExp) The tokenizing match for the rule.
      * **handler** (Function) The method to run when the parser encounters
          this rule.
  * **parser** (String) The name of the parser to update. (default: 'default')

### Recursive Interpretation
Some commands might choose to call the Interpreter a second time with a subset
of the phrase they were given to handle.  These commands must implement their
own callback to handle the resulting Instruction Set, but can be used to alter
the Instruction Set however necessary before handing off their own Instruction
Set to the original callback.

For example, a command might be defined which disables the parser for the rest
of the phrase (in MUSHes, this command is "]"), or a command might be defined
which prefixes all output with another phrase (such as an "OOC" command).

Instruction Sets
-----
Any generation of output or modification of objects is handled through the
creation of an Instruction Set.  Generating an Instruction Set is as simple as
creating an array of Instructions using the Instruction API.

### Instructions
Instructions are specific classes which perform some action like modifying an
object in memory, or performing output.  Each Instruction is unique, and
requires a different set of parameters to initialize and perform it.

For example, an Instruction "oemit" might be defined to output a string to all
Sessions with a location near another Session.  The "oemit" Instruction would
then require the originator Session and the Phrase to be output as parameters
when it is initialized.  When performed, it would filter the active Sessions
to find those which have the same location as the originator Session and
output the selected phrase.

### Defining an Instruction
Instructions are defined by creating a new class, and then adding that class
to the Controller:
```javascript
var myInstruction = Implement(Instruction, <definition>);
Controller.define(<name>, myInstruction);
```

  * **definition** (Class) The definition of the Instruction.
  * **name** (String) The name of the Instruction.

### Invoking an Instruction
Instructions are invoked and prepared by calling the Controller:
```javascript
var Set = [];
Set.push(Controller.instruction(<instruction>, <arguments>));
```

  * **instruction** (String) The name of the instruction to be prepared.
  * **arguments** (*[]) Any arguments required to prepare the Instruction.
