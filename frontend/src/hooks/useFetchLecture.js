import { useState, useEffect } from 'react';
import axios from 'axios';
import { baseUrl } from '../utils/services'; // Ensure this path is correct

export const useFetchLecture = (lectureId) => {
  const [latestLecture, setLatestLecture] = useState(null);

  useEffect(() => {
    const getLectures = async () => {
      try {
        const response = await axios.get(`${baseUrl}/lectures/${lectureId}`);
        setLatestLecture(response.data);
      } catch (error) {
        console.error('Error fetching lecture:', error);
      }
    };

    if (lectureId) {
      getLectures();
    }
  }, [lectureId]);

  return { latestLecture };
};
