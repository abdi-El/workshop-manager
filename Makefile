.PHONY: up reset build dist
build:
	yarn

up:
	yarn tauri dev

dist:
	yarn tauri build

reset:
	cd ~/.config && rm -rf com.mechanic-estimates.app