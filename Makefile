.PHONY: up reset build dist bump version
build:
	yarn

up:
	yarn tauri dev

dist:
	yarn tauri build

reset:
	cd ~/.config && rm -rf com.mechanic-estimates.app

version:
	@echo "Versione corrente: $$(grep -m1 '\"version\"' src-tauri/tauri.conf.json | grep -oP '[\d.]+')"

# Usage: make bump V=2.3.0
bump:
	@test -n "$(V)" || (echo "Specifica la versione: make bump V=x.y.z" && exit 1)
	@echo "Versione corrente: $$(grep -m1 '\"version\"' src-tauri/tauri.conf.json | grep -oP '[\d.]+')"
	@sed -i 's/"version": ".*"/"version": "$(V)"/' src-tauri/tauri.conf.json package.json
	@echo "Versione aggiornata a $(V)"