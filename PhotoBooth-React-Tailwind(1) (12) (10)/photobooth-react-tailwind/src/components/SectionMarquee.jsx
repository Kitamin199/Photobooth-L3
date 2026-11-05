import useVisibleMotion from '../hooks/useVisibleMotion';

export default function SectionMarquee({ label, reverse = false }) {
  const ref = useVisibleMotion();
  return (
    <div ref={ref} aria-hidden="true" className={`section-marquee ${reverse ? 'section-marquee-reverse' : ''}`}>
      <div className="section-marquee-track">
        {[0, 1].map(copy => <div className="section-marquee-group" key={copy}>
          {[0, 1, 2, 3].map(index => <span key={index}>{label} ✦ </span>)}
        </div>)}
      </div>
    </div>
  );
}
