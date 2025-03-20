import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import { Stack, Modal } from "react-bootstrap";
import { useFetchLatestMessage } from "../../hooks/useFetchLatestMessage";
import { TfiDownload } from "react-icons/tfi";
import InputEmoji from "react-input-emoji";
import { FaFile } from "react-icons/fa6";
import { MdOutlineAttachFile } from "react-icons/md";
import './Chat.css';
import moment from 'moment/min/moment-with-locales';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { MdCancel } from "react-icons/md";
import { Card, Button, Row, Col, Container, Spinner, Dropdown, ButtonGroup, } from 'react-bootstrap';
import { PiPaperPlaneRightFill } from "react-icons/pi";
import EmojiPicker from "emoji-picker-react";
import { MdEmojiEmotions } from "react-icons/md";
import { BiSolidImageAdd } from "react-icons/bi";

moment.locale('th');
const ChatBox = ({ chat, }) => {
  const pickerRef = useRef(null);
  const { user } = useContext(AuthContext);
  const { currentChat, markMessageAsRead, setCurrentChat, messages, isMessagesLoading, sendTextMessage, setNotificationsAsRead } = useContext(ChatContext);
  const { recipientUser } = useFetchRecipientUser(currentChat, user, chat);
  // const [loading, setLoading] = useState(true); // Loading state
  const [textMessage, setTextMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const scroll = useRef();
  // ดึงข้อความล่าสุด
  const { latestMessage: initialLatestMessage } = useFetchLatestMessage(currentChat, chat, user);
  const [latestMessage, setLatestMessage] = useState(initialLatestMessage);
  const [showPicker, setShowPicker] = useState(false);

  // ฟังก์ชันตรวจจับคลิกนอก Emoji Picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEmojiClick = (emojiObject) => {
    setTextMessage((prev) => prev + emojiObject.emoji);
  };
  // เข้าถึง Shadow DOM

  useEffect(() => {
    setLatestMessage(initialLatestMessage);
  }, [initialLatestMessage]);

  //   console.log("Latest Message:", latestMessage);
  //   console.log(messages)

  useEffect(() => {
    if (chat) {
      setCurrentChat(chat);  // ตั้งค่า currentChat เมื่อเปิดแชท
    }

  }, [chat, setCurrentChat]);

  useEffect(() => {
    if (scroll.current) {
      scroll.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const formatFileName = (fileName) => {
    if (fileName.length > 10) {
      return fileName.substring(0, 10) + '...' + fileName.substring(fileName.length - 4);
    }
    return fileName;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e) => {
    const reader = new FileReader();
    const file = e.target.files[0];
    reader.onload = (ev) => {
      setSelectedFile({
        name: file.name,
        data: ev.target.result,
        type: file.type,
        size: file.size
      });
    };
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    fileInputRef.current.value = "";
  };
  // console.log('currentChat',currentChat)

  // const handleSendMessage = () => {

  //     setNotificationsAsRead();
  //     sendTextMessage(textMessage, user, currentChat?._id, selectedFile, setTextMessage, setSelectedFile);
  //     setTextMessage("")
  // };

  const handleSendMessage = (event) => {
    event.preventDefault(); // ป้องกันการรีเฟรชหน้า
    setNotificationsAsRead();
    sendTextMessage(textMessage, user, currentChat?._id, selectedFile, setTextMessage, setSelectedFile);
    setTimeout(() => {
      setTextMessage("");
    }, 100);
    setSelectedFile(null);
  };


  const handleImageClick = (data) => {
    setPreviewImage(data);
    setShowImageModal(true);
  };

  const handleCloseModal = () => {
    setShowImageModal(false);
    setPreviewImage(null);
  };

// ตรวจสอบว่า recipientUser มีหรือไม่
if (!recipientUser) {
  return <div style={{
    display: 'flex', justifyContent: 'center', color: 'rgb(172, 78, 235)', margin: '0 auto'
  }}>
    กรุณาเลือกผู้ใช้งานที่จะเริ่มแชท
  </div>
}

// ตรวจสอบว่าแชทกำลังโหลด
// if (isMessagesLoading) {
//   return <div className="loading-container" style={{
//     display: 'flex', justifyContent: 'center', color: 'rgb(172, 78, 235)', margin: '0 auto'
//   }}>
//     <Spinner
//       as="span"
//       animation="grow"
//       role="status"
//       aria-hidden="true"
//       style={{ marginRight: '5px', background: 'rgb(168, 69, 243)', width: '25px', height: '25px' }}
//     />
//     กำลังโหลดข้อความ...
//   </div>
// }


  const handleClick = async (id) => {
    if (!latestMessage || !id || latestMessage.isRead || latestMessage.senderId === user._id) {
      // ถ้าข้อความถูกอ่านแล้ว หรือไม่มี latestMessage ก็ไม่ต้องทำอะไร
      console.log("Message is already read or latestMessage is undefined.");
      return;
    }

    try {
      // เรียกใช้งาน markMessageAsRead เพื่ออัปเดตสถานะการอ่าน
      console.log("Marking message as read for sender:", id);
      await markMessageAsRead(id, latestMessage.isRead);

      // อัปเดตการแจ้งเตือนเมื่อข้อความถูกอ่านแล้ว
      setNotificationsAsRead(id);
    } catch (error) {
      console.error("❌ Error marking message as read:", error);
    }
  }

  //     console.log("User data:", user);
  // console.log("Messages:", messages);


  return (
    <Stack gap={30} className="chat-box"
      onClick={() => handleClick(recipientUser._id)} // Click handler for image
    >
      <div className="chat-header">
        <strong style={{ display: 'inline-flex', alignItems: 'center' }}>
          <LazyLoadImage className="chat-header-profile"
            style={{ width: '37px', height: '37px', borderRadius: '50%', marginRight: '10px' }}
            src={recipientUser?.img} ></LazyLoadImage>
          {/* {recipientUser.fname} {recipientUser.lname} */}
          <span style={{ fontWeight: '300', fontSize: '20px' }}>{recipientUser.name}</span>

        </strong>
      </div>


      <Stack gap={3} className="messages">

        {messages && messages.map((message, index) => (
          <Stack key={index} direction="vertical" style={{ maxWidth: '100%' }}>

            <Stack
              className={`message ${message.senderId === user._id ? "self align-self-end flex-grow-0" : "you align-self-start flex-grow-0"}`}
              ref={index === messages.length - 1 ? scroll : null}
            >
              <span>
                {message.text && (
                  <span className="textmessage" style={{}}>
                    {message.text}
                  </span>
                )}
              </span>

              <span>
                {message.file && message.file.type && message.file.data && (
                  <div className={`file-preview ${message.senderId === user._id ? "self-file" : ""}`}>
                    {message.file.type.startsWith('image') ? (
                      <LazyLoadImage
                        src={message.file.data}
                        alt={message.file.name}
                        className="file-image"
                        style={{ maxWidth: '100%', maxHeight: '120px', marginTop: '10px', cursor: 'pointer' }}
                        onClick={() => handleImageClick(message.file.data)} // Click handler for image
                      />
                    ) : (
                      <div className="file-preview2">
                        <Stack direction="horizontal" gap={2} className="file-preview">
                          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-file-text-fill" viewBox="0 0 16 16">
                            <path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2M5 4h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1m-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5M5 8h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1m0 2h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1" />
                          </svg>
                          <div className="file-info">
                            <a href={message.file.data} download={message.file.name} style={{ color: message.senderId === user._id ? '#F0F0F0' : '#000' }}>
                              {formatFileName(message.file.name)}
                            </a>
                            <span className="size" style={{ color: message.senderId === user._id ? '#F0F0F0' : '#666666 ', fontSize: '10px' }}>
                              {formatBytes(message.file.size)}
                            </span>
                          </div>
                        </Stack>
                      </div>
                    )}
                  </div>
                )}
              </span>

              {/* <span className="message-footer" style={{ fontSize: '8px', color: message.senderId === user._id ? '#F0F0F0' : '#666666 ' }}>
                 {moment(latestMessage?.createdAt).locale("th").calendar()}
               </span> */}
            </Stack>
            <Stack direction="horizontal" gap={2} style={{ alignItems: '', justifyContent: message?.senderId === user._id ? 'flex-end' : 'flex-start' }}>
              {/* แสดงสถานะ "อ่านแล้ว" ทางซ้าย */}
              {message?.senderId === user._id && message?.isRead && (
                <span className="messageRead" >
                  อ่านแล้ว
                </span>
              )}
            </Stack>
          </Stack>

        ))}
        {/* แสดงไฟล์ที่เลือก */}
        {selectedFile && (
          <div className="selected-file" style={{ display: 'flex' }}>
            <div className="flie" style={{ backgroundColor: '#ddd', borderRadius: '15px', padding: '10px 10px' }}>
              {selectedFile.type.startsWith('image') ? (
                <img src={selectedFile.data} alt={selectedFile.name} className="file-preview-image" style={{ maxWidth: '200px', maxHeight: '100px' }} />
              ) : (
                <div className="file-preview2">
                  <Stack direction="horizontal" gap={2} className="file-preview">
                    <FaFile size={'28'} style={{ color: '#000' }} />
                    <div className="file-info">
                      <span style={{ color: '#000', fontSize: '14px', fontWeight: 'bold', }}>{formatFileName(selectedFile.name)}</span>
                      <span className="size" style={{ color: '#000', fontSize: '12px', fontWeight: '400px' }}>{formatBytes(selectedFile.size)}</span>
                    </div>
                  </Stack>
                </div>
              )}
            </div>
            <button onClick={clearFile} className="clear-file-button" style={{ color: 'red', fontSize: '18px' }}><MdCancel /></button>
          </div>
        )}
      </Stack>

      <Stack direction="horizontal" className="chat-input flex-grow-0">
        <input
          type="text"
          value={textMessage}
          onChange={(e) => setTextMessage(e.target.value)}
          // placeholder="Type a message..."
          style={{
            boxShadow: 'rgba(39, 40, 44, 0.44) 0px 0px 0.1em, rgba(77, 92, 118, 0.05) 0px 0.1em 0.2em',
            padding: "10px",
            width: "100%",
            borderRadius: "20px",
            border: "none",
            background: "#eef1f8",
            margin:'10px 5px'
          }}
        />
        <button onClick={() => setShowPicker(!showPicker)}><MdEmojiEmotions size={28}  style={{ color: '#8567f6', margin:'10px 5px'}}/></button>
        {showPicker && (
          <div ref={pickerRef} style={{ position: "absolute", bottom: "50px", right: "0" }}>
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
        {/* <InputEmoji
    value={textMessage}
    onChange={(value) => {
      setTextMessage(value + " "); // เพิ่มช่องว่างเพื่อบังคับให้ React รู้ว่าค่าถูกเปลี่ยน
      setTimeout(() => setTextMessage(value), 0); // รีเซ็ตให้เหมือนเดิม
  }}
  
    borderColor="none"
    background="#eef1f8"
/> */}

        <label htmlFor="file-upload" style={{ cursor: "pointer",marginRight:'5px'}}>
          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx,.txt,.csv"
            onChange={handleFileChange}
            id="file-upload"
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          <BiSolidImageAdd  size={30} style={{ color: '#8567f6', margin: '10px 5px' }} />
        </label>
        <button  type="button" className="send-button" onClick={handleSendMessage} style={{ color: '#fff', fontSize: '14px', backgroundColor: '#8567f6', padding: '9px 12px', borderRadius: '7px', boxShadow: 'rgba(17, 17, 26, 0.1) 0px 4px 16px, rgba(17, 17, 26, 0.1) 0px 8px 24px, rgba(17, 17, 26, 0.1) 0px 16px 56px' }}><PiPaperPlaneRightFill size={22} /></button>
      </Stack>



      {/* Modal for Image Preview */}
      <Modal show={showImageModal} onHide={handleCloseModal}>
        {/* closeButton */}
        <Modal.Header  >
          <Modal.Title>รูปภาพ</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <a href={previewImage} download="image-preview.jpg" className="btn " style={{ float: 'right' }}>
            <TfiDownload size={'24'} />
          </a>
          <img src={previewImage} alt="Preview" style={{ width: '100%', height: 'auto' }} />

        </Modal.Body>
        <Modal.Footer>
          <button variant="secondary" onClick={handleCloseModal}>
            ปิด
          </button>
        </Modal.Footer>
      </Modal>
    </Stack>
  );
};

export default ChatBox;
