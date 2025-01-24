const Frame = ( {children}) => {
    return ( 
        <div
        className="frame"
        style={{
            display: "table-cell",
            width: "80vw",
            minHeight: "70vw",
            padding: "8px",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            borderTop: "8px solid #9333ea",
            borderRadius: "20px",
            borderLeft: "1px solid #eee",
            borderRight: "1px solid #eee",
            borderBottom: "none",
             boxShadow: '0 0 100px 0px rgba(0, 0, 0, 0.02)',
            overflow: "hidden"
        }}
    >
         {children}
    </div>

     );
}
 
export default Frame;