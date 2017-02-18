all: readme v0.8 v0.12 v4. v6. v7.

readme: README.md
	markedpp --githubid -i $< -o $<

v%:
	n $@ && npm test

zuul:
	node_modules/.bin/zuul --local 3000 test/*.js

.PHONY: all readme zuul
