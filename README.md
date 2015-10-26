# arrow-logger
`arrow-logger` is node development helper tools.
Show variables or returned value of method by arrow comment (`// =>`). Behaves like ruby xmpfilter command in [rcodetools gem](https://rubygems.org/gems/rcodetools).

## Install
```sh
$ npm install arrow-logger
```

## Usage
Add arrow comment to your code and run.
```javascript
$ cat sample.js
var string = 'Hello World';
string; // =>
string.length; // =>
string.slice(6); // =>
string.split(' '); // =>

$ arrow-logger sample.js
var string = 'Hello World';
string;    // => 'Hello World'
string.length;    // => 11
string.slice(6);    // => 'World'
string.split(' ');    // => [ 'Hello', 'World' ]
```

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
