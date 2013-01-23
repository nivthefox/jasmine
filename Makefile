SRC					= src
TESTS				= test
INTERFACE			= qunit
REPORTER			= spec
TIMEOUT				= 5000
ENV					= test
JSDOC				= /usr/lib/node_modules/jsdoc/jsdoc
MOCHA				= ./node_modules/.bin/mocha

all: clean node_modules coverage docs

clean:
	@rm -rf coverage
	@rm -f coverage.html

coverage.html:
	@mkdir -p ./coverage
	@cp -r $(TESTS) ./coverage/$(TESTS)
	@cp -r config ./coverage/config
	@jscoverage hdr ./coverage/hdr
	@jscoverage src ./coverage/src
	@$(MAKE) test-core REPORTER=html-cov > coverage.html

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

test: test-core test-modules

test-core:
	@echo "Testing jasmine core."
	@NODE_ENV=$(ENV) $(MOCHA) \
		--ui $(INTERFACE) \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		$(TESTS)

test-modules:
	@echo "Testing currently available modules."
	@for mod in `ls mod` ; do \
		if test -d $(PWD)/mod/$$mod ; then \
			echo "-- Module: $$mod" ; \
			NODE_ENV=$(ENV) $(MOCHA) \
				--ui $(INTERFACE) \
				--reporter $(REPORTER) \
				--timeout $(TIMEOUT) \
				$(PWD)/mod/$$mod/test ; \
		fi ; \
	done

.PHONY: all clean coverage docs documentation install node_modules realclean test test-core test-modules
