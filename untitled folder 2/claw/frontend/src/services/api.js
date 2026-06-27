import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export const analyzeFeedback = async (sourceType, content, file) => {
  try {
    let response;
    if (sourceType === 'text') {
      response = await axios.post(`${API_BASE_URL}/analyze-feedback`, {
        sourceType,
        content
      });
    } else if (sourceType === 'csv' && file) {
      const formData = new FormData();
      formData.append('sourceType', 'csv');
      formData.append('file', file);
      response = await axios.post(`${API_BASE_URL}/analyze-feedback`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    return response.data.data;
  } catch (error) {
    console.error('Error analyzing feedback:', error);
    throw error;
  }
};

export const generatePRD = async (groupedFeedback) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate-prd`, {
      groupedFeedback
    });
    return response.data.data.prdContent;
  } catch (error) {
    console.error('Error generating PRD:', error);
    throw error;
  }
};
