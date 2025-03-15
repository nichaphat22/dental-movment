import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Biomechanical_consideration.css";
import { baseUrl } from '../../../utils/services';
import { useNavigate } from "react-router-dom";
import { Card, Button, Row, Col } from 'react-bootstrap';
import { useSelect } from "@material-tailwind/react";
import { useSelector } from "react-redux";

function View_Biomechanical_consideration_Student() {
  const user = useSelector((state) => state.auth.user);
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

  const handleAction = async (
    actionType,
    animationId = null,
    quizId = null
  ) => {
    if (!user) return;
    try {
      await axios.post("http://localhost:8080/api/recent", {
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
      <Row>
        {animations.map((animation) => (
          <Col sm={6} md={4} lg={3} className="mb-4" key={animation._id}>
            <div className="animationid" style={{ textAlign: 'center' }}>
              <img
                onClick={() => handleImageClick(animation._id)}
                src={`data:${animation.Ani_image.contentType};base64,${animation.Ani_image.data}`}
                alt={animation.Ani_name}
                width="100%"
                max-height="120px"
                style={{  cursor: "pointer" }}
              />
              <h3 className="Ani_name">{animation.Ani_name}</h3>

            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default View_Biomechanical_consideration_Student;