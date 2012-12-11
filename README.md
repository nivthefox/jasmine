Nodem
-----
A NodeJS MUD server.

## How Commands are Parsed

Prior to login, the login parser is the only parser that is checked.

After login:
  1. The user's personal parser is checked first.
  2. Custom parsers (see below) are checked by priority.
  3. The global parser is checked last.

### Custom Parsers
```javascript
Parser.getParser(<context>[, <priority>, <test>]);
```

   **<context>:** (String) The name of the parser (can be used to fetch a parser which already exists)
   **<priority>:** (Integer) The parser's priority.  A lower number means it will be checked sooner.
   **<test>:** (Function) A boolean to determine whether the parser is appropriate for the current situation.

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
loginParser.addRule(