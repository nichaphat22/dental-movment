import { useEffect } from "react";

const useBlockNavigation = (isFormModified, message) => {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isFormModified) {
        event.preventDefault();
        event.returnValue = message; // สำหรับแสดงข้อความเตือน
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isFormModified, message]);
};

export default useBlockNavigation;
