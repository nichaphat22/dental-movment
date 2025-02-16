import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Biomechanical_consideration.css";
import { baseUrl } from '../../../utils/services';
import { useNavigate } from "react-router-dom";
import { Card, Button, Row, Col,Container } from 'react-bootstrap';

function View_Biomechanical_consideration_Student() {
  const [animations, setAnimations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnimations();
  }, []);

  const fetchAnimations = () => {
    axios
      .get(`${baseUrl}/animation/getAnimation`)
      .then((response) => {
        setAnimations(response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handleImageClick = (id) => {
    navigate(`/animation/view/${id}`);
  };

  return (
    <div className="Content" style={{ backgroundColor: "#fff" }}>
      <h1 className="title-h1">Biomechanical consideration</h1>
      <div className="title">Mechanical force</div>
      <Container>
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
             <sapan className="bt" style={{}}>
       
             </sapan>
             </div>
             </div>
            </div>
          </Col>
        ))}
      </Row>
      </Container>
    </div>
  );
}

export default View_Biomechanical_consideration_Student;