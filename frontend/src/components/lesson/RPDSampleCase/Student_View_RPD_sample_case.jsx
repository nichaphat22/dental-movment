import React, { useContext,useState, useEffect } from "react";
import { ref, get, remove } from "firebase/database"; // Added remove for deleting from Realtime Database
import { getDownloadURL, ref as storageRef, deleteObject } from "firebase/storage"; // Added deleteObject
import { database, storage } from "../../../config/firebase";
import { useNavigate, useLocation } from "react-router-dom";
import "./RPD_sample_case.css";
import { IoIosSearch } from "react-icons/io";
import axios from 'axios';
// import { baseUrl } from '../../../utils/services';
import { AuthContext } from '../../../context/AuthContext';
import { useSelector } from "react-redux";
// import { HiPlusSm } from "react-icons/hi";

const Student_View_RPD_sample_case = () => {
  const [models, setModels] = useState([]);
  const [clickedBookmark, setClickedBookmark] = useState({});
  const [selectedModel, setSelectedModel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  // const { user } = useContext(AuthContext);
  const user = useSelector((state) => state.auth.user);
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
              id: model.id,
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

    return () => clearInterval(refreshInterval); // Clear interval on component unmount
  }, [location.state, location.search]);

  useEffect(() => {
    if (user?._id) {
      fetchBookmarks(user._id);
    }
  }, [user]); // ✅ ใช้ useEffect เพื่อดึงบุ๊คมาร์คเมื่อ user เปลี่ยนแปลง

  const fetchBookmarks = async (userId) => {
    try {
      const response = await axios.get(`/api/bookmark/${userId}`);
  
      console.log("Response from API:", response.data); // ดูโครงสร้างข้อมูลที่กลับมา
  
      // ✅ ใช้ response.data ตรง ๆ เพราะมันคือ bookmarks
      setClickedBookmark(response.data || {});
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    }
  };
  
  const handleModelClick = (model) => {
    setSelectedModel(model);
    navigate(`/Model/${model.name}/view`, {
      state: { selectedModel: model },
    });
  };

  const handleBookmarkClick = async (userId, modelName) => {
    if (!userId) {
      console.error("Invalid userId:", userId);
      return;
    }
  
    const updatedBookmarks = {
      ...clickedBookmark,
      [modelName]: !clickedBookmark[modelName],
    };
  
    setClickedBookmark(updatedBookmarks); // อัปเดต UI ทันที
  
    try {
      await axios.post(`/api/bookmark/${userId}`, {
        userId,
        bookmarks: updatedBookmarks,
      });
  
      fetchBookmarks(userId); // ✅ โหลดค่าบุ๊คมาร์คใหม่จาก API หลังจากอัปเดต
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

      <div className="grid-container" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {models.filter(model => model.name.toLowerCase().includes(searchTerm.toLowerCase())).map((model) => (
          <div className="modelrow" key={model.name} style={{ maxWidth: '220px' }}>
            <div className="modelbtw">
              <div className="modelname">
                <img
                className="img-model"
                  src={model.imageUrl}
                  alt={model.name}
                  onClick={() => handleModelClick(model)}
                  style={{ cursor: 'pointer', width: '100%', height: 'auto',boxShadow:'none' }}
                />
                <div className="model-container" style={{ columnCount: '2', justifyContent: 'space-between' }}>
                  <span style={{ marginLeft: '10px', fontSize: "0.85rem", color: "#000", fontWeight: '500',maxWidth:'180px' }}>
                    {model.name}
                  </span>
                  <button className="bookmark" onClick={() => handleBookmarkClick(user._id,model.name)}>
                    <img
                    className="img-model"
                      src={clickedBookmark[model.name] ? '/bookmark.png' : '/bookmark1.png'}
                      alt="bookmark"
                      width="30"
                      height="30"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Student_View_RPD_sample_case;