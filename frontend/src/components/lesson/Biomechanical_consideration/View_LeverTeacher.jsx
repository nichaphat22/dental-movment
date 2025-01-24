import React, { useEffect, useState } from "react";
// import axios from "axios";
import "./Biomechanical_consideration.css";
// import { useNavigate } from "react-router-dom";

function View_LeverTeacher() {
//   const [animations, setAnimations] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchAnimations(); // Fetch animations on component load
//   }, []); 

//   const fetchAnimations = () => {
//     axios
//       .get("http://localhost:8080/api/animation/getAnimation")
//       .then((response) => {
//         setAnimations(response.data); // Store animation data in state
//       })
//       .catch((error) => {
//         console.error("Error:", error);
//       });
//   };

//   const goToEditPage = (id) => {
//     navigate(`/Edit-Biomechanical-consideration/${id}`);
//   };

//   const removeAnimation = (id) => {
//     const confirmDelete = window.confirm("Are you sure you want to delete this animation?");
//     if (confirmDelete) {
//       axios
//         .delete(`http://localhost:8080/api/animation/deleteAnimation/${id}`)
//         .then((response) => {
//           setAnimations(animations.filter((animation) => animation._id !== id));
//           alert("Animation deleted successfully!");
//         })
//         .catch((error) => {
//           console.error("Error:", error);
//           alert("Failed to delete animation.");
//         });
//     }
//   };

//   const handleAddAnimation = () => {
//     navigate(`/Add-Biomechanical-consideration`);
//   };

//   const handleImageClick = (id) => {
//     navigate(`/animation/view/${id}`);
//   };

  return (
    <div className="Content" style={{ backgroundColor: "#fff" }}>
      {/* <h1 className="title-h1">Biomechanical consideration</h1>
      <div className="title">Mechanical force</div>
      <div className="viewAnimation" style={{  display: 'flex', flexWrap: 'wrap', textAlign: 'center'  }}>
        {animations.map((animation) => (
          <div className="animationid" key={animation._id} style={{ marginBottom: "20px" }}>
            <img
              onClick={() => handleImageClick(animation._id)} 
              src={`data:${animation.Ani_image.contentType};base64,${animation.Ani_image.data}`}
              alt={animation.Ani_name}
              width="250"
              height="160px"
              style={{ margin: "10px", cursor: "pointer" }}
            />
            <h3 className="Ani_name" style={{ marginLeft: "10px" }}>{animation.Ani_name}</h3>
            <button className="button-edit" onClick={() => goToEditPage(animation._id)}>Edit</button>
            <button className="button-remove" onClick={() => removeAnimation(animation._id)}>Delete</button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', marginBottom: "20px", marginTop: '20px', justifyContent: 'center' }}>
        <button className="button-add" onClick={handleAddAnimation}>
          <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" fill="currentColor" className="bi bi-plus-lg" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>
</svg>
        </button>
      </div> */}
    </div>
  );
}

export default View_LeverTeacher;
