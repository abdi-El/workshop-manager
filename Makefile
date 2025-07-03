.PHONY: up reset build
build:
	yarn

up:
	yarn tauri dev

reset:
	cd ~/.config && rm -rf com.mechanic-estimates.app