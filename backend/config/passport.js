const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const LocalStrategy = require("passport-local");
const authController = require("../Controllers/authController");
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
        if (!isMatch)
          return done(null, false, { message: "Incorrect password" });

        return done(null, user);
      } catch (error) {
        return done(err);
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
    authController.googleLogin
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
