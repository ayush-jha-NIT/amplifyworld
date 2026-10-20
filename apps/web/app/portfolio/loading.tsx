export default function PortfolioLoading() {
  return (
    <main className="content-shell portfolio-loading" aria-busy="true" aria-label="Loading portfolio">
      <div className="portfolio-loading-line" />
      <div className="portfolio-loading-title" />
      <div className="portfolio-loading-grid">
        <div className="portfolio-loading-copy" />
        <div className="portfolio-loading-image" />
      </div>
      <p className="sr-only" role="status">Loading portfolio concepts</p>
    </main>
  );
}
