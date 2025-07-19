const User = require("../Models/userModel");
const Teacher = require("../Models/teacherModel");
const { default: mongoose } = require("mongoose");

const checkUserStatus = async (email) => {
  const user = await User.findOne({ email });
  return user ? true : false;
};

// get teacher
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find({ isDeleted: false }).populate({
      path: "user",
      select: "_id name email isDeleted",
      match: { isDeleted: false },
    });
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching teachers" });
  }
};

const softDeleteTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message: "teacherId ไม่ถูกต้อง" });
    }

    const teacher = await Teacher.findOneAndUpdate(
      { _id: teacherId },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!teacher) {
      return res.status(404).json({ message: "ไม่พบอาจารย์" });
    }

    if (teacher.user) {
      await User.findByIdAndUpdate(teacher.user, { 
        isDeleted: true,
        deletedAt: new Date(),
       });
    }

    res.status(200).json({ message: "ลบอาจารย์เรียนร้อย softdelete" });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบอาจารย์" });
  }
};

// restore
const restoreTeacher = async (req, res) => {
  try {
    let { teacherIds } = req.body;
    console.log("📥 teacherIds:", teacherIds);

    if (!Array.isArray(teacherIds)){
        teacherIds = [teacherIds];
    }

    const teachers = await Teacher.find({ _id: { $in: teacherIds } });
    const userIds = teachers.map((s) => s.user).filter(Boolean);

    if (userIds.length > 0) {
      await User.updateMany(
        { _id: { $in: userIds } },
        { $set: { isDeleted: false } }
      );
    }
    await Teacher.updateMany(
      { _id: { $in: teacherIds } },
      { $set: { isDeleted: false } }
    );

    res.status(200).json({ message: "กู้คืนข้อมูลเรียบร้อย" });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// restoreMultiple
const restoreMultipleTeachers = async (req, res) => {
  try {
    const { teacherIds } = req.body;

    if (!Array.isArray(teacherIds) || teacherIds.length === 0) {
      return res
        .status(400)
        .json({ message: "กรุณาส่ง teacherIds ที่ถูกต้อง" });
    }

    const validObjectIds = teacherIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    const teachersBeforeUpdate = await Teacher.find({
      _id: { $in: validObjectIds },
    });

    const userIdsToUpdate = teachersBeforeUpdate
      .map((teacher) => teacher.user)
      .filter((id) => new mongoose.Types.ObjectId(id));

    const teacherUpdate = await Teacher.updateMany(
      { _id: { $in: validObjectIds } },
      { $set: { isDeleted: false } }
    );

    const userUpdate = await User.updateMany(
      { _id: { $in: userIdsToUpdate } },
      { $set: { isDeleted: false } }
    );

    res
      .status(200)
      .json({
        message: "กู้คืนข้อมูลอาจารย์เรียบร้อยแล้ว",
        teacherModifiedCount: teacherUpdate.modifiedCount,
        userModifiedCount: userUpdate.modifiedCount,
      });
  } catch (error) {
    console.error("Error restoring teachers:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการกู้คืนข้อมูล" });
  }
};

// delete
const deleteTeacher = async (req, res) => {
  const teacherId = req.params.teacherId;

  try {
    const teacher = await Teacher.findById(teacherId).populate("user");

    if (!teacher) {
      return res.status(404).json({ message: "ไม่พบข้อมูลนักเรียน" });
    }

    if (teacher.user) {
      const userId = teacher.user._id;
      await User.findByIdAndDelete(userId);
    }

    await Teacher.findByIdAndDelete(teacherId);

    res.status(200).json({ message: "ลบข้อมูลเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("❌ Error deleting student and user:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบข้อมูล" });
  }
};

// deleteMultiple
const deleteMultipleTeachers = async (req, res) => {
  const { teacherIds } = req.body;

  try {
    if (!teacherIds || teacherIds.length === 0) {
      return res.status(400).json({ message: "ไม่มีรายการที่ต้องลบ" });
    }

    const teachers = await Teacher.find({ _id: { $in: teacherIds } }).populate(
      "user"
    );

    if (teachers.length === 0) {
      return res.status(404).json({ message: "ไม่พบที่ต้องการลบ" });
    }

    const userIds = teachers
      .filter((teacher) => teacher.user)
      .map((teacher) => teacher.user._id);

    if (userIds.length > 0) {
      await User.deleteMany({ _id: { $in: teacherIds } });
    }

    await Teacher.deleteMany({ _id: { $in: teacherIds } });
    res.status(200).json({ message: "ลบผู้ใช้ที่เกี่ยวข้องเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("❌ Error deleting multiple user:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบข้อมูล" });
  }
};

module.exports = {
  getAllTeachers,
  softDeleteTeacher,
  restoreTeacher,
  restoreMultipleTeachers,
  deleteTeacher,
  deleteMultipleTeachers,
};
