import React, { useState, useEffect } from "react";
import { GoX } from "react-icons/go";
import { API } from "../../api/api";
import { updateUserProfile } from "../../redux/authSlice";
import { useDispatch, useSelector } from "react-redux";

const CustomizeProfile = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const userImg = useSelector((state) => state.auth.img);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    img: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        img: userImg ?? "/default-profile.png", // ✅ ป้องกัน undefined
      });
    }
  }, [user, userImg]);
  

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"; // ปิดการเลื่อน
    } else {
      document.body.style.overflow = "auto"; // เปิดการเลื่อนกลับเมื่อปิด
    }
  
    return () => {
      document.body.style.overflow = "auto"; // Cleanup ตอน unmount
    };
  }, [isOpen]);
  

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({ ...formData, img: reader.result });
        };
        reader.readAsDataURL(file);
    }
  };
  

  const handleSave = async () => {
    try {
      let updatedFormData = { ...formData };
  
      if (formData.img.startsWith("data:image")) {
        // อัปโหลดรูปไปยังเซิร์ฟเวอร์
        const uploadRes = await API.post("/api/upload", { image: formData.img });
        updatedFormData.img = uploadRes.data.url; // เก็บ URL ที่อัปโหลดแล้ว
      }
  
      const updatedData = await API.put("/api/users/updateProfile", updatedFormData);
      dispatch(updateUserProfile(updatedData.data));
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์");
    }
  };
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/30">
      <div
        className="bg-white p-6 rounded-lg shadow-lg w-96"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-center mb-4">
          <h2 className="text-lg font-semibold">Customize Profile</h2>
          {/* <div onClick={onClose}>
            <GoX className="w-5 h-5" />
          </div> */}
        </div>

        {/* รูปโปรไฟล์ */}
        <div className="flex justify-center mb-4 relative">
          <label className="cursor-pointer relative">
            <img
              src={formData.img}
              alt="Profile"
              className="w-24 h-24 rounded-full border shadow-md object-cover"
            />
            {/* อัปโหลดรูป */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <div className="absolute bottom-0 right-0 bg-gray-700 text-white text-xs p-1 rounded-full">
              📷
            </div>
          </label>
        </div>

        {/* Form */}
        <div className="text-left space-y-2">
          <label className="ml-1">ชื่อ</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />

          <label className="ml-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            readOnly // 🔹 ใส่ readOnly เพื่อป้องกันการแก้ไข
            className="w-full max-w-[250px] border p-2 rounded bg-gray-200 cursor-not-allowed"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-center mt-4">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
            onClick={onClose}
          >
            ยกเลิก
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleSave}
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizeProfile;
