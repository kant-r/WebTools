const express = require("express");
const fs = require("fs");
const app = express();
const path = require("path");
const imageSize = require('image-size');
const sharp = require('sharp');
const hbs = require('hbs');
const multer = require('multer');
const bodyParser = require('body-parser');
const {exex, exec} = require('child_process')
const outputFilePath = Date.now() + "output.pdf"
const port = process.env.PORT || 3000;
// public static path


app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

const static_path = path.join(__dirname,"../public");
const template_path = path.join(__dirname,"../templates/views");
const partials_path = path.join(__dirname,"../templates/partials");
app.set("view engine", "hbs");

app.set('views',template_path);
app.use(express.static(static_path));
hbs.registerPartials(partials_path);


var width
var height
var format
var outputFilePaths

var dir = "public";
var subDirectory = "public/uploads";
 

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
 
  fs.mkdirSync(subDirectory);
}


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
 
 

// routing

app.get("/",(req,res)=>{
 res.render('index');
})

app.get("/about",(req,res)=>{
    res.render('about');
   })

   app.get("/textToSpeech",(req,res)=>{
    res.render('textToSpeech');
   })
   
   app.get("/wordToPdf",(req,res) =>{
     res.render('wordToPdf');
   })
 
   app.get("/imageResize",(req,res) =>{
    res.render('imageResize');
  })
  
  app.get("/tools",(req,res) => {
    res.render('tools');
  })

  app.get("/imageToPdf",(req,res) => {
    res.render('imageToPdf');
  })

  app.get("/contact",(req,res) =>{
    res.render('contact');
  })

   var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });
   
  const imageFilter = function (req, file, cb) {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  };
   
  var upload = multer({ storage: storage, fileFilter: imageFilter });



   app.post('/processimage',upload.single('file'),(req,res) => {
    format = req.body.format
    width = parseInt(req.body.width)
    height = parseInt(req.body.height)
 if(req.file){
     console.log(req.file.path)
     if(isNaN(width) || isNaN(height)){
       var dimension = imageSize(req.file.path)
       console.log(dimension)
       width = parseInt(dimension.width)
       height = parseInt(dimension.height)
       processImage(width,height,req,res)
     }else{
      processImage(width,height,req,res)
     }
 }
})

// image to pdf start

   app.get("/imageToPdf",(req,res)=>{
     res.render('imageToPdf');
   })

   app.post("/merge", upload.array("files", 1000), (req, res) => {
    list = "";
    if (req.files) {
      req.files.forEach((file) => {
        list += `${file.path}`;
        list += " ";
      });
  
      console.log(list);
  
      exec(`magick convert ${list} ${outputFilePath}`, (err, stderr, stdout) => {
        if (err) throw err;
  
        res.download(outputFilePath, (err) => {
          if (err) throw err;
  
          req.files.forEach((file) => {
            fs.unlinkSync(file.path);
          });
  
          fs.unlinkSync(outputFilePath);
        });
      });
    }
  });
   // image to pdf end

   function processImage(width,height,req,res){

    outputFilePaths = Date.now() + "output." + format;

    if (req.file) {
        sharp(req.file.path)
          .resize(width, height)
          .toFile(outputFilePaths, (err, info) => {
            if (err) throw err;
            res.download(outputFilePaths, (err) => {
              if (err) throw err;
              fs.unlinkSync(req.file.path);
              fs.unlinkSync(outputFilePaths);
            });
          });
      }
}


app.get("*",(req,res)=>{
  res.render('404err');
 })

app.listen(port,()=>{
    console.log("listning at port no 3000");
})