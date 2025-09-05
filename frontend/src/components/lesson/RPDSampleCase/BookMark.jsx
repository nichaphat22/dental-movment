import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RPD_sample_case.css";
import axios from "axios"; // นำเข้า axios
import { backendUrl, baseUrl } from "../../../utils/services";
import bk from "../../../assets/bookmark.png";
import { useSelector } from "react-redux";
import { Row, Col, Container, Spinner } from "react-bootstrap";

function BookMark({ limit = null, showViewAllButton = false }) {
  const [bookmarkedModels, setBookmarkedModels] = useState([]);
  const navigate = useNavigate();
  const [clickedBookmark, setClickedBookmark] = useState([]);
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true); // Loading state

  console.log(bookmarkedModels);

  // ฟังก์ชันสำหรับดึงข้อมูลโมเดลที่ถูกบุ๊คมาร์ค
  // สำหรับ BookMark.jsx
  const fetchBookmarkedModels = async () => {
    if (!user?._id) return;
    setLoading(true); 
    try {
      // ดึง bookmarks จาก backend
      const response = await axios.get(`${baseUrl}/bookmark/${user._id}`);
      const bookmarkIds = response.data?.bookmarks || [];
      console.log("Bookmark IDs:", bookmarkIds);


      setClickedBookmark(bookmarkIds); // อัปเดต state ของ bookmarks

      if (bookmarkIds.length === 0) {
        setBookmarkedModels([]);
        return;
      }

      // ดึงข้อมูล models ตาม bookmarkIds
      const modelsResponse = await axios.post(`${baseUrl}/model/getByIds`, {
        ids: bookmarkIds, // ส่ง array ของ string ตรง ๆ
      });

      console.log("Models fetched:", modelsResponse.data?.data);
      setBookmarkedModels(modelsResponse.data?.data || []);
    } catch (err) {
      console.error("Error fetching bookmarked models:", err);
    }finally {
    setLoading(false); // ต้อง setLoading(false) หลัง fetch
  }
  };

  // useEffect สำหรับดึงข้อมูลเมื่อมีการเปลี่ยนแปลง user
  useEffect(() => {
    if (user?._id) {
      fetchBookmarkedModels(); // เรียกใช้ฟังก์ชันดึงข้อมูล
    }
  }, [user]); // useEffect นี้จะทำงานเมื่อ user เปลี่ยนแปลง

  // ฟังก์ชันสำหรับจัดการการคลิกที่โมเดล
  const handleModelClick = (model) => {
    navigate(`/Model/${model._id}/view`, {
      state: { selectedModel: { ...model } },
    });
  };

  const handleRemoveBookmark = async (modelId) => {
    try {
      await axios.delete(`${baseUrl}/bookmark/remove-bookmark`, {
        data: { userId: user._id, modelId },
      });

      // อัปเดต state ทั้ง bookmarkedModels และ clickedBookmark
      setBookmarkedModels((prev) => prev.filter((m) => m._id !== modelId));
      setClickedBookmark((prev) => prev.filter((id) => id !== modelId));
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
  };

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
            {bookmarkedModels.map((model, index) => (
              <Col
                xs={12}
                sm={6}
                md={6}
                lg={3}
                xl={3}
                className="mb-4 py-2"
                key={model._id || index}
                style={{}}
              >
                <div className="modelrow-bookmark  h-100" style={{}}>
                  <div className="model-bk2">
                    <button
                      title="บันทึกเป็นรายการโปรด"
                      className="bookmark"
                      onClick={() => handleRemoveBookmark(model._id)}
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
                      src={`${backendUrl}${model.imageUrl}`}
                      alt={model.name}
                      style={{
                        cursor: "pointer",
                        width: "100%",
                        height: "25vh",
                      }}
                      onClick={() => handleModelClick(model)}
                    />
                    <div
                      className="model-container h-100"
                      style={{ height: "70px", display: "flex" }}
                    >
                      <span
                        className="modelName-span h-100"
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
