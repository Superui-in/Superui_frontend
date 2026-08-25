import { useSiteContent } from '../../hooks/useSiteContent';
import useThemeStore from '../../store/themeStore';

export function getLogoHtml(logoData, options = {}) {
  const {
    variant = 'navbar',
    darkMode = false,
    fontSize = 19,
    fontWeight = 800,
    letterSpacing = '-0.4px',
    fontFamily = "'Space Grotesk', system-ui, sans-serif",
  } = options;

  const defaultLogoUrl = '/superui_logo.png';
  const mode = logoData?.mode || 'both'; // default to displaying both

  // Determine logo source image based on mode and variant
  let logoSrc = defaultLogoUrl;
  if (logoData) {
    if (mode === 'image-variant') {
      if (variant === 'footer') {
        logoSrc = darkMode ? (logoData.footerWhiteLogoUrl || logoData.fullLogoUrl || logoData.logoUrl) : (logoData.footerDarkLogoUrl || logoData.fullLogoUrl || logoData.logoUrl);
      } else {
        logoSrc = darkMode ? (logoData.navbarWhiteLogoUrl || logoData.fullLogoUrl || logoData.logoUrl) : (logoData.navbarDarkLogoUrl || logoData.fullLogoUrl || logoData.logoUrl);
      }
    } else {
      logoSrc = logoData.logoUrl || logoData.fullLogoUrl || defaultLogoUrl;
    }
  }

  const logoAlt = logoData?.logoAlt || logoData?.fullLogoAlt || 'SuperUi Logo';

  const imgEl = (mode === 'image' || mode === 'image-variant' || mode === 'both') ? (
    <img
      src={logoSrc}
      alt={logoAlt}
      style={{ height: 26, width: 26, objectFit: 'contain', flexShrink: 0 }}
      loading="eager"
    />
  ) : null;

  // Split names or use default
  const firstName = logoData?.firstName || 'Super';
  const lastName = logoData?.lastName || 'Ui';
  const lastNameColor = logoData?.lastNameColor || '#FF5000';

  const textEl = (mode === 'text' || mode === 'both') ? (
    <span style={{ fontWeight, fontSize, letterSpacing, fontFamily }}>
      <span style={{ color: darkMode ? '#FFFFFF' : '#111111' }}>{firstName}</span>
      <span style={{ color: lastNameColor }}>{lastName}</span>
    </span>
  ) : null;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {imgEl}
      {textEl}
    </span>
  );
}

export function useLogo(options = {}) {
  const { data: logoData } = useSiteContent('brand');
  const { darkMode } = useThemeStore();
  return { logoData, darkMode, ...options };
}

