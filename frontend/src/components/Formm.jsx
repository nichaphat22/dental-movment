import React, { useRef } from 'react';
import axios from 'axios';
import { baseUrl } from '../utils/services';

const Form = () => {
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    event.preventDefault();
    // Prepare form data
    const formData = new FormData();
    formData.append('excelFile', fileInputRef.current.files[0]);

    try {
      const response = await axios.post(`${baseUrl}/users/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Success:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div>
      <form onSubmit={handleFileUpload}>
        <input
          type="file"
          name="excelFile"
          ref={fileInputRef}
          accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          style={{ display: 'none' }}
        />
        <button type="button" onClick={handleClick}>
          Select File
        </button>
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default Form;
 