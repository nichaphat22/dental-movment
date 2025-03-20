import React, { useState, useEffect, useRef, useContext } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './RPD_sample_case.css';
import { FaPen, FaEraser, FaTrash } from "react-icons/fa"; // Import icons
import { baseUrl } from '../../../utils/services';
import { AuthContext } from '../../../context/AuthContext';
import { IoIosSave } from "react-icons/io";
import { RxText } from "react-icons/rx";
import { FaBold } from "react-icons/fa6";
import { FiItalic } from "react-icons/fi";
import { BsTypeUnderline } from "react-icons/bs";
import { GrTextAlignLeft } from "react-icons/gr";
import { GrTextAlignCenter } from "react-icons/gr";
import { GrTextAlignRight } from "react-icons/gr";
import { RiFontFamily } from "react-icons/ri";

import { FaPlay } from "react-icons/fa6";
import { TbPlayerPauseFilled } from "react-icons/tb";
// import * as fabric from 'fabric';
import { fabric } from 'fabric'
import 'fabric-history'
import { GrRedo } from "react-icons/gr";
import { GrUndo } from "react-icons/gr";
import { FaEye } from "react-icons/fa6";
import { MdDraw } from "react-icons/md";
import { BsTypeBold } from "react-icons/bs";
import { VscBold } from "react-icons/vsc";
import { BsEraser } from "react-icons/bs";
import { RiDeleteBin6Line } from "react-icons/ri";
import { AiOutlineDelete } from "react-icons/ai";
import { IoHandRightSharp } from "react-icons/io5";
import { IoHandRightOutline } from "react-icons/io5";
import { RxBorderWidth } from "react-icons/rx";
import InputNumber from 'rc-input-number';

import { toast, Flip, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";


const ViewModel = () => {
  const location = useLocation();
  const containerRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const modelRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const rendererRef = useRef(null);
  const canvasRef = useRef(null);
  const textCanvasRef = useRef(null);
  const { user } = useContext(AuthContext); // ใช้ context เพื่อดึงข้อมูลผู้ใช้
  // const [history, setHistory] = useState(null); // History state

  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [startPoint, setStartPoint] = useState(null);
  const [lineWidth, setLineWidth] = useState(2);
  const [currentColor, setCurrentColor] = useState('#3884ff');
  const [isErasing, setIsErasing] = useState(false); // State for erase mode

  const [fabricCanvas, setFabricCanvas] = useState(null);
  const [isTextMode, setIsTextMode] = useState(false); // State for text mode
  const [textColor, setTextColor] = useState('#000000'); // Text color
  const [fontSize, setFontSize] = useState(20); // Text size

  // const [isModelActive, setIsModelActive] = useState(false); 
  const [animationStopped, setAnimationStopped] = useState(false);
  const [isEraserMode, setIsEraserMode] = useState(false); // ประกาศ useState สำหรับการตั้งค่าโหมดลบ
  const [selectedObject, setSelectedObject] = useState(null); // เก็บวัตถุที่ถูกเลือก

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState('left');
  const [activeButton, setActiveButton] = useState('left');
  const [showOptions, setShowOptions] = useState(false); // ควบคุมการแสดงปุ่มเพิ่มเติม
  const [isClicked, setIsClicked] = useState(false);
  const buttonRef = useRef(null);
  const [isChecked, setIsChecked] = useState(isDrawingMode || isTextMode);
  const lineWidthRef = useRef(null);
  const [showLineWidth, setShowLineWidth] = useState(false);
  // const [fontSize, setFontSize] = useState(14); // ค่าเริ่มต้นเป็น 14px


  const [showCanvas, setShowCanvas] = useState(false);
  const [isActive, setIsActive] = useState({
    pen: false,  // สถานะของปุ่ม Pen
    eraser: false, // สถานะของปุ่ม 1
    bold: false, // สถานะของปุ่ม 2
    italic: false,
    underline: false,
    textAlignLeft: false,
    textAlignCenter: false,
    textAlignRight: false,
  });


  useEffect(() => {
    const loader = new GLTFLoader();
    // const renderer = new THREE.WebGLRenderer({ antialias: true });
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    // renderer.setPixelRatio(window.devicePixelRatio); // ป้องกันภาพแตก
    // renderer.setSize(container.clientWidth, container.clientHeight);
  // กำหนดขนาดให้เต็มพื้นที่ของ container
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  // renderer.domElement.style.maxWidth = "100%"; // ตัวอย่าง max-width
  // renderer.domElement.style.maxHeight = "100%"; // ตัวอย่าง max-height

    renderer.setPixelRatio(2); // ตั้งค่าความละเอียดเป็น 2 เท่าของค่าปกติ


    renderer.setClearColor(0xffffff, 1);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;

    
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.screenSpacePanning = true; // เพิ่มการสนับสนุนสำหรับการเลื่อนโมเดล
    controls.enableZoom = true;


    // ใช้ Pointer Events
    renderer.domElement.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") {
        // เมื่อเกิดเหตุการณ์สัมผัส
        controls.enabled = true;
      }
    });

    renderer.domElement.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") {
        // สามารถจัดการการเคลื่อนไหวเมื่อสัมผัส
      }
    });

    renderer.domElement.addEventListener("pointerup", () => {
      controls.enabled = true; // ให้สามารถหมุนโมเดลได้หลังจากสัมผัสเสร็จ
    });

    // ปรับการจัดการสัมผัสให้รองรับอุปกรณ์
    renderer.domElement.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        controls.enabled = true; // ให้ใช้ OrbitControls ขณะสัมผัส
      }
    });

    renderer.domElement.addEventListener("touchmove", (e) => {
      if (e.touches.length === 1) {
        e.preventDefault(); // ป้องกันการเลื่อนหน้าจอ
        controls.update(); // ใช้การอัพเดตจาก OrbitControls
      }
    });

    renderer.domElement.addEventListener("touchend", () => {
      controls.enabled = true; // ปล่อยการควบคุมเมื่อสัมผัสเสร็จ
    });

  // รองรับการสัมผัส
    renderer.domElement.addEventListener("touchmove", (e) => {
        if (e.touches.length === 1) {
            e.preventDefault();
            controls.update(); // อัพเดต controls สำหรับการซูม
        }
    });

    const container = containerRef.current;
    container.appendChild(renderer.domElement);
    renderer.setSize(container.clientWidth, container.clientHeight);


    if (location.state && location.state.selectedModel) {
      const { url } = location.state.selectedModel;
      loader.load(
        url,
        (gltf) => {
          const loadedModel = gltf.scene;
          modelRef.current = loadedModel;

          const box = new THREE.Box3().setFromObject(loadedModel);
          const size = new THREE.Vector3();
          const center = new THREE.Vector3();
          box.getSize(size);
          box.getCenter(center);
          loadedModel.position.sub(center);

          const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
          const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
          directionalLight.position.set(10, 10, 10);
          loadedModel.add(ambientLight);
          loadedModel.add(directionalLight);

          camera.position.set(0, 0, size.length() * 0.7);
          scene.add(loadedModel);

          // เริ่มด้วย animationStopped เป็น true เพื่อป้องกันการโต้ตอบทันที
          setAnimationStopped(true);
        },
        undefined,
        (error) => {
          console.error('Error loading model:', error);
          alert('Failed to load the model. Please try again.');
        }
      );
    }

    const animate = () => {
      requestAnimationFrame(animate);
      if (!isDrawingMode) {
        controls.update();
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [location.state]);

  // Array of preset colors
  const presetColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];
  // Function to handle color change
  const handleColorChange = (color) => {
    setCurrentColor(color);
    if (fabricCanvas && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = color; // อัปเดตสีของแปรง
    }
  };



  // ฟังก์ชันสลับการหยุดหรือเริ่มการเคลื่อนไหว
  const toggleAnimation = () => {
    setAnimationStopped(!animationStopped);

    if (!animationStopped) {
      controlsRef.current.autoRotate = false;
      controlsRef.current.enabled = false;
    } else {
      controlsRef.current.autoRotate = true;
      controlsRef.current.enabled = true;
    }
  };



  // เพิ่มฟังก์ชัน Undo 
  // เพิ่มฟังก์ชัน Redo
  // import { fabric } from 'fabric';

  useEffect(() => { 
    if (showCanvas) {
      if (!fabricCanvas) {
        console.log("Canvas is now visible, initializing fabric canvas...");
        
        const newCanvas = new fabric.Canvas(canvasRef.current, {
          isDrawingMode: false,
          imageSmoothingEnabled: true, // Enable image smoothing for better image sharpness
        });
        const container = containerRef.current;
        newCanvas.setWidth(container.clientWidth);
        newCanvas.setHeight(container.clientHeight);
        
        
        const undoStack = [];
        const redoStack = [];

        let isUndoRedoAction = false;

        const undo = () => {
          if (undoStack.length > 1) {
            isUndoRedoAction = true; // เริ่ม Undo Action
            redoStack.push(undoStack.pop());
            const currentState = undoStack[undoStack.length - 1];
            newCanvas.loadFromJSON(currentState, () => {
              newCanvas.renderAll();
              isUndoRedoAction = false; // จบ Undo Action
            });
          } else if (undoStack.length === 1) {
            newCanvas.clear();
            undoStack.length = 0;
            redoStack.length = 0;
            console.log('Canvas has been reset to empty.');
          }
        };

        const redo = () => {
          if (redoStack.length > 0) {
            isUndoRedoAction = true; // เริ่ม Redo Action
            const redoState = redoStack.pop();
            undoStack.push(redoState);
            newCanvas.loadFromJSON(redoState, () => {
              newCanvas.renderAll();
              isUndoRedoAction = false; // จบ Redo Action
            });
          }
        };

        const addHistory = () => {
          if (!isUndoRedoAction) { // ถ้าไม่ได้อยู่ใน Undo/Redo Action
            const currentState = newCanvas.toJSON();
            if (undoStack.length === 0 || JSON.stringify(undoStack[undoStack.length - 1]) !== JSON.stringify(currentState)) {
              undoStack.push(currentState);
              redoStack.length = 0; // Clear redoStack เมื่อมีการเปลี่ยนแปลงใหม่
              console.log('Added history:', currentState);
            }
          }
        };



        newCanvas.on('object:modified', addHistory);
        newCanvas.on('object:added', addHistory);
        newCanvas.on('object:removed', addHistory);

        // Add initial state
        undoStack.push(newCanvas.toJSON());


        setFabricCanvas(newCanvas);

        // ตัวอย่างการใช้งาน undo และ redo
        document.getElementById("undoButton").addEventListener("click", undo);
        document.getElementById("redoButton").addEventListener("click", redo);

        // Cleanup function to off the events when the component is unmounted or canvas is no longer needed

      }
    } else {
      if (fabricCanvas) {
        fabricCanvas.dispose();
        setFabricCanvas(null);
      }
    }
  }, [showCanvas]);



  useEffect(() => {
    if (canvasRef.current) {
      // เปิดหรือปิดโหมดการวาดตามค่า isDrawingMode
      canvasRef.current.isDrawingMode = isDrawingMode;

      // ตรวจสอบว่า freeDrawingBrush ถูกกำหนดหรือยัง
      if (isDrawingMode && canvasRef.current.freeDrawingBrush) {
        canvasRef.current.freeDrawingBrush.color = currentColor;
        canvasRef.current.freeDrawingBrush.width = lineWidth;
      }
    }
  }, [isDrawingMode, currentColor, lineWidth]); // ทำงานเมื่อ isDrawingMode, currentColor หรือ lineWidth เปลี่ยนแปลง



  // ฟังก์ชันสลับระหว่างโหมดการวาดและการแสดงโมเดล
  const switchToDrawingMode = () => {
    setShowCanvas(true);  // แสดงแคนวาส
    // addText()
    setIsDrawingMode(true);
    setIsTextMode(true);
  };

  const switchToModelView = () => {
    setShowCanvas(false);
    setIsDrawingMode(false);
    setIsTextMode(false);

    // เคลียร์ canvas เมื่อสลับกลับไปที่โหมด 3D Model
    if (fabricCanvas) {
      fabricCanvas.dispose(); // Clear the fabric canvas
      setFabricCanvas(null);  // Reset the fabricCanvas state
    }
    // รีเซ็ตสถานะของปุ่มที่เกี่ยวข้อง (เช่นการรีเซ็ต isActive)
    setIsActive((prev) => ({
      ...prev,
      pen: false,  // สถานะของปุ่ม Pen
      eraser: false, // สถานะของปุ่ม 1
      bold: false, // สถานะของปุ่ม 2
      italic: false,
      underline: false,
      textAlignLeft: false,
      textAlignCenter: false,
      textAlignRight: false,
    }));
    setIsBold(false);
    setIsItalic(false);
    setIsUnderline(false);
  };

  // Add this useEffect to handle changes in the currentColor state
  useEffect(() => {
    if (fabricCanvas && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = currentColor; // Update brush color when currentColor changes
    }
  }, [currentColor, fabricCanvas]); // Re-run this effect when currentColor or fabricCanvas changes
  // ฟังก์ชันสำหรับสลับโหมดการวาด

  const toggleDrawingMode = (button) => {
    // setIsActive({ pen:  });
    // setShowLineWidth(!showLineWidth); // สลับการแสดง/ซ่อนของ input

    if (fabricCanvas) {
      setIsDrawingMode((prev) => {
        const newMode = !prev;
        console.log('Drawing Mode: ', newMode);
        return newMode;
      });

      // สลับสถานะการวาด
      fabricCanvas.isDrawingMode = !fabricCanvas.isDrawingMode;


      if (fabricCanvas.isDrawingMode) {

        if (!fabricCanvas.freeDrawingBrush) {
          fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
        }

        fabricCanvas.freeDrawingBrush.color = currentColor;
        fabricCanvas.freeDrawingBrush.width = lineWidth;

      }
      // สลับสถานะ isActive (สำหรับ UI)
      setIsActive((prev) => ({
        ...prev,
        [button]: !prev[button],  // สลับสถานะของปุ่มที่ถูกคลิก
      }));

      // ปิดสถานะการวาด
      setIsActive((prev) => ({
        ...prev,
        eraser: false,  // ปิดสถานะปุ่มปากกาเมื่อปิดโหมดการวาด
      }));
      setIsEraserMode(false);
      // fabricCanvas.isEraserMode = false;

    }
  };



  // ฟังก์ชันสลับ Eraser Mode
  const toggleEraserMode = (button) => {
    if (fabricCanvas) {
      // สลับ Eraser Mode
      setIsEraserMode((prev) => {
        const newMode = !prev;
        fabricCanvas.selection = !newMode; // ปิด/เปิดการเลือกวัตถุ
        return newMode;
      });

      // สลับสถานะ isActive (สำหรับ UI)
      setIsActive((prev) => ({
        ...prev,
        [button]: !prev[button],  // สลับสถานะของปุ่มที่ถูกคลิก
      }));

      // ปิดสถานะการวาด
      setIsActive((prev) => ({
        ...prev,
        pen: false,  // ปิดสถานะปุ่มปากกาเมื่อปิดโหมดการวาด
      }));
      setIsDrawingMode(false);
      fabricCanvas.isDrawingMode = false;
    }
  };

  const handleLineWidthChange = (newWidth) => {
    setLineWidth(newWidth); // อัปเดต state lineWidth
    if (fabricCanvas && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.width = newWidth; // อัปเดตขนาดเส้น
    }
  };

  // ฟังก์ชันเลือกวัตถุเมื่อคลิก
  // ฟังก์ชันลบวัตถุที่เลือกใน Eraser Mode
  useEffect(() => {
    if (fabricCanvas) {
      const handleMouseDown = (e) => {
        if (e.target) {
          setSelectedObject(e.target); // ตั้งค่า selectedObject เป็นวัตถุที่ถูกคลิก
        } else {
          setSelectedObject(null); // ถ้าไม่ได้คลิกที่วัตถุใด ให้รีเซ็ต selectedObject
        }

        // ถ้าอยู่ในโหมด Eraser ให้ลบวัตถุที่เลือก
        if (isEraserMode && e.target) {
          // เพิ่มการลบวัตถุลงใน history เพื่อสามารถ undo ได้

          fabricCanvas.remove(e.target); // ลบวัตถุที่เลือก
          fabricCanvas.renderAll(); // อัพเดต canvas
          setSelectedObject(null); // รีเซ็ตการเลือก
        }
      };

      fabricCanvas.on('mouse:down', handleMouseDown);

      return () => {
        fabricCanvas.off('mouse:down', handleMouseDown); // ลบ listener เมื่อ component ถูกลบ
      };
    }
  }, [fabricCanvas, isEraserMode]);

  // ฟังก์ชันสำหรับการ Clear Canvas
  const clearCanvas = () => {
    if (fabricCanvas) {
      // ล้าง canvas
      fabricCanvas.clear();
      fabricCanvas.renderAll();
    }
  };


  const addText = () => {
    if (fabricCanvas && isTextMode) {  // ตรวจสอบว่าอยู่ในโหมดเพิ่มข้อความ
      const newText = new fabric.Textbox('New Text', {
        left: 100,
        top: 100,
        fontSize: fontSize,
        fill: currentColor,
        selectable: true,
        fontWeight: isBold ? 'bold' : 'normal',
        fontStyle: isItalic ? 'italic' : 'normal',
        underline: isUnderline,
        textAlign: textAlign,
      });
      fabric.Object.prototype.objectCaching = false; // ปิด caching เพื่อป้องกันการเบลอ

      fabricCanvas.add(newText);
      newText.set({ lockMovementX: false, lockMovementY: false });
      fabricCanvas.renderAll();
    } else {
      // ถ้าไม่ได้อยู่ในโหมดเพิ่มข้อความ (Text Mode) ก็ไม่ให้เพิ่มข้อความ
      console.log("Cannot add text in current mode");
    }
  };

  const changeTextColor = (color) => {
    if (fabricCanvas) {
      const activeObject = fabricCanvas.getActiveObject();
      if (activeObject && activeObject.type === 'textbox') {
        activeObject.set({ fill: color });
        fabricCanvas.renderAll();
      }
    }
  };

  const changeFontSize = (size) => {
    if (fabricCanvas) {
      const activeObject = fabricCanvas.getActiveObject();
      if (activeObject && activeObject.type === 'textbox') {
        activeObject.set({ fontSize: size });
        fabricCanvas.renderAll();
      }
    }
  };

  const toggleBold = () => {
    if (fabricCanvas) {
      const activeObject = fabricCanvas.getActiveObject();
      if (activeObject && activeObject.type === 'textbox') {
        const currentWeight = activeObject.fontWeight;
        activeObject.set({ fontWeight: currentWeight === 'bold' ? 'normal' : 'bold' });
        setIsBold(!isBold);
        fabricCanvas.renderAll();
      }
    }
  };

  const toggleItalic = () => {
    if (fabricCanvas) {
      const activeObject = fabricCanvas.getActiveObject();
      if (activeObject && activeObject.type === 'textbox') {
        const currentStyle = activeObject.fontStyle;
        activeObject.set({ fontStyle: currentStyle === 'italic' ? 'normal' : 'italic' });
        setIsItalic(!isItalic);
        fabricCanvas.renderAll();
      }
    }
  };

  const toggleUnderline = () => {
    if (fabricCanvas) {
      const activeObject = fabricCanvas.getActiveObject();
      if (activeObject && activeObject.type === 'textbox') {
        const currentUnderline = activeObject.underline;
        activeObject.set({ underline: !currentUnderline });
        setIsUnderline(!isUnderline);
        fabricCanvas.renderAll();
      }
    }
  };

  useEffect(() => {
    if (fabricCanvas) {
      fabricCanvas.on('selection:created', updateTextStyles);
      fabricCanvas.on('selection:updated', updateTextStyles);
      fabricCanvas.on('selection:cleared', clearTextStyles);
      fabricCanvas.on('selection:cleared', () => setFontSize(14)); // เคลียร์เมื่อไม่ได้เลือก
    }
  
    return () => {
      if (fabricCanvas) {
        fabricCanvas.off('selection:created', updateTextStyles);
        fabricCanvas.off('selection:updated', updateTextStyles);
        fabricCanvas.off('selection:cleared', clearTextStyles);
        fabricCanvas.off('selection:cleared', () => setFontSize(14));
      }
    };
  }, [fabricCanvas]);
  
  const updateTextStyles = () => {
    const activeObject = fabricCanvas?.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
      console.log("Selected Object:", activeObject);
      console.log("Font Size:", activeObject.fontSize);
      console.log("Text Color:", activeObject.fill); // ✅ ตรวจสอบค่า fill
      
      setFontSize(activeObject.fontSize || 14);
      setCurrentColor(activeObject.fill || "#000000"); // ✅ อัปเดตสีปัจจุบัน
      setIsBold(activeObject.fontWeight === 'bold');
      setIsItalic(activeObject.fontStyle === 'italic');
      setIsUnderline(activeObject.underline);
    }
  };
  
  
  
  
  const clearTextStyles = () => {
    setIsBold(false);
    setIsItalic(false);
    setIsUnderline(false);
  };
  

  const changeTextAlign = (alignment) => {
    if (fabricCanvas) {
      const activeObject = fabricCanvas.getActiveObject();
      if (activeObject && activeObject.type === 'textbox') {
        // เปลี่ยนการจัดตำแหน่งข้อความ
        activeObject.set({ textAlign: alignment });
        fabricCanvas.renderAll(); // อัพเดทการแสดงผลของ canvas
        setTextAlign(alignment); // อัพเดทสถานะของ textAlign
        setActiveButton(alignment); // อัพเดทสถานะของปุ่มที่กด
        setShowOptions(false);
        // setIsClicked(false);
      }
    }
  };

  // เลือกไอคอนตาม activeButton
  const getIcon = () => {
    switch (activeButton) {
      case 'center':
        return <GrTextAlignCenter size="15" />;
      case 'right':
        return <GrTextAlignRight size="15" />;
      default:
        return <GrTextAlignLeft size="15" />;
    }
  };


  const saveDrawing = async () => {
    if (
      !drawingCanvasRef.current &&
      !rendererRef.current &&
      !sceneRef.current &&
      !canvasRef.current &&
      !cameraRef.current
    ) {
      console.error("No Canvas or Three.js scene/camera is initialized");
      alert("Unable to save drawing. Please try again later.");
      return;
    }

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;

    if (renderer && scene && camera) {
      renderer.setClearColor(0xffffff, 1);
      renderer.render(scene, camera);
    }

    const rendererCanvas = renderer?.domElement || document.createElement("canvas");
    const userCanvas = drawingCanvasRef.current || document.createElement("canvas");
    const textCanvas = canvasRef.current || document.createElement("canvas");

    const width = Math.max(rendererCanvas.width, userCanvas.width, textCanvas.width);
    const height = Math.max(rendererCanvas.height, userCanvas.height, textCanvas.height);

    const combinedCanvas = document.createElement("canvas");
    combinedCanvas.width = 790; // กำหนดความกว้างตามที่ต้องการ
    combinedCanvas.height = 450; // กำหนดความสูงตามที่ต้องการ


    const context = combinedCanvas.getContext("2d");

    if (rendererCanvas.width > 0 && rendererCanvas.height > 0) {
      context.drawImage(rendererCanvas, 0, 0, 790, 450); // ปรับภาพให้ขนาด 790 x 450
    }
    if (userCanvas.width > 0 && userCanvas.height > 0) {
      context.drawImage(userCanvas, 0, 0, 790, 450);
    }
    if (textCanvas.width > 0 && textCanvas.height > 0) {
      context.drawImage(textCanvas, 0, 0, 790, 450);
    }


    const dataURL = combinedCanvas.toDataURL("image/png", 1);

    const canvasData = {
      img: dataURL,
      userLectureID: user?._id,
    };

    try {
      const response = await axios.post(`${baseUrl}/lecture`, canvasData);
      console.log("Image and notes saved successfully:", response.data);
      toast.success("บันทึกรูปภาพเสร็จสิ้น!", { autoClose: 1500 });
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error("ไม่สามารถบันทึกรูปภาพได้.", { autoClose: 1500 });
    }
  };
  

//  const saveDrawing = async () => { 
//   if (
//     !drawingCanvasRef.current &&
//     !rendererRef.current &&
//     !sceneRef.current &&
//     !canvasRef.current &&
//     !cameraRef.current
//   ) {
//     console.error("No Canvas or Three.js scene/camera is initialized");
//     toast.error("ไม่สามารถบันทึกรูปภาพได้.", { autoClose: 2000 });
//     return;
//   }

//   const renderer = rendererRef.current;
//   const scene = sceneRef.current;
//   const camera = cameraRef.current;

//   if (renderer && scene && camera) {
//     renderer.setClearColor(0xffffff, 1);
//     renderer.render(scene, camera);
//   }

//   // สร้าง canvas ใหม่สำหรับการจับภาพจาก renderer
//   const rendererCanvas = document.createElement("canvas");
//   const rendererContext = rendererCanvas.getContext("2d");
//   rendererCanvas.width = renderer.domElement.width;
//   rendererCanvas.height = renderer.domElement.height;

//   // ดึงข้อมูลจาก renderer DOM element ไปวาดลงใน canvas ที่สร้างใหม่
//   rendererContext.drawImage(renderer.domElement, 0, 0);

//   // แคปเจอร์ข้อมูลจาก userCanvas และ textCanvas
//   const userCanvas = drawingCanvasRef.current || document.createElement("canvas");
//   const textCanvas = canvasRef.current || document.createElement("canvas");

//   // สร้าง canvas ใหม่เพื่อรวมภาพทั้งหมด
//   const combinedCanvas = document.createElement("canvas");
//   combinedCanvas.width = rendererCanvas.width;  // ใช้ขนาดของ rendererCanvas
//   combinedCanvas.height = rendererCanvas.height;

//   const context = combinedCanvas.getContext("2d");

//   // วาดแต่ละ canvas ลงใน combinedCanvas
//   context.drawImage(rendererCanvas, 0, 0);
//   context.drawImage(userCanvas, 0, 0);
//   context.drawImage(textCanvas, 0, 0);

//   // แปลง combinedCanvas เป็น dataURL
//   const dataURL = combinedCanvas.toDataURL("image/png", 1);

//   const canvasData = {
//     img: dataURL,
//     userLectureID: user?._id,
//   };

//   try {
//     const response = await axios.post(`${baseUrl}/lecture`, canvasData);
//     console.log("Image and notes saved successfully:", response.data);
//     toast.success("บันทึกรูปภาพเสร็จสิ้น!", { autoClose: 1500 });
//   } catch (error) {
//     console.error("Error saving image:", error);
//     toast.error("ไม่สามารถบันทึกรูปภาพได้.", { autoClose: 1500 });
//   }
// };

  
  const handleToggle = () => {
    setIsChecked(!isChecked);
    if (isChecked) {
      switchToModelView(); // ไปยังโหมดดูโมเดล
    } else {
      switchToDrawingMode(); // ไปยังโหมดวาดเขียน
    }
  };

    // ฟังก์ชันสำหรับเปิด/ปิดแสดง input ขนาดเส้น
    const toggleLineWidth = () => {
      setShowLineWidth(!showLineWidth);
    };
  
  ///////////////////////////////////////////////////////////////////////////////
  return (
    <div className="container" style={{position: 'relative'  }}>
{/* */}



    {/* zIndex: 10, marginTop: '0', paddingTop: '0px' ,width:'100%' */}
    {/* <div className="model-container" style={{ }}>
      <div className="switch-mode" style={{marginTop:'20px'}}>
      {/* display:'inline-flex' */}
  

        {/* <div className="draw" style={{display: 'inline-flex', gap:3,marginTop:'30px', marginLeft:'',margin: 'auto',
      height: '', width: '', zIndex: 5, background: '#fff',padding:'10px',justifyContent:'space-between',marginBottom:'10px',
    height:'85px',alignContent:'center',alignItems:'center',borderRadius:'15px',boxShadow: 'rgba(149, 149, 149, 0.67) 0px 1px 2px 0px, rgba(151, 151, 151, 0.15) 0px 1px 3px 1px'}}> */} 


   <ToastContainer  />  
    {/* zIndex: 10, marginTop: '0', paddingTop: '0px' ,width:'100%' */}
      <div className="model-container" style={{ }}>
      <div className="switch-mode" style={{ display: 'flex', marginTop: '20px', maxWidth: '100%', marginBottom: '20px',position:'relative'}}>

        <div className="draw" style={{position:'relative',display: 'flex',gap:2, marginLeft:'',margin: 'auto',maxWidth:'95%', flexWrap: 'wrap',justifyContent: 'center',
      zIndex: 6, background: '#fff',padding:'10px 15px',
    maxHeight:'100vh',alignContent:'center',alignItems:'center',borderRadius:'15px',boxShadow: 'rgba(149, 149, 149, 0.67) 0px 1px 2px 0px, rgba(151, 151, 151, 0.15) 0px 1px 3px 1px'}}>


<div className="Mode" style={{display: 'inline-flex'}}>
  <input
    type="checkbox"
        id="animationMode"
        checked={isChecked} // ผูกกับ state
        onChange={handleToggle} // อัปเดตค่าเมื่อกด
      />
      <label htmlFor="animationMode" className="label-Mode">
  {/* <FaEye size={20} className="animation-mode" /> */}
  <FaEye  size={20} className="animation-mode" />
  <MdDraw size={20} className="draw-mode" />
</label>
</div>
<div className="" style={{border:'1px solid #ddd',height:'30px'}}></div>
<button className='bt-play' title='เล่นโมเดล' style={{ minWidth: '40px',
                minHeight: '40px', zIndex: 5, justifyItems: 'center',backgroundColor: '#fff', color: '#000',}} onClick={toggleAnimation}>
            {animationStopped ? <FaPlay size={20} /> : <TbPlayerPauseFilled size={20} />}
          </button>
          {/* backgroundColor: animationStopped ? "#fff" : "rgb(100, 0, 193)"  */}
          {/*  */}
      {/* ปุ่มเลือกปากกา */}
      <button 
        className='bt-drawing'
        title="คลิกเพื่อวาด"
        onClick={() => toggleDrawingMode('pen')}

        style={{
          zIndex: 5,
          color: isActive.pen ? 'rgb(0, 0, 0) ': '#000',
          cursor: 'pointer',
          minWidth: '40px',
          minHeight: '40px',
          backgroundColor: isActive.pen ? 'rgb(241, 241, 241)' : '#fff',
          border: isActive.pen ? '1px solid #ddd' : 'none',
          borderRadius: isActive.pen ? '10px' : 'none',
          justifyItems: 'center'
        }}
      >
        <FaPen size="16" />
      </button>
      <button className='bt-border' onClick={toggleLineWidth} style={{minWidth: '40px',
          minHeight: '40px',justifyItems: 'center'}}>
        <RxBorderWidth size="18" color='#000'/>
      </button>
      <div style={{ 
  position: 'relative', 
  display: 'inline-block', 
  zIndex: 10, 
  top: '-30px',  
  left: '0px'
}}>
      {/* แสดง Input ขนาดเส้นเมื่อ showLineWidth เป็น true */}
      {showLineWidth && (
        
        <div
        
          ref={lineWidthRef}  // ใช้ ref สำหรับตรวจจับการคลิกภายนอก
          style={{  
            position: 'absolute',  
            width: '120px',
            height: '30px',
            background:'#fff',
            boxShadow: 'rgba(9, 30, 66, 0.25) 0px 1px 1px, rgba(9, 30, 66, 0.13) 0px 0px 1px 1px',
            display: 'flex',
            justifyContent: 'center',  // จัดกลางแนวนอน
            alignItems: 'center',      // จัดกลางแนวตั้ง
            top: '45px',
            left: '-30px',
          }}
        >
          <input
            title="ขนาดเส้นวาด"
            type="range"
            min="1"
            max="10"
            value={lineWidth}
            onChange={(e) => handleLineWidthChange(parseInt(e.target.value))}
            style={{
              width: '100px',
              cursor: 'pointer',
              background:'#fff',
            }}
          />
        </div>
      )}
      </div>
            <button
              className='bt-addText'
              onClick={addText}
              title="เพิ่มข้อความ"
              style={{
                justifyItems: 'center',
                zIndex: 5,
                marginLeft: '0rem',
                backgroundColor: '#fff',
                color: '#000',
                minWidth: '40px',
                minHeight: '40px',
                // borderRadius: '50px',
                cursor: 'pointer',
                // boxShadow: '1px 1px 1px rgba(0, 0, 0, 0.5)',
              }}
              disabled={!switchToDrawingMode} // ปิดปุ่มจนกว่าอยู่ในโหมดการวาด
            >
              <RxText size="18" />
            </button>

<InputNumber
  min={1}
  max={120}
  // ❌ defaultValue ใช้เพียงค่าเริ่มต้น แต่ไม่อัปเดตตาม state
  defaultValue={18} 
  // ✅ ต้องใช้ value แทน เพื่อให้ React อัปเดตค่าตาม `setFontSize`
  value={fontSize} 
  onChange={(value) => {
    setFontSize(value);
    changeFontSize(value);
  }}
  style={{
    fontSize: '18px',
  }}
/>

            <div 
  style={{
    width: '28px',
    height: '28px',
    borderRadius: '50px',
    backgroundColor: currentColor,
    cursor: 'pointer',
    marginLeft:'15px',
    border: '1px solid #ccc', // เพิ่มเส้นขอบให้ดูเหมือนปุ่ม
  }}
  onClick={() => document.getElementById('color-picker').click()} // คลิกแล้วเปิด input สี
>
  <input
    id="color-picker"
    type="color"
    value={currentColor}
    onChange={(e) => {
      setCurrentColor(e.target.value);
      setTextColor(e.target.value);
      changeTextColor(e.target.value);
    }}
    style={{

      visibility: 'hidden', // ซ่อน input จริง
      position: 'absolute',
    }}
  />
</div>


            <button
              className='bt-bold'
              onClick={toggleBold}
              title="ตัวหนา"
              style={{
                justifyItems: 'center',
                backgroundColor: isBold ? 'rgb(241, 241, 241)' : '#fff',

              //   backgroundImage: isBold 
              //   ? "linear-gradient(180deg, rgba(175, 90, 255, 0.44), rgb(152, 33, 243))" 
              //   : "none", // ใช้ none แทน เพื่อรีเซ็ต
              // backgroundColor: isBold ? "transparent" : "#fff" ,
                // backgroundColor: isBold ? 'rgb(102, 3, 196)' : '#fff',
                zIndex: 5,
                color: isBold ? '#000': '#000',
                cursor: 'pointer',
                minWidth: '40px',
                minHeight: '40px',
                borderRadius: isBold ? '10px' : 'none',
                // borderRadius: '50px',
                // boxShadow: '1px 1px 1px rgba(0, 0, 0, 0.5)',
                border: isBold ? '1px solid #ddd' : 'none',
              }}>
              {/* <FaBold size="1.3vw" />
               */}
               <VscBold   size="20" />
            </button>
            <button
              className='bt-italic'
              onClick={toggleItalic}
              title="ตัวเอียง"
              style={{
                justifyItems: 'center',
                backgroundColor: isItalic ? 'rgb(241, 241, 241)' : '#fff',
              //   backgroundImage: isItalic
              //   ? "linear-gradient(180deg, rgba(175, 90, 255, 0.44), rgb(152, 33, 243))" 
              //   : "none", // ใช้ none แทน เพื่อรีเซ็ต
              // backgroundColor: isItalic ? "transparent" : "#fff" ,
              borderRadius: isItalic ? '10px' : 'none',
                // backgroundColor: isItalic ? 'rgb(102, 3, 196)' : '#fff',
                zIndex: 5,
                color: isItalic ? '#000 ': '#000',
                // margin: '5px',
                cursor: 'pointer',
                minWidth: '40px',
                minHeight: '40px',
                // borderRadius: '50px',
                // boxShadow: '1px 1px 1px rgba(0, 0, 0, 0.5)',
                justifyItems: 'center',
                border: isItalic ? '1px solid #ddd' : 'none',
              }}>
              <FiItalic size="16" />
            </button>
            <button
              className='bt-underline'
              onClick={toggleUnderline}
              title="ขีดเส้นใต้"
              style={{
                backgroundColor: isUnderline ? 'rgb(241, 241, 241)' : '#fff',
                // backgroundImage: isUnderline
              //   ? "linear-gradient(180deg, rgba(175, 90, 255, 0.44), rgb(152, 33, 243))" 
              //   : "none", // ใช้ none แทน เพื่อรีเซ็ต
              // backgroundColor: isUnderline ? "transparent" : "#fff" ,
              borderRadius: isUnderline ? '10px' : 'none',
                // backgroundColor: isUnderline ? 'linear-gradient(180deg,rgba(175, 90, 255, 0.44),rgb(152, 33, 243))' : '#fff',
                zIndex: 5,
                color: isUnderline  ? '#000 ': '#000',
                // margin: '5px',
                cursor: 'pointer',
                minWidth: '40px',
                minHeight: '40px',
                // borderRadius: '50px',
                // boxShadow: '1px 1px 1px rgba(0, 0, 0, 0.5)',
                justifyItems: 'center',
                border: isUnderline ? '1px solid #ddd' : 'none',
              }}>
              <BsTypeUnderline size="18" />
            </button>


            <button
        className='text-align'
        title="การจัดข้อความ"
        onClick={() => {
          const nextAlign = activeButton === 'left' ? 'center' : activeButton === 'center' ? 'right' : 'left';
          changeTextAlign(nextAlign); // เปลี่ยนการจัดตำแหน่งเมื่อคลิก
        }}
        style={{
          zIndex: 5,
          color: '#000',
          justifyItems: 'center',
          cursor: 'pointer',
          minWidth: '40px',
          minHeight: '40px',
          // borderRadius: '50px',
          // boxShadow: '1px 1px 1px rgba(0, 0, 0, 0.5)',
          // border: '1px solid #ddd',
          backgroundColor: '#fff',
        }}
      >
        {getIcon()} {/* แสดงไอคอนที่เลือก */}
      </button>
            
            <button
              className='bt-eraser'
              title="คลิกเพื่อเลือกลบวัตถุ"
              onClick={() => {
                toggleEraserMode('eraser');
                // deleteSelectedObject(); // ลบวัตถุที่เลือก
              }}
              style={{
                backgroundColor: isActive.eraser ? 'rgb(241, 241, 241)' : '#fff',
              //   backgroundImage: isActive.eraser
              //   ? "linear-gradient(180deg, rgba(175, 90, 255, 0.44), rgb(152, 33, 243))" 
              //   : "none", // ใช้ none แทน เพื่อรีเซ็ต
              // backgroundColor: isActive.eraser ? "transparent" : "#fff" ,
              borderRadius: isActive.eraser ? '10px' : 'none',
                // backgroundColor: isActive.eraser ? 'rgb(102, 3, 196)' : '#fff',
                zIndex: 5,
                color: isActive.eraser ? '#000 ': '#000',
                // margin: '5px',
                minWidth: '40px',
                minHeight: '40px',
                // width: '40px',
                // height: '40px',
                // borderRadius: '50px',
                cursor: 'pointer',
                // boxShadow: '1px 1px 1px rgba(0, 0, 0, 0.5)',
                justifyItems: 'center',
                border: isActive.eraser ? '1px solid #ddd' : 'none',
              }}
            >
              <BsEraser  size="18" />
            </button>


            <button
              className='bt-clear'
              title="ล้าง"
              onClick={clearCanvas}
              style={{
                zIndex: 5,
                // backgroundColor: '#f1f1f1',
                // color: 'rgb(102, 3, 196)',
                color: '#000',
                // margin: '5px',
                minWidth: '40px',
                minHeight: '40px',
                // borderRadius: '50px',
                cursor: 'pointer',
                // boxShadow: '1px 1px 1px rgba(0, 0, 0, 0.5)',
                justifyItems: 'center'
              }}
            >
              <AiOutlineDelete size="18" />
            </button>

            <button
              className='bt-saveImag'
              title="บันทึกภาพ"
              onClick={saveDrawing}
              style={{
                // backgroundColor: '#f1f1f1',
                color: '#000',
                zIndex: 5,
                // margin: '5px',
                minWidth: '40px',
                minHeight: '40px',
                // borderRadius: '50px',
                cursor: 'pointer',
                // boxShadow: '1px 1px 1px rgba(0, 0, 0, 0.5)',
                justifyItems: 'center'
              }}
            >
              <IoIosSave size="20" />
            </button>
            <button id="undoButton" title="เลิกทำ"
              style={{
                backgroundColor: '#fff',
                // margin: '5px',
                zIndex: 5,
                cursor: 'pointer',
                minWidth: '40px',
                minHeight: '40px',
                // borderRadius: '50px',
                justifyItems: 'center',
                // boxShadow: '1px 1px 1px rgba(0, 0, 0, 0.5)',

              }}><GrUndo size="17" />
            </button>
            <button id="redoButton" title="ทำซ้ำ"
              style={{
                backgroundColor: '#fff',
                // margin: '5px',
                zIndex: 5,
                cursor: 'pointer',
                maxWidth: '40px',
                maxHeight: '40px',
                minWidth: '40px',
                minHeight: '40px',
                // borderRadius: '50px',
                justifyItems: 'center',
                // boxShadow: '1px 1px 1px rgba(0, 0, 0, 0.5)',
              }}><GrRedo size="17" />
            </button>
          {/* </div> */}
          {/* <div className="line-two" style={{ float: 'right', margin: '', width: '45%', textAlign: 'center', justifyContent: 'space-between' }}>
           
          


          </div> */}


          {/* /////////////////////////////////////////////////////////////// */}
          </div>

        </div>


        {/* <div className="line-size" style={{borderRadius:'10px',zIndex: 10,position:'absolute', height:'450px',boxShadow: '0 0 10px 1px rgba(0, 0, 0, 0.1)',background:'#fff',width:'200px'}}> */}
        
          
       
         

          {/* </div>  */}

      
        <div className="bt-mode" style={{
        }}>
          
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
                    กำลังโหลด...
                    
          </div>
        ) : (

          
  
          <div className='containerRef' ref={containerRef} style={{ zIndex: 5,width:'100%'}}>  </div>
        )}
          {showCanvas &&
            <canvas className='canvas-drawing' ref={canvasRef} style={{ zIndex: 5,width:'100%' }} />
          }

        </div>

      </div>
    </div>
  );
};

export default ViewModel;