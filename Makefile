all: readme v0.8 v0.10 v0.12

readme: README.md
	markedpp --githubid -i $< -o $<

v%:
	n $@ && npm test

.PHONY: all readme