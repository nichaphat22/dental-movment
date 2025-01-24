import NavBarLeft from "../components/navbar/NavBarLeft";
import Frame from "../components/Frame";
import LectureHistory from "../components/lesson/RPDSampleCase/LectureHistory"
import ChatBox from "../components/Noti";
// import '../tailwind.css'
const LectureHistoryImg = () => {
    return ( 
        <div className="flex justify-center items-center min-h-screen mt-20" >
           <Frame >
           <LectureHistory/>
           </Frame>
           <ChatBox/>
        </div>

     );
}
 
export default LectureHistoryImg;