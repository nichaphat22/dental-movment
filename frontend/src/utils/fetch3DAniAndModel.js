import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const fetchRecent = async () => {
  try {
    const q = query(collection(db, "3d_models"), orderBy("createdAt", "desc"), limit(5));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: "3d" }));
  } catch (error) {
    console.error("Error fetching 3D models:", error);
    return [];
  }
};
