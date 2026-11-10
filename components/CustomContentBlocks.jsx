export default function CustomContentBlocks({ blocks = [] }) {
  const visibleBlocks = Array.isArray(blocks)
    ? blocks.filter((b) => b && b.visible !== false)
    : [];

  if (visibleBlocks.length === 0) return null;

  return (
    <div className="space-y-6">
      {visibleBlocks.map((block, index) => (
        <section
          key={block.id || index}
          className="bg-white rounded-3xl p-6 sm:p-9 border border-beige shadow-2xs space-y-4"
        >
          {block.title && (
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brun">
              {block.title}
            </h2>
          )}
          {block.subtitle && (
            <p className="text-sm font-medium text-champagne-dark">
              {block.subtitle}
            </p>
          )}
          {Array.isArray(block.paragraphs) &&
            block.paragraphs
              .filter((p) => typeof p === "string" && p.trim() !== "")
              .map((p, pIdx) => (
                <p
                  key={pIdx}
                  className="text-stone-700 text-sm sm:text-base leading-relaxed font-normal"
                >
                  {p}
                </p>
              ))}
          {Array.isArray(block.bullets) &&
            block.bullets.filter((li) => typeof li === "string" && li.trim() !== "")
              .length > 0 && (
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-stone-700">
                {block.bullets
                  .filter((li) => typeof li === "string" && li.trim() !== "")
                  .map((li, bIdx) => (
                    <li key={bIdx}>{li}</li>
                  ))}
              </ul>
            )}
        </section>
      ))}
    </div>
  );
}
