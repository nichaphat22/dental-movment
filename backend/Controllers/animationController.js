const Animation = require('../Models/animationModel.js');
// const multer = require('multer');
// const express from 'express';

// const router = express.Router();
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 20 * 1024 * 1024, // 20 MB
//   },
// });

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
}

const updateAnimation = async (req, res) => {
  const id = req.params._id;  // ใช้ id แทน _id
  const { Ani_name, Ani_description } = req.body;

  try {
    // หาค่าปัจจุบันจากฐานข้อมูล
    const animation = await Animation.findById(id);
    
    // ตรวจสอบว่าไฟล์ใหม่ถูกส่งมาไหม และอัปเดตเฉพาะกรณีที่ไฟล์ใหม่ถูกส่ง
    let updateData = {
      Ani_name: Ani_name || animation.Ani_name,  // หากไม่ส่งมาใช้ค่าเดิม
      Ani_description: Ani_description || animation.Ani_description,  // หากไม่ส่งมาใช้ค่าเดิม
    };

    // ตรวจสอบว่าไฟล์ใหม่ถูกส่งมาในคำขอ
    if (req.files) {
      const { Ani_animation, Ani_image } = req.files;

      // อัปเดตเฉพาะเมื่อไฟล์ใหม่ถูกส่ง
      if (Ani_animation) {
        updateData.Ani_animation = {
          data: Ani_animation[0].buffer,
          contentType: Ani_animation[0].mimetype,
          size: Ani_animation[0].size
        };
      }

      if (Ani_image) {
        updateData.Ani_image = {
          data: Ani_image[0].buffer,
          contentType: Ani_image[0].mimetype,
          size: Ani_image[0].size
        };
      }
    }

    // อัปเดตข้อมูลในฐานข้อมูล
    await Animation.findByIdAndUpdate(id, updateData);
    res.json("Updated Successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: err, msg: "Something went wrong!" });
  }
};




// Create a new Animation
const saveAnimation = async (req, res) => {
  const { Ani_name, Ani_description } = req.body;
  const { Ani_animation, Ani_image } = req.files;

  if (!Ani_name || !Ani_description || !Ani_animation || !Ani_image) {
    return res.status(400).json({ err: "Ani_name, Ani_description, Ani_animation, and Ani_image details are required." });
  }

  try {
    const newAnimation = await Animation.create({
      Ani_name,
      Ani_description,
      Ani_animation: { data: Ani_animation[0].buffer, contentType: Ani_animation[0].mimetype, size: Ani_animation[0].size },
      Ani_image: { data: Ani_image[0].buffer, contentType: Ani_image[0].mimetype, size: Ani_image[0].size }
    });
    console.log("Saved Successfully...");
    res.status(201).json(newAnimation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: err, msg: "Something went wrong!" });
  }
}




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
