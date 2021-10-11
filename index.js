// Libraries Constants
// Major requirement : LIBRE OFFICE
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const libre = require('libreoffice-convert');
const PATH = require('path');
const fs = require('fs');
const {
    fromPath
} = require("pdf2pic");
const mkdirsSync = require("fs-extra");
const rimraf = require("rimraf");
const PORT = 8000;
const dirTree = require("directory-tree");
const { EventEmitter } = require('events');
const eventEmitter = new EventEmitter();

// IO Constants 
const extend = '.pdf'
const outputPath = PATH.join(__dirname, `/resources/doc${extend}`);
const outputDirectory = PATH.join(__dirname, '/resources/converted');
var file;


// ----------- End Declerations --------- //

function init() {
    app.use(express.urlencoded({
        extended: true
    }));
    app.use(express.json());
    //form-urlencoded
    app.use('/resources/converted/', express.static(outputDirectory));
    // for parsing multipart/form-data
    //app.use(mulupload.single('fileToConvert')); 
    app.use('/form', express.static(__dirname + '/index.html'));
    app.use(fileUpload());
    app.listen(PORT, function () {
        console.log('Server Running On Port :', PORT); // eslint-disable-line
    });
}

init();

function sampleGetResponse() {
    // Check Sample Response
    app.get('/ping', function (req, res) {
        res.send('pong');
    });
}

// Event
eventEmitter.on('converted', () => {
    console.log("Callback with event");

    app.get('/files', function (req, res) {
        var ls = []
        // Currently initializing before conversion so [Exception Thrown]
        var filteredTree = dirTree(outputDirectory, { attributes: ['mode', 'mtime', 'size'] },
            (file) => {
                console.log(file.name);
                ls.push("http://192.168.29.195:8000/resources/converted/" + file.name)
            });
        //console.log("Load Json file" + c);
        // For File Info : 
        //  res.send({ info: filteredTree, urls: ls });
        res.send({ urls: ls });
    })
});

function fullUrl(req) {
    return url.format({
        protocol: req.protocol,
        host: req.get('host'),
        pathname: req.originalUrl
    });
}


app.post('/convert', function (req, res) {
    let storedFile;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        res.status(400).send('No files were uploaded.');
        return;
    }

    storedFile = req.files.storedFile;
    uploadPath = __dirname + '/resources/' + storedFile.name;

    storedFile.mv(uploadPath, async function (err) {
        if (err) {
            return res.status(500).send(err);
        }

        file = fs.readFileSync(uploadPath);

        // TODO : Make this call async as response should 
        // be shown after all processes are completed
        await convertToPdf();
        // redirecting before convert operation
        res.redirect('/files');
    })

    async function convertToPdf() {
        return new Promise((resolve, reject) => {
            // ... 
            libre.convert(file, extend, undefined, async (err, done) => {
                if (err) {
                    console.log(`Error converting file: ${err}`);
                }

                fs.writeFileSync(outputPath, done);
                if (done) {
                    console.log("Converted to PDF");
                    await convertToImage();
                    resolve();
                }
            });
        });
    }

    // Converting PDF >> Image as Unity requires Image Textures
    async function convertToImage() {

        const specimen1 = outputPath;

        rimraf.sync(outputDirectory);

        fs.mkdirSync(outputDirectory);

        const baseOptions = {
            width: 2550,
            height: 3300,
            density: 330,
            savePath: outputDirectory
        };

        const convert = fromPath(specimen1, baseOptions);

        const resolve = await convert.bulk(-1);

        console.log("Done Conversion Need CB");
        eventEmitter.emit('converted');
        console.log("Code End");

    }

});


