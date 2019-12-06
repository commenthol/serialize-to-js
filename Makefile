all: readme v8 v10 v12 v13

readme: README.md
	markedpp --githubid -i $< -o $<

v%:
	n $@ && npm test

zuul:
	node_modules/.bin/zuul --local 3000 test/*.js

.PHONY: all readme zuul
