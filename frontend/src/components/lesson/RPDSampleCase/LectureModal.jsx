import React from 'react';
import './Draw.css'
import { RxCross2 } from "react-icons/rx";
import { PiDownloadSimple } from "react-icons/pi";

const LectureModal = ({ lecture, onClose }) => {
  return (
    <div className="lecture-modal">
      <div className="modal-img">
      <a href={lecture.img} download className="download-btn" style={{color:'#000'}}>
      <PiDownloadSimple size={22}/> 
        </a>
        <span className="close" onClick={onClose} style={{color:'#000'}}>
        <RxCross2  size={22}/>
        </span>
        <img src={lecture.img} alt="Lecture full size" className="lecture-fullscreen" style={{}}/>
      </div>
    </div>
  );
};

export default LectureModal;
