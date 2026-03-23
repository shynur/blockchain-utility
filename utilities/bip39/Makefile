SHELL := /bin/bash -O globstar

.PHONY: all
all:

.PHONY: type-check
type-check:
	tsc --noEmit --allowJs --checkJs --strict --module nodenext --typeRoots `npm root -g`/@types --types node main.mjs
