#!/usr/bin/env node
var program = require('commander');
var arrowLogger = require('../lib/arrow-logger');

program
  .version(require('../package.json').version)
  .usage('[options] <js file ...>')
  .option('-c,  --config <path>',  'set configurations')
  .parse(process.argv);

if (!program.args.length) {
  program.help();
  process.exit(0);
}

arrowLogger.run(program);
