# es6-boilerplate:
Boilerplate for authoring in ES6 and publishing in ES5.

## Scripts
```sh
$ npm run
Lifecycle scripts included in es6-boilerplate:
  test
    mocha --compilers js:espower-babel/guess test/*.js

available via `npm run-script`:
  build
    babel src --out-dir lib
  watch
    babel src --out-dir lib --watch
  test-watch
    mocha --watch --compilers js:espower-babel/guess test/*.js
  lint
    eslint src test
```
