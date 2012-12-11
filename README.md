Nodem
-----
A NodeJS MUD server.

## How Commands are Parsed
Prior to login:
  1. The login parser is the only command parser that is checked.

After login:
  1. The user's personal command parser is checked first.
  2. Custom command parsers (see below) are checked by priority.
  3. The global command parser is checked last.

Individual command implementations may, optionally, call the "function" parser
with a specific phrase to allow for softcode parsing.

### Custom Parsers
```javascript
Parser.getParser(<context>[, <priority>, <test>]);
```

   **<context>:** (String) The name of the parser (can be used to fetch a
        parser which already exists)
   **<priority>:** (Integer) The parser's priority.  A lower number means it
        will be checked sooner.
   **<test>:** (Function) A boolean to determine whether the parser is
        appropriate for the current situation.

Some additional parsers which might make sense:
* "Local" or "Room" parsers.
* "Nearby" parsers.
* "Zone" parsers.

### Examples
```javascript
var loginParser     = Parser.getParser('login');
var connect         = new Parser.Rule;
connect.name        = 'Connect';
connect.expression  = /^connect\s+(?:"(.+?)"|(\S+))\s+(?:"(.+?)"|(\S+))/i
connect.priority    = 1;
connect.handler     = function(session, value) {
    parts           = this.expression.exec(value);

    if (parts) {
        var user    = parts[1] || parts[2];
        var pass    = parts[3] || parts[4];
    }

    if (User.getByCredentials(user, pass) instanceof User) {
        session.setStatus(Session.Status.CONNECTED);
    }
}
loginParser.addRule(connect);
```