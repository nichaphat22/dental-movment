import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./RPD_sample_case.css";
import { HiPlusSm } from "react-icons/hi";
import { IoIosSearch } from "react-icons/io";
import { backendUrl, baseUrl } from "../../../utils/services";
import axios from "axios";
import { toast, Flip, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
// import bk1 from "../../../../public/bookmark1.png";
// import bk from "../../../../public/bookmark.png";
import bk1 from "../../../assets/bookmark1.png";
import bk from "../../../assets/bookmark.png";
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

const ViewRPDSampleCase = () => {
  const [models, setModels] = useState([]);
  const [clickedBookmark, setClickedBookmark] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true); // Loading state

  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch models
  useEffect(() => {
    const fetchModels = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${baseUrl}/model`);
        console.log(res.data);
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
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, [location.state, location.search]);

  // Fetch bookmarks
  useEffect(() => {
    if (user?._id) {
      fetchBookmarks(user._id);
    }
  }, [user]);

  const fetchBookmarks = async (userId) => {
    if (!userId) return;
    try {
      const response = await axios.get(`${baseUrl}/bookmark/${userId}`);
      const bookmarkIds = response.data?.bookmarks || [];
      setClickedBookmark(bookmarkIds);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    }
  };

  const handleModelClick = (model) => {
    setSelectedModel(model);
    navigate(`/Model-teacher/${model._id}/view`, {
      // ใช้ id แทนชื่อ
      state: { selectedModel: model },
    });
  };

  // Handle bookmark click
  const handleBookmarkClick = async (userId, modelId) => {
    if (!userId || !modelId) {
      console.error("userId or modelId undefined", { userId, modelId });
      // toast.error("ไม่สามารถบันทึกโมเดลโปรด: user หรือ model ไม่ถูกต้อง");
      return;
    }

    try {
      const res = await axios.post(`${baseUrl}/bookmark`, { userId, modelId });
      setClickedBookmark(res.data.bookmarks);
      console.log("Bookmark toggled:", modelId);
    } catch (error) {
      console.error("Error updating bookmarks:", error);
      // toast.error("เกิดข้อผิดพลาดในการบันทึกโมเดลโปรด");
    }
  };

  const removeModel = async (modelId, index) => {
    // แสดง Swal เพื่อขอการยืนยันจากผู้ใช้
    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณต้องการลบโมเดลนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${baseUrl}/model/${modelId}`);

          setModels((prevModels) =>
            prevModels.filter((model) => model._id !== modelId)
          );

          // แสดงข้อความสำเร็จหลังจากการลบ
          Swal.fire("ลบสำเร็จ!", "โมเดลถูกลบเรียบร้อยแล้ว", "success");
        } catch (error) {
          console.error("Error deleting model:", error);
          Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถลบโมเดลได้", "error");
        }
      } else {
        console.log("Deletion canceled");
      }
    });
  };

  const goToEditPage = (model) => {
    console.log(model.id);
    navigate(`/Edit-RPD/${model._id}/edit`, { state: model });
  };

  const handleAddModel = () => {
    navigate(`/Add-RPD`);
  };

  const handleSearch = () => {
    navigate(`/?search=${searchTerm}`);
    setSearchTerm("");
  };

  return (
    <div className="Content" style={{}}>
      <ToastContainer />
      <div className="flex justify-between my-2 mx-4">
        <h1 className="my-2 text-xl font-semibold">RPD sample case</h1>
        <button
          className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          onClick={handleAddModel}
        >
          <HiPlusSm className="w-4 h-4 lg:w-5 lg:h-5 mr-1" />
          <span className="text-xs md:text-sm lg:text-base">
            เพิ่มสื่อการสอน
          </span>
        </button>
      </div>

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
      {/* display: 'flex', justifyContent: 'center', flexWrap: 'wrap' */}

      <Container className="container-model">
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
        ) : (
          <Row>
            {models
              .filter((model) =>
                model.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((model) => (
                //  <div className="grid-contaioner">
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
                        onClick={() =>
                          handleBookmarkClick(user?._id, model._id)
                        }
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
                      <div className="dd h-100" style={{ height: "100px" }}>
                        <div
                          className="detail-model  h-100"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            flexDirection: "column",
                          }}
                        >
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
                              {/* maxWidth:'100%'  */}
                              {model.name}
                            </span>
                          </div>
                          <div className="bt3DModel">
                            <button
                              className="button-edit"
                              onClick={() => goToEditPage(model)}
                            >
                              แก้ไข
                            </button>
                            <button
                              className="button-remove"
                              onClick={() => removeModel(model._id)} // ใช้ id แทนชื่อ
                            >
                              ลบ
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
                // </div>
              ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default ViewRPDSampleCase;
