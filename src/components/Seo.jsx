import { Helmet } from "react-helmet-async";

const SITE_NAME = "Lycee Saint Alexandre Sauli de Muhura";
const SITE_URL = "https://lycee-muhura.onrender.com";
const DEFAULT_IMAGE = `${SITE_URL}/assets/img/logo1.jpg`;

export default function Seo({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  robots = "index,follow",
}) {
  const canonicalUrl = `${SITE_URL}${path}`;
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
