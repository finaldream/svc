# Introduction
Scalable Vector Converter - A small SVG to inline CSS converter.
It takes a bunch of SVG-files, performs some cleanup-actions and outputs them as a single CSS-file with a single selector representing each image.

The graphics are converted into background-images with base64-encoded data-URLs. They are exposed through CSS-classes which match the original filenames.

# Installation

Run:
```
npm install -g svc
```
# Usage

```
svc SOURCE-FOLDER DESTINATION-FILE
```

See `svc --help` for options.