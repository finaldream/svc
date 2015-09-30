#!/usr/bin/env node

'use strict';

var SVCApp = require('./lib/svc.js');
var cli    = require('commander');
var pJson  = require('./package.json');

process.title = 'svc';

function increaseVerbosity(v, total)
{
    return total + 1;
}

var desc = [
    pJson.description + ', Version ' + pJson.version,
    '',
    'Takes a folder of SVG-files and translates them into a single CSS-file with inline background-images.',
    'The filenames will be used as CSS-selectors for the generated rules.'
].join('\n');

cli.version(pJson.version)
    .description(desc)
    .usage('[options] <source-dir> <target-file>')
    .option('--prefix [value]', 'Prepended string to each selector in the resulting css.')
    .option('--write-dimensions', 'Write width and height as sass-variables to the resulting css.')
    .option('-v, --verbose', 'Verbose output. -v = basic, -vv = detailed, -vvv = debug.', increaseVerbosity, 0)
    .parse(process.argv);

if (!process.argv.slice(2).length) {
    cli.outputHelp();
    return;
}

var app = new SVCApp();
app.init(cli);
