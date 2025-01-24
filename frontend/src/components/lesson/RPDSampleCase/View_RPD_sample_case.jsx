import React, { useState, useEffect } from "react";
import { ref, get, remove } from "firebase/database"; // Added remove for deleting from Realtime Database
import { getDownloadURL, ref as storageRef, deleteObject } from "firebase/storage"; // Added deleteObject
import { database, storage } from "../../../config/firebase";
import { useNavigate, useLocation } from "react-router-dom";
import "./RPD_sample_case.css";
import { HiPlusSm } from "react-icons/hi";

const ViewRPDSampleCase = () => {
  const [models, setModels] = useState([]);
  const [clickedBookmark, setClickedBookmark] = useState({});
  const [selectedModel, setSelectedModel] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

    const savedBookmarks = JSON.parse(localStorage.getItem('bookmarks')) || {};
    setClickedBookmark(savedBookmarks);

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

  const handleModelClick = (model) => {
    setSelectedModel(model);
    navigate(`/Model/${model.name}/view`, {
      state: { selectedModel: model },
    });
  };

  const handleBookmarkClick = (modelName) => {
    const updatedBookmarks = {
      ...clickedBookmark,
      [modelName]: !clickedBookmark[modelName],
    };
    setClickedBookmark(updatedBookmarks);
    localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
  };

  const removeModel = async (modelName) => {
    if (window.confirm(`ต้องการที่จะลบโมเดล ${modelName} ใช่ไหม?`)) {
      try {
        const modelRef = ref(database, `models/${modelName}`);
        
        // Find the model data from state
        const modelToDelete = models.find((model) => model.name === modelName);
        if (!modelToDelete) {
          throw new Error("Model not found");
        }

        // Delete the image from Firebase Storage
        const imageRef = storageRef(storage, modelToDelete.imageUrl);
        await deleteObject(imageRef);
        console.log(`Image for ${modelName} deleted successfully`);

        // Remove model data from Realtime Database
        await remove(modelRef);
        console.log(`Model ${modelName} deleted from database`);

        // Update local state
        const updatedModels = models.filter((model) => model.name !== modelName);
        setModels(updatedModels);

        // Update bookmarks
        const updatedBookmarks = { ...clickedBookmark };
        delete updatedBookmarks[modelName];
        setClickedBookmark(updatedBookmarks);
        localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
      } catch (error) {
        console.error("Error deleting model:", error);
      }
    } else {
      console.log("Deletion canceled");
    }
  };

  const goToEditPage = (model) => {
    navigate(`/Edit-RPD/${model.name}/edit`, { state: model });
  };

  const handleAddModel = () => {
    navigate(`/Add-RPD`);
  };

  return (
    <div className="Content">
      {/* <h1 className="title-h1">RPD sample case</h1>
      <div className="title"></div> */}
      <div className="flex justify-between my-2 mx-4 ">
      <h1 className="my-2 text-xl font-semibold">RPD sample case</h1>
      <button 
        className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        onClick={handleAddModel}>
        <HiPlusSm className="w-5 h-5 mr-2" />
        เพิ่มสื่อการสอน
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
                  style={{ cursor: 'pointer', width: '100%', height: 'auto' }}
                />
                <div className="model-container" style={{ columnCount: '2', justifyContent: 'space-between' }}>
                  <span style={{ marginLeft: '10px', fontSize: "0.85rem", color: "#000", fontWeight: '500',maxWidth:'180px' }}>
                    {model.name}
                  </span>
                  <button className="bookmark" onClick={() => handleBookmarkClick(model.name)}>
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
              <button
                className="button-edit"
                onClick={() => goToEditPage(model)}
              >
                แก้ไข
              </button>
              <button
                className="button-remove"
                onClick={() => removeModel(model.name)}
              >
                ลบ
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* <div style={{ display: 'flex', marginBottom: "20px", marginTop: '20px', justifyContent: 'center' }}>
        <button className="button-add" onClick={handleAddModel}>
          <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2" />
          </svg>
        </button>
      </div> */}
    </div>
  );
};

export default ViewRPDSampleCase;
