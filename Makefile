ENV					= test
PWD					= `pwd`
INTERFACE			= qunit
REPORTER			= spec
COVERAGE			= json-cov
TESTS               = test
COVTESTS			= coverage/test

default: install

coverage.html: clean
	@$(MAKE) coverage COVERAGE=html-cov > coverage.html

coverage:
	@mkdir -p ./coverage/noop
	@rm -r ./coverage/*
	@cp -r test ./coverage/test
	@cp -r cfg ./coverage/cfg
	@jscoverage src ./coverage/src
	@NODE_ENV=$(ENV) ./node_modules/.bin/mocha \
		--ui $(INTERFACE) \
		--reporter $(COVERAGE) \
		$(COVTESTS)

docs:
	@echo Generating documentation.
	@mkdir -p ./docs
	@./node_modules/jsdoc/jsdoc app -r -d docs

install: node_modules

node_modules:
	@echo Installing node modules.
	@if test ! -d $(PWD)/node_modules ; then \
		NODE_ENV="$(ENV)" npm install --python=python2 ; \
	else \
		NODE_ENV="$(ENV)" npm update --python=python2 ; \
	fi

clean:
	@rm -f coverage.html

realclean:
	rm -rf coverage
	rm -rf docs
	rm -rf node_modules

test:
	@NODE_ENV=$(ENV) ./node_modules/.bin/mocha \
		--ui $(INTERFACE) \
		--reporter $(REPORTER) \
		$(TESTS)

.PHONY: coverage install clean realclean test
