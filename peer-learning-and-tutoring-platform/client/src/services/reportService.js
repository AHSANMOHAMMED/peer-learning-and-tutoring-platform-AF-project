import axios from 'axios';

const API_BASE = '/api/moderation/reports';

/**
 * Report/Moderation API Service
 */

export const createReport = async (reportData) => {
  try {
    const response = await axios.post(API_BASE, reportData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getReports = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await axios.get(`${API_BASE}?${params}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getReportById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateReportStatus = async (id, statusData) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}`, statusData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteReport = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getReportStats = async () => {
  try {
    const response = await axios.get(`${API_BASE}/stats`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
