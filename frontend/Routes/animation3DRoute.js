const express = require("express")
const multer = require("multer")
const {
    getAnimation3D,
    getAnimation3DById,
    saveAnimation3D,
    updateAnimation3D,
    deleteAnimation3D } = require("../Controllers/animation3DController")

    const router = express.Router();
    const upload = multer({ storage: multer.memoryStorage() });

router.get("/getAnimation3D", getAnimation3D);
router.get("/getAnimation3DById/:_id", getAnimation3DById);
router.post("/saveAnimation3D", upload.fields([{name: 'Ani3D_animation'}, {name: 'Ani3D_image'}]),saveAnimation3D);
router.put("/updateAnimation3D/:_id", upload.fields([{name: 'Ani3D_animation'}, {name: 'Ani3D_image'}]), updateAnimation3D);
router.delete("/deleteAnimation/:_id", deleteAnimation3D);

module.exports = router;