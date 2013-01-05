SRC					= src
TESTS				= test
INTERFACE			= qunit
REPORTER			= spec
TIMEOUT				= 5000
ENV					= test
JSDOC				= /usr/lib/node_modules/jsdoc/jsdoc
MOCHA				= ./node_modules/.bin/mocha

clean:
	rm -rf coverage
	rm -f coverage.html
	rm -rf doc

coverage.html:
	mkdir -p ./coverage
	cp -r $(TESTS) ./coverage/$(TESTS)
	cp -r config ./coverage/config
	jscoverage hdr ./coverage/hdr
	jscoverage src ./coverage/src
	@NODE_ENV=$(ENV) NOLOG=1 $(MOCHA) \
		--ui $(INTERFACE) \
		--reporter html-cov \
		--timeout $(TIMEOUT) \
		./coverage/$(TESTS) > coverage.html
	rm -rf coverage

coverage: clean coverage.html

docs: clean documentation

documentation:
	mkdir -p ./doc
	./node_modules/jsdoc/jsdoc hdr src -r -p -d doc README.md

install: clean node_modules

node_modules:
	@NODE_ENV="$(ENV)" npm install

realclean: clean
	rm -rf node_modules

test:
	@NODE_ENV=$(ENV) NOLOG=1 $(MOCHA) \
		--ui $(INTERFACE) \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		$(TESTS)

test-watch:
	@NODE_ENV=$(ENV) NOLOG=1 $(MOCHA) \
		--ui $(INTERFACE) \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		--watch \
		$(TESTS)

.PHONY: clean coverage docs documentation install node_modules realclean test test-watch
