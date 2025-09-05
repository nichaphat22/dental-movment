const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Animation3D = require("../Models/animation3DModel");
const notificationController = require("../Controllers/notificationController");

const videoDir = path.join(__dirname, "../uploads/video3d/videos");
const imageDir = path.join(__dirname, "../uploads/video3d/images");

//สร้างโฟลเดอร์อัตโนมัติ
[videoDir, imageDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "animationFile") {
      cb(null, videoDir);
    } else if (file.fieldname === "imageFile") {
      cb(null, imageDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.fieldname === "animationFile" &&
      !file.mimetype.startsWith("video/")
    ) {
      return cb(new Error("ต้องเป็นไฟล์วิดีโอเท่านั้น"));
    }
    if (file.fieldname === "imageFile" && !file.mimetype.startsWith("image/")) {
      return cb(new Error("ต้องเป็นไฟล์รูปภาพเท่านั้น"));
    }
    cb(null, true);
  },
});

//----------------------- API ------------------------------//
//upload
exports.uploadAnimation = [
  upload.fields([
    { name: "animationFile", maxCount: 1 },
    { name: "imageFile", maxCount: 1 },
  ]),
  async (req, res) => {
    const { name, description } = req.body;
    const animationFile = req.files?.animationFile?.[0];
    const imageFile = req.files?.imageFile?.[0];
    if (
      !name ||
      !description ||
      !req.files.animationFile ||
      !req.files.imageFile
    ) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    const animation = await Animation3D.create({
      name,
      description,
      animationFile: {
        name: animationFile.originalname,
        path: `uploads/video3d/videos/${animationFile.filename}`,
        mimetype: animationFile.mimetype,
        size: animationFile.size,
      },
      imageFile: {
        name: imageFile.originalname,
        path: `uploads/video3d/images/${imageFile.filename}`,
        mimetype: imageFile.mimetype,
        size: imageFile.size,
      },
    });

    const io = req.app.get("socketio");

    await notificationController.sendNotification(
      "animation3d_add", name, animation._id, "student", io
    );
    await notificationController.sendNotification(
      "animation3d_add", name, animation._id, "teacher", io
    );

    res.status(201).json({ message: "อัปโหลดสำเร็จ", data: animation });
  },
];

// get all
exports.getAnimations = async (req, res) => {
  try {
    const animations = await Animation3D.find();
    res.json(animations);
  } catch (err) {
    res.status(500).json({ message: "โหลดข้อมูลล้มเหลว", error: String(err) });
  }
};

//get by ID
exports.getAnimationById = async (req, res) => {
  try {
    const { id } = req.params;
    const animation = await Animation3D.findById(id);
    if (!animation) return res.status(404).json({ message: "ไม่พบข้อมูล" });
    res.json(animation);
  } catch (err) {
    res.status(500).json({ message: "โหลดข้อมูลล้มเหลว", error: String(err) });
  }
};

// update
exports.updateAnimation = [
  upload.fields([
    { name: "animationFile", maxCount: 1 },
    { name: "imageFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, description } = req.body;
      const { id } = req.params;

      const animation = await Animation3D.findById(id);
      if (!animation) return res.status(404).json({ message: "ไม่พบข้อมูล"})

      const updateData = {};

      if (name) updateData.name = name;
      if (description) updateData.description = description;

      // อัปเดตไฟล์วิดีโอ
      if (req.files.animationFile) {
        const file = req.files.animationFile[0];
        // ลบไฟล์เก่า
        if (animation.animationFile?.path) {
          const oldVideoPath = path.join(__dirname, "..", animation.animationFile.path);
          if (fs.existsSync(oldVideoPath)) fs.unlinkSync(oldVideoPath);
        }
        // อัปเดตไฟล์ใหม่
        updateData.animationFile = {
          name: file.originalname,
          path: `uploads/video3d/videos/${file.filename}`,
          mimetype: file.mimetype,
          size: file.size,
        };
      }

      // อัปเดตไฟล์รูปภาพ
      if (req.files.imageFile) {
        const file = req.files.imageFile[0];
        // ลบไฟล์เก่า
        if (animation.imageFile?.path) {
          const oldImagePath = path.join(__dirname, "..", animation.imageFile.path);
          if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        }

        // อัปเดตไฟล์ใหม่
        updateData.imageFile = {
          name: file.originalname,
          path: `uploads/video3d/images/${file.filename}`,
          mimetype: file.mimetype,
          size: file.size,
        };
      }

      const updateAnimation = await Animation3D.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!updateAnimation) {
        return res.status(404).json({ message: "ไม่พบข้อมุล" });
      }

      const io = req.app.get("socketio");

    await notificationController.sendNotification(
      "animation3d_update", name, updateAnimation._id, "student", io
    );
    await notificationController.sendNotification(
      "animation3d_update", name, updateAnimation._id, "teacher", io
    );

      res.json({ message: "อัปเดตสำเร็จ", data: updateAnimation });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "เกิดข้อผิดพลาด" });
    }
  },
];

//delete
exports.deleteAnimation = async (req, res) => {
  try {
    const { id } = req.params;
    const animation = await Animation3D.findById(id);

    if (!animation) {
      return res.status(404).json({ message: "ไม่พบข้อมูล" });
    }

    // ใช้ path ที่เก็บใน object
    const videoPath = path.join(__dirname, "..", animation.animationFile.path);
    if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);

    const imagePath = path.join(__dirname, "..", animation.imageFile.path);
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    await Animation3D.findByIdAndDelete(id);

    res.json({ message: "ลบสำเร็จ" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};
