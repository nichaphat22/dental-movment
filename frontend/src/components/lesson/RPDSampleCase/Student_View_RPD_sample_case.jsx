import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./RPD_sample_case.css";
import { IoIosSearch } from "react-icons/io";
import { GoDownload } from "react-icons/go";
import axios from "axios";
import { backendUrl, baseUrl } from "../../../utils/services";
import { useSelector } from "react-redux";
// import bk1 from "../../../../public/bookmark1.png";
// import bk from "../../../../public/bookmark.png";
import bk1 from "../../../assets/bookmark1.png";
import bk from "../../../assets/bookmark.png";
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

const Student_View_RPD_sample_case = () => {
  const [models, setModels] = useState([]);
  const [clickedBookmark, setClickedBookmark] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);

      try {
        const res = await axios.get(`${baseUrl}/model`);
        const sortedData = res.data.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        
        setModels(sortedData);
      } catch (error) {
        console.error("Error fetching models:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();

    if (location.state?.selectedModel) {
      setSelectedModel(location.state.selectedModel);
    }

    const query = new URLSearchParams(location.search);
    setSearchTerm(query.get("search") || "");

    const refreshInterval = setInterval(() => {
      fetchModels();
    }, 60000); // Refresh every 60 seconds

    return () => clearInterval(refreshInterval);
  }, [location.state, location.search]);

  useEffect(() => {
    if (user?._id) {
      fetchBookmarks(user._id);
    }
  }, [user]);

  const fetchBookmarks = async (userId) => {
    try {
      const response = await axios.get(`${baseUrl}/bookmark/${userId}`);
      const bookmarkIds = response.data?.bookmarks || {};
      setClickedBookmark(bookmarkIds);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    }
  };

  const handleAction = async ({
  actionType,
  animationId = null,
  animationTitle = null,
  quizId = null,
  quizTitle = null,
  modelId = null,
  modelTitle = null,
  animation3DId = null,
  animation3DTitle = null,
}) => {
  if (!user) return;

  try {
    await axios.post(`${baseUrl}/recent`, {
      userId: user._id,
      action: actionType,
      animationId,
      animationTitle,
      quizId,
      quizTitle,
      modelId,
      modelTitle,
      animation3DId,
      animation3DTitle,
    });
  } catch (error) {
    console.error("Error saving action:", error);
  }
};


  const handleModelClick = (model) => {
    setSelectedModel(model);
    handleAction({
    actionType: "สื่อการสอน3D",
    modelId: model._id,
    modelTitle: model.name,
  });
    navigate(`/Model/${model._id}/view`, {
      // ใช้ id แทนชื่อ
      state: { selectedModel: model },
    });
  };

  const handleBookmarkClick = async (userId, modelId) => {
    if (!userId || !modelId) {
      console.error("userId or modelId undefined", { userId, modelId });
      return;
    }

    try {
      const res = await axios.post(`${baseUrl}/bookmark/`, {
        userId,
        modelId,
      });
      setClickedBookmark(res.data.bookmarks);
      console.log("Bookmark toggled:", modelId);
      // fetchBookmarks(userId);
    } catch (error) {
      console.error("Error updating bookmarks:", error);
    }
  };

  const handleSearch = () => {
    navigate(`/?search=${searchTerm}`);
    setSearchTerm(""); // ล้างค่าหลังการค้นหา
  };

  const handleDownloadMarker = async (markerUrl) => {
    if (!markerUrl?.path) return;

    // ดึงชื่อไฟล์จาก path
    const filename = markerUrl.path.split("/").pop();
    const url = `${baseUrl}/model/marker-image/${filename}`;

    const res = await fetch(url);

    if (!res.ok) throw new Error("ดาวน์โหลดไม่สำเร็จ");

    const blob = await res.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = markerUrl.name || filename;
    link.click();
    link.remove();
  };

  return (
    <div className="Content">
      <h1 className="title-h1">RPD sample case</h1>
      <div className="title"></div>

      <div className="input-group" style={{ marginBottom: "20px" }}>
        <div className="form-outline" data-mdb-input-init>
          <input
            type="search"
            placeholder="ค้นหาโมเดล..."
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="btn btn-primary"
          data-mdb-ripple-init
        >
          <IoIosSearch />
        </button>
      </div>

      <Container className="container-model">
        <Row>
          {models
            .filter((model) =>
              model.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((model) => (
              <Col
                xs={12}
                sm={6}
                md={6}
                lg={3}
                xl={3}
                className="mb-4"
                key={model._id}
                style={{}}
              >
                <div className="modelbtw  h-100">
                  <div className="modelname">
                    <button
                      title="บันทึกเป็นรายการโปรด"
                      className="bookmark"
                      onClick={() => handleBookmarkClick(user?._id, model._id)}
                    >
                      <img
                        className="img-bookmark"
                        src={clickedBookmark.includes(model._id) ? bk : bk1}
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
                      className="img-model"
                      src={`${backendUrl}${model.imageUrl}`}
                      alt={model.name}
                      onClick={() => handleModelClick(model)}
                      style={{
                        clear: "both",
                        cursor: "pointer",
                        width: "100%",
                        height: "18vh",
                      }}
                    />
                    <div className="dd h-100" style={{ height: "70px" }}>
                      <div
                        className="model-container-view "
                        style={{ height: "100px" }}
                      >
                        <span
                          className="modelName-span "
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
                      {model.markerUrl && (
                        <button
                          className="text-blue-600 hover:underline  font-normal text-xs ml-auto flex items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation(); // ป้องกัน trigger click ของ card
                            handleDownloadMarker(model.markerUrl);
                          }}
                        >
                          <div className="flex ">
                           AR Marker<GoDownload className="ml-1"/>

                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Col>
            ))}
        </Row>
      </Container>
    </div>
  );
};

export default Student_View_RPD_sample_case;
