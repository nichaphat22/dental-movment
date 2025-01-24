import React, { useState, useEffect } from "react";
import { ref, get, remove } from "firebase/database"; // Added remove for deleting from Realtime Database
import { getDownloadURL, ref as storageRef, deleteObject } from "firebase/storage"; // Added deleteObject
import { database, storage } from "../../../config/firebase";
import { useNavigate, useLocation } from "react-router-dom";
import "./RPD_sample_case.css";

const Student_View_RPD_sample_case = () => {
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



  return (
    <div className="Content">
      <h1 className="title-h1">RPD sample case</h1>
      <div className="title"></div>

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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Student_View_RPD_sample_case;