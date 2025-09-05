const express = require("express")
const { 
    getAnimation,
    getAnimationById,
    saveAnimation,
    updateAnimation,
    deleteAnimation} = require("../Controllers/animationController")
const router = express.Router();
const {upload} = require("../middleware/uploadModel");

router.get("/getAnimation", getAnimation);
router.get("/getAnimationById/:_id", getAnimationById);
router.post("/saveAnimation", upload.fields([
  { name: 'Ani_animation', maxCount: 1}, 
  { name: 'Ani_image', maxCount: 1 }]), 
  saveAnimation);
router.put("/updateAnimation/:_id", upload.fields([
  { name: 'Ani_animation', maxCount: 1 }, 
  { name: 'Ani_image', maxCount: 1 }]), 
  updateAnimation);
router.delete("/deleteAnimation/:_id", deleteAnimation);

module.exports = router;