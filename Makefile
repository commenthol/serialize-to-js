all: readme v0.8 v0.12 v4.4 v5.10

readme: README.md
	markedpp --githubid -i $< -o $<

v%:
	n $@ && npm test

.PHONY: all readme
