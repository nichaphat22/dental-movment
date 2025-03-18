const express = require("express")
const multer = require("multer")
const { 
    getAnimation,
    getAnimationById,
    saveAnimation,
    updateAnimation,
    deleteAnimation} = require("../Controllers/animationController")
const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 50 * 1024 * 1024,  // ขนาดไฟล์สูงสุด 50MB
    },
  });

router.get("/getAnimation", getAnimation);
router.get("/getAnimationById/:_id", getAnimationById);
router.post("/saveAnimation", upload.fields([{ name: 'Ani_animation' }, { name: 'Ani_image' }]), saveAnimation);
router.put("/updateAnimation/:_id", upload.fields([{ name: 'Ani_animation' }, { name: 'Ani_image' }]), updateAnimation);
router.delete("/deleteAnimation/:_id", deleteAnimation);

module.exports = router;