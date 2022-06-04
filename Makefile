.PHONY: project
project:
	make build

.PHONY: install
install:
	npm install --prefer-offline --no-audit

.PHONY: test
test:
	./node_modules/.bin/jest --runInBand --passWithNoTests

.PHONY: build
build:
	make tsc

.PHONY: esbuild
esbuild:
	./node_modules/.bin/esbuild --bundle src/index.ts --outdir=dist/cjs --minify --platform=node --target=node16 "--external:./node_modules/*"

.PHONY: tsc
tsc:
	./node_modules/.bin/tsc --resolveJsonModule -p ./tsconfig.json --module commonjs --outDir ./dist/cjs --emitDeclarationOnly

