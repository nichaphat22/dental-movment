const multer = require("multer");
const xlsx = require("xlsx");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const iconv = require("iconv-lite");
const path = require("path");

const Student = require("../Models/studentModel");
const User = require("../Models/userModel");
const { default: mongoose } = require("mongoose");
const Teacher = require("../Models/teacherModel");
const { isDataView } = require("util/types");

const checkUserStatus = async (email) => {
  const user = await User.findOne({ email });
  return user ? true : false; // ถ้ามีผู้ใช้จะส่งกลับ true
};

//uploadfile
const uploadedFile = async (req, res) => {
  try {
    const io = req.app.get("socketio");
    if (!req.file) {
      return res.status(400).json({ message: "กรุณาอัปโหลดไฟล์" });
    }

    const filePath = req.file.path;
    const fileType = path
      .extname(req.file.originalname)
      .toLowerCase()
      .replace(".", "");

    if (fileType === "xls") {
      const fileBuffer = fs.readFileSync(filePath);
      const decodedBuffer = iconv.decode(fileBuffer, "win874");
      fs.writeFileSync(filePath, decodedBuffer);
    }

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (fileType === "xlsx") {
      console.log("📄 ข้อมูลจากไฟล์ Excel:", data.slice(1, 4));
      fs.unlink(filePath, (error) => {
        if (error) console.error("❌ ลบไฟล์ไม่สำเร็จ:", error);
      });
      return res.json(data);
    }

    const studentLists = data.slice(6, -2); // ข้าม 6 แถวแรก และเว้น 3 แถวสุดท้าย

    async function processStudents(studentLists) {
      for (const student of studentLists) {
        let updatedData = { ...student };
        const [studentId, studentName, studentEmail] = Object.values(
          updatedData
        ).slice(1, 4);

        if (!studentEmail) continue; // ข้ามถ้าไม่มีอีเมล

        let findUser = await User.findOne({ email: studentEmail });

        const profileImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          studentEmail
        )}&background=random`;

        if (!findUser) {
          // สร้างบัญชีใหม่
          const createUser = new User({
            email: studentEmail,
            name: studentName,
            role: "student",
            img: profileImage,
            isDeleted: false,
          });
          await createUser.save();

          // สร้าง Student และเชื่อมโยงกับ User
          const createStudent = new Student({
            studentID: studentId,
            user: createUser._id,
          });
          await createStudent.save();

          // อัปเดต user ให้เชื่อมกับ student
          await User.findByIdAndUpdate(createUser._id, {
            roleData: createStudent._id,
            roleRef: "Student",
          });
          // ✅ emit ผ่าน socket ว่ามีการเพิ่ม user ใหม่
          io.emit("userAdded", {
            message: "เพิ่มผู้ใช้ใหม่จากไฟล์",
            user: {
              _id: createUser._id,
              email: createUser.email,
              name: createUser.name,
              img: createUser.img,
              role: createUser.role,
            },
          });
        } else if (!findUser.roleData) {
          // ถ้ามี User แต่ยังไม่มี Student, สร้าง Student และเพิ่ม roleData
          const createStudent = new Student({
            studentID: studentId,
            user: findUser._id,
          });
          await createStudent.save();

          await User.findByIdAndUpdate(findUser._id, {
            roleData: createStudent._id,
          });
        }
      }
    }

    await processStudents(studentLists);
    // ✅ ลบไฟล์หลังจากประมวลผลเสร็จ
    fs.unlink(filePath, (error)=> {
      if (error) console.error("❌ ลบไฟล์ไม่สำเร็จ:", err);
    })
    

    res.json({ message: "อัปโหลดและบันทึกข้อมูลสำเร็จ!" });
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการอัปโหลดไฟล์" });
  }
};

//get student
const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({ isDeleted: false })
      .populate({
        path: "user",
        select: "name email isDeleted",
        match: { isDeleted: false },
      })
      .select("studentID user"); // เพิ่ม studentID ในผลลัพธ์

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students" });
  }
};

//Soft Delete นักศึกษา
const softDeleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log("🔍 studentIds ที่ได้รับจาก frontend:", req.body);

    // ตรวจสอบว่า studentId ถูกต้องหรือไม่
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "studentId ไม่ถูกต้อง" });
    }

    // ค้นหานักศึกษาด้วย studentId
    const student = await Student.findOneAndUpdate(
      { _id: studentId },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "ไม่พบนักศึกษา" });
    }

    // อัปเดตสถานะ isDeleted ใน User ที่เกี่ยวข้อง
    if (student.user) {
      await User.findByIdAndUpdate(student.user, {
        isDeleted: true,
        deletedAt: new Date(),
      });
    }
    const io = req.app.get("socketio");
    io.emit("studentDeleted", studentId);

    res.status(200).json({ message: "ลบนักศึกษาเรียบร้อยแล้ว (Soft Delete)" });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบนักศึกษา" });
  }
};

const softDeleteMultipleStudents = async (req, res) => {
  try {
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res
        .status(400)
        .json({ message: "กรุณาส่ง studentIds ให้ถูกต้อง" });
    }

    const validObjectIds = studentIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    // ดึง student เพื่อหาว่า user ไหนเกี่ยวข้อง
    const studentsBeforeUpdate = await Student.find({
      _id: { $in: validObjectIds },
    });

    const userIdsToUpdate = studentsBeforeUpdate
      .filter((student) => student.user)
      .map((student) => new mongoose.Types.ObjectId(student.user)); // 👈 แปลงให้แน่ใจว่าเป็น ObjectId

    console.log("✅ จะอัปเดต userIds:", userIdsToUpdate);

    // อัปเดต Student
    const studentUpdate = await Student.updateMany(
      { _id: { $in: validObjectIds } },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

    // อัปเดต User
    const userUpdate = await User.updateMany(
      { _id: { $in: userIdsToUpdate } },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

    console.log("🟢 Student update:", studentUpdate);
    console.log("🟢 User update:", userUpdate);

    const io = req.app.get("socketio");
    io.emit("studentsDeleted", validObjectIds);

    res.status(200).json({
      message: "ลบนักศึกษาเรียบร้อยแล้ว (Soft Delete)",
      studentModifiedCount: studentUpdate.modifiedCount,
      userModifiedCount: userUpdate.modifiedCount,
    });
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการ soft delete:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบนักศึกษา" });
  }
};

// ✅ กู้คืน (Restore) นักศึกษา
const restoreMultipleStudents = async (req, res) => {
  try {
    const { studentIds } = req.body;

    // ตรวจสอบว่า studentIds เป็นอาร์เรย์หรือไม่
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res
        .status(400)
        .json({ message: "กรุณาส่ง studentIds ที่ถูกต้อง" });
    }

    const validObjectIds = studentIds.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    // ค้นหานักเรียนที่ต้องกู้คืน
    const studentsBeforeUpdate = await Student.find({
      _id: { $in: validObjectIds },
    });

    // ดึง userId จาก student
    const userIdsToUpdate = studentsBeforeUpdate
      .map((student) => student.user)
      .filter((student) => new mongoose.Types.ObjectId(student.user)); // กรองค่า null หรือ undefined ออก

    //update student
    const studentUpdate = await Student.updateMany(
      { _id: { $in: validObjectIds } },
      { $set: { isDeleted: false } }
    );

    //update user
    const userUpdate = await User.updateMany(
      { _id: { $in: userIdsToUpdate } },
      { $set: { isDeleted: false } }
    );

    res
      .status(200)
      .json({
        message: "กู้คืนข้อมูลนักศึกษาเรียบร้อยแล้ว",
        studentModifiedCount: studentUpdate.modifiedCount,
        userModifiedCount: userUpdate.modifiedCount,
      });
  } catch (error) {
    console.error("Error restoring students:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการกู้คืนข้อมูล" });
  }
};

const restoreStudents = async (req, res) => {
  try {
    const { studentIds } = req.body;
    console.log("📥 studentIds:", studentIds);

    if (!Array.isArray(studentIds)) {
      studentIds = [studentIds];
    }


    // ดึง student เพื่อหาว่า user ไหนเกี่ยวข้อง
    const students = await Student.find({ _id: { $in: studentIds } });
    console.log("🧍 students:", students);

    // if (!students.length) {
    //   return res.status(404).json({ message: "ไม่พบนักเรียน" });
    // }

    const userIds = students.map((s) => s.user).filter(Boolean);
    console.log("🧑‍💻 userIds:", userIds);

    // อัปเดต User isDeleted = false
    if (userIds.length > 0) {
      await User.updateMany(
        { _id: { $in: userIds } },
        { $set: { isDeleted: false } }
      );
    }
    // อัปเดต student isDeleted = false
    await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: { isDeleted: false } }
    );

    res.status(200).json({ message: "กู้คืนข้อมูลเรียบร้อย" });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

const getDeletedStudents = async (req, res) => {
  try {
    const students = await Student.find({ isDeleted: true })
      .populate({
        path: "user",
        select: "name email isDeleted",
        match: { isDeleted: true },
      })
      .select("studentID user");

    const filtered = students.filter((s) => s.user !== null);

    res.status(200).json(filtered);
  } catch (error) {
    console.error("Error fetching deleted students:", error);
    res.status(500).json({ message: "Error fetching deleted students" });
  }
};

const getDeletedUsers = async (req, res) => {
  try {
    const deletedUsers = await User.find({
      isDeleted: true,
      role: { $in: ["student", "teacher"] },
    }).select("name email role isDeleted deletedAt");

    const students = await Student.find({ isDeleted: true })
      .populate({
        path: "user",
        match: { isDeleted: true },
        select: "name email role isDeleted deletedAt",
      })
      .select("studentID user deletedAt");

    const teachers = await Teacher.find({ isDeleted: true })
      .populate({
        path: "user",
        match: { isDeleted: true },
        select: "name email role isDeleted deletedAt",
      })
      .select("deletedAt");

    const studentUserIds = students.map((s) => s.user?._id?.toString());

    const teacherMerged = teachers
      .filter(
        (t) =>
          t.user !== null && !studentUserIds.includes(t.user._id.toString())
      )
      .map((t) => ({
        _id: t._id,
        teacherId: t._id,
        studentID: null,
        user: t.user,
        deletedAt: t.deletedAt,
      }));

    const studentMerged = students
      .filter((s) => s.user !== null)
      .map((s) => ({
        _id: s._id,
        studentID: s.studentID,
        user: s.user,
        deletedAt: s.deletedAt,
      }));

    const merged = [...studentMerged, ...teacherMerged];

    res.status(200).json(merged);
  } catch (error) {
    console.error("❌ Error fetching deleted users:", error);
    res.status(500).json({ message: "Error fetching deleted users" });
  }
};

const deleteStudent = async (req, res) => {
  const studentId = req.params.studentId;

  try {
    // ค้นหานักเรียนที่ต้องการลบ พร้อม populate user ที่เกี่ยวข้อง
    const student = await Student.findById(studentId).populate("user");

    if (!student) {
      return res.status(404).json({ message: "ไม่พบข้อมูลนักเรียน" });
    }

    // ตรวจสอบว่ามี user ที่เกี่ยวข้องหรือไม่
    if (student.user) {
      const userId = student.user._id;
      await User.findByIdAndDelete(userId); // ลบ user ที่เกี่ยวข้อง
    }

    // ลบข้อมูลนักเรียน
    await Student.findByIdAndDelete(studentId);

    res.status(200).json({ message: "ลบข้อมูลนักเรียนและผู้ใช้เรียบร้อยแล้ว" });
  } catch (error) {
    console.error("❌ Error deleting student and user:", error);
    res
      .status(500)
      .json({ message: "เกิดข้อผิดพลาดในการลบข้อมูลนักเรียนและผู้ใช้" });
  }
};

const deleteMultipleStudents = async (req, res) => {
  const { studentIds } = req.body; // รับ Array ของ studentIds จาก frontend

  try {
    if (!studentIds || studentIds.length === 0) {
      return res.status(400).json({ message: "ไม่มีรายการนักเรียนที่ต้องลบ" });
    }

    // ค้นหานักเรียนทั้งหมดที่ต้องการลบ พร้อม populate user ที่เกี่ยวข้อง
    const students = await Student.find({ _id: { $in: studentIds } }).populate(
      "user"
    );

    if (students.length === 0) {
      return res.status(404).json({ message: "ไม่พบนักเรียนที่ต้องการลบ" });
    }

    // ลบข้อมูลผู้ใช้ที่เกี่ยวข้อง
    const userIds = students
      .filter((student) => student.user) // ตรวจสอบว่ามี user หรือไม่
      .map((student) => student.user._id);

    if (userIds.length > 0) {
      await User.deleteMany({ _id: { $in: userIds } });
    }

    // ลบข้อมูลนักเรียนทั้งหมด
    await Student.deleteMany({ _id: { $in: studentIds } });

    res
      .status(200)
      .json({ message: "ลบนักเรียนและผู้ใช้ที่เกี่ยวข้องเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("❌ Error deleting multiple students:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบข้อมูลนักเรียน" });
  }
};

module.exports = {
  uploadedFile,
  upload,
  checkUserStatus,
  getAllStudents,
  softDeleteStudent,
  restoreMultipleStudents,
  softDeleteMultipleStudents,
  deleteStudent,
  deleteMultipleStudents,
  getDeletedStudents,
  restoreStudents,
  getDeletedUsers,
};
