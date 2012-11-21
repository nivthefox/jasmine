SRC					= src
TESTS				= test
INTERFACE			= qunit
REPORTER			= spec
TIMEOUT				= 5000

test:
	@NODE_ENV=test NOLOG=1 ./node_modules/.bin/mocha \
		--ui $(INTERFACE) \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		$(TESTS)

test-watch:
	@NODE_ENV=test NOLOG=1 ./node_modules/.bin/mocha \
		--ui $(INTERFACE) \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		--watch \
		$(TESTS)

clean:
	rm -rf coverage
	rm -f coverage.html

coverage.html:
	mkdir -p ./coverage
	cp -r $(TESTS) ./coverage/$(TESTS)
	cp -r config ./coverage/config
	jscoverage src ./coverage/src
	@NODE_ENV=test NOLOG=1 ./node_modules/.bin/mocha \
		--ui $(INTERFACE) \
		--reporter html-cov \
		--timeout $(TIMEOUT) \
		./coverage/$(TESTS) > coverage.html

coverage: clean coverage.html

.PHONY: clean coverage test test-watch