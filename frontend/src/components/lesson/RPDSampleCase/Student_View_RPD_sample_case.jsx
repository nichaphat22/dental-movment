import React, { useContext,useState, useEffect } from "react";
import { ref, get, remove } from "firebase/database"; // Added remove for deleting from Realtime Database
import { getDownloadURL, ref as storageRef, deleteObject } from "firebase/storage"; // Added deleteObject
import { database, storage } from "../../../config/firebase";
import { useNavigate, useLocation } from "react-router-dom";
import "./RPD_sample_case.css";
import { IoIosSearch } from "react-icons/io";
import axios from 'axios';
import { baseUrl } from '../../../utils/services';
import { AuthContext } from '../../../context/AuthContext';
import { useSelector } from "react-redux";
// import { HiPlusSm } from "react-icons/hi";
// import { Card, Button, Row, Col,Container } from 'react-bootstrap';
import bk1 from '../../../../public/bookmark1.png'
import bk from '../../../../public/bookmark.png'
import { Card, Button, Row, Col, Container, Spinner, Dropdown, ButtonGroup, } from 'react-bootstrap';

const Student_View_RPD_sample_case = () => {
  const [models, setModels] = useState([]);
  const [clickedBookmark, setClickedBookmark] = useState({});
  const [selectedModel, setSelectedModel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  // const { user } = useContext(AuthContext);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
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
  
  
  const handleSearch = () => {
    navigate(`/?search=${searchTerm}`);
    setSearchTerm(""); // ล้างค่าหลังการค้นหา
  };

  return (
    <div className="Content">
      <h1 className="title-h1">RPD sample case</h1>
      <div className="title"></div>

      <div className="input-group" style={{marginBottom:'20px'}}>
  <div className="form-outline" data-mdb-input-init>
    <input type="search"  placeholder="ค้นหาโมเดล..."  className="form-control" value={searchTerm}   onChange={(e) => setSearchTerm(e.target.value)} />
  </div>
  <button type="button" onClick={handleSearch} className="btn btn-primary" data-mdb-ripple-init>
  <IoIosSearch />
  </button>
</div>


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
                <div className="dd h-100" style={{height:'70px'}}>
                {/* <div className="detail-model  h-100" style={{display:'flex',justifyContent:'space-between',flexDirection:'column',}}> */}
                <div className="model-container-view " style={{ height:'100px', }}>
                  <span className="modelName-span " style={{ margin: '10px 0 10px 0', fontSize: "0.85rem", color: "#000", fontWeight: '500',wordBreak:'break-all'}}>
                  
                  {/* maxWidth:'100%'  */}
                    {model.name}
                  </span>
                 
                </div>
              </div>
              </div>
              </div>
              
              
            {/* </div> */}
          </Col>
          // </div>
        ))}
        </Row>
         {/* )} */}
        </Container>
    </div>
  );
};

export default Student_View_RPD_sample_case;