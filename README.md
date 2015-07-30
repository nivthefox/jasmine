# JaSMINE
JavaScript Mass Interactive Narrative Environment

[![Build Status](https://img.shields.io/travis/kkragenbrink/jasmine/master.svg)](https://travis-ci.org/kkragenbrink/jasmine)
[![Coverage Status](https://img.shields.io/coveralls/kkragenbrink/jasmine.svg)](https://coveralls.io/r/kkragenbrink/jasmine)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/kkragenbrink/jasmine/blob/master/LICENSE.txt)

## Directory Structure
```
game-name/      # Your game-specific files
  commands/     # Your custom commands
  types/        # Your custom object types
  config.yml    # The main configuration file
  test/         # Your custom unit tests
jasmine/        # The jasmine core sourcecode; do not modify
  game/         # The default game directory to be copied for a new game
  commands/     # Built in commands
  types/        # Built in object types
  test/         # Unit tests
jasmine         # The main executable
```
