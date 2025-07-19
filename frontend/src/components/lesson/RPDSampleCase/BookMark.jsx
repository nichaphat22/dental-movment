import React, { useState, useContext, useEffect } from "react";
import { ref, get } from "firebase/database";
import { database } from "../../../config/firebase"; // ใช้การตั้งค่าของ Firebase Realtime Database
import { useNavigate } from "react-router-dom";
import "./RPD_sample_case.css";
import axios from "axios"; // นำเข้า axios
import { baseUrl } from "../../../utils/services";
import { AuthContext } from "../../../context/AuthContext";
import { RiDeleteBin6Line } from "react-icons/ri";
import bk from "../../../../public/bookmark.png";
import { useSelector } from "react-redux";
import {
  Card,
  Button,
  Row,
  Col,
  Container,
  Spinner,
  Dropdown,
  ButtonGroup,
} from "react-bootstrap";


function BookMark({ limit = null, showViewAllButton = false }) {
  const [bookmarkedModels, setBookmarkedModels] = useState([]);
  const navigate = useNavigate();
  const [clickedBookmark, setClickedBookmark] = useState({});
  // const { user } = useContext(AuthContext);
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true); // Loading state

  console.log(bookmarkedModels);

  // ฟังก์ชันสำหรับดึงข้อมูลโมเดลที่ถูกบุ๊คมาร์ค
  const fetchBookmarkedModels = async () => {
    if (!user?._id) {
      console.error("User ID is not available");
      return;
    }

    try {
      const response = await axios.get(`${baseUrl}/bookmark/${user._id}`);
      // ตรวจสอบว่า response มีข้อมูลบุ๊คมาร์คหรือไม่
      if (!response.data) {
        console.error("Error: No bookmarks data found", response.data);
        return;
      }

      const bookmarksData = response.data;

      // คัดกรองเฉพาะโมเดลที่บุ๊คมาร์ค (ค่าที่เป็น true)
      const filteredBookmarks = Object.entries(bookmarksData)
        .filter(([_, isBookmarked]) => isBookmarked) // คัดกรองเฉพาะที่เป็น true
        .map(([name]) => name);

      // ถ้าไม่มีข้อมูลบุ๊คมาร์คก็ออกจากฟังก์ชัน
      if (filteredBookmarks.length === 0) {
        console.warn("No valid bookmarked models found.");
        setBookmarkedModels([]); // ตั้งค่ารายการโมเดลเป็นค่าว่าง
        setLoading(false);
        return;
      }

      // ดึงข้อมูลจาก Firebase Realtime Database
      const modelsRef = ref(database, "models"); // เส้นทางที่เก็บข้อมูลโมเดลใน Realtime Database
      const modelsSnapshot = await get(modelsRef);

      if (!modelsSnapshot.exists()) {
        console.error("Error: No models data found in database");
        return;
      }

      const modelsData = modelsSnapshot.val();

      // คัดกรองเฉพาะโมเดลที่ถูกบุ๊คมาร์คจากฐานข้อมูล
      const modelsWithUrls = filteredBookmarks
        .map((modelId) => {
          const model = modelsData[modelId];
          if (model) {
            return {
              id: model.id,
              name: model.name,
              url: model.url || "",
              patternUrl: model.patternUrl || "",
              imageUrl: model.imageUrl || "",
            };
          }
          return null;
        })
        .filter((model) => model !== null); // ลบข้อมูลที่เป็น null ออก

      // ตั้งค่ารายการโมเดลที่ถูกบุ๊คมาร์ค
      // ตั้งค่ารายการโมเดลที่ถูกบุ๊คมาร์ค โดยเรียงลำดับใหม่ (ล่าสุดอยู่หน้า)
      const sortedModels = [...modelsWithUrls].reverse();

      // ถ้ามี limit ให้ตัดเฉพาะจำนวนล่าสุด
      const limitedModels = limit ? sortedModels.slice(0, limit) : sortedModels;

      setBookmarkedModels(limitedModels);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching bookmarked models:", error);
      setLoading(false);
    }
  };

  // useEffect สำหรับดึงข้อมูลเมื่อมีการเปลี่ยนแปลง user
  useEffect(() => {
    if (user?._id) {
      fetchBookmarkedModels(); // เรียกใช้ฟังก์ชันดึงข้อมูล
    }
  }, [user]); // useEffect นี้จะทำงานเมื่อ user เปลี่ยนแปลง

  // ฟังก์ชันสำหรับจัดการการคลิกที่โมเดล
  const handleModelClick = (name, url, patternUrl) => {
    navigate(`/Model/${name}/view`, {
      state: { selectedModel: { name, url, patternUrl } },
    });
  };

  const handleRemoveBookmark = async (modelId, modelName) => {
    try {
      // Send a DELETE request with the correct modelId
      await axios.delete(
        `${baseUrl}/bookmark/remove-bookmark/${user._id}/${modelId}`
      );

      // Update UI to remove the model using modelId
      setBookmarkedModels((prevModels) =>
        prevModels.filter((model) => model.id !== modelId)
      ); // ใช้ model.id แทน model.name
    } catch (error) {
      console.error("Error removing bookmark:", error);
    }
  };

  const handleAllClick = () => {
    if (user?.role === "student") {
      navigate("/bookmark-student");
    } else if (user?.role === "teacher") {
      navigate("/bookmark-teacher");
    } else {
      navigate("/"); // fallback เผื่อไม่มี role
    }
  }

  return (
    <div className="Content" style={{ backgroundColor: "#fff" }}>
      <h1 className="title-h1"></h1>
      <Container className="container">
        {loading ? ( // Show loading spinner while data is loading
          <div className="d-flex justify-content-center my-5" style={{}}>
            {/* animation="grow" */}
            <Spinner
              as="span"
              animation="grow"
              //  size="lg"
              role="status"
              aria-hidden="true"
              style={{
                marginRight: "5px",
                background: "rgb(168, 69, 243)",
                width: "25px", // ปรับขนาดของสปินเนอร์
                height: "25px",
              }}
            />
            กำลังโหลด...
          </div>
        ) : bookmarkedModels.length === 0 ? (
          <div
            className="text-center my-5 text-muted"
            style={{ fontSize: "1.2rem" }}
          >
            ไม่มีรายการโปรด
          </div>
        ) : (
          <Row>
            {showViewAllButton && (
              <div className="text-end mb-2">
                <button
                  className="text-sm text-blue-600 hover:underline"
                  onClick={handleAllClick}
                >
                  ดูรายการทั้งหมด
                </button>
              </div>
            )}
            {bookmarkedModels.map((model) => (
              <Col
                xs={12}
                sm={6}
                md={6}
                lg={3}
                className="mb-4 py-2"
                key={model.name}
                style={{}}
              >
                <div className="modelrow-bookmark  h-100" style={{}}>
                  <div className="model-bk2">
                    <button
                      title="บันทึกเป็นรายการโปรด"
                      className="bookmark"
                      onClick={() => handleRemoveBookmark(model.id, model.name)}
                    >
                      <img
                        className="img-bookmark"
                        src={bk}
                        alt="bookmark"
                        style={{
                          minWidth: "28px",
                          minHeight: "28px",
                          height: "28px",
                          width: "28px",
                        }}
                      />
                    </button>
                    <img
                      className="img-bookmark"
                      src={model.imageUrl}
                      alt={model.name}
                      style={{
                        cursor: "pointer",
                        width: "100%",
                        height: "20vh",
                      }}
                      onClick={() =>
                        handleModelClick(
                          model.name,
                          model.url,
                          model.patternUrl
                        )
                      }
                    />
                    <div
                      className="model-container h-100"
                      style={{ height: "70px", display: "flex" }}
                    >
                      <span
                        className="modelName-span"
                        style={{
                          margin: "10px 0 10px 0",
                          fontSize: "0.85rem",
                          color: "#000",
                          fontWeight: "500",
                          wordBreak: "break-all",
                        }}
                      >
                        {model.name}
                      </span>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}

export default BookMark;
