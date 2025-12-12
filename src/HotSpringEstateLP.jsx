/**
 * HotSpringEstateLP.jsx (gallery + lightbox)
 * --------------------------------------------------------------
 * New: Click-to-zoom Lightbox for hero and gallery images.
 * - No external libs. Accessible keyboard controls (ESC to close, ←/→ to navigate).
 * - Keeps previous tests, adds a few helper tests. No existing tests changed.
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';

// 1x1 transparent PNG as a safe, always-available fallback
const DEFAULT_HERO_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';

// ---------------- helpers ----------------
export function isValidHeroUrl(u) {
  if (typeof u !== 'string' || !u) return false;
  // Allow http(s), protocol-relative, data URLs, and relative/rooted paths
  return /^(https?:)?\/\//.test(u) || /^data:/.test(u) || /^(\.\.\/|\.\/|\/)/.test(u);
}
export function selectHeroSrc(inputUrl) {
  return isValidHeroUrl(inputUrl) ? inputUrl : DEFAULT_HERO_DATA_URL;
}
export function coerceArray(a) {
  return Array.isArray(a) ? a : [];
}
export function clampIndex(i, len) {
  if (len <= 0) return 0;
  return Math.max(0, Math.min(i, len - 1));
}

// ---------------- i18n content ----------------
const CONTENT = {
  ja: {
    title: '日本の隠れた楽園 — 温泉と自然が融合した至高の邸宅',
    subtitle: '五万坪・天然温泉・プール・テニスコート・サウナ。オーナー直売（仲介不要）',
    overviewTitle: '物件概要',
    overviewLines: [
      '敷地面積：約50,000坪（約165,000㎡）',
      '設備：天然温泉、サウナ、屋外プール、テニスコート、ゲストルーム、駐車場多数',
      '用途：別荘／保養所／リゾート開発用地',
    ],
    featuresTitle: '特徴',
    featuresLines: [
      '天然温泉源',
      '山林と河川の景観を一望できる絶景',
      '日本国内登記済・即引渡可能',
      '海外投資家購入可（台湾等）',
    ],
    contactCTA: '詳細資料（日本語／繁體中文／英語）をご希望の方はお問い合わせください。',
    contactButton: '資料を請求する',
  },
  zh: {
    title: '日本隱世溫泉莊園 — 私人天堂的極致體驗',
    subtitle: '五萬坪・天然溫泉・泳池・網球場・桑拿。屋主直售（無需仲介）',
    overviewTitle: '物件概要',
    overviewLines: [
      '面積：約165,000平方公尺（五萬坪）',
      '設施：天然溫泉、桑拿、泳池、網球場、賓客室、多車位停車場',
      '適用用途：私人別墅／企業招待所／度假開發',
    ],
    featuresTitle: '特色',
    featuresLines: [
      '自家天然溫泉泉源（豐富湧出量）',
      '被原始森林與河泊景觀環繞',
      '日本合法登記，即可過戶',
      '開放外國買家（包含台灣、香港、新加坡）',
    ],
    contactCTA: '此不動產由日本屋主直接提供，無須透過仲介公司。',
    contactButton: '索取完整簡介',
  },
  en: {
    title: 'A Hidden Sanctuary in Japan — The Ultimate Hot Spring Estate',
    subtitle: '50,000 tsubo · natural onsen · pool · tennis court · sauna. Owner direct sale (no agents)',
    overviewTitle: 'Property Overview',
    overviewLines: [
      'Land Area: Approx. 165,000 m² (50,000 tsubo)',
      'Facilities: Private onsen (hot spring), sauna, pool, tennis court, guest room, parking',
      'Usage: Private villa / Resort / Corporate retreat / Investment',
    ],
    featuresTitle: 'Key Features',
    featuresLines: [
      'Private natural hot spring source',
      'Panoramic forest and river views', // fixed typo
      'Fully registered under Japanese property law, ready for transfer',
      'Open to international buyers (Taiwan, Hong Kong, Singapore, etc.)',
    ],
    contactCTA: 'This property is offered directly by the owner — no real estate agents involved.',
    contactButton: 'Request Full Brochure',
  },
};

// ---------------- component ----------------
export default function HotSpringEstateLP({
  initialLang = 'ja',
  email = 'xxxx@example.com',
  // Default can be swapped to any direct-image URL (NOT a page URL)
 heroPhotoUrl="/images/hero.jpg"
galleryUrls={[
  "/images/g1.jpg",
  "/images/g2.jpg",
  "/images/g3.jpg",
  "/images/g4.jpg",
  "/images/g5.jpg",
  "/images/g6.jpg",
]}

}) {
  const [lang, setLang] = useState(initialLang);
  const t = CONTENT[lang] || CONTENT.ja;

  // Allow `?hero=` query param as an alternative to prop
  const heroFromQuery = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('hero')
    : undefined;
  const effectiveHero = heroPhotoUrl || heroFromQuery;

  // Resolve hero src and manage fallback
  const initialSrc = useMemo(() => selectHeroSrc(effectiveHero), [effectiveHero]);
  const [imgSrc, setImgSrc] = useState(initialSrc);

  const mailTo = (subject) => `mailto:${email}?subject=${encodeURIComponent(subject)}`;

  // Build an ordered array of images for lightbox: hero first, then gallery
  const galleryList = coerceArray(galleryUrls).map((u) => (u || '').trim()).filter(Boolean);
  const lightboxImages = [selectHeroSrc(imgSrc), ...galleryList.map(selectHeroSrc)];

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = useCallback((idx) => {
    setLightboxIndex(clampIndex(idx, lightboxImages.length));
    setLightboxOpen(true);
  }, [lightboxImages.length]);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const prevImage = useCallback(() => setLightboxIndex((i) => (i - 1 + lightboxImages.length) % lightboxImages.length), [lightboxImages.length]);
  const nextImage = useCallback(() => setLightboxIndex((i) => (i + 1) % lightboxImages.length), [lightboxImages.length]);

  // Keyboard accessibility: ESC to close, arrows to navigate
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, closeLightbox, prevImage, nextImage]);

  const renderGallery = () => {
    const list = coerceArray(galleryUrls);
    if (list.length > 0) {
      return (
        <div className="grid grid-cols-2 gap-4">
          {list.map((url, idx) => (
            <img
              key={idx}
              src={selectHeroSrc((url || '').trim())}
              alt={`Gallery ${idx + 1}`}
              loading="lazy"
              decoding="async"
              className="h-36 w-full object-cover rounded-lg shadow cursor-zoom-in"
              onClick={() => openLightbox(1 + idx)}
              onError={(e) => { e.currentTarget.src = DEFAULT_HERO_DATA_URL; }}
            />
          ))}
        </div>
      );
    }
    // placeholders
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="h-36 rounded-lg bg-white shadow flex items-center justify-center">写真A</div>
        <div className="h-36 rounded-lg bg-white shadow flex items-center justify-center">写真B</div>
        <div className="h-36 rounded-lg bg-white shadow flex items-center justify-center">写真C</div>
        <div className="h-36 rounded-lg bg-white shadow flex items-center justify-center">写真D</div>
      </div>
    );
  };

return (
  <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-white font-semibold">JP</div>
          <div>
            <h1 className="text-lg font-semibold">Hot Spring Estate — Owner Direct</h1>
            <p className="text-sm text-gray-500">Private, off-market opportunity — Japanese estate</p>
          </div>
        </div>

        <nav className="flex items-center gap-4">
          <div className="flex items-center gap-2 border rounded-md overflow-hidden">
            <button onClick={() => setLang('ja')} className={`px-3 py-2 ${lang === 'ja' ? 'bg-gray-100' : ''}`}>日本語</button>
            <button onClick={() => setLang('zh')} className={`px-3 py-2 ${lang === 'zh' ? 'bg-gray-100' : ''}`}>繁體中文</button>
            <button onClick={() => setLang('en')} className={`px-3 py-2 ${lang === 'en' ? 'bg-gray-100' : ''}`}>English</button>
          </div>

          <a href={mailTo('Brochure Request - Hot Spring Estate')} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg shadow">
            {lang === 'ja' ? 'お問い合わせ' : lang === 'zh' ? '聯絡我們' : 'Contact'}
          </a>
        </nav>
      </div>
    </header>

    <main className="max-w-7xl mx-auto px-6 py-12">
      <section className="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-4">{t.title}</h2>
          <p className="text-lg text-gray-600 mb-6">{t.subtitle}</p>

          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="font-semibold mb-3">{t.overviewTitle}</h3>
            <ul className="list-disc pl-5 text-gray-700 space-y-2">
              {t.overviewLines.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>

            <div className="mt-6">
              <h4 className="font-semibold mb-2">{t.featuresTitle}</h4>
              <ul className="list-inside space-y-2 text-gray-700">
                {t.featuresLines.map((line, idx) => (
                  <li key={idx}>• {line}</li>
                ))}
              </ul>
            </div>

            <p className="mt-6 text-sm text-gray-500">{t.contactCTA}</p>

            <div className="mt-4 flex items-center gap-3">
              <a href={mailTo('Brochure Request - Hot Spring Estate')} className="px-4 py-2 bg-emerald-600 text-white rounded-md shadow">{t.contactButton}</a>
              <button onClick={() => alert('Request recorded. Replace this with API call in production.')} className="px-4 py-2 border rounded-md">
                {lang === 'ja' ? '詳細を見る' : lang === 'zh' ? '更多資訊' : 'Learn More'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src={imgSrc}
              alt="Hot Spring Estate Drone View"
              className="w-full h-72 object-cover rounded-2xl shadow-lg cursor-zoom-in"
              onClick={() => openLightbox(0)}
              onError={() => setImgSrc(DEFAULT_HERO_DATA_URL)}
            />
          </div>
          {renderGallery()}
        </div>
      </section>
    </main>

    {/* Lightbox overlay */}
    {lightboxOpen && (
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        onClick={closeLightbox}
      >
        <div className="relative max-w-6xl w-[92vw] max-h-[88vh]" onClick={(e) => e.stopPropagation()}>
          <img
            src={lightboxImages[clampIndex(lightboxIndex, lightboxImages.length)]}
            alt={`Preview ${lightboxIndex + 1}`}
            className="max-h-[80vh] w-auto mx-auto rounded-xl shadow-lg"
            onError={(e) => { e.currentTarget.src = DEFAULT_HERO_DATA_URL; }}
          />

          <button
            aria-label="Close"
            className="absolute -top-10 right-0 px-3 py-1 bg-white/90 rounded-md shadow hover:bg-white"
            onClick={closeLightbox}
          >✕</button>

          <div className="absolute inset-y-0 left-0 flex items-center">
            <button aria-label="Previous" className="m-2 px-3 py-2 bg-white/90 rounded-md shadow hover:bg-white" onClick={prevImage}>←</button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button aria-label="Next" className="m-2 px-3 py-2 bg-white/90 rounded-md shadow hover:bg-white" onClick={nextImage}>→</button>
          </div>

          <div className="mt-3 grid grid-cols-6 gap-2">
            {lightboxImages.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Thumb ${i + 1}`}
                className={`h-16 w-full object-cover rounded cursor-pointer border ${i === lightboxIndex ? 'border-white' : 'border-transparent'}`}
                onClick={() => setLightboxIndex(i)}
                onError={(e) => { e.currentTarget.src = DEFAULT_HERO_DATA_URL; }}
              />
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
);

}

// ---------------- inline tests (lightweight) ----------------
(function runInlineTests(){
  try {
    // Existing tests
    console.assert(isValidHeroUrl('https://example.com/x.png') === true, 'http URL valid');
    console.assert(isValidHeroUrl('data:image/png;base64,AAA') === true, 'data URL valid');
    console.assert(isValidHeroUrl('') === false, 'empty invalid');
    console.assert(selectHeroSrc('not-a-url') === DEFAULT_HERO_DATA_URL, 'invalid -> fallback');

    // Added tests
    console.assert(isValidHeroUrl('//cdn.example.com/asset.jpg') === true, 'protocol-relative valid');
    console.assert(isValidHeroUrl('/rooted/path.jpg') === true, 'rooted path valid');
    console.assert(Array.isArray(coerceArray(['a'])) && coerceArray(['a']).length === 1, 'coerceArray keeps arrays');
    console.assert(Array.isArray(coerceArray(null)) && coerceArray(null).length === 0, 'coerceArray non-array -> []');
    console.assert(clampIndex(-1, 5) === 0 && clampIndex(6, 5) === 4 && clampIndex(3, 5) === 3, 'clampIndex works');
  } catch (e) {
    console.warn('Inline tests encountered an error:', e);
  }
})();
