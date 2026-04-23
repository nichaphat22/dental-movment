import React, { useEffect, useState, useMemo } from "react";
import { ARCanvas, ARMarker } from "@artcom/react-three-arjs";
import AR_RPD_sample_case from "./AR_RPD_sample_case";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { baseUrl, backendUrl } from "../../../utils/services";
import axios from "axios";

function ARScene() {
  const [patterns, setPatterns] = useState([]);
  const [isARActive, setIsARActive] = useState(true);
  const navigate = useNavigate();
  const [visibleMarkers, setVisibleMarkers] = useState({});

  const targetSize = 100;   // normalize ขนาดโมเดล
  const baseScale = 0.05;  // ปรับรวม scale สำหรับ AR

  // Fetch model data
  useEffect(() => {
    const fetchModelData = async () => {
      try {
        const response = await axios.get(`${baseUrl}/model`);
        if (response.data && Array.isArray(response.data)) {
          const modelsArray = response.data
            .filter((model) => model && Object.keys(model).length > 0)
            .map((model) => ({
              patternUrl: `${backendUrl}${model.patternUrl}`,
              modelUrl: `${backendUrl}${model.modelUrl}`,
            }));
          setPatterns(modelsArray);
        } else {
          console.log("No data available");
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchModelData();
  }, []);

  const memoizedPatterns = useMemo(() => patterns, [patterns]);

  // Close AR
  const handleClose = () => {
    setIsARActive(false);
    setTimeout(() => {
      if (window.history.length > 1) navigate(-1);
      else window.close();
    }, 300);

    const video = document.querySelector("video");
    if (video?.srcObject) video.srcObject.getTracks().forEach(t => t.stop());

    const arVideo = document.getElementById("arjs-video");
    if (arVideo) { arVideo.srcObject = null; arVideo.remove(); }

    const arCanvas = document.querySelector("canvas");
    if (arCanvas) arCanvas.remove();
  };

  // Camera settings
  const [cameraSettings, setCameraSettings] = useState({
    fov: 50,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 10,
  });

  useEffect(() => {
    const handleResize = () => {
      setCameraSettings(prev => ({
        ...prev,
        aspect: window.innerWidth / window.innerHeight,
      }));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Marker handlers
  const onMarkerFound = (pattern) => {
    setVisibleMarkers(prev => ({ ...prev, [pattern.patternUrl]: true }));
  };
  const onMarkerLost = (pattern) => {
    setVisibleMarkers(prev => ({ ...prev, [pattern.patternUrl]: false }));
  };

  return (
    <div>
      {isARActive ? (
        <ARCanvas
          className="ar-Scene"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 10000,
            width: "100vw",
            height: "100vh",
          }}
          camera={cameraSettings}
          gl={{ antialias: true }}
          onCreated={({ gl }) => {
            gl.setSize(window.innerWidth, window.innerHeight);
            gl.setPixelRatio(window.devicePixelRatio);
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight intensity={0.5} />
          <pointLight position={[2, 2, 2]} intensity={0.5} />

          {memoizedPatterns.map((pattern, index) => (
            <ARMarker
              key={index}
              type="pattern"
              patternUrl={pattern.patternUrl}
              onMarkerFound={() => onMarkerFound(pattern)}
              onMarkerLost={() => onMarkerLost(pattern)}
            >
              {visibleMarkers[pattern.patternUrl] && (
                <AR_RPD_sample_case
                  modelUrl={pattern.modelUrl}
                  targetSize={targetSize}
                  baseScale={baseScale}
                  position={[0, 1, 0]}
                />
              )}
            </ARMarker>
          ))}
        </ARCanvas>
      ) : (
        <p>AR Mode exited.</p>
      )}

      <Button
        className="bt-cross"
        variant="primary"
        onClick={handleClose}
        style={{
          background: "rgb(166, 84, 249)",
          borderColor: "transparent",
          position: "absolute",
          padding: "8px",
          top: "10px",
          right: "8px",
          zIndex: 10000,
          boxShadow:
            "rgb(0, 0, 0) 0px 50px 100px -20px, rgba(0, 0, 0, 0.38) 0px 30px 60px -30px, rgb(27, 11, 62) 0px -2px 6px 0px inset",
        }}
      >
        <span style={{ color: "#fff", fontWeight: "300", fontSize: "1.7rem" }}>
          <IoMdClose />
        </span>
      </Button>
    </div>
  );
}

export default ARScene;
