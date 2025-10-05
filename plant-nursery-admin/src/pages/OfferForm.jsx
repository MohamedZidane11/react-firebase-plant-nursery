// src/pages/OfferForm.jsx
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

const defaultImage = '/images/offer_default.png';
const API_BASE = 'https://react-firebase-plant-nursery-production.up.railway.app';

const OfferForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [nurseries, setNurseries] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(defaultImage);
  const [albumFiles, setAlbumFiles] = useState([]);
  const [albumPreviews, setAlbumPreviews] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [],
    endDate: '',
    discount: null,
    highlighted: false,
    published: true,
    nurseryId: '',
    image: null,
    album: []
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

  const uploadToBackend = async (file, folder, offerId = null) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    if (offerId) {
      formData.append('offerId', offerId);
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
    const fetchNurseries = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'nurseries'));
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name
        })).sort((a, b) => a.name.localeCompare(b.name));
        setNurseries(list);
      } catch (err) {
        console.error('Error fetching nurseries:', err);
      }
    };

    const loadData = async () => {
      await fetchNurseries();
      if (id) {
        try {
          const offerDoc = await getDoc(doc(db, 'offers', id));
          if (offerDoc.exists()) {
            const data = offerDoc.data();
            const imageUrl = data.image || null;
            const albumUrls = data.album || [];
            setFormData({
              title: data.title || '',
              description: data.description || '',
              tags: data.tags || [],
              endDate: data.endDate || '',
              discount: data.discount,
              highlighted: data.highlighted || false,
              published: data.published !== false,
              nurseryId: data.nurseryId || '',
              image: imageUrl,
              album: albumUrls
            });
            setImagePreview(imageUrl || defaultImage);
            setAlbumPreviews([]);
            setAlbumFiles([]);
          }
        } catch (err) {
          console.error('Error loading offer:', err);
        }
      }
      setLoading(false);
    };

    loadData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTagChange = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
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
    if (!formData.title.trim() || !formData.description.trim() || !formData.endDate.trim()) {
      alert('العنوان، الوصف، وتاريخ الانتهاء مطلوبون');
      return;
    }
    try {
      setLoading(true);

      let imageUrl = formData.image;
      let finalOfferId = id;

      if (id) {
        // Editing
        if (imageFile) {
          if (formData.image && formData.image.includes('firebasestorage.googleapis.com')) {
            await deleteImageFromStorage(formData.image);
          }
          imageUrl = await uploadToBackend(imageFile, 'offers_images', id);
        }
      } else {
        // Creating: first create with null image
        const docRef = await addDoc(collection(db, 'offers'), {
          ...formData,
          image: null,
          album: [],
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser.email,
          updatedAt: serverTimestamp(),
          updatedBy: auth.currentUser.email
        });
        finalOfferId = docRef.id;

        if (imageFile) {
          imageUrl = await uploadToBackend(imageFile, 'offers_images', docRef.id);
        }
      }

      // Upload album
      let albumUrls = formData.album;
      if (albumFiles.length > 0) {
        const uploadPromises = albumFiles.map(file =>
          uploadToBackend(file, 'offers_album', finalOfferId)
        );
        const newAlbumUrls = await Promise.all(uploadPromises);
        albumUrls = [...formData.album, ...newAlbumUrls];
      }

      const selectedNursery = nurseries.find(n => n.id === formData.nurseryId);
      const nurseryName = selectedNursery ? selectedNursery.name : '';

      const finalData = {
        ...formData,
        image: imageUrl || null,
        album: albumUrls,
        nurseryId: formData.nurseryId || null,
        nurseryName,
        discount: formData.discount ? Number(formData.discount) : null,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser.email
      };

      if (id) {
        await updateDoc(doc(db, 'offers', id), finalData);
      } else {
        await updateDoc(doc(db, 'offers', finalOfferId), {
          ...finalData,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser.email
        });
      }

      alert(id ? 'تم تحديث العرض!' : 'تم إضافة العرض!');
      navigate('/offers');
    } catch (err) {
      alert('خطأ في الحفظ: ' + err.message);
      console.error(err);
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center py-8">جاري التحميل...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/offers')}
          className="mb-6 text-orange-700 hover:underline"
        >
          ← العودة إلى قائمة العروض
        </button>
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">{id ? 'تعديل عرض' : 'إضافة عرض جديد'}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">صورة العرض الرئيسية</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 transition">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500">
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
                  <p className="text-xs text-gray-500">PNG, JPG حتى 5MB</p>
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
                    🗑️ حذف الصورة
                  </button>
                </div>
              )}
            </div>

            {/* Album Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ألبوم الصور (اختياري)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 transition">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="album-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500">
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
                  <p className="text-xs text-gray-500">يمكنك رفع عدة صور (حتى 5MB لكل صورة)</p>
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
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
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
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rest of the form fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان العرض</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="خصم 30% على النباتات الداخلية"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم المشتل</label>
                <select
                  name="nurseryId"
                  value={formData.nurseryId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">اختر المشتل (اختياري)</option>
                  {nurseries.map((nursery) => (
                    <option key={nursery.id} value={nursery.id}>
                      {nursery.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الانتهاء</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الخصم (%)</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount || ''}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="مثل: 30"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="احصل على خصم مميز..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التصنيفات</label>
              <div className="flex flex-wrap gap-2">
                {['نباتات داخلية', 'توصيل', 'استشارات', 'أدوات زراعة', 'موسمي'].map((tag) => (
                  <label key={tag} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.tags.includes(tag)}
                      onChange={() => handleTagChange(tag)}
                      className="mr-2 h-4 w-4 text-orange-600"
                    />
                    <span className="text-sm">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="highlighted"
                  checked={formData.highlighted}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-orange-600"
                />
                <span className="text-sm">مميز</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-orange-600"
                />
                <span className="text-sm">منشور</span>
              </label>
            </div>
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition"
              >
                {loading ? 'جاري الحفظ...' : id ? 'تحديث' : 'إضافة'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/offers')}
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

export default OfferForm;