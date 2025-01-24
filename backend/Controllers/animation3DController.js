const Animation3D = require('../Models/animation3DModel.js');

// GET all Animations3D
const getAnimation3D = async (req, res) => {
    try {
      const animation3D = await Animation3D.find().lean();
      res.json(animation3D);
    } catch (error) {
      console.error(error);
      res.status(500).json({ err: error, msg: "Something went wrong!" });
    }
  }
  
  // GET Animation by ID
  const getAnimation3DById = async (req, res) => {
    try {
      const id = req.params._id; // ใช้ _id แทน id
      const animation3D = await Animation3D.findById(id).lean();
  
      if (!animation3D) {
        return res.status(404).json({ error: 'Animation3D not found' });
      }
  
      res.json(animation3D);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
  
  // Update an existing Animation3D
  const updateAnimation3D = async (req, res) => {
    const id = req.params._id; // ใช้ id แทน _id
    const { Ani3D_name, Ani3D_description } = req.body;
    const { Ani3D_animation, Ani3D_image } = req.files;
  
    try {
      let updateData = {
        Ani3D_name, Ani3D_description,
        Ani3D_animation: { data: Ani3D_animation[0].buffer, contentType: Ani3D_animation[0].mimetype, size: Ani3D_animation[0].size },
        Ani3D_image: { data: Ani3D_image[0].buffer, contentType: Ani3D_image[0].mimetype, size: Ani3D_image[0].size }
      };
  
  
      await Animation3D.findByIdAndUpdate(id, updateData); // ใช้ id แทน _id
      res.json("Updated Successfully");
    } catch (err) {
      console.error(err);
      res.status(500).json({ err: err, msg: "Something went wrong!" });
    }
  }
  
  
  
  
  // Create a new Animation
// Create a new Animation
const saveAnimation3D = async (req, res) => {
  const { Ani3D_name, Ani3D_description } = req.body;
  const { Ani3D_animation, Ani3D_image} = req.files;
  // const Ani3D_animationFile = req.files['Ani3D_animation'] ? req.files['Ani3D_animation'][0] : null;
  // const Ani3D_imageFile = req.files['Ani3D_image'] ? req.files['Ani3D_image'][0] : null;

  if (!Ani3D_name || !Ani3D_description || !Ani3D_animationFile || !Ani3D_imageFile) {
      return res.status(400).json({ err: "Ani3D_name, Ani3D_description, Ani3D_animation, and Ani3D_image details are required." });
  }

  // // Debugging output
  // console.log("Ani3D_animation size:", Ani3D_animationFile.size);
  // console.log("Ani3D_image size:", Ani3D_imageFile.size);

  try {
      const newAnimation3D = await Animation3D.create({
          Ani3D_name,
          Ani3D_description,
          Ani3D_animation: {
              data: Ani3D_animation[0].buffer,
              contentType: Ani3D_animation[0].mimetype,
              size: Ani3D_animation[0].size
          },
          Ani3D_image: {
              data: Ani3D_image[0].buffer,
              contentType: Ani3D_image[0].mimetype,
              size: Ani3D_image[0].size
          }
      });
      console.log("Saved Successfully...");
      res.status(201).json(newAnimation3D);
  } catch (error) {
      console.error("Error saving animation:", error);
      res.status(500).json({ err: error.message, msg: "Something went wrong!" });
  }
};



  
  
  
  
  // Delete an Animation
  const deleteAnimation3D = async (req, res) => {
    const id = req.params._id;
  
    try {
      await Animation3D.findByIdAndDelete(id);
      res.json("Delete Successfully");
    } catch (err) {
      console.error(err);
      res.status(500).json({ err: err, msg: "Something went wrong!" });
    }
  }

  module.exports = {getAnimation3D, getAnimation3DById, updateAnimation3D, saveAnimation3D, deleteAnimation3D};