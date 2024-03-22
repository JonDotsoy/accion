lib_path = ./lib
esm_path = $(lib_path)/esm
cjs_path = $(lib_path)/cjs
types_path = $(lib_path)/types

all:
	@echo .

build: clean build@esm build@cjs build@types

build@esm:
	bunx tsc --project tsconfig.esm.json --outDir $(esm_path)
	echo '{"type": "module"}' > $(esm_path)/package.json

build@cjs:
	bunx tsc --project tsconfig.cjs.json --outDir $(cjs_path)
	echo '{"type": "commonjs"}' > $(cjs_path)/package.json

build@types:
	bunx tsc --project tsconfig.types.json --outDir $(types_path)

clean: clean@lib

clean@lib:
	rm -rf $(lib_path)
