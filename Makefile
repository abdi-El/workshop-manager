.PHONY: up reset
up:
	yarn tauri dev

reset:
	cd ~/.config && rm -rf com.mechanic-estimates.app