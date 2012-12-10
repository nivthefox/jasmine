Nodem
-----
A NodeJS MUD server.

## How Commands are Parsed

Prior to login, the login parser is the only parser that is checked.

After login:
1. The user's personal parser is checked first.
2. The local parser for the room they are in is checked second.
3. The global parser is checked last.
