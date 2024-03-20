esm_path = ./lib/esm/
cjs_path = ./lib/cjs/

all:
	@echo .

build: build@esm build@cjs

build@esm: clean@esm
	bunx tsc --project tsconfig.esm.json --outDir $(esm_path)

build@cjs: clean@cjs
	bunx tsc --project tsconfig.cjs.json --outDir $(cjs_path)

clean: clean@esm clean@cjs

clean@esm:
	rm -rf $(esm_path)

clean@cjs:
	rm -rf $(cjs_path)
