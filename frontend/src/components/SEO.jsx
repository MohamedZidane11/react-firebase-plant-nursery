// src/components/SEO.jsx
// هذا المكون يضيف meta tags ديناميكية لكل صفحة
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEO = ({ 
  title, 
  description, 
  keywords, 
  ogImage,
  ogUrl,
  canonical 
}) => {
  // استخدام القيم الافتراضية إذا لم تُمرر
  const defaultTitle = 'مشاتل السعودية | اكتشف أجمل النباتات والمشاتل في المملكة';
  const defaultDescription = 'منصة مشاتل السعودية تجمع لك النباتات والزهور من مشاتل المملكة في مكان واحد';
  const defaultKeywords = 'مشاتل السعودية، نباتات الزينة، مشاتل الرياض';
  const defaultOgImage = 'https://firebasestorage.googleapis.com/your-default-image.jpg';
  const siteUrl = 'https://nurseries.qvtest.com';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title || defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={ogUrl || siteUrl} />
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={ogImage || defaultOgImage} />
      <meta property="og:site_name" content="مشاتل السعودية" />
      <meta property="og:locale" content="ar_SA" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={ogUrl || siteUrl} />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={ogImage || defaultOgImage} />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Arabic" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="مشاتل السعودية" />
      <meta httpEquiv="Content-Language" content="ar" />
      
      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="format-detection" content="telephone=yes" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#10b981" />
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  ogImage: PropTypes.string,
  ogUrl: PropTypes.string,
  canonical: PropTypes.string,
};

export default SEO;
