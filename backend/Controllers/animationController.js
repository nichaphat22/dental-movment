const Animation = require("../Models/animationModel.js");
const fs = require("fs").promises;
// const path = (require = require("path"));
const path = require("path");
const notificationController = require("../Controllers/notificationController.js");

// GET all Animations with pagination
const getAnimation = async (req, res) => {
  try {
    const { lastCreatedAt, limit = 10 } = req.query;
    const query = {};
    const maxLimit = 50;
    const paginationLimit = Math.min(Number(limit), maxLimit);

    if (lastCreatedAt) {
      const lastCreatedDate = new Date(lastCreatedAt);
      if (!isNaN(lastCreatedDate)) query.createdAt = { $lt: lastCreatedDate };
      else return res.status(400).json({ msg: "Invalid lastCreatedAt format" });
    }

    const animations = await Animation.find(query)
      .select("Ani_name Ani_image createdAt")
      .sort({ createdAt: -1 })
      .limit(paginationLimit)
      .lean();

    res.json(animations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ err: error.message, msg: "Something went wrong!" });
  }
};

// GET Animation by ID
const getAnimationById = async (req, res) => {
  try {
    const id = req.params._id;
    const animation = await Animation.findById(id).lean();

    if (!animation)
      return res.status(404).json({ error: "Animation not found" });

    res.json(animation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || "Server error" });
  }
};

// Update Animation
const updateAnimation = async (req, res) => {
  const id = req.params._id;
  const { Ani_name, Ani_description } = req.body;

  try {
    const animation = await Animation.findById(id);

    if (!animation) {
      return res.status(404).json({ msg: "Animation not found" });
    }

    let updateData = {};

    if (Ani_name) updateData.Ani_name = Ani_name;
    if (Ani_description) updateData.Ani_description = Ani_description;

    if (req.files) {
      const { Ani_animation, Ani_image } = req.files;

      // const filePromises = [];

      if (Ani_animation) {
        // ลบไฟล์เก่า
        if (animation.Ani_animation?.path) {
          await fs
            .unlink(path.resolve(animation.Ani_animation.path))
            .catch(() => {});
        }
        updateData.Ani_animation = {
          name: Ani_animation[0].originalname,
          path: `uploads/animation2d/animations/${Ani_animation[0].filename}`,
          contentType: Ani_animation[0].mimetype,
          size: Ani_animation[0].size,
        };
      }

      if (Ani_image) {
        if (animation.Ani_image?.path) {
          await fs
            .unlink(path.resolve(animation.Ani_image.path))
            .catch(() => {});
        }
        updateData.Ani_image = {
          name: Ani_image[0].originalname,
          path: `uploads/animation2d/images/${Ani_image[0].filename}`,
          contentType: Ani_image[0].mimetype,
          size: Ani_image[0].size,
        };
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ msg: "ไม่มีการเปลี่ยนแปลงข้อมูล" });
    }

    const updatedAnimation = await Animation.findByIdAndUpdate(id, updateData, {
      new: true,
    }).lean();

    if (!updatedAnimation) {
      return res.status(500).json({ msg: "Failed to update animation." });
    }
    const io = req.app.get("socketio");

    // 🔔 ส่งแจ้งเตือนให้ student & teacher
    await notificationController.sendNotification(
      "animation2d_update",
      updatedAnimation.Ani_name,
      updatedAnimation._id,
      "student",
      io
    );
    await notificationController.sendNotification(
      "animation2d_update",
      updatedAnimation.Ani_name,
      updatedAnimation._id,
      "teacher",
      io
    );

    res.json({ msg: "Animation updated successfully", updatedAnimation });
  } catch (err) {
    console.error("Error updating animation:", err);
    res.status(500).json({ err: err.message, msg: "Something went wrong!" });
  }
};

// Create a new Animation
const saveAnimation = async (req, res) => {
  const { Ani_name, Ani_description } = req.body;
  const Ani_image = req.files?.Ani_image?.[0];
  const Ani_animation = req.files?.Ani_animation?.[0];

  if (!Ani_name || !Ani_description || !Ani_animation || !Ani_image) {
    return res.status(400).json({ err: "All fields are required." });
  }

  try {
    const newAnimation = await Animation.create({
      Ani_name,
      Ani_description,
      Ani_image: {
        name: Ani_image.originalname,
        path: `uploads/animation2d/images/${Ani_image.filename}`,
        contentType: Ani_image.mimetype,
        size: Ani_image.size,
      },
      Ani_animation: {
        name: Ani_animation.originalname,
        path: `uploads/animation2d/animations/${Ani_animation.filename}`,
        contentType: Ani_animation.mimetype,
        size: Ani_animation.size,
      },
    });

    const io = req.app.get("socketio");

    // 🔔 ส่งแจ้งเตือนให้ student & teacher
    await notificationController.sendNotification(
      "animation2d_add",
      Ani_name,
      newAnimation._id,
      "student",
      io
    );
    await notificationController.sendNotification(
      "animation2d_add",
      Ani_name,
      newAnimation._id,
      "teacher",
      io
    );

    res
      .status(201)
      .json({ message: "Animation saved successfully!", newAnimation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save animation" });
  }
};

// Delete an Animation
const deleteAnimation = async (req, res) => {
  const id = req.params._id;

  try {
    const animation = await Animation.findById(id);
    if (!animation) {
      return res.status(404).json({ msg: "Animation not found" });
    }
    if (animation.Ani_image?.path) {
      await fs.unlink(animation.Ani_image.path).catch(() => {});
    }
    if (animation.Ani_animation?.path) {
      await fs.unlink(animation.Ani_animation?.path).catch(() => {});
    }
    await Animation.findByIdAndDelete(id);

    res.json("Delete Successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: err, msg: "Something went wrong!" });
  }
};

module.exports = {
  getAnimation,
  getAnimationById,
  updateAnimation,
  saveAnimation,
  deleteAnimation,
};
