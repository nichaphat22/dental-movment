const path = require("path");
const fssync = require("fs");
const fs = require("fs/promises");
const { v4: uuidv4 } = require("uuid");
const { processGlb } = require("gltf-pipeline");
const { dirs } = require("../middleware/uploadModel");
const Model3D = require("../Models/modelsModel");
const mongoose = require("mongoose");
const { error } = require("console");
const notificationController = require("../Controllers/notificationController");

//บีบอัด .glb ด้วย draco
const compressGlb = async (inputPath, outputPath) => {
  const glbBuffer = await fs.readFile(inputPath);
  const option = { dracoOptions: { compressionLevel: 7 } };
  const results = await processGlb(glbBuffer, option);
  await fs.writeFile(outputPath, results.glb);
};

//====================api===================//

//create
exports.createModel = async (req, res) => {
  try {
    const { name } = req.body;

    if (
      !name ||
      !req.files?.modelFile ||
      !req.files?.patternFile ||
      !req.files?.imageFile ||
      !req.files?.markerFile
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await Model3D.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: "ชื่อโมเดลนี้ถูกใช้แล้ว" });
    }

    // ไฟล์จาก multer
    const rawModel = req.files.modelFile[0];
    const image = req.files.imageFile[0];
    const pattern = req.files.patternFile[0];
    const marker = req.files.markerFile[0];

    const ext = path.extname(rawModel.filename).toLowerCase();
    const baseName = path.basename(rawModel.filename, ext);
    const outFile = `${baseName}-draco.glb`;

    const tempPath = rawModel.path;
    const outPath = path.join(dirs.modelDir, outFile);

    let modelUrl = "";

    // ตรวจสอบนามสกุลไฟล์
    if (ext === ".glb") {
      await compressGlb(tempPath, outPath);
      await fs.unlink(tempPath); // ลบไฟล์ temp
      modelUrl = `/uploads/model3d/models/${outFile}`;
    } else {
      const copyTo = path.join(dirs.modelDir, rawModel.originalname);
      await fs.rename(tempPath, copyTo);
      modelUrl = `/uploads/model3d/models/${rawModel.originalname}`;
    }

    const patternUrl = `/uploads/model3d/patterns/${pattern.filename}`;
    // const markerFile = `uploads/model3d/markers/${marker.filename}`;
    const imageUrl = `/uploads/model3d/images/${image.filename}`;

    const newModel = await Model3D.create({
      name,
      modelUrl,
      patternUrl,
      markerUrl:{
        name: marker.originalname,
        path: `uploads/model3d/markers/${marker.filename}`,
        mimetype: marker.mimetype,
        size: marker.size,
      },
      imageUrl,
    });

    const io = req.app.get("socketio");

    await notificationController.sendNotification(
      "model_add", name, newModel._id, "student", io
    );

    await notificationController.sendNotification(
      "model_add", name, newModel._id, "teacher", io
    );

    res.json({ message: "อัปโหลดสำเร็จ", data: newModel });
  } catch (error) {
    console.error("createModel error:", error);
    return res.status(500).json({
      message: "อัปโหลด/บีบอัดล้มเหลว",
      error: String(error?.message || error),
    });
  }
};

//get models by array of ids
exports.getModelsById = async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ message: "ids ต้องเป็น array" });
  }

  try {
    // แปลงเฉพาะ id ที่ valid เป็น ObjectId
    const objectIds = ids
      .map((id) => (mongoose.Types.ObjectId.isValid(id) ? id : null))
      .filter((id) => id !== null);

    // ถ้าไม่มี ObjectId valid ให้ return array ว่าง
    if (objectIds.length === 0) {
      return res.json({ data: [] });
    }

    const models = await Model3D.find({ _id: { $in: objectIds } });
    res.json({ data: models });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดใน server" });
  }
};

// get All
exports.getAllModels = async (req, res) => {
  try {
    const models = await Model3D.find().sort({ createdAt: -1 });
    res.json(models);
  } catch (err) {
    res.status(500).json({ message: "โหลดโมเดลล้มเหลว", error: String(err) });
  }
};

// get by id
exports.getModelById = async (req, res) => {
  try {
    const { id } = req.params;

    const model = await Model3D.findById(id);
    if (!model) return res.status(404).json({ message: "ไม่พบโมเดล" });
    res.json(model);
  } catch (err) {
    res.status(500).json({ message: "โหลดโมเดลล้มเหลว", error: String(err) });
  }
};

// update
exports.updateModel = async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "_id ไม่ถูกต้อง" });
  }

  const model = await Model3D.findById(id);
  if (!model) {
    return res.status(404).json({ message: "ไม่พบข้อมูล" });
  }

  const { name } = req.body;
  if (name) {
    const isDuplicate = await Model3D.findOne({
      _id: { $ne: id },
      name: name.trim(),
    });
    if (isDuplicate) {
      return res.status(400).json({ message: "ชื่อโมเดลนี้ถูกใช้แล้ว" });
    }
    model.name = name.trim();
  }

  const deleteOldFile = (filePath) => {
    const fullPath = path.join(__dirname, "..", filePath.replace(/^\//, ""));
    if (fssync.existsSync(fullPath)) fssync.unlinkSync(fullPath);
  };

  if (req.files?.modelFile) {
    const rawModel = req.files.modelFile[0];
    const ext = path.extname(rawModel.originalname).toLowerCase();
    const baseName = path.basename(rawModel.originalname, ext);
    const outFile = `${baseName}-draco.glb`;
    const tempPath = rawModel.path;
    let modelUrl = "";

    if (ext === ".glb") {
      const outPath = path.join(dirs.modelDir, outFile);
      await compressGlb(tempPath, outPath);
      await fs.unlink(tempPath);
      modelUrl = `/uploads/model3d/models/${outFile}`;
    } else {
      const copyTo = path.join(dirs.modelDir, rawModel.originalname);
      await fs.rename(tempPath, copyTo);
      modelUrl = `/uploads/model3d/models/${rawModel.originalname}`;
    }
    if (model.modelUrl) deleteOldFile(model.modelUrl);
    model.modelUrl = modelUrl;
  }

  if (req.files?.patternFile) {
    if (model.patternUrl) deleteOldFile(model.patternUrl);
    model.patternUrl = `/uploads/model3d/patterns/${req.files.patternFile[0].filename}`;
  }

  if (req.files?.imageFile) {
    if (model.imageUrl) deleteOldFile(model.imageUrl);
    model.imageUrl = `/uploads/model3d/images/${req.files.imageFile[0].filename}`;
  }

  if (req.files?.markerFile) {
  if (model.markerUrl?.path) deleteOldFile(model.markerUrl.path);

  const marker = req.files.markerFile[0];
  model.markerUrl = {
    name: marker.originalname,
    path: `/uploads/model3d/markers/${marker.filename}`,
    mimetype: marker.mimetype,
    size: marker.size,
  };
}


  await model.save();

  const io = req.app.get("socketio");

  await notificationController.sendNotification(
    "model_update", name, model._id, "student", io
  );

  await notificationController.sendNotification(
    "model_update", name, model._id, "teacher", io
  );


  res.json({ message: "อัปเดตสำเร็จ", data: model });
};

//deleted
exports.deleteModel = async (req, res) => {
  const model = await Model3D.findById(req.params.id);

  if (!model) {
    return res.status(404).json({ message: "ไม่พบข้อมูล" });
  }

  const deleteFile = (filePath) => {
    const fullPath = path.join(__dirname, "..", filePath.replace(/^\//, ""));
    if (fssync.existsSync(fullPath)) fssync.unlinkSync(fullPath);
  };

 [model.modelUrl, model.patternUrl, model.imageUrl, model.markerUrl?.path].forEach(
  (filePath) => filePath && deleteFile(filePath)
);


  await model.deleteOne();

  res.json({ message: "ลบสำเร็จ" });
};

//-----------------------//
exports.getMarker = (req, res) => {
  const {filename} = req.params;
  const filePath = path.join(__dirname, "../uploads/model3d/markers", filename);

  res.download(filePath, filename, (error) => {
    if (error) {
      console.error("Error sending marker file:", error);
      res.status(404).json({ message: "ไม่พบไฟล์ marker"})
    }
  })
}

//---------------------------//
//.patt -> .png
// exports.getPatternAsImage = async (req, res) => {
//   try {
//     const filename = req.params.filename;
//     const pattFile = path.join(
//       __dirname,
//       "../uploads/model3d/patterns",
//       filename
//     );

//     if (!fs.existsSync(pattFile)) {
//       return res.status(404).json({ error: "Pattern not found" });
//     }

//     const content = fs.readFileSync(pattFile, "utf-8");
//     const lines = content
//       .trim()
//       .split("\n")
//       .map(
//         (line) =>
//           line
//             .trim()
//             .split(/\s+/)
//             .map((v) => (v === "" ? 0 : parseFloat(v))) // ป้องกัน NaN
//       );

//     const size = lines.length;
//     const scale = 20;
//     const canvas = createCanvas(size * scale, size * scale);
//     const ctx = canvas.getContext("2d");

//     for (let y = 0; y < size; y++) {
//       for (let x = 0; x < size; x++) {
//         const val = lines[y][x] || 0;
//         ctx.fillStyle = val > 0.5 ? "black" : "white";
//         ctx.fillRect(x * scale, y * scale, scale, scale);
//       }
//     }

//     // ตั้งชื่อไฟล์เป็น .png
//     const outputFilename = filename.replace(/\.patt$/, ".png");
//     res.setHeader("Content-Type", "image/png");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="${outputFilename}"`
//     );
//     res.send(canvas.toBuffer("image/png"));
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "เกิดข้อผิดพลาดในการสร้างภาพ" });
//   }
// };
