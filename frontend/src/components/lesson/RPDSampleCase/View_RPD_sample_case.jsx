import React, { useContext, useState, useEffect } from "react"; 
import { ref, get, remove } from "firebase/database"; 
import { getDownloadURL, ref as storageRef, deleteObject } from "firebase/storage"; 
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
import { Card, Button, Row, Col,Container } from 'react-bootstrap';

const ViewRPDSampleCase = () => {
  const [models, setModels] = useState([]);
  const [clickedBookmark, setClickedBookmark] = useState({});
  const [selectedModel, setSelectedModel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

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
        } else {
          console.warn("No models found in database.");
        }
      } catch (error) {
        console.error("Error fetching models:", error);
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

  const deleteFolderContents = async (folderPath) => {
    const folderRef = storageRef(storage, folderPath);
    
    try {
      // ดึงรายการไฟล์ทั้งหมดในโฟลเดอร์
      const folderContents = await listAll(folderRef);
      
      // ลบไฟล์แต่ละไฟล์ในโฟลเดอร์
      const deletePromises = folderContents.items.map(itemRef => deleteObject(itemRef));
      await Promise.all(deletePromises);
      
      console.log(`All files in ${folderPath} deleted successfully`);
    } catch (error) {
      console.error("Error deleting folder contents:", error);
    }
  };
  
  const removeModel = async (modelId) => {
    if (window.confirm(`ต้องการที่จะลบโมเดลนี้ ใช่ไหม?`)) {
      try {
        const modelRef = ref(database, `models/${modelId}`); // ใช้ id แทนชื่อ
        const modelToDelete = models.find((model) => model.id === modelId);
  
        if (!modelToDelete) {
          throw new Error("Model not found");
        }
  
        // ลบไฟล์ใน folder image
        await deleteFolderContents(`models/${modelId}/image`);
        console.log(`Image files for ${modelId} deleted successfully`);
  
        // ลบไฟล์ใน folder pattern
        await deleteFolderContents(`models/${modelId}/pattern`);
        console.log(`Pattern files for ${modelId} deleted successfully`);
  
        // ลบไฟล์ใน folder model
        await deleteFolderContents(`models/${modelId}/model`);
        console.log(`Model files for ${modelId} deleted successfully`);
  
        // ลบข้อมูลจาก Realtime Database
        await remove(modelRef);
        console.log(`Model ${modelId} deleted from database`);
  
        // อัปเดต state ใน UI เพื่อแสดงข้อมูลที่ถูกลบ
        const updatedModels = models.filter((model) => model.id !== modelId);
        setModels(updatedModels);
  
        // อัปเดต bookmarks (หากมี)
        const updatedBookmarks = { ...clickedBookmark };
        delete updatedBookmarks[modelId];
        setClickedBookmark(updatedBookmarks);
  
      } catch (error) {
        console.error("Error deleting model:", error);
      }
    } else {
      console.log("Deletion canceled");
    }
  };
  
  
  const goToEditPage = (model) => {
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
                      src={clickedBookmark[model.id] ? '/bookmark.png' : '/bookmark1.png'}
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
        </Container>
        </div>
  );
};

export default ViewRPDSampleCase;
