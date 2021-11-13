install:
	npm ci
publish:
	npm publish --dry-run
lint:
	npx eslint .
test:
	NODE_OPTIONS=--experimental-vm-modules npm jest
test-coverage:
	NODE_OPTIONS=--experimental-vm-modules npm jest --coverage --coverageProvider=v8