const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/uploadModel");

const model3DController = require("../Controllers/model3DController");

router.post("/model3d",
  upload.fields([
    {name: "modelFile", maxCount: 1},
    {name: "patternFile", maxCount: 1},
    {name: "imageFile", maxCount: 1},
    { name: "markerFile", maxCount: 1},
  ]),
  model3DController.createModel

);
router.post("/getByIds", model3DController.getModelsById);

router.get("/", model3DController.getAllModels);
router.get("/:id", model3DController.getModelById);

router.get("/marker-image/:filename", model3DController.getMarker);


router.put("/:id",
  upload.fields([
    { name: "modelFile", maxCount: 1},
    { name: "patternFile", maxCount: 1},
    { name: "imageFile", maxCount: 1},
     { name: "markerFile", maxCount: 1},
  ]),
  model3DController.updateModel
);

router.delete("/:id", model3DController.deleteModel);



module.exports = router;