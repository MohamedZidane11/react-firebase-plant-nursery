import { useState, useEffect, useMemo } from 'react';

const SurveyManager = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const API_BASE = 'https://nurseries.qvtest.com';

  const [filters, setFilters] = useState({
    name: '',
    phone: '',
    startDate: '',
    endDate: '',
    status: ''
  });

  // Fetch surveys from API
  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/surveys`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSurveys(data);
    } catch (err) {
      console.error('Error fetching surveys:', err);
      alert('فشل تحميل الاستبيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  // Filter surveys based on filters
  const filteredSurveys = useMemo(() => {
    let result = [...surveys];

    // Filter by name or email
    if (filters.name.trim()) {
      const term = filters.name.trim().toLowerCase();
      result = result.filter(s => 
        s.name?.toLowerCase().includes(term) || 
        s.email?.toLowerCase().includes(term)
      );
    }

    // Filter by phone
    if (filters.phone.trim()) {
      const phoneDigits = filters.phone.trim().replace(/\D/g, '');
      result = result.filter(s => {
        const whatsapp = (s.whatsapp || '').replace(/\D/g, '');
        const phone = (s.phone || '').replace(/\D/g, '');
        return whatsapp.includes(phoneDigits) || phone.includes(phoneDigits);
      });
    }

    // Filter by start date
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0);
      result = result.filter(s => {
        if (!s.timestamp) return false;
        const surveyDate = new Date(s.timestamp);
        return surveyDate >= startDate;
      });
    }

    // Filter by end date
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      result = result.filter(s => {
        if (!s.timestamp) return false;
        const surveyDate = new Date(s.timestamp);
        return surveyDate <= endDate;
      });
    }

    // Filter by status
    if (filters.status) {
      result = result.filter(s => {
        const surveyStatus = s.status || 'active';
        return surveyStatus === filters.status;
      });
    }

    // Sort by date (newest first)
    result.sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      return dateB - dateA;
    });

    return result;
  }, [surveys, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      name: '',
      phone: '',
      startDate: '',
      endDate: '',
      status: ''
    });
  };

  const handleShowDetails = (survey) => {
    setSelectedSurvey(survey);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedSurvey(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الاستبيان؟\nلا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }

    try {
      setDeleteLoading(id);
      const res = await fetch(`${API_BASE}/api/surveys/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete');

      alert('✅ تم حذف الاستبيان بنجاح');
      setSurveys(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting survey:', err);
      alert('❌ فشل حذف الاستبيان');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'غير محدد';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'غير محدد';
    }
  };

  const getStatusBadge = (status) => {
    const surveyStatus = status || 'active';
    switch(surveyStatus) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
            <span>✓</span>
            <span>نشط</span>
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full font-semibold">
            <span>✕</span>
            <span>غير نشط</span>
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full font-semibold">
            <span>📝</span>
            <span>مسودة</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold">
            <span>✓</span>
            <span>نشط</span>
          </span>
        );
    }
  };

  const isFiltering = Object.values(filters).some(val => val !== '');

  // ✅ Loading Animation
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#218380] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Helper to safely get values
  const safe = (val) => val || 'غير محدد';

  return (
    <>
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .print-survey-content, .print-survey-content * { visibility: visible; }
            .print-survey-content { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
          }
        `}
      </style>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#218380] mb-2">إدارة الاستبيانات</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="bg-white px-4 py-2 rounded-lg shadow-sm">
                📊 إجمالي الاستبيانات: <strong>{surveys.length}</strong>
              </span>
              <span className="bg-white px-4 py-2 rounded-lg shadow-sm">
                🔍 المعروضة: <strong>{filteredSurveys.length}</strong>
              </span>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span>🔍</span>
                <span>البحث والفلترة</span>
              </h2>
              {isFiltering && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors font-medium"
                >
                  ✕ مسح جميع الفلاتر
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الاسم أو البريد الإلكتروني
                </label>
                <input
                  type="text"
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#218380] focus:border-transparent outline-none transition-all"
                  placeholder="ابحث بالاسم أو البريد..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  رقم الجوال
                </label>
                <input
                  type="text"
                  name="phone"
                  value={filters.phone}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#218380] focus:border-transparent outline-none transition-all"
                  placeholder="ابحث برقم الجوال..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الحالة
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#218380] focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="inactive">غير نشط</option>
                  <option value="draft">مسودة</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  من تاريخ
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#218380] focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  إلى تاريخ
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#218380] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[#49b6ff] to-[#218380] text-white">
                    <th className="px-6 py-4 text-right text-sm font-bold whitespace-nowrap">
                      الاسم
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold whitespace-nowrap">
                      رقم الجوال
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold whitespace-nowrap">
                      تاريخ الإنشاء
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold whitespace-nowrap">
                      الحالة
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold whitespace-nowrap">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSurveys.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-6xl">📋</span>
                          <p className="text-gray-500 text-lg">
                            {isFiltering 
                              ? 'لا توجد نتائج مطابقة للفلاتر المحددة' 
                              : 'لا توجد استبيانات'}
                          </p>
                          {isFiltering && (
                            <button
                              onClick={handleClearFilters}
                              className="text-[#218380] hover:underline text-sm"
                            >
                              مسح الفلاتر
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredSurveys.map((survey) => (
                      <tr key={survey.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">👤</span>
                            <div>
                              <p className="font-semibold text-gray-800">
                                {survey.name || 'غير محدد'}
                              </p>
                              {survey.email && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {survey.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-700">
                            {survey.phone || survey.whatsapp || 'غير محدد'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600 text-sm">
                            {formatDate(survey.timestamp)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {getStatusBadge(survey.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleShowDetails(survey)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors font-medium inline-flex items-center gap-1"
                            >
                              <span>🔍</span>
                              <span>عرض</span>
                            </button>
                            <button
                              onClick={() => handleDelete(survey.id)}
                              disabled={deleteLoading === survey.id}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                            >
                              {deleteLoading === survey.id ? (
                                <>
                                  <span className="animate-spin">⏳</span>
                                  <span>حذف</span>
                                </>
                              ) : (
                                <>
                                  <span>🗑️</span>
                                  <span>حذف</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {filteredSurveys.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-600">
              عرض {filteredSurveys.length} من أصل {surveys.length} استبيان
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedSurvey && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#49b6ff] via-[#218380] to-[#6a994e] text-white p-8 shadow-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-3xl">
                      👤
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold mb-1">
                        {selectedSurvey.name || 'مستخدم غير مسجل'}
                      </h2>
                      {selectedSurvey.email && (
                        <p className="text-sm opacity-90 flex items-center gap-2">
                          <span>📧</span>
                          <span>{selectedSurvey.email}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    {(selectedSurvey.phone || selectedSurvey.whatsapp) && (
                      <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                        📱 {selectedSurvey.phone || selectedSurvey.whatsapp}
                      </span>
                    )}
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                      🆔 {selectedSurvey.id.substring(0, 8)}...
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-all hover:rotate-90 duration-300"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto max-h-[calc(95vh-250px)]">
              <div className="p-8 space-y-6">
                {/* Status & Platform */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <span className="text-2xl">📊</span>
                        <span>حالة الاستبيان</span>
                      </h3>
                      {getStatusBadge(selectedSurvey.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      تم الإنشاء في: <strong>{formatDate(selectedSurvey.timestamp)}</strong>
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-3">
                      <span className="text-2xl">🌐</span>
                      <span>معلومات المنصة</span>
                    </h3>
                    <p className="text-sm text-gray-600">
                      المنصة: <strong>{selectedSurvey.platform || 'مشاتل'}</strong>
                    </p>
                  </div>
                </div>

                {/* Personal Info */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                  <h3 className="font-bold text-gray-800 text-xl mb-4 flex items-center gap-2">
                    <span className="text-3xl">👥</span>
                    <span>المعلومات الشخصية</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedSurvey.name && (
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">الاسم</p>
                        <p className="font-semibold text-gray-800 flex items-center gap-2">
                          <span>👤</span>
                          <span>{selectedSurvey.name}</span>
                        </p>
                      </div>
                    )}
                    {(selectedSurvey.phone || selectedSurvey.whatsapp) && (
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">رقم الجوال</p>
                        <p className="font-semibold text-gray-800 flex items-center gap-2">
                          <span>📱</span>
                          <span>{selectedSurvey.phone || selectedSurvey.whatsapp}</span>
                        </p>
                      </div>
                    )}
                    {selectedSurvey.email && (
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-1">البريد الإلكتروني</p>
                        <p className="font-semibold text-gray-800 flex items-center gap-2 text-sm break-all">
                          <span>📧</span>
                          <span>{selectedSurvey.email}</span>
                        </p>
                      </div>
                    )}
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">المنطقة</p>
                      <p className="font-semibold text-gray-800 flex items-center gap-2">
                        <span>📍</span>
                        <span>{selectedSurvey.region || 'غير محدد'}</span>
                      </p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">مستوى الاهتمام</p>
                      <p className="font-semibold text-gray-800 flex items-center gap-2">
                        <span>🌿</span>
                        <span>{selectedSurvey.interest_level || 'غير محدد'}</span>
                      </p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-xs text-gray-500 mb-1">وسيلة التواصل المفضلة</p>
                      <p className="font-semibold text-gray-800 flex items-center gap-2">
                        <span>📱</span>
                        <span>{selectedSurvey.communication_method || 'غير محدد'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expected Features */}
                {selectedSurvey.expected_features && (
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-yellow-200 shadow-md">
                    <h3 className="font-bold text-gray-800 text-xl mb-4 flex items-center gap-2">
                      <span className="text-3xl">⭐</span>
                      <span>الميزات المتوقعة من المنصة</span>
                    </h3>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedSurvey.expected_features}
                      </p>
                    </div>
                  </div>
                )}

                {/* Service Suggestions */}
                {selectedSurvey.service_suggestions && (
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border-2 border-indigo-200 shadow-md">
                    <h3 className="font-bold text-gray-800 text-xl mb-4 flex items-center gap-2">
                      <span className="text-3xl">💡</span>
                      <span>اقتراحات لخدمات جديدة</span>
                    </h3>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedSurvey.service_suggestions}
                      </p>
                    </div>
                  </div>
                )}

                {/* Directory Interest */}
                {selectedSurvey.directory_interest && (
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border-2 border-teal-200 shadow-md">
                    <h3 className="font-bold text-gray-800 text-xl mb-4 flex items-center gap-2">
                      <span className="text-3xl">📋</span>
                      <span>الاهتمام بدليل المشاتل</span>
                    </h3>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-2xl">
                          {selectedSurvey.directory_interest.includes('نعم') ? '✅' : '❌'}
                        </div>
                        <p className="text-gray-700 text-lg font-semibold">
                          {selectedSurvey.directory_interest}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferred Offers */}
                {selectedSurvey.preferred_offers && selectedSurvey.preferred_offers.length > 0 && (
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border-2 border-rose-200 shadow-md">
                    <h3 className="font-bold text-gray-800 text-xl mb-4 flex items-center gap-2">
                      <span className="text-3xl">🎁</span>
                      <span>العروض والحملات المفضلة</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedSurvey.preferred_offers.map((offer, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow flex items-center gap-3"
                        >
                          <span className="text-2xl">✓</span>
                          <span>{offer}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Comments */}
                {selectedSurvey.additional_comments && (
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-6 border-2 border-gray-300 shadow-md">
                    <h3 className="font-bold text-gray-800 text-xl mb-4 flex items-center gap-2">
                      <span className="text-3xl">💬</span>
                      <span>تعليقات وملاحظات إضافية</span>
                    </h3>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border-r-4 border-gray-400">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap italic">
                        "{selectedSurvey.additional_comments}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="bg-gradient-to-r from-[#49b6ff] to-[#218380] rounded-xl p-6 text-white shadow-lg">
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <span className="text-3xl">📈</span>
                    <span>ملخص الاستبيان</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold">{selectedSurvey.preferred_offers?.length || 0}</p>
                      <p className="text-sm mt-1 opacity-90">عروض مختارة</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold">{selectedSurvey.expected_features?.length || 0}</p>
                      <p className="text-sm mt-1 opacity-90">حروف الميزات</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold">{selectedSurvey.service_suggestions?.length || 0}</p>
                      <p className="text-sm mt-1 opacity-90">حروف الاقتراحات</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold">{selectedSurvey.additional_comments?.length || 0}</p>
                      <p className="text-sm mt-1 opacity-90">حروف التعليقات</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gradient-to-r from-gray-50 to-slate-50 p-6 border-t-2 border-gray-200 rounded-b-2xl flex justify-between items-center no-print">
              <div className="text-sm text-gray-600">
                <p>آخر تحديث: {formatDate(selectedSurvey.timestamp)}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                >
                  إغلاق
                </button>
                <button
                  onClick={() => {
                    if (!selectedSurvey) return;

                    const offersHtml = selectedSurvey.preferred_offers?.length > 0
                      ? selectedSurvey.preferred_offers.map(offer => 
                          `<span class="badge">${offer}</span>`
                        ).join('')
                      : '';

                    const printHtml = `
                      <h1>استبيان منصة مشاتل</h1>
                      <div class="info-card">
                        <h2>المعلومات الأساسية</h2>
                        <p><strong>الاسم:</strong> ${safe(selectedSurvey.name)}</p>
                        ${selectedSurvey.email ? `<p><strong>البريد الإلكتروني:</strong> ${selectedSurvey.email}</p>` : ''}
                        ${(selectedSurvey.phone || selectedSurvey.whatsapp) ? `<p><strong>رقم الجوال:</strong> ${safe(selectedSurvey.phone || selectedSurvey.whatsapp)}</p>` : ''}
                        <p><strong>المنطقة:</strong> ${safe(selectedSurvey.region)}</p>
                        <p><strong>مستوى الاهتمام:</strong> ${safe(selectedSurvey.interest_level)}</p>
                        <p><strong>وسيلة التواصل المفضلة:</strong> ${safe(selectedSurvey.communication_method)}</p>
                        <p><strong>تاريخ الإنشاء:</strong> ${formatDate(selectedSurvey.timestamp)}</p>
                      </div>
                      ${selectedSurvey.expected_features ? `
                        <div class="info-card">
                          <h2>الميزات المتوقعة من المنصة</h2>
                          <p>${selectedSurvey.expected_features}</p>
                        </div>
                      ` : ''}
                      ${selectedSurvey.service_suggestions ? `
                        <div class="info-card">
                          <h2>اقتراحات لخدمات جديدة</h2>
                          <p>${selectedSurvey.service_suggestions}</p>
                        </div>
                      ` : ''}
                      ${selectedSurvey.directory_interest ? `
                        <div class="info-card">
                          <h2>الاهتمام بدليل المشاتل</h2>
                          <p>${selectedSurvey.directory_interest}</p>
                        </div>
                      ` : ''}
                      ${offersHtml ? `
                        <div class="info-card">
                          <h2>العروض والحملات المفضلة</h2>
                          ${offersHtml}
                        </div>
                      ` : ''}
                      ${selectedSurvey.additional_comments ? `
                        <div class="info-card">
                          <h2>تعليقات وملاحظات إضافية</h2>
                          <p>${selectedSurvey.additional_comments}</p>
                        </div>
                      ` : ''}
                    `;

                    const printWindow = window.open('', '_blank', 'width=800,height=600');
                    printWindow.document.write(`
                      <!DOCTYPE html>
                      <html dir="rtl">
                        <head>
                          <meta charset="utf-8">
                          <title>طباعة الاستبيان - ${safe(selectedSurvey.name)}</title>
                          <style>
                            body { 
                              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                              padding: 20px; 
                              direction: rtl; 
                              line-height: 1.6;
                            }
                            h1 { 
                              color: #218380; 
                              border-bottom: 3px solid #218380; 
                              padding-bottom: 10px; 
                              margin-bottom: 20px;
                            }
                            h2 { 
                              color: #49b6ff; 
                              margin: 20px 0 10px; 
                              padding-right: 10px; 
                              border-right: 4px solid #49b6ff;
                            }
                            .info-card { 
                              background: #f8f9fa; 
                              padding: 15px; 
                              margin: 15px 0; 
                              border-radius: 8px; 
                              border: 1px solid #e9ecef;
                            }
                            .badge { 
                              display: inline-block; 
                              background: #218380; 
                              color: white; 
                              padding: 5px 12px; 
                              border-radius: 20px; 
                              margin: 4px; 
                              font-size: 14px;
                            }
                            @media print {
                              body { padding: 10px; }
                              .no-print { display: none !important; }
                            }
                          </style>
                        </head>
                        <body>
                          ${printHtml}
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                  }}
                  className="bg-gradient-to-r from-[#49b6ff] to-[#218380] hover:from-[#218380] hover:to-[#6a994e] text-white px-8 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <span>🖨️</span>
                  <span>طباعة</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SurveyManager;