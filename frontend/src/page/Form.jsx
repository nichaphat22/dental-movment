import NavBarLeft from "../components/navbar/NavBarLeft";
import Frame from "../components/Frame";
// import Formm from "../components/Formm"

const Form =() => {
  return(
    <div className="mb-2" gap={2} style={{display: "flex", marginTop: "100px"}} >
            <NavBarLeft />
           <Frame >
           <Formm/>
           </Frame>
      </div>

);
}

export default Form;