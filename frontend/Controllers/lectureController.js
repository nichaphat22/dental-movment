const lectureModel = require("../Models/lectureModel");


// Add a new lecture
const addLecture = async (req, res) => {
  try {
    const { userLectureID, img } = req.body;
    if (!userLectureID) {
      return res.status(400).json({ message: "userLectureID is required" });
    }
    // Create and save the new lecture
    const newLecture = new lectureModel({ userLectureID, img });
    await newLecture.save();
    res.status(201).json(newLecture);
  } catch (error) {
    console.error("Error adding lecture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all lectures
const getLectures = async (req, res) => {
  const { userLectureID } = req.params;

  try {
    const lectures = await lectureModel.find({ userLectureID });
    res.status(200).json(lectures);
  } catch (error) {
    console.error('Error getting lectures:', error);
    res.status(500).send('Server Error');
  }
};

// Delete a lecture by ID
const deleteLecture = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedLecture = await lectureModel.findByIdAndDelete(id);

    if (!deletedLecture) {
      return res.status(404).json({ msg: 'Lecture not found' });
    }

    res.json({ msg: 'Lecture deleted successfully' });
  } catch (error) {
    console.error('Error deleting lecture:', error);
    res.status(500).send('Server Error');
  }
};

module.exports = { addLecture, getLectures, deleteLecture };

