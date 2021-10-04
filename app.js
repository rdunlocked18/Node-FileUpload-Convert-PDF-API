// TEST VERSION : APP.js converts files to PDF and then images
// Static File initialization

const libre = require('libreoffice-convert');
const path = require('path');
const fs = require('fs');
const { fromPath } = require("pdf2pic");
const { mkdirsSync } = require("fs-extra");
const rimraf = require("rimraf");
//const gm = require('gm').subClass({imageMagick: true});

const extend = '.pdf'
const enterPath = path.join(__dirname, '/resources/Book.xlsx');
const outputPath = path.join(__dirname, `/resources/doc${extend}`);

const file = fs.readFileSync(enterPath);

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


function convertToImage(){

  const specimen1 = outputPath;

  const outputDirectory = path.join(__dirname, '/resources/op');
  
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

  

