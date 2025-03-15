const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcryptjs");
const User = require("../Models/userModel");
const Student = require("../Models/studentModel");
const Teacher = require("../Models/teacherModel");
require("dotenv").config();

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: "Incorrect password" });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("✅ Google Profile:", profile);

        if (!accessToken) {
          console.error("❌ Google Access Token missing!");
          return done(new Error("Access Token not received"), null);
        }

        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          console.log("🆕 Creating New User...");

          // 🔹 กำหนดค่า role (ค่าเริ่มต้น: 'teacher' หรือเปลี่ยนเป็น 'student' ถ้าจำเป็น)
          const role = "student"; // หรือกำหนดจากค่าอื่น เช่น profile.metadata

          // 🔹 สร้าง User ใหม่
          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            img: profile.photos[0].value,
            role: role, // ใช้ตัวแปร role ที่กำหนดไว้
          });

          await user.save();

          // 🔹 เช็คว่าเป็น Student หรือ Teacher แล้วสร้าง record
          if (role === "student") {
            console.log("🟢 Creating Student Profile...");
            const student = await Student.create({ user: user._id });
            user.roleData = student._id;
            user.roleRef = "Student";
          } else if (role === "teacher") {
            console.log("🟢 Creating Teacher Profile...");
            const teacher = await Teacher.create({ user: user._id });
            user.roleData = teacher._id;
            user.roleRef = "Teacher";
          }

          await user.save();
          console.log("✅ User Created:", user);
        }

        return done(null, user);
      } catch (error) {
        console.error("❌ Google Authentication Error:", error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("🔹 Serializing user:", user);
  if (!user || !user._id) {
    console.error("❌ Error: User serialization failed - Missing _id");
    return done(new Error("User serialization failed"));
  }
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    console.log("🔹 Deserializing user:", user);
    if (!user) {
      console.error("❌ Error: User deserialization failed - User not found");
      return done(new Error("User not found"));
    }
    done(null, user);
  } catch (error) {
    console.error("❌ Deserialization error:", error);
    done(error, null);
  }
});

module.exports = passport;
