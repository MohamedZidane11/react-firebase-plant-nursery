// src/hooks/useSEO.js
// Hook لجلب بيانات SEO من الـ Backend
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export const useSEO = (pageName) => {
  const [seo, setSeo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSEO = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // جلب بيانات SEO لصفحة معينة
        const response = await axios.get(`${API_BASE}/api/seo/${pageName}`);
        setSeo(response.data);
      } catch (err) {
        console.error('Error fetching SEO:', err);
        setError(err.message);
        
        // في حالة الخطأ، استخدم قيم افتراضية
        setSeo({
          title: 'مشاتل السعودية',
          description: 'منصة مشاتل السعودية',
          keywords: 'مشاتل السعودية'
        });
      } finally {
        setLoading(false);
      }
    };

    if (pageName) {
      fetchSEO();
    }
  }, [pageName]);

  return { seo, loading, error };
};

// Hook لجلب جميع بيانات SEO
export const useAllSEO = () => {
  const [allSeo, setAllSeo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllSEO = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_BASE}/api/seo`);
        setAllSeo(response.data);
      } catch (err) {
        console.error('Error fetching all SEO:', err);
        setError(err.message);
        setAllSeo({});
      } finally {
        setLoading(false);
      }
    };

    fetchAllSEO();
  }, []);

  return { allSeo, loading, error };
};

// وظيفة لحفظ بيانات SEO
export const saveSEO = async (seoData) => {
  try {
    const response = await axios.post(`${API_BASE}/api/seo`, seoData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error saving SEO:', error);
    return { success: false, error: error.message };
  }
};

// وظيفة لتحديث SEO لصفحة محددة
export const updatePageSEO = async (pageName, seoData) => {
  try {
    const response = await axios.put(`${API_BASE}/api/seo/${pageName}`, seoData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error updating page SEO:', error);
    return { success: false, error: error.message };
  }
};
