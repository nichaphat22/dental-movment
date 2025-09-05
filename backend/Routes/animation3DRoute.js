const express = require("express");
const router = express.Router();
const {
    updateAnimation,
    uploadAnimation,
    getAnimations,
    getAnimationById,
    deleteAnimation,
} = require("../Controllers/animation3DController");

router.post("/uploadAnimation", uploadAnimation);
router.get("/animations", getAnimations);
router.get("/animation/:id", getAnimationById);
router.put("/update/:id", updateAnimation);
router.delete("/delete/:id", deleteAnimation);

module.exports = router;
