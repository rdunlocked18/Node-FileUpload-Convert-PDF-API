// Libraries Constants
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const libre = require('libreoffice-convert');
const path = require('path');
const fs = require('fs');
const { fromPath } = require("pdf2pic");
const { mkdirsSync } = require("fs-extra");
const rimraf = require("rimraf");
const PORT = 8000;
var bodyParser = require('body-parser');
var multer = require('multer');
var mulupload = multer();

// IO Constants 
const extend = '.pdf'
//const enterPath = path.join(__dirname, '/resources/Book.xlsx');
const outputPath = path.join(__dirname, `/resources/doc${extend}`);
var file;


// App Configurations
// Create resources && converted dirs if not Present
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
//form-urlencoded

// for parsing multipart/form-data
//app.use(mulupload.single('sampleFile')); 
app.use('/form', express.static(__dirname + '/index.html'));
app.use(fileUpload());
app.listen(PORT, function() {
  console.log('Express server started On Port :', PORT); // eslint-disable-line
});


// Get PINg req
app.get('/ping', function(req, res) {
  res.send('pong');
});


// Post Request and Upload
app.post('/upload', function(req, res) {
  let sampleFile;
  let uploadPath;

  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400).send('No files were uploaded.');
    return;
  }


  sampleFile = req.files.sampleFile;
  uploadPath = __dirname + '/resources/' + sampleFile.name;

  sampleFile.mv(uploadPath, function(err) {
    if (err) {
      return res.status(500).send(err);
    }
    
    file = fs.readFileSync(uploadPath);
    convertFileToPdf().then((c)=>{res.send('File uploaded to ' + uploadPath);});
  })
});


async function convertFileToPdf(){
  libre.convert(file, extend, undefined, (err, done) => {
    if (err) {
      console.log(`Error converting file: ${err}`);
    } 

    fs.writeFileSync(outputPath, done);
    if(done){
      console.log("Converted to PDF");
      convertToImage();
    }
});
}

function convertToImage(){

  const specimen1 = outputPath;

  const outputDirectory = path.join(__dirname, '/resources/converted');
  
  rimraf.sync(outputDirectory);
  
  mkdirsSync(outputDirectory);
  
  const baseOptions = {
    width: 2550,
    height: 3300,
    density: 330,
    savePath: outputDirectory
  };
  
  const convert = fromPath(specimen1, baseOptions);
  
  convert.bulk(-1).then((resolve) => {
      console.log("Done Conversion");
      console.log(resolve.entries.length);
       return resolve;
     });
     console.log("Code End");

}


