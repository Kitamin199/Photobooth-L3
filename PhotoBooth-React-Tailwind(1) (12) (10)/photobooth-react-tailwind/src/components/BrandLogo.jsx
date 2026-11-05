// Crop transparent padding through the SVG viewport; preserve the supplied artwork.
export default function BrandLogo({ className = '' }) {
  return (
    <svg viewBox="22 481 2013 1100" className={className} role="img" aria-label="CekRek!" width="132" height="72">
      <image href={`${import.meta.env.BASE_URL}images/brand/cekrek.png`} width="2048" height="2048" />
    </svg>
  );
}
