// src/pages/NurseryForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, auth } from '../firebase/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

const defaultImage = '/images/nurs_empty.png';
const API_BASE = 'https://nurseries.qvtest.com';

const NurseryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(defaultImage);
  const [albumFiles, setAlbumFiles] = useState([]);
  const [albumPreviews, setAlbumPreviews] = useState([]);
  const [existingNurseryNames, setExistingNurseryNames] = useState(new Set());
  const [nameError, setNameError] = useState('');
  const [originalName, setOriginalName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
    album: [],
    categories: [],
    region: '',
    city: '',
    district: '',
    services: [],
    featured: false,
    published: true,
    phones: [''],
    socialMedia: {
      instagram: '',
      twitter: '',
      facebook: '',
      snapchat: '',
      tiktok: ''
    },
    workingHours: {
      weekdays: { open: '09:00', close: '21:00' },
      friday: { open: '16:00', close: '22:00' }
    }
  });

  // Delete image via backend API
  const deleteImageFromStorage = async (imageUrl) => {
    try {
      if (!imageUrl || !imageUrl.includes('firebasestorage.googleapis.com')) {
        return;
      }

      const response = await fetch(`${API_BASE}/api/delete-image`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: imageUrl }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.warn('Failed to delete image:', error.error || 'Unknown error');
      }
    } catch (err) {
      console.warn('Could not delete image:', err);
    }
  };

  // Upload image via backend
  const uploadToBackend = async (file, folder, nurseryId = null) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    if (nurseryId) {
      formData.append('nurseryId', nurseryId);
    }

    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.error || 'فشل رفع الصورة');
    }
    const data = await res.json();
    return data.url;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Load locations
        const locDoc = await getDoc(doc(db, 'locations', 'SA'));
        if (locDoc.exists()) {
          setLocations(locDoc.data().data || []);
        }
  
        // 2. Load existing nursery names for uniqueness check
        const nurseriesSnapshot = await getDocs(collection(db, 'nurseries'));
        const namesSet = new Set();
        nurseriesSnapshot.docs.forEach((doc) => {
          const name = doc.data().name;
          if (name) {
            namesSet.add(name.trim().toLowerCase());
          }
        });
        setExistingNurseryNames(namesSet);
  
        // 3. If editing, load current nursery data
        if (id) {
          const nurseryDoc = await getDoc(doc(db, 'nurseries', id));
          if (nurseryDoc.exists()) {
            const data = nurseryDoc.data();
            
            setOriginalName(data.name || '');
            
            setFormData({
              name: data.name || '',
              description: data.description || '',
              image: data.image || null,
              album: data.album || [],
              categories: data.categories || [],
              region: data.region || '',
              city: data.city || '',
              district: data.district || '',
              services: data.services || [],
              featured: data.featured || false,
              published: data.published !== undefined ? data.published : true,
              phones: data.phones && data.phones.length > 0 ? data.phones : [''],
              socialMedia: data.socialMedia || {
                instagram: '',
                twitter: '',
                facebook: '',
                snapchat: '',
                tiktok: ''
              },
              workingHours: data.workingHours || {
                weekdays: { open: '09:00', close: '21:00' },
                friday: { open: '16:00', close: '22:00' }
              }
            });
            setImagePreview(data.image || defaultImage);
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
        alert('حدث خطأ أثناء تحميل البيانات: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);

  const validateName = (name) => {
    if (!name.trim()) {
      setNameError('اسم المشتل مطلوب');
      return false;
    }
  
    const normalized = name.trim().toLowerCase();
    let isDuplicate = existingNurseryNames.has(normalized);
    
    if (id && originalName.trim().toLowerCase() === normalized) {
      isDuplicate = false;
    }
  
    if (isDuplicate) {
      setNameError('اسم المشتل مستخدم بالفعل. يرجى اختيار اسم فريد.');
      return false;
    }
  
    setNameError('');
    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'name') {
      validateName(value);
    }
  };

  const handleWorkingHoursChange = (period, field, value) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [period]: {
          ...prev.workingHours[period],
          [field]: value
        }
      }
    }));
  };

  const handleSocialMediaChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleCategoryChange = (category) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleServiceChange = (service) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service]
    }));
  };

  const handlePhoneChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 15);
    const newPhones = [...formData.phones];
    newPhones[index] = cleaned;
    setFormData((prev) => ({ ...prev, phones: newPhones }));
  };

  const addPhoneField = () => {
    setFormData((prev) => ({ ...prev, phones: [...prev.phones, ''] }));
  };

  const removePhoneField = (index) => {
    if (formData.phones.length <= 1) return;
    const newPhones = formData.phones.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, phones: newPhones }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAlbumChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setAlbumFiles(prev => [...prev, ...files]);
      setAlbumPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const deleteAlbumImage = async (index) => {
    const imageUrl = formData.album[index];
    await deleteImageFromStorage(imageUrl);
    const newAlbum = formData.album.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, album: newAlbum }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateName(formData.name)) {
      alert('يرجى تصحيح اسم المشتل. ' + nameError);
      return;
    }

    if (!formData.name.trim()) {
      alert('اسم المشتل مطلوب');
      return;
    }
    
    if (!formData.region || !formData.city) {
      alert('المنطقة، المدينة مطلوبتان');
      return;
    }

    const mainCategories = ['مشاتل', 'مشاتل مختلطة', 'أدوات الزراعة'];
    const hasMainCategory = formData.categories.some(cat => mainCategories.includes(cat));
    if (!hasMainCategory) {
      alert('يجب اختيار تصنيف رئيسي واحد على الأقل');
      return;
    }

    try {
      setLoading(true);
      
      let imageUrl = formData.image;
      let finalNurseryId = id;

      if (id) {
        if (imageFile) {
          if (formData.image && formData.image.includes('firebasestorage.googleapis.com')) {
            await deleteImageFromStorage(formData.image);
          }
          imageUrl = await uploadToBackend(imageFile, 'nurs_images', id);
        }
      } else {
        const fullLocation = `${formData.region} - ${formData.city} - ${formData.district}`;
        const docRef = await addDoc(collection(db, 'nurseries'), {
          name: formData.name.trim(),
          description: formData.description.trim(),
          image: null,
          album: [],
          categories: formData.categories,
          region: formData.region,
          city: formData.city,
          district: formData.district,
          location: fullLocation,
          services: formData.services,
          featured: formData.featured,
          published: formData.published,
          phones: formData.phones.filter(p => p.trim() !== ''),
          socialMedia: Object.keys(formData.socialMedia).some(key => formData.socialMedia[key].trim() !== '')
            ? Object.fromEntries(Object.entries(formData.socialMedia).filter(([_, v]) => v.trim() !== ''))
            : null,
          workingHours: formData.workingHours,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser.email,
          updatedAt: serverTimestamp(),
          updatedBy: auth.currentUser.email
        });
        finalNurseryId = docRef.id;

        if (imageFile) {
          imageUrl = await uploadToBackend(imageFile, 'nurs_images', docRef.id);
        }
      }

      let albumUrls = formData.album;
      if (albumFiles.length > 0) {
        const uploadPromises = albumFiles.map(file =>
          uploadToBackend(file, 'nurs_album', finalNurseryId)
        );
        const newAlbumUrls = await Promise.all(uploadPromises);
        albumUrls = [...formData.album, ...newAlbumUrls];
      }

      const fullLocation = `${formData.region} - ${formData.city} - ${formData.district}`;
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: imageUrl || null,
        album: albumUrls,
        categories: formData.categories,
        region: formData.region,
        city: formData.city,
        district: formData.district,
        location: fullLocation,
        services: formData.services,
        featured: formData.featured,
        published: formData.published,
        phones: formData.phones.filter(p => p.trim() !== ''),
        socialMedia: Object.keys(formData.socialMedia).some(key => formData.socialMedia[key].trim() !== '')
          ? Object.fromEntries(Object.entries(formData.socialMedia).filter(([_, v]) => v.trim() !== ''))
          : null,
        workingHours: formData.workingHours,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser.email
      };

      await updateDoc(doc(db, 'nurseries', finalNurseryId), data);
      
      alert(id ? 'تم التحديث بنجاح!' : 'تم إضافة المشتل بنجاح!');
      navigate('/nurseries');
    } catch (err) {
      alert('خطأ: ' + err.message);
      console.error(err);
      setLoading(false);
    }
  };

  const cities = locations.find(loc => loc.region === formData.region)?.cities || [];
  const districts = cities.find(c => c.name === formData.city)?.districts || [];

  if (loading) return <p className="text-center py-8">جاري التحميل...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/nurseries')}
          className="mb-6 text-green-700 hover:underline"
        >
          ← العودة إلى قائمة المشاتل
        </button>

        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">
            {id ? 'تعديل مشتل' : 'إضافة مشتل جديد'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span>اسم المشتل
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={() => validateName(formData.name)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  nameError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="مثال: مشتل الرياض الأخضر"
                required
              />
              {nameError && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {nameError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">وصف المشتل</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="وصف مفصل عن المشتل، خدماته، تاريخه، إلخ..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">صورة المشتل الرئيسية</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 transition">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500">
                      <span>رفع صورة</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">أو اسحب الملف هنا</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF حتى 10MB</p>
                </div>
              </div>
              {imagePreview && (
                <div className="mt-4 flex flex-col items-center">
                  <img
                    src={imagePreview}
                    alt="معاينة الصورة"
                    className="w-32 h-32 object-cover rounded-lg border mb-2"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (formData.image && formData.image.includes('firebasestorage.googleapis.com')) {
                        await deleteImageFromStorage(formData.image);
                      }
                      setImageFile(null);
                      setImagePreview(defaultImage);
                      setFormData(prev => ({ ...prev, image: null }));
                    }}
                    className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                  >
                    حذف الصورة
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ألبوم الصور (اختياري)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 transition">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="album-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500">
                      <span>إضافة صور</span>
                      <input
                        id="album-upload"
                        name="album-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        onChange={handleAlbumChange}
                      />
                    </label>
                    <p className="pl-1">أو اسحب الملفات هنا</p>
                  </div>
                  <p className="text-xs text-gray-500">يمكنك رفع عدة صور (حتى 10MB لكل صورة)</p>
                </div>
              </div>

              {(albumPreviews.length > 0 || formData.album.length > 0) && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">الصور المضافة:</h4>
                  <div className="flex flex-wrap gap-2">
                    {albumPreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative">
                        <img
                          src={preview}
                          alt={`معاينة ${index + 1}`}
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newPreviews = albumPreviews.filter((_, i) => i !== index);
                            const newFiles = albumFiles.filter((_, i) => i !== index);
                            setAlbumPreviews(newPreviews);
                            setAlbumFiles(newFiles);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {formData.album.map((url, index) => (
                      <div key={`saved-${index}`} className="relative">
                        <img
                          src={url}
                          alt={`صورة ${index + 1}`}
                          className="w-20 h-20 object-cover rounded border"
                          onError={(e) => {
                            e.target.src = defaultImage;
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => deleteAlbumImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span>المنطقة
                </label>
                <select 
                  name="region" 
                  value={formData.region} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  required
                >
                  <option value="">اختر المنطقة</option>
                  {locations.map((loc) => (
                    <option key={loc.region} value={loc.region}>
                      {loc.region}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span>المدينة
                </label>
                <select 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  disabled={!formData.region} 
                  required
                >
                  <option value="">اختر المدينة</option>
                  {cities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الحي</label>
                <select 
                  name="district" 
                  value={formData.district} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  disabled={!formData.city}
                >
                  <option value="">اختر الحي</option>
                  {districts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Working Hours Section */}
            <div className="bg-green-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-3">ساعات العمل</label>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-2">السبت - الخميس</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">من</label>
                      <input
                        type="time"
                        value={formData.workingHours.weekdays.open}
                        onChange={(e) => handleWorkingHoursChange('weekdays', 'open', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">إلى</label>
                      <input
                        type="time"
                        value={formData.workingHours.weekdays.close}
                        onChange={(e) => handleWorkingHoursChange('weekdays', 'close', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-2">الجمعة</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">من</label>
                      <input
                        type="time"
                        value={formData.workingHours.friday.open}
                        onChange={(e) => handleWorkingHoursChange('friday', 'open', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">إلى</label>
                      <input
                        type="time"
                        value={formData.workingHours.friday.close}
                        onChange={(e) => handleWorkingHoursChange('friday', 'close', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                أرقام التواصل (واتس آب) - أدخل أرقام صحيحة بدون رموز (مثل: 966501234567)
              </label>
              {formData.phones.map((phone, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="966501234567"
                    maxLength={15}
                  />
                  {formData.phones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePhoneField(index)}
                      className="px-3 bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      حذف
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPhoneField}
                className="text-green-600 text-sm hover:underline"
              >
                + إضافة رقم آخر
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">وسائل التواصل الاجتماعي (اختياري)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'instagram', label: 'إنستغرام' },
                  { key: 'twitter', label: 'تويتر' },
                  { key: 'facebook', label: 'فيسبوك' },
                  { key: 'snapchat', label: 'سناب شات' },
                  { key: 'tiktok', label: 'تيك توك' }
                ].map((item) => (
                  <div key={item.key}>
                    <label className="block text-xs text-gray-600 mb-1">{item.label}</label>
                    <input
                      type="url"
                      value={formData.socialMedia[item.key]}
                      onChange={(e) => handleSocialMediaChange(item.key, e.target.value)}
                      className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder={
                        item.key === 'snapchat'
                          ? 'https://www.snapchat.com/add/...'
                          : `https://${item.key}.com/...`
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-800 mb-2">
                  <span className="text-red-500">*</span>التصنيف الرئيسي (اختر واحدًا على الأقل)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['مشاتل', 'مشاتل مختلطة', 'أدوات الزراعة'].map((cat) => (
                    <label key={cat} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(cat)}
                        onChange={() => handleCategoryChange(cat)}
                        className="mr-2 h-4 w-4 text-green-600"
                      />
                      <span className="text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-2">تصنيفات أخرى (اختياري)</h4>
                <div className="flex flex-wrap gap-2">
                  {['نباتات داخلية', 'نباتات خارجية', 'زهور', 'نخيل', 'معدات'].map((cat) => (
                    <label key={cat} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(cat)}
                        onChange={() => handleCategoryChange(cat)}
                        className="mr-2 h-4 w-4 text-green-600"
                      />
                      <span className="text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الخدمات (اختياري)</label>
              <div className="flex flex-wrap gap-2">
                {['delivery', 'consultation', 'maintenance', 'installation'].map((svc) => {
                  const labels = {
                    delivery: 'التوصيل',
                    consultation: 'الاستشارات',
                    maintenance: 'الصيانة',
                    installation: 'التركيب'
                  };
                  return (
                    <label key={svc} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.services.includes(svc)}
                        onChange={() => handleServiceChange(svc)}
                        className="mr-2 h-4 w-4 text-green-600"
                      />
                      <span className="text-sm">{labels[svc]}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-green-600"
                />
                <span className="text-sm">مميز</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-green-600"
                />
                <span className="text-sm">منشور</span>
              </label>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || !!nameError}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري الحفظ...' : id ? 'تحديث' : 'إضافة'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/nurseries')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NurseryForm;