SRC                 = src/
TESTS               = test/
INTERFACE           = qunit
REPORTER            = spec
TIMEOUT             = 5000

test:
    @NODE_ENV=test @NOLOG= ./node_modules/.bin/mocha \
        --ui $(INTERFACE) \
        --reporter $(REPORTER) \
        --timeout $(TIMEOUT) \
        $(TESTS)

test-watch:
    @NODE_ENV=test @NOLOG= ./node_modules/.bin/mocha \
        --ui $(INTERFACE) \
        --reporter $(REPORTER) \
        --timeout $(TIMEOUT) \
        --watch \
        $(TESTS)

coverage.html:
    mkdir -p ./coverage/noop
    rm -r ./coverage/*
    if [ -d fixtures ]; then
        cp -r fixtures ./coverage/fixtures
    fi
    cp -r $(TESTS) ./coverage/$(TESTS)
    jscoverage $(SRC) ./coverage/$(SRC)
    test REPORTER=html-cov TESTS=coverage/$(TESTS) > coverage.html
    rm -r coverage

coverage: coverage.html

.PHONY: coverage test test-watch