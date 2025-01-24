import React, { useState, useRef, useEffect } from 'react';
import './Draw.css';
import GLTFViewer from '../components/lesson/RPDSampleCase/GLTFViewer'; // Assuming Viewer component is imported from GLTFViewer

const Draw = () => {
  const canvasRef = useRef(null);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [fillColor, setFillColor] = useState(false);
  const [selectedShape, setSelectedShape] = useState('pen');
  const [lineWidth, setLineWidth] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prevMouseX, setPrevMouseX] = useState(0);
  const [prevMouseY, setPrevMouseY] = useState(0);
  const [snapshot, setSnapshot] = useState(null);
  const [url, setUrl] = useState(null); // State for storing URL

  // Effect for canvas initialization and resizing
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const handleWindowLoad = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      setCanvasBackground();
    };

    const handleWindowResize = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(canvas, 0, 0);

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.drawImage(tempCanvas, 0, 0);
    };

    handleWindowLoad();
    window.addEventListener("load", handleWindowLoad);
    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("load", handleWindowLoad);
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);

  // Function to set initial canvas background
  const setCanvasBackground = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = currentColor;
    ctx.lineWidth = lineWidth;
  };

  // Function to start drawing on canvas
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    setPrevMouseX(e.clientX - canvas.offsetLeft);
    setPrevMouseY(e.clientY - canvas.offsetTop);
    ctx.beginPath();
    ctx.strokeStyle = currentColor;
    ctx.fillStyle = currentColor;
    ctx.lineWidth = lineWidth;

    // Take a snapshot of the current canvas state
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
  };

  // Function to stop drawing
  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Function for drawing on canvas
  const drawing = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Restore the snapshot
    ctx.putImageData(snapshot, 0, 0);

    switch (selectedShape) {
      case 'pen':
      case 'eraser': {
        ctx.strokeStyle = selectedShape === "eraser" ? "#fff" : currentColor;
        ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        ctx.stroke();
        break;
      }
      case 'rectangle':
        drawRect(ctx, e);
        break;
      case 'circle':
        drawCircle(ctx, e);
        break;
      case 'triangle':
        drawTriangle(ctx, e);
        break;
      default:
        if (fillColor) {
          ctx.fillRect(prevMouseX, prevMouseY, e.clientX - canvas.offsetLeft - prevMouseX, e.clientY - canvas.offsetTop - prevMouseY);
        } else {
          ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
          ctx.stroke();
        }
        break;
    }
  };

  // Function to draw a rectangle
  const drawRect = (ctx, e) => {
    if (!fillColor) {
      ctx.strokeRect(prevMouseX, prevMouseY, e.clientX - canvasRef.current.offsetLeft - prevMouseX, e.clientY - canvasRef.current.offsetTop - prevMouseY);
    } else {
      ctx.fillRect(prevMouseX, prevMouseY, e.clientX - canvasRef.current.offsetLeft - prevMouseX, e.clientY - canvasRef.current.offsetTop - prevMouseY);
    }
  };

  // Function to draw a circle
  // const drawCircle = (ctx, e) => {
  //   ctx.beginPath();
  //   const radius = Math.sqrt(Math.pow((prevMouseX - e.clientX + canvasRef.current.offsetLeft), 2) + Math.pow((prevMouseY - e.clientY + canvasRef.current.offsetTop), 2));
  //   ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
  //   if (fillColor) {
  //     ctx.fill();
  //   } else {
  //     ctx.stroke();
  //   }
  // };

  // Function to draw a triangle
  // const drawTriangle = (ctx, e) => {
  //   ctx.beginPath();
  //   ctx.moveTo(prevMouseX, prevMouseY);
  //   ctx.lineTo(e.clientX - canvasRef.current.offsetLeft, e.clientY - canvasRef.current.offsetTop);
  //   ctx.lineTo(prevMouseX * 2 - e.clientX + canvasRef.current.offsetLeft, e.clientY - canvasRef.current.offsetTop);
  //   ctx.closePath();
  //   if (fillColor) {
  //     ctx.fill();
  //   } else {
  //     ctx.stroke();
  //   }
  // };

  // Function to clear the canvas
  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
  };

  // Function to handle color change
  const handleColorChange = (color) => {
    setCurrentColor(color);
  };

  // Function to handle fill color toggle
  const handleFillColorChange = () => {
    setFillColor(!fillColor);
  };

  // Function to handle shape selection
  const handleShapeClick = (shape) => {
    setSelectedShape(shape);
  };

  // Function to handle line width change
  const handleLineWidthChange = (e) => {
    setLineWidth(parseInt(e.target.value));
  };

  // Function to save the drawing as an image
  const handleSaveImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  // Array of preset colors
  const presetColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];

  return (
    <div className="Container-Draw">
      <section className="tools-board">
        <div className="row">
          <label className="title">Shapes</label>
          <ul className="options">
            <li className={`option tool ${selectedShape === 'rectangle' ? 'active' : ''}`} id='rectangle' onClick={() => handleShapeClick('rectangle')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-square" viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
              </svg>
              <span>Rectangle</span>
            </li>
            <li className={`option tool ${selectedShape === 'circle' ? 'active' : ''}`} id='circle' onClick={() => handleShapeClick('circle')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-circle" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
              </svg>
              <span>Circle</span>
            </li>
            <li className={`option tool ${selectedShape === 'triangle' ? 'active' : ''}`} id='triangle' onClick={() => handleShapeClick('triangle')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-triangle" viewBox="0 0 16 16">
                <path d="M7.938 2.016a.777.777 0 0 1 1.124 0l6.79 7.665a.777.777 0 0 1-.562 1.297H1.71a.777.777 0 0 1-.562-1.297l6.79-7.665z" />
              </svg>
              <span>Triangle</span>
            </li>
          </ul>
        </div>
        <div className="row">
          <label className="title">Colors</label>
          <ul className="options">
            {presetColors.map((color, index) => (
              <li key={index} className={`option tool color ${currentColor === color ? 'active' : ''}`} style={{ backgroundColor: color }} onClick={() => handleColorChange(color)}></li>
            ))}
            <li className="option tool">
              <input type="color" className="color-picker" value={currentColor} onChange={(e) => handleColorChange(e.target.value)} />
            </li>
          </ul>
        </div>
        <div className="row">
          <label className="title">Options</label>
          <ul className="options">
            <li className={`option tool ${fillColor ? 'active' : ''}`} id='fill' onClick={handleFillColorChange}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-brush" viewBox="0 0 16 16">
                <path d="M5 6a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm5.5-3a.5.5 0 0 1 .5.5v3.586l2.25-2.25a.5.5 0 0 1 .707.707l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .707-.707l2.25 2.25V3.5a.5.5 0 0 1 .5-.5z" />
                <path d="M2.5 13.5l-1 1V15h14v-1.5l-1-1a.5.5 0 0 0-.354-.146l-3.793.798-1.806-1.806a.5.5 0 0 0-.707 0L6.646 14.1l-3.793-.798a.5.5 0 0 0-.353.146z" />
              </svg>
              <span>Fill</span>
            </li>
          </ul>
        </div>
        <div className="row">
          <label className="title">Line Width</label>
          <input type="range" min="1" max="50" value={lineWidth} onChange={handleLineWidthChange} className="slider" />
        </div>
        <div className="row">
          <button className="clear-button" onClick={handleClearCanvas}>
            Clear
          </button>
        </div>
        <div className="row">
          <button className="save-button" onClick={handleSaveImage}>
            Save
          </button>
        </div>
      </section>
      <section className="canvas-board">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={drawing}
          className="canvas"
        />
      </section>
      <section className="viewer-board">
        {/* Use Viewer component here */}
        <GLTFViewer url={url} />
      </section>
    </div>
  );
};

export default Draw;
