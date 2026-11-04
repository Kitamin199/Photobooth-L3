import ScrollVelocity from './ScrollVelocity';

export default function SectionMarquee({ label, reverse = false }) {
  return (
    <div aria-hidden="true" className="py-3 text-plum">
      <ScrollVelocity texts={[label]} velocity={reverse ? -32 : 32} separator="✦"
        gap={18} numCopies={24} fadeEdges={reverse} fontSize="clamp(1.6rem, 3.5vw, 3.25rem)"
        parallaxStyle={{ paddingBlock: '0.35em' }}
        scrollerStyle={{ lineHeight: 1.35, ...(reverse && { WebkitTextStroke: '1px currentColor', WebkitTextFillColor: 'transparent' }) }} />
    </div>
  );
}
