const Animation = require('../Models/animationModel.js');
const multer = require('multer');
// const express = require("express");

// const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
  
});

// GET all Animations
const getAnimation = async (req, res) => {
  try {
    const animations = await Animation.find().limit(10).lean();

    res.json(animations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ err: error, msg: "Something went wrong!" });
  }
}

// GET Animation by ID
// GET Animation by ID
const getAnimationById = async (req, res) => {
  try {
    const id = req.params._id; // ใช้ _id แทน id
    const animation = await Animation.findById(id).lean();

    if (!animation) {
      return res.status(404).json({ error: 'Animation not found' });
    }



    res.json(animation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};


const updateAnimation = async (req, res) => {
  const id = req.params._id; // ควรใช้ id ตรงๆ ไม่ใช่ _id
  const { Ani_name, Ani_description } = req.body;

  try {
    // หาค่าปัจจุบันจากฐานข้อมูล
    const animation = await Animation.findById(id);
    if (!animation) {
      return res.status(404).json({ msg: "Animation not found" });
    }

    // เก็บค่าที่จะอัปเดต (เฉพาะค่าที่ถูกส่งมา)
    let updateData = {};

    if (Ani_name) updateData.Ani_name = Ani_name;
    if (Ani_description) updateData.Ani_description = Ani_description;

    // ตรวจสอบว่ามีไฟล์แนบมาหรือไม่
    if (req.files) {
      const { Ani_animation, Ani_image } = req.files;

      if (Ani_animation) {
        updateData.Ani_animation = {
          name: encodeURIComponent(Ani_animation[0].originalname), 
          data: Ani_animation[0].buffer,
          contentType: Ani_animation[0].mimetype,
          size: Ani_animation[0].size,
        };
      }

      if (Ani_image) {
        updateData.Ani_image = {
          name: encodeURIComponent(Ani_image[0].originalname), 
          data: Ani_image[0].buffer,
          contentType: Ani_image[0].mimetype,
          size: Ani_image[0].size,
        };
      }
    }

    // ถ้าไม่มีข้อมูลเปลี่ยนแปลง ให้ส่ง error กลับไป
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ msg: "ไม่มีการเปลี่ยนแปลงข้อมูล" });
    }

    // อัปเดตข้อมูล
    const updatedAnimation = await Animation.findByIdAndUpdate(id, updateData, {
      new: true, // คืนค่าใหม่หลังอัปเดต
    });

    if (!updatedAnimation) {
      return res.status(500).json({ msg: "Failed to update animation." });
    }

    res.json({ msg: "Animation updated successfully", updatedAnimation });
  } catch (err) {
    console.error("Error updating animation:", err);
    res.status(500).json({ err: err.message, msg: "Something went wrong!" });
  }
};



// Create a new Animation
const saveAnimation = async (req, res) => {
  const { Ani_name, Ani_description } = req.body;
  const { Ani_animation, Ani_image } = req.files;

  // 🔹 แปลงชื่อไฟล์จาก latin1 → utf8
  let imageNameUTF8 = Buffer.from(Ani_image[0].originalname, "latin1").toString("utf8").trim();
  let animationNameUTF8 = Buffer.from(Ani_animation[0].originalname, "latin1").toString("utf8").trim();

  // 🔹 แก้ปัญหาช่องว่างหรืออักขระผิดพลาด
  imageNameUTF8 = imageNameUTF8.replace(/(\d{4})-0 (\d{2}-\d{2})/, "$1-$2");
  animationNameUTF8 = animationNameUTF8.replace(/(\d{4})-0 (\d{2}-\d{2})/, "$1-$2");

  console.log("Fixed Image Name:", imageNameUTF8);
  console.log("Fixed Animation Name:", animationNameUTF8);
  if (!Ani_name || !Ani_description || !Ani_animation || !Ani_image) {
    return res.status(400).json({ err: "All fields are required." });
  }

  try {
    const newAnimation = await Animation.create({
      Ani_name,
      Ani_description,
      Ani_animation: {
        name: animationNameUTF8,  
        data: Ani_animation[0].buffer, 
        contentType: Ani_animation[0].mimetype, 
        size: Ani_animation[0].size
      },
      Ani_image: {
        name: imageNameUTF8,  
        data: Ani_image[0].buffer, 
        contentType: Ani_image[0].mimetype, 
        size: Ani_image[0].size
      }
    });

    res.status(201).json({ message: "Animation saved successfully!", newAnimation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save animation" });
  }
};





// Delete an Animation
const deleteAnimation = async (req, res) => {
  const id = req.params._id;

  try {
    await Animation.findByIdAndDelete(id);
    res.json("Delete Successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: err, msg: "Something went wrong!" });
  }
}

module.exports = { getAnimation, getAnimationById, updateAnimation, saveAnimation, deleteAnimation };
