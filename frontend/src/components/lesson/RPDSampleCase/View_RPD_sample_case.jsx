import React, { useContext,useState, useEffect } from "react";
import { ref, get, remove } from "firebase/database"; // Added remove for deleting from Realtime Database
import { getDownloadURL, ref as storageRef, deleteObject } from "firebase/storage"; // Added deleteObject
import { database, storage } from "../../../config/firebase";
import { useNavigate, useLocation } from "react-router-dom";
import "./RPD_sample_case.css";
import { HiPlusSm } from "react-icons/hi";
import { IoIosSearch } from "react-icons/io";
import { baseUrl } from '../../../utils/services';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
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
      const response = await axios.get(`${baseUrl}/bookmark/${userId}`);
  
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
      await axios.post(`${baseUrl}/bookmark/${userId}`, {
        userId,
        bookmarks: updatedBookmarks,
      });
  
      fetchBookmarks(userId); // ✅ โหลดค่าบุ๊คมาร์คใหม่จาก API หลังจากอัปเดต
    } catch (error) {
      console.error("Error updating bookmarks:", error);
    }
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
        // localStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
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

  const handleSearch = () => {
    navigate(`/?search=${searchTerm}`);
    setSearchTerm(""); // ล้างค่าหลังการค้นหา
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
          <div className="modelrow" key={model.name} style={{ maxWidth: '210px' }}>
            <div className="modelbtw">
              <div className="modelname">
                <img
                className="img-model"
                  src={model.imageUrl}
                  alt={model.name}
                  onClick={() => handleModelClick(model)}
                  style={{ cursor: 'pointer', width: '100%', height: '180px' }}
                />
                <div className="model-container-view" style={{ columnCount: '2', justifyContent: 'space-between' }}>
                  <span style={{ marginLeft: '10px', fontSize: "0.85rem", color: "#000", fontWeight: '500',maxWidth:'80%' }}>
                    {model.name}
                  </span>
                  <button className="bookmark" onClick={() => handleBookmarkClick(user._id,model.name)}>
                    <img
                    className="img-model"
                      src={clickedBookmark[model.name] ? '/bookmark.png' : '/bookmark1.png'}
                      alt="bookmark"
                      width="28"
                      height="28"
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



// import React, { useState, useContext, useEffect } from "react";
// import { ref, get, remove } from "firebase/database";
// import { getDownloadURL, ref as storageRef, deleteObject } from "firebase/storage";
// import { database, storage } from "../../../config/firebase";
// import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios"; // นำเข้า axios
// import "./RPD_sample_case.css";
// import { HiPlusSm } from "react-icons/hi";
// import { IoIosSearch } from "react-icons/io";
// import { baseUrl } from '../../../utils/services';
// import { AuthContext } from '../../../context/AuthContext';
// import { urlencoded } from "body-parser";

// const ViewRPDSampleCase = () => {
//   const [models, setModels] = useState([]);
//   const [clickedBookmark, setClickedBookmark] = useState({});
//   const [selectedModel, setSelectedModel] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user } = useContext(AuthContext);

// console.log('user',user)
//   useEffect(() => {
//     const fetchModels = async () => {
//       try {
//         const modelsRef = ref(database, "models/");
//         const snapshot = await get(modelsRef);

//         if (snapshot.exists()) {
//           const modelsData = await Promise.all(Object.values(snapshot.val()).map(async (model) => {
//             let imageUrl = '';
//             try {
//               const imageRef = storageRef(storage, model.imageUrl);
//               imageUrl = await getDownloadURL(imageRef);
//             } catch (error) {
//               console.error('Error fetching image URL:', error);
//             }

//             return {
//               id: model.id,
//               name: model.name,
//               url: model.url,
//               patternUrl: model.patternUrl,
//               imageUrl: imageUrl
//             };
//           }));
//           setModels(modelsData);
//         } else {
//           console.warn("No models found in database.");
//         }
//       } catch (error) {
//         console.error("Error fetching models:", error);
//       }
//     };

//     fetchModels(); // ✅ เรียกครั้งเดียวพอ

//     if (location.state?.selectedModel) {
//       setSelectedModel(location.state.selectedModel);
//     }

//     const query = new URLSearchParams(location.search);
//     setSearchTerm(query.get('search') || '');

//     const refreshInterval = setInterval(() => {
//       fetchModels();
//     }, 60000); // Refresh every 60 seconds

//     return () => clearInterval(refreshInterval); // Cleanup
//   }, [location.state, location.search]);

//   // ✅ แยก useEffect สำหรับ bookmarks
//   useEffect(() => {
//     const fetchBookmarks = async (userId) => {
//       try {
//         const response = await axios.get(`${baseUrl}/bookmark/${userId}`);
//         const receivedBookmarks = response.data; // รับข้อมูลจาก API
//         setClickedBookmark(receivedBookmarks); // อัปเดต state ด้วยข้อมูลที่ได้รับ
//       } catch (error) {
//         console.error("Error fetching bookmarks:", error);
//       }
//     };
  

//     if (user?._id) {
//       fetchBookmarks(user._id); // ✅ ทำให้แน่ใจว่า fetch ถูกเรียกตอน user เปลี่ยน
//     }
//   }, [user]);
  
//   const handleBookmarkClick = async (userId, modelName) => {
//     console.log("userId before API call:", userId);
//     console.log("modelName before API call:", modelName);
  
//     if (!userId) {
//       console.error("Invalid userId:", userId);
//       return;
//     }
  
//     const updatedBookmarks = {
//       ...clickedBookmark,
//       [modelName]: !clickedBookmark[modelName],
//     };
  
//     console.log("Updated bookmarks:", updatedBookmarks);
  
//     setClickedBookmark(updatedBookmarks);
  
//     try {
//       const response = await axios.post(`${baseUrl}/bookmark/${userId}`, {
//         userId,
//         bookmarks: updatedBookmarks,
//       }, {
//         headers: {
//           'Content-Type': 'application/json', // เพิ่ม headers เพื่อให้ API รับข้อมูล JSON
//         }
//       });
  
//       console.log("Response from API:", response.data);
//     } catch (error) {
//       console.error("Error updating bookmarks:", error);
//     }
//   };
  
  

//   const removeModel = async (modelName, userId) => {
//     if (window.confirm(`ต้องการที่จะลบโมเดล ${modelName} ใช่ไหม?`)) {
//       try {
//         const modelRef = ref(database, `models/${modelName}`);
  
//         // ค้นหาข้อมูลโมเดลจาก state
//         const modelToDelete = models.find((model) => model.name === modelName);
//         if (!modelToDelete) {
//           throw new Error("Model not found");
//         }
  
//         // ลบภาพจาก Firebase Storage
//         const imageRef = storageRef(storage, modelToDelete.imageUrl);
//         await deleteObject(imageRef);
//         console.log(`Image for ${modelName} deleted successfully`);
  
//         // ลบข้อมูลโมเดลจาก Realtime Database
//         await remove(modelRef);
//         console.log(`Model ${modelName} deleted from database`);
  
//         // อัปเดต state ของโมเดล
//         const updatedModels = models.filter((model) => model.name !== modelName);
//         setModels(updatedModels);
  
//         // อัปเดต bookmarks
//         const updatedBookmarks = { ...clickedBookmark };
//         delete updatedBookmarks[modelName];
//         setClickedBookmark(updatedBookmarks);
  
//         // อัปเดตข้อมูล bookmarks ผ่าน API
//         try {
//           await axios.post(`${baseUrl}/bookmark/${userId}`, { userId, bookmarks: updatedBookmarks });
//         } catch (error) {
//           console.error("Error updating bookmarks after deletion:", error);
//         }
//       } catch (error) {
//         console.error("Error deleting model:", error);
//       }
//     } else {
//       console.log("Deletion canceled");
//     }
//   };
  
  
//   const handleModelClick = (model) => {
//     setSelectedModel(model);
//     navigate(`/Model/${model.name}/view`, {
//       state: { selectedModel: model },
//     });
//   };



//   const goToEditPage = (model) => {
//     navigate(`/Edit-RPD/${model.name}/edit`, { state: model });
//   };

//   const handleAddModel = () => {
//     navigate(`/Add-RPD`);
//   };

//   const handleSearch = () => {
//     navigate(`/?search=${searchTerm}`);
//     setSearchTerm(""); // ล้างค่าหลังการค้นหา
//   };

//   return (
//     <div className="Content">
//       <div className="flex justify-between my-2 mx-4 ">
//         <h1 className="my-2 text-xl font-semibold">RPD sample case</h1>
//         <button
//           className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
//           onClick={handleAddModel}>
//           <HiPlusSm className="w-5 h-5 mr-2" />
//           เพิ่มสื่อการสอน
//         </button>
//       </div>

//       <div className="input-group">
//         <div className="form-outline" data-mdb-input-init>
//           <input type="search" placeholder="ค้นหาโมเดล..." className="form-control" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
//         </div>
//         <button type="button" onClick={handleSearch} className="btn btn-primary" data-mdb-ripple-init>
//           <IoIosSearch />
//         </button>
//       </div>

//       <div className="grid-container" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
//         {models.filter(model => model.name.toLowerCase().includes(searchTerm.toLowerCase())).map((model) => (
//           <div className="modelrow" key={model.name} style={{ maxWidth: '210px' }}>
//             <div className="modelbtw">
//               <div className="modelname">
//                 <img
//                   className="img-model"
//                   src={model.imageUrl}
//                   alt={model.name}
//                   onClick={() => handleModelClick(model)}
//                   style={{ cursor: 'pointer', width: '100%', height: '180px' }}
//                 />
//                 <div className="model-container-view" style={{ columnCount: '2', justifyContent: 'space-between' }}>
//                   <span style={{ marginLeft: '10px', fontSize: "0.85rem", color: "#000", fontWeight: '500', maxWidth: '80%' }}>
//                     {model.name}
//                   </span>
//                   <button className="bookmark" onClick={() => handleBookmarkClick(user._id,model.name)}>
//                     <img
//                       className="img-model"
//                       src={clickedBookmark[model.name] ? '/bookmark.png' : '/bookmark1.png'}
//                       alt="bookmark"
//                       width="28"
//                       height="28"
//                     />
//                   </button>
//                 </div>
//               </div>
//               <button className="button-edit" onClick={() => goToEditPage(model)}>แก้ไข</button>
//               <button className="button-remove" onClick={() => removeModel(model.name)}>ลบ</button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ViewRPDSampleCase;
