SRC					= src
INTERFACE			= qunit
REPORTER			= spec
TIMEOUT				= 5000
ENV					= test
JSDOC				= /usr/lib/node_modules/jsdoc/jsdoc
MOCHA				= ./node_modules/.bin/mocha
TESTS				:= test/*Tests.js $(foreach mod, $(shell ls mod), $(PWD)/mod/$(mod)/test/*Tests.js)

all: clean node_modules coverage docs

clean:
	@rm -rf coverage
	@rm -f coverage.html

coverage.html:
	$(error Coverage tests are disabled pending module inclusion)
	@mkdir -p ./coverage
	@cp -r $(TESTS) ./coverage/$(TESTS)
	@cp -r config ./coverage/config
	@jscoverage hdr ./coverage/hdr
	@jscoverage src ./coverage/src
	@NODE_ENV=$(ENV) $(MOCHA) \
	 	--ui $(INTERFACE) \
	 	--reporter html-cov \
	 	--timeout $(TIMEOUT) \
	 	$(TESTS) > coverage.html

coverage: clean coverage.html

docs: documentation

documentation:
	@mkdir -p ./doc
	@./node_modules/jsdoc/jsdoc hdr src -r -p -d doc README.md

install: clean node_modules

node_modules:
	@if test ! -d $(PWD)/node_modules ; then \
		NODE_ENV="$(ENV)" npm install --quiet ; \
	else \
		NODE_ENV="$(ENV)" npm update --quiet ; \
	fi

realclean: clean
	@rm -f coverage.html
	@rm -rf doc
	@rm -rf node_modules

test:
	@NODE_ENV=$(ENV) $(MOCHA) \
	 	--ui $(INTERFACE) \
	 	--reporter $(REPORTER) \
	 	--timeout $(TIMEOUT) \
	 	$(TESTS)

.PHONY: all clean coverage docs documentation install node_modules realclean test
