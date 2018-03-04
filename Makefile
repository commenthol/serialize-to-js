all: readme v4. v6. v8. v9.

readme: README.md
	markedpp --githubid -i $< -o $<

v%:
	n $@ && npm test

zuul:
	node_modules/.bin/zuul --local 3000 test/*.js

.PHONY: all readme zuul
