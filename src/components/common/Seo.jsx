import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'SuperUi';
const SITE_URL = 'https://SuperUi.com';
const DEFAULT_IMAGE = `/superui_logo.png`;
const DEFAULT_DESCRIPTION = 'SuperUi -- Your one-stop destination for premium digital products. Buy rediment websites, portfolio templates, full-stack source code, UI components, and developer tools. Pay once, download instantly.';

const Seo = ({
  title,
  description,
  image = DEFAULT_IMAGE,
  url = SITE_URL,
  type = 'website',
  keywords = [],
  publishedTime,
  modifiedTime,
  noindex = false,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonical = url.startsWith('http') ? url : `${SITE_URL}${url}`;
  const keywordsStr = keywords.join(', ');

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description || DEFAULT_DESCRIPTION} />
      {keywordsStr && <meta name="keywords" content={keywordsStr} />}

      {/* Canonical */}
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || DEFAULT_DESCRIPTION} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || DEFAULT_DESCRIPTION} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data -- Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
          logo: '/superui_logo.png',
          description: DEFAULT_DESCRIPTION,
          contactPoint: {
            '@type': 'ContactPoint',
            email: 'hello@SuperUi.com',
            telephone: '+91-9876543210',
            contactType: 'customer service',
            availableLanguage: ['English', 'Hindi']
          },
          sameAs: []
        })}
      </script>

      {/* Structured Data -- WebSite */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: SITE_URL,
          description: DEFAULT_DESCRIPTION,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${SITE_URL}/category/all?q={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        })}
      </script>

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
};

export default Seo;

