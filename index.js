// Libraries Constants
// Major requirement : LIBRE OFFICE
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const libre = require('libreoffice-convert');
const PATH = require('path');
const fs = require('fs');
const fromPath = require("pdf2pic");
const mkdirsSync = require("fs-extra");
const rimraf = require("rimraf");
const PORT = 8000;
const dirTree = require("directory-tree");

// IO Constants 
const extend = '.pdf'
//const enterPath = path.join(__dirname, '/resources/Book.xlsx');
const outputPath = PATH.join(__dirname, `/resources/doc${extend}`);
var file;


// App Configurations
// Create resources && converted dirs if not Present
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
//form-urlencoded

// for parsing multipart/form-data
//app.use(mulupload.single('fileToConvert')); 
app.use('/form', express.static(__dirname + '/index.html'));
app.use(fileUpload());
app.listen(PORT, function() {
    console.log('Server Running On Port :', PORT); // eslint-disable-line
});


// Check Sample Response
app.get('/ping', function(req, res) {
    res.send('pong');
});


// Post Request and Upload
app.post('/convert', function(req, res) {
    let storedFile;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        res.status(400).send('No files were uploaded.');
        return;
    }


    storedFile = req.files.sampleFile;
    uploadPath = __dirname + '/resources/' + storedFile.name;

    storedFile.mv(uploadPath, function(err) {
        if (err) {
            return res.status(500).send(err);
        }

        file = fs.readFileSync(uploadPath);

        // TODO : Make this call async as response should 
        // be shown after all processes are completed
        convertFileToPdf().then((c) => {
            // Currently initializing before conversion so [Exception Thrown]
            var filteredTree = dirTree(outputDirectory, ['.jpg', '.png'], {
                attributes: ['size', 'size']
            });
            console.log("Load Json file" + c);
            res.send({
                ob: filteredTree
            });
        });
    })
});

// Convert any Office file type to PDF
async function convertFileToPdf() {
    libre.convert(file, extend, undefined, (err, done) => {
        if (err) {
            console.log(`Error converting file: ${err}`);
        }

        fs.writeFileSync(outputPath, done);
        if (done) {
            console.log("Converted to PDF");
            convertToImage();
        }
    });
}

// Converting PDF >> Image as Unity requires Image Textures
async function convertToImage() {

    const fileLocation = outputPath;

    const outputDirectory = PATH.join(__dirname, '/resources/converted');

    rimraf.sync(outputDirectory);

    mkdirsSync(outputDirectory);

    // Currently Size is very huge 
    // TODO : Dynamic Size WxH
    const baseOptions = {
        width: 2550,
        height: 3300,
        density: 330,
        savePath: outputDirectory
    };

    const convert = fromPath(fileLocation, baseOptions);

    convert.bulk(-1).then((resolve) => {
        console.log("Done Conversion");
        // We can return response here but [EXPRESS post OUT OF SCOPE]
        return resolve;
    });
    console.log("Code End");

}