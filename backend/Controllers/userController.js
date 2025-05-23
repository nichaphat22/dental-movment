const userModel = require("../Models/userModel");
const Teacher = require("../Models/teacherModel");
const Student = require("../Models/studentModel");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const createToken = (_id) => {
  const jwtkey = process.env.JWT_SECRET_KEY;
  return jwt.sign({ _id }, jwtkey, { expiresIn: "3d" });
};

// register
// // register
const registerUser = async (req, res) => {
    try {
        const { fname, lname, email, password, roleRef, img } = req.body;

        let user = await userModel.findOne({ email });

        if (user) return res.status(400).json("User with the given email already exists...");

        if (!fname || !lname || !email || !password || !roleRef || !img) return res.status(400).json("All fields are required...");

        if (!validator.isEmail(email)) return res.status(400).json("Email must be a valid email...");

        user = new userModel({ fname, lname, email, password, roleRef,img });

        if (!password) {
            return res.status(400).json("Password is required");
        }
        
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);  // ใช้ password ที่รับมาจาก req.body
        
        // Save the user
        await user.save();

        // Check if the role is 'student' and create student record
        if (roleRef === 'student') {
            const student = await Student.create({ user: user._id });
            user.student = student._id;
            await user.save();
        } else if (roleRef === 'teacher') {
            const teacher = await Teacher.create({ user: user._id });
            user.teacher = teacher._id;
            await user.save();
        }

        const token = createToken(user._id);

        res.status(200).json({ _id: user._id, fname, lname, email, roleRef, img, token });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

// login

const loginUser = async (req, res) => {
    const { email, password } = req.body;  // อย่าลืมรับ password ด้วย

  try {
    let user = await userModel.findOne({ email });

        if (!user) return res.status(400).json({ error: "Invalid email or password..." });

        // หากไม่ได้ตรวจสอบรหัสผ่าน (เพราะคอมเมนต์ไว้) ต้องแน่ใจว่าโค้ดด้านบนไม่ลืมเช็ค password

        const token = createToken(user._id); // สมมติว่า createToken สร้าง JWT token ให้

        // ส่งข้อมูลผู้ใช้และ token กลับไป
        res.status(200).json({ 
            _id: user._id, 
            name: user.name, 
            email: user.email, 
            roleRef: user.roleRef, 
            img: user.img, 
            token 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong, please try again later." });
    }
};

// Add teacher
const addTeacher = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json("User not found...");

    const teacher = await Teacher.create({ user: userId }); // สร้างข้อมูลใน teacherModel
    user.teacher = teacher._id; // อัปเดตฟิลด์ teacher ใน userModel

    await user.save();

    res.status(200).json({ message: "Teacher added successfully", user });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

// Add student
const addStudent = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json("User not found...");

    const student = await Student.create({ user: userId }); // สร้างข้อมูลใน studentModel
    user.student = student._id; // อัปเดตฟิลด์ student ใน userModel

    await user.save();

    res.status(200).json({ message: "Student added successfully", user });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

// finduser
const findUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await userModel.findById(userId);

    if (!user) return res.status(404).json("User not found...");

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

// getUsers
const getUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

//getStudent
const getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json({ students });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//update profile
const updateProfile = async (req, res) => {
    const { name, img } = req.body;
    const userId = req.userId; // ได้รับมาจาก middleware `verifyToken`
  
    try {
      const user = await userModel.findById(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
  
      // ตรวจสอบว่า name หรือ img ต้องมีค่าก่อนอัปเดต
      if (!name && !img) {
        return res.status(400).json({ error: "No data to update" });
      }
  
      if (name) user.name = name; 
      if (img) user.img = img;
  
      await user.save();
  
      res.status(200).json({ fname: user.fname, img: user.img });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Error updating profile" });
    }
  };


const getUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        // console.log("UserID:", userId); // ตรวจสอบ userId

        const currentUser = await userModel.findById(userId);
        const roleRef = currentUser.roleRef; // ถ้าฟิลด์เป็น roleRef แทน
        // const role = currentUser.role; // ถ้าฟิลด์เป็น roleRef แทน
        // console.log("roleRef:", currentUser.roleRef); // ตรวจสอบ currentUser
        // console.log("role:", currentUser.role); // ตรวจสอบ currentUser

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }
        // console.log("CurrentUser:", currentUser); // ตรวจสอบ currentUser
        // ตรวจสอบว่า role อยู่ใน currentUser หรือไม่
        // const role = currentUser.role; // ใช้ role จาก currentUser
        if (!roleRef) {
            return res.status(400).json({ message: "Role not found in user data" });
        }

        // console.log("CurrentUser Role:", roleRef); // ตรวจสอบ role

        let users;
        if (roleRef.trim().toLowerCase() === "teacher") {
            users = await userModel.find({ roleRef: "student" });
        } else if (roleRef.trim().toLowerCase() === "student") {
            users = await userModel.find({ roleRef: "teacher" });
        } else {
            users = []; // ถ้าไม่มี role ที่กำหนด
        }

        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching users", error });
    }
};



module.exports = 
{ 
    registerUser,
    loginUser, 
    findUser, 
    getUsers, 
    addTeacher, 
    addStudent,
    getUserId,
    getStudents,
    updateProfile 
};
