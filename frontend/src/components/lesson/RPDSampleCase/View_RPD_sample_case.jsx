import React, { useContext, useState, useEffect } from "react"; 
import { ref, get, remove } from "firebase/database"; 
import { getDownloadURL, getStorage,ref as storageRef, deleteObject,listAll } from "firebase/storage"; 
import { database, storage } from "../../../config/firebase";
import { useNavigate, useLocation } from "react-router-dom";
import "./RPD_sample_case.css";
import { HiPlusSm } from "react-icons/hi";
import { IoIosSearch } from "react-icons/io";
import { baseUrl } from '../../../utils/services';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdEdit } from "react-icons/md";
// import { Card, Button, Row, Col,Container } from 'react-bootstrap';
import { toast, Flip, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import bk1 from '../../../../public/bookmark1.png'
import bk from '../../../../public/bookmark.png'
import { useSelector } from "react-redux";
import { Card, Button, Row, Col, Container, Spinner, Dropdown, ButtonGroup, } from 'react-bootstrap';



const ViewRPDSampleCase = () => {
  const [models, setModels] = useState([]);
  const [clickedBookmark, setClickedBookmark] = useState({});
  const [selectedModel, setSelectedModel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  // const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true); // Loading state

  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  // const storage = getStorage(); // Firebase Storage instance
  // const database = getDatabase(); // Firebase Database instance
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const modelsRef = ref(database, "models/");
        const snapshot = await get(modelsRef);

        if (snapshot.exists()) {
          const modelsData = await Promise.all(Object.values(snapshot.val()).map(async (model) => {
            let imageUrl = '';
            try {
              const imageRef = storageRef(storage, model.imageUrl);
              imageUrl = await getDownloadURL(imageRef);
            } catch (error) {
              console.error('Error fetching image URL:', error);
            }

            return {
              id: model.id, // เปลี่ยนเป็น id
              name: model.name,
              url: model.url,
              patternUrl: model.patternUrl,
              imageUrl: imageUrl
            };
          }));
          setModels(modelsData);
          setLoading(false); 
        } else {
          console.warn("No models found in database.");
        }
      } catch (error) {
        console.error("Error fetching models:", error);
        setLoading(false); 
      }
    };

    fetchModels();

    if (location.state?.selectedModel) {
      setSelectedModel(location.state.selectedModel);
    }

    const query = new URLSearchParams(location.search);
    setSearchTerm(query.get('search') || '');

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
      setClickedBookmark(response.data || {});
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    }
  };

  const handleModelClick = (model) => {
    setSelectedModel(model);
    navigate(`/Model/${model.id}/view`, { // ใช้ id แทนชื่อ
      state: { selectedModel: model },
    });
  };


  const handleBookmarkClick = async (userId, modelId) => {
    if (!userId) {
      console.error("Invalid userId:", userId);
      return;
    }
  
    const updatedBookmarks = {
      ...clickedBookmark,
      [modelId]: !clickedBookmark[modelId], // ใช้ id แทนชื่อ
    };
  
    setClickedBookmark(updatedBookmarks);
  
    try {
      await axios.post(`${baseUrl}/bookmark/${userId}`, {
        userId,
        bookmarks: updatedBookmarks,
      });
  
      fetchBookmarks(userId);
    } catch (error) {
      console.error("Error updating bookmarks:", error);
    }
  };
  const deleteFileFromStorage = async (fileUrl) => {
    try {
      console.log("fileUrl",fileUrl);
        // ตรวจสอบว่า fileUrl มีค่าหรือไม่
        if (!fileUrl) {
            throw new Error('File URL is undefined or null');
        }

        // แยกเอา path ของไฟล์ออกจาก URL โดยการใช้ decodeURIComponent และการ split ตาม '?'
        const filePath = decodeURIComponent(fileUrl.split('?')[0].split('o/')[1]);
        // const fileName = filePath.split('/').pop();  // ดึงแค่ชื่อไฟล์จากพาธ
        
        // console.log("fileName",fileName);
        // `${folder}/${newFileName}
        // เตรียมการเข้าถึง Firebase Storage
        // const storage = getStorage();
        const fileRef =  storageRef(storage, `${filePath}`);  // สร้าง reference สำหรับไฟล์ที่ต้องการลบ
       
        // ลบไฟล์จาก Storage
        await deleteObject(fileRef);
        console.log("File deleted successfully from Storage!");
    } catch (error) {
        // หากเกิดข้อผิดพลาด ให้จับและแสดงข้อความผิดพลาด
        console.error("Error deleting file from Storage:", error.message);
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
        // แสดง Toast ขณะกำลังกำจัดไฟล์
      // toast.info("กำลังกำจัดไฟล์โมเดล...", {
      //     position: "top-right",
      //     autoClose: false, // ให้ค้างไว้จนกว่าการลบจะเสร็จ
      //     theme: "light",
      //     transition: Flip,
      //   });
         // อัปเดต Toast สำหรับไฟล์โมเดลที่ลบเสร็จแล้ว
        //  toast.update(toastId, {
        //   render: "ลบไฟล์โมเดลเสร็จสิ้น!",
        //   type: "success",
        //   autoClose: 1000, // ปิดหลังจาก 2 วินาที
        // });
        // เรียกดูข้อมูลของโมเดลจาก Firebase Realtime Database
        const modelRef = ref(database, `models/${modelId}`);
        const modelSnapshot = await get(modelRef);
        const modelData = modelSnapshot.val();

        if (!modelData) {
          console.log(`No data found for model ${modelId}`);
          return;
        }

        // ดึง URLs ของไฟล์ที่เกี่ยวข้อง
        const { imageUrl, patternUrl, url } = modelData;
        console.log("Deleting files with URLs:", { imageUrl, patternUrl, url });

        // ลบไฟล์จาก Firebase Storage
        if (imageUrl) {
          await deleteFileFromStorage(imageUrl); // ส่ง URL ของไฟล์
          console.log(`Image files for ${modelId} deleted successfully`);
        }

        if (patternUrl) {
          await deleteFileFromStorage(patternUrl); // ส่ง URL ของไฟล์
          console.log(`Pattern files for ${modelId} deleted successfully`);
        }

        if (url) {
          await deleteFileFromStorage(url); // ส่ง URL ของไฟล์
          console.log(`Model files for ${modelId} deleted successfully`);
        }

        // ลบข้อมูลของโมเดลออกจาก Firebase Realtime Database
        await remove(modelRef);
        console.log(`Model ${modelId} deleted from database`);

        // อัพเดทสถานะ UI
        const updatedModels = models.filter((model) => model.id !== modelId);
        setModels(updatedModels);

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
    console.log(model.id)
    navigate(`/Edit-RPD/${model.id}/edit`, { state: model });
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
       <ToastContainer  />  
      <div className="flex justify-between my-2 mx-4">
        <h1 className="my-2 text-xl font-semibold">RPD sample case</h1>
        <button 
          className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          onClick={handleAddModel}>
          <HiPlusSm className="w-5 h-5 mr-2" />
          เพิ่มสื่อการสอน
        </button>
      </div>

      <div className="input-group" style={{ marginBottom: '20px' }}>
        <div className="form-outline" data-mdb-input-init>
          <input 
            type="search" 
            placeholder="ค้นหาโมเดล..."  
            className="form-control" 
            value={searchTerm}   
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <button type="button" onClick={handleSearch} className="btn btn-primary" data-mdb-ripple-init>
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
                      style={{marginRight:'5px',background:'rgb(168, 69, 243)', width: '25px',  // ปรับขนาดของสปินเนอร์
                       height: '25px'}}
                    />
                    กำลังโหลด...
                    
          </div>
        ) : (

          
  
       
    <Row >
        {models.filter(model => model.name.toLowerCase().includes(searchTerm.toLowerCase())).map((model) => (
        //  <div className="grid-contaioner">
         <Col xs={12} sm={6} md={6} lg={3} xl={3} className="mb-4" key={model.id} style={{  }}>
            <div className="modelbtw  h-100">
              <div className="modelname">
                 <button 
                  title="บันทึกเป็นรายการโปรด"
                  className="bookmark" onClick={() => handleBookmarkClick(user._id, model.id)}>
                    <img
                      className="img-bookmark"
                      src={clickedBookmark[model.id] ? bk : bk1 }
                      alt="bookmark"
                      style={{minWidth:'28px',minHeight:'28px',height:'28px',width:'28px'}}
                    />
                  </button>
                <img
                  className="img-model"
                  src={model.imageUrl}
                  alt={model.name}
                  onClick={() => handleModelClick(model)}
                  style={{ clear:'both',cursor: 'pointer', width: '100%', height: '18vh',}}
                />
                <div className="dd h-100" style={{height:'100px'}}>
                <div className="detail-model  h-100" style={{display:'flex',justifyContent:'space-between',flexDirection:'column',}}>
                <div className="model-container-view " style={{ height:'100px', }}>
                  <span className="modelName-span " style={{ margin: '10px 0 10px 0', fontSize: "0.85rem", color: "#000", fontWeight: '500',wordBreak:'break-all'}}>
                  
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
                onClick={() => removeModel(model.id)} // ใช้ id แทนชื่อ
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
