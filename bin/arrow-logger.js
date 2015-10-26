#!/usr/bin/env node
var program = require('commander');
var arrowLogger = require('../lib/arrow-logger');
var fs = require('fs');

program
  .version(require('../package.json').version)
  .usage('[options] <js file ...>')
  .option('-c,  --config <path>',  'set configurations')
  .parse(process.argv);

var stream;
if (process.stdin.isTTY) {
  if (program.args.length === 0) {
    program.help();
    process.exit(0);
  }
  stream = fs.createReadStream(program.args[0]);
} else {
  if (program.args.length !== 0) {
    program.help();
    process.exit(0);
  }
  stream = process.stdin;
}

var data = '';
stream.on('data', function(buf) {
  data += buf;
});
stream.on('end', function() {
  arrowLogger
    .run(data, program)
    .then(function(result) {
      console.log(result);
    });
});
