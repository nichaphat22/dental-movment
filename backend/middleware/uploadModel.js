const path = require("path");
const fs = require("fs");
const multer = require("multer");

const tempModelDir = path.join(__dirname, "../uploads/model3d/temp")
const modelDir = path.join(__dirname, "../uploads/model3d/models");
const imageDir = path.join(__dirname, "../uploads/model3d/images");
const patternDir = path.join(__dirname, "../uploads/model3d/patterns");
const imageAniDir = path.join(__dirname, "../uploads/animation2d/images");
const animaDir = path.join(__dirname, "../uploads/animation2d/animations");
const markerDir = path.join(__dirname, "../uploads/model3d/markers");

[tempModelDir, modelDir, imageDir, patternDir, imageAniDir, animaDir, markerDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "modelFile") {
      cb(null, tempModelDir);
    } else if (file.fieldname === "imageFile") {
      cb(null, imageDir);
    } else if (file.fieldname === "patternFile") {
      cb(null, patternDir);
    } else if (file.fieldname === "Ani_image") {
      cb(null, imageAniDir);
    } else if (file.fieldname === "Ani_animation") {
      cb(null, animaDir);
    } else if (file.fieldname === "markerFile" ){
      cb(null, markerDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "modelFile") {
      const allowedExt = [".glb", ".gltf"];
      if (!allowedExt.includes(path.extname(file.originalname).toLowerCase())) {
        return cb(new Error("โมเดลต้องเป็น .glb หรือ .gltf เท่านั้น (แนะนำ .glb)"))
      }
    }
    if (file.fieldname === "imageFile" && !file.mimetype.startsWith("image/")) {
      return cb(new Error("ต้องเป็นไฟล์รูปภาพ"));
    }
    if (file.fieldname === "patternFile") {
      const ext = path.extname(file.originalname).toLowerCase();
      if (ext !== ".patt") {
        return cb(new Error("ไฟล์ Pattern ต้องเป็น .patt"));
      }
    } 
    cb(null, true);
  }
});


module.exports = { upload, dirs: { tempModelDir, modelDir, imageDir, patternDir, imageAniDir, animaDir, markerDir} };