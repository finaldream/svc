/**
 *  Svg2Css App.
 *  A small and simple SVG to inline CSS converter for node.js.
 *
 *  @author Oliver Erdmann, <o.erdmann@finaldream.de>
 *  @since 13.03.2015
 */

'use strict';

var fs   = require('fs');
var path = require('path');
var libXml  = require('libxmljs');

/**
 * Instantiate and call either init with the required arguments or directly call process() with an array of files.
 *
 * @constructor
 */
var SVCApp = function () {

    var srcFolder = '';
    var dstFile   = '';
    var cssPrefix = '';
    var writeDimensions = false;


    /**
     * Internal init function.
     * Needs only be called when evaluating arguments.
     *
     * @param {object} cli
     */
    this.init = function (cli) {

        var args = cli.args || [];

        srcFolder = args[0];
        dstFile   = args[1];

        cssPrefix = cli.prefix || '';
        writeDimensions = cli.writeDimensions === true;

        fs.readdir(srcFolder, this._readdirCallback.bind(this));

    };


    /**
     * Readdir callback for error-processing and keeping the process-function clean.
     * Calls @see process();
     *
     * @param {Error} error
     * @param {String[]} files
     * @private
     */
    this._readdirCallback = function (error, files) {

        if (error) {
            console.error(error);
            process.exit(1);
        }

        this.process(files, dstFile);

    };


    /**
     * Processes the provided input-files and writes the result to destination.
     * @param {String[]} inputFiles
     * @param {String}   destination
     */
    this.process = function(inputFiles, destination) {

        inputFiles = this.filterFiles(inputFiles, '.svg');

        if (inputFiles.length < 1) {
            console.error('No input files found!');
        }

        var output = [];


        for (var i = 0; i < inputFiles.length; i++) {
            var file      = path.join(srcFolder, inputFiles[i]);
            var fileBase  = inputFiles[i].split('.').shift();
            var blockName = fileBase;

            console.log('Processing:', file);

            if (cssPrefix.length) {
                blockName = cssPrefix + fileBase;
            }

            var content = fs.readFileSync(file, {encoding: 'utf-8'});
            var dom     = libXml.parseXmlString(content);

            if (writeDimensions) {
                var dim = this.getDimensions(dom);
                if (dim) {
                    // Write SCSS variables.
                    output.push('$' + blockName + '-width: ' + dim.width + ';');
                    output.push('$' + blockName + '-height: ' + dim.height + ';');
                }
            }

            var css = this.cleanUpInputFile(dom);
            css = this.makeCSSBlock(blockName, css);
            output.push(css);
        }

        console.log('Writing file', destination);
        fs.writeFile(destination, output.join('\n'));

    };

    /**
     * Filters an array of files by a provided extension.
     * @param {array} files
     * @param {string} ext  File-ext with a dot (eg. ".svg").
     */
    this.filterFiles = function (files, ext) {

        var result = [];

        for (var i = 0; i < files.length; i++) {
            if (path.extname(files[i]) === ext) {
                result.push(files[i]);
            }
        }

        return result;

    };


    /**
     * Reads the input-file and cleans up line-breaks, comments and tabs.
     *
     * @param {Document} doc    XMLDocument.
     * @returns {string} Single line content-string.
     */
    this.cleanUpInputFile = function(doc) {

        var content = doc.toString(false);

        // Clean up.
        return content
            // Remove comments.
            .replace(/<!--[\s\S]*?-->/g, '')
            // Remove linebreaks.
            .replace(/(\n|\r)/gm, '')
            // Replace tabs / collapse double tabs.
            .replace(/(\t\t|\t)/gm, ' ');

    };


    /**
     * Generates a named CSS-Block from file-content.
     *
     * @param {String} name    Selector-name.
     * @param {String} content Content to be encoded.
     *
     * @returns {string} Generated CSS-block.
     */
    this.makeCSSBlock = function (name, content) {

        var encoded = new Buffer(content).toString('base64');

        return [
            '.', name, ' {\n',
            '    background-image: url(data:image/svg+xml;base64,', encoded,');\n',
            '}\n'
        ].join('');

    };

    /**
     *
     * @param dom
     * @returns {object|null}
     */
    this.getDimensions = function (dom)
    {

        var svgTag = dom.get('//xmlns:svg', 'http://www.w3.org/2000/svg');

        if (svgTag === null) {
            return null;
        }

        var attrWidth = svgTag.attr('width');
        var attrHeight = svgTag.attr('height');

        var width = attrWidth ? attrWidth.value() : 0;
        var height = attrHeight ? attrHeight.value() : 0;

        if (!width && !height) {

            var viewBox = svgTag.attr('viewBox');

            if (!viewBox.length) {
                return null;
            }
            viewBox = viewBox.split(' ');

            if (viewBox.length < 4) {
                return null;
            }

            width = viewBox[2];
            height = viewBox[3];

        }

        return {
            width: width,
            height: height
        }

    }

};

module.exports = SVCApp;
