import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Biomechanical_consideration.css";
import { baseUrl } from '../../../utils/services';
import { useNavigate } from "react-router-dom";
// <<<<<<< HEAD
// import { Card, Button, Row, Col } from 'react-bootstrap';
import { useSelect } from "@material-tailwind/react";
import { useSelector } from "react-redux";
// =======
import { Card, Button, Row, Col,Container,Spinner } from 'react-bootstrap';
// >>>>>>> 17e3e66933ba71d74a2e3eb14960d1a5350d1d3a

function View_Biomechanical_consideration_Student() {
  const user = useSelector((state) => state.auth.user);
  const [animations, setAnimations] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    fetchAnimations();
  }, []);

  const fetchAnimations = () => {
    axios
      .get(`${baseUrl}/animation/getAnimation`)
      .then((response) => {
        console.log("API Response:", response.data); // Debugging
      setAnimations(response.data);
      setLoading(false); // Set loading to false once data is fetched
    })
    .catch((error) => {
      console.error("Error:", error);
      setLoading(false); // Set loading to false in case of an error
    });
};


  const handleAction = async (
    actionType,
    animationId = null,
    quizId = null
  ) => {
    if (!user) return;
    try {
      await axios.post(`${baseUrl}/recent`, {
        userId: user._id, // ใช้ userId ที่ได้จาก useSelector
        action: actionType,
        animationId,
        quizId,
      });
    } catch (error) {
      console.error("Error saving action:", error);
    }
  }

  const handleImageClick = (id,  Ani_name) => {
    handleAction("บทเรียน", id,null ,Ani_name);
    navigate(`/animation/view/${id}`);
  };

  return (
    <div className="Content" style={{ backgroundColor: "#fff" }}>
      <h1 className="title-h1">Biomechanical consideration</h1>
      <div className="title">Mechanical force</div>
      <Container>
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
                                กำลังโหลด... </div>
        ) : (
      <Row>
        {animations.map((animation) => (
          <Col xs={12} sm={6} md={6} lg={3}  className="mb-4" key={animation._id}>
            <div className="animationid" style={{ textAlign: 'center',justifyItems:'center' }}>
             <div className="ani" style={{boxShadow:'box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.075)',paddingBottom:'15px'}}>
              <img
              className="img_ani"
              title="คลิกเพื่อเล่นวิดีโอ"
                onClick={() => handleImageClick(animation._id)}
                src={`data:${animation.Ani_image.contentType};base64,${animation.Ani_image.data}`}
                alt={animation.Ani_name}
      
                style={{  cursor: "pointer",borderRadius:'10px' }}
              />
            
             <div className="nameandbt">
             <h3 className="Ani_name">{animation.Ani_name}</h3>
             {/* <sapan className="bt" style={{}}>
       
             </sapan> */}
             </div>
             </div>
            </div>
          </Col>
        ))}
      </Row>
        )}
      </Container>
    </div>
  );
}
export default View_Biomechanical_consideration_Student;