const Animation = require('../Models/animationModel.js');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
});

// GET all Animations with pagination
const getAnimation = async (req, res) => {
  try {
    const { lastCreatedAt, limit = 10 } = req.query;
    const query = {};

    // Ensure limit is a valid number and doesn't exceed a max limit
    const maxLimit = 50; // Set a max limit for pagination
    const paginationLimit = Math.min(Number(limit), maxLimit);

    // Handle lastCreatedAt pagination
    if (lastCreatedAt) {
      const lastCreatedDate = new Date(lastCreatedAt);
      if (!isNaN(lastCreatedDate)) {
        query.createdAt = { $lt: lastCreatedDate };
      } else {
        return res.status(400).json({ msg: 'Invalid lastCreatedAt format' });
      }
    }

    console.time("APIRequest");

    // Fetch animations from the database
    const animations = await Animation.find(query)
      .select('Ani_name Ani_image createdAt')
      .sort({ createdAt: -1 })
      .limit(paginationLimit)
      .lean();

    console.timeEnd("APIRequest");

    // Return the animations as JSON
    res.setHeader('Content-Type', 'application/json');
    res.json(animations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ err: error.message, msg: "Something went wrong!" });
  }
};

// GET Animation by ID
const getAnimationById = async (req, res) => {
  try {
    const id = req.params._id; // ใช้ _id แทน id
    const animation = await Animation.findById(id).lean(); // ใช้ .lean()

    if (!animation) {
      return res.status(404).json({ error: 'Animation not found' });
    }

    res.json(animation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Update Animation
const updateAnimation = async (req, res) => {
  const id = req.params._id;
  const { Ani_name, Ani_description } = req.body;

  try {
    const animation = await Animation.findById(id).lean();

    if (!animation) {
      return res.status(404).json({ msg: "Animation not found" });
    }

    let updateData = {};

    if (Ani_name) updateData.Ani_name = Ani_name;
    if (Ani_description) updateData.Ani_description = Ani_description;

    if (req.files) {
      const { Ani_animation, Ani_image } = req.files;
      
      const filePromises = [];

      if (Ani_animation) {
        filePromises.push(
          (async () => {
            updateData.Ani_animation = {
              name: encodeURIComponent(Ani_animation[0].originalname),
              data: Ani_animation[0].buffer,
              contentType: Ani_animation[0].mimetype,
              size: Ani_animation[0].size,
            };
          })()
        );
      }

      if (Ani_image) {
        filePromises.push(
          (async () => {
            updateData.Ani_image = {
              name: encodeURIComponent(Ani_image[0].originalname),
              data: Ani_image[0].buffer,
              contentType: Ani_image[0].mimetype,
              size: Ani_image[0].size,
            };
          })()
        );
      }

      // รอให้ไฟล์ทั้งหลายเสร็จ
      await Promise.all(filePromises);
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

  let imageNameUTF8 = Buffer.from(Ani_image[0].originalname, "latin1").toString("utf8").trim();
  let animationNameUTF8 = Buffer.from(Ani_animation[0].originalname, "latin1").toString("utf8").trim();

  imageNameUTF8 = imageNameUTF8.replace(/(\d{4})-0 (\d{2}-\d{2})/, "$1-$2");
  animationNameUTF8 = animationNameUTF8.replace(/(\d{4})-0 (\d{2}-\d{2})/, "$1-$2");

  console.log("Fixed Image Name:", imageNameUTF8);
  console.log("Fixed Animation Name:", animationNameUTF8);

  if (!Ani_name || !Ani_description || !Ani_animation || !Ani_image) {
    return res.status(400).json({ err: "All fields are required." });
  }

  try {
    const filePromises = [];

    if (Ani_animation) {
      filePromises.push(
        (async () => {
          return {
            Ani_animation: {
              name: animationNameUTF8,  
              data: Ani_animation[0].buffer, 
              contentType: Ani_animation[0].mimetype, 
              size: Ani_animation[0].size
            }
          };
        })()
      );
    }

    if (Ani_image) {
      filePromises.push(
        (async () => {
          return {
            Ani_image: {
              name: imageNameUTF8,  
              data: Ani_image[0].buffer, 
              contentType: Ani_image[0].mimetype, 
              size: Ani_image[0].size
            }
          };
        })()
      );
    }

    // รอให้ไฟล์ทั้งหลายเสร็จ
    const fileData = await Promise.all(filePromises);

    // Combine file data with the rest of the body
    const newAnimationData = {
      Ani_name,
      Ani_description,
      ...fileData[0],
      ...fileData[1]
    };

    const newAnimation = await Animation.create(newAnimationData);

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
};

module.exports = { getAnimation, getAnimationById, updateAnimation, saveAnimation, deleteAnimation };
