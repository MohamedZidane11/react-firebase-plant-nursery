// src/pages/SurveyManager.jsx
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';

const SurveyManager = () => {
  const [surveys, setSurveys] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const API_BASE = 'http://localhost:5000';

  const [filters, setFilters] = useState({
    name: '',
    region: '',
    interestLevel: ''
  });

  const fetchSurveys = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/surveys`);
      const data = await res.json();
      setSurveys(data);
    } catch (err) {
      console.error('Error fetching surveys:', err);
      toast.error('فشل تحميل الاستبيانات');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/survey/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchSurveys(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredSurveys = useMemo(() => {
    let result = [...surveys];

    if (filters.name.trim()) {
      const term = filters.name.trim().toLowerCase();
      result = result.filter(s => 
        s.name?.toLowerCase().includes(term) || 
        s.email?.toLowerCase().includes(term)
      );
    }

    if (filters.region) {
      result = result.filter(s => s.region === filters.region);
    }

    if (filters.interestLevel) {
      result = result.filter(s => s.interest_level === filters.interestLevel);
    }

    return result;
  }, [surveys, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const toggleExpand = (survey) => {
    setSelectedSurvey(survey);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedSurvey(null);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'غير محدد';
    try {
      return new Date(timestamp).toLocaleString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'غير محدد';
    }
  };

  const isSearching = Object.values(filters).some(val => val !== '');

  if (loading) return <p className="text-center py-8">جاري التحميل...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#218380]">إدارة الاستبيانات</h1>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">إجمالي الاستبيانات</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <div className="text-4xl">📊</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">المناطق المشاركة</p>
                  <p className="text-3xl font-bold text-green-600">
                    {Object.keys(stats.byRegion).length}
                  </p>
                </div>
                <div className="text-4xl">📍</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">أكثر عرض مطلوب</p>
                  <p className="text-sm font-semibold text-purple-600">
                    {Object.entries(stats.preferredOffers).sort((a, b) => b[1] - a[1])[0]?.[0] || 'لا يوجد'}
                  </p>
                </div>
                <div className="text-4xl">🎁</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-r-4 border-[#218380]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm mb-1">أكثر منطقة نشاطاً</p>
                  <p className="text-sm font-semibold text-[#218380]">
                    {Object.entries(stats.byRegion).sort((a, b) => b[1] - a[1])[0]?.[0] || 'لا يوجد'}
                  </p>
                </div>
                <div className="text-4xl">🏆</div>
              </div>
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">بحث وفلترة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاسم أو البريد</label>
              <input
                type="text"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="ابحث بالاسم أو البريد..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المنطقة</label>
              <select
                name="region"
                value={filters.region}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">الكل</option>
                <option value="الرياض">منطقة الرياض</option>
                <option value="مكة">منطقة مكة المكرمة</option>
                <option value="المدينة">منطقة المدينة المنورة</option>
                <option value="القصيم">منطقة القصيم</option>
                <option value="الشرقية">المنطقة الشرقية</option>
                <option value="عسير">منطقة عسير</option>
                <option value="تبوك">منطقة تبوك</option>
                <option value="حائل">منطقة حائل</option>
                <option value="الحدود الشمالية">منطقة الحدود الشمالية</option>
                <option value="جازان">منطقة جازان</option>
                <option value="نجران">منطقة نجران</option>
                <option value="الباحة">منطقة الباحة</option>
                <option value="الجوف">منطقة الجوف</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">مستوى الاهتمام</label>
              <select
                name="interestLevel"
                value={filters.interestLevel}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">الكل</option>
                <option value="مبتدئ">مبتدئ</option>
                <option value="هاوي">هاوي</option>
                <option value="محترف">محترف</option>
                <option value="صاحب نشاط تجاري">صاحب نشاط تجاري</option>
              </select>
            </div>
          </div>
        </div>

        {/* Surveys List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-cyan-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold">
              الاستبيانات ({isSearching ? filteredSurveys.length : surveys.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {(isSearching ? filteredSurveys : surveys).length === 0 ? (
              <p className="p-8 text-center text-gray-500">
                {isSearching ? 'لا توجد نتائج مطابقة' : 'لا توجد استبيانات.'}
              </p>
            ) : (
              (isSearching ? filteredSurveys : surveys).map((survey) => (
                <div key={survey.id} className="p-6 hover:bg-gray-50">
                  {/* Survey Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">👤</span>
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">
                            {survey.name || 'مستخدم غير مسجل'}
                          </h3>
                          {survey.email && (
                            <p className="text-sm text-gray-600">📧 {survey.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold">
                          📍 {survey.region}
                        </span>
                        <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold">
                          🌿 {survey.interest_level}
                        </span>
                        <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-semibold">
                          📱 {survey.communication_method}
                        </span>
                        <span className="bg-cyan-100 text-[#218380] text-xs px-3 py-1 rounded-full font-semibold">
                          ⏰ {formatDate(survey.timestamp)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpand(survey)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm px-4 py-2 rounded transition font-medium whitespace-nowrap"
                    >
                      🔍 عرض التفاصيل
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedSurvey && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#49b6ff] to-[#218380] text-white p-6 rounded-t-xl flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {selectedSurvey.name || 'مستخدم غير مسجل'}
                </h2>
                {selectedSurvey.email && (
                  <p className="text-sm opacity-90">📧 {selectedSurvey.email}</p>
                )}
              </div>
              <button
                onClick={closeModal}
                className="text-white hover:bg-white/20 rounded-full p-2 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Basic Info Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-800 text-sm px-4 py-2 rounded-full font-semibold">
                  📍 {selectedSurvey.region}
                </span>
                <span className="bg-green-100 text-green-800 text-sm px-4 py-2 rounded-full font-semibold">
                  🌿 {selectedSurvey.interest_level}
                </span>
                <span className="bg-purple-100 text-purple-800 text-sm px-4 py-2 rounded-full font-semibold">
                  📱 {selectedSurvey.communication_method}
                </span>
                <span className="bg-cyan-100 text-[#218380] text-sm px-4 py-2 rounded-full font-semibold">
                  ⏰ {formatDate(selectedSurvey.timestamp)}
                </span>
              </div>

              {/* Expected Features */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                  <span className="text-2xl">⭐</span>
                  الميزات المتوقعة
                </h3>
                <p className="text-gray-700 leading-relaxed">{selectedSurvey.expected_features}</p>
              </div>

              {/* Service Suggestions */}
              {selectedSurvey.service_suggestions && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                    <span className="text-2xl">💡</span>
                    اقتراحات الخدمات
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{selectedSurvey.service_suggestions}</p>
                </div>
              )}

              {/* Directory Interest */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                  <span className="text-2xl">📋</span>
                  الاهتمام بالدليل
                </h3>
                <p className="text-gray-700 leading-relaxed">{selectedSurvey.directory_interest}</p>
              </div>

              {/* Preferred Offers */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                  <span className="text-2xl">🎁</span>
                  العروض المفضلة
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSurvey.preferred_offers?.map((offer, index) => (
                    <span
                      key={index}
                      className="bg-green-500 text-white text-sm px-4 py-2 rounded-full font-medium"
                    >
                      ✓ {offer}
                    </span>
                  ))}
                </div>
              </div>

              {/* Additional Comments */}
              {selectedSurvey.additional_comments && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
                    <span className="text-2xl">💬</span>
                    تعليقات إضافية
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{selectedSurvey.additional_comments}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-xl flex justify-end">
              <button
                onClick={closeModal}
                className="bg-[#49b6ff] hover:bg-[#218380] text-white px-6 py-3 rounded-lg font-medium transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyManager;