export default function BlogLoading() {
  return (
    <main className="content-shell blog-loading" aria-busy="true" aria-label="Loading blog">
      <div className="blog-loading-eyebrow" />
      <div className="blog-loading-heading" />
      <div className="blog-loading-cards">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="blog-loading-card" key={index} aria-hidden="true" />
        ))}
      </div>
      <p className="sr-only" role="status">Loading insights</p>
    </main>
  );
}
