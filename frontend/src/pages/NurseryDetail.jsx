// src/pages/NurseryDetail.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const NurseryDetail = () => {
  const { id } = useParams();
  const [nursery, setNursery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNursery = async () => {
      try {
        const response = await fetch(`https://react-firebase-plant-nursery.vercel.app/api/nurseries/${id}`); // You'll need to add this route
        if (!response.ok) throw new Error('Not found');
        const data = await response.json();
        setNursery(data);
      } catch (err) {
        setNursery(null);
      } finally {
        setLoading(false);
      }
    };

    fetchNursery();
  }, [id]);

  if (loading) return <p>جاري التحميل...</p>;
  if (!nursery) return <div>المشتل غير موجود</div>;

  return (
    <div> {/* Your existing JSX */ }</div>
  );
};

export default NurseryDetail;