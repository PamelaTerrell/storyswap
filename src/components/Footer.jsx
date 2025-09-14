export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer" role="contentinfo" aria-label="Site footer">
      <div className="footer-inner">
        <p>
          © {year} LifeStoriesNow.com <span className="dot">•</span>{" "}
          Created by{" "}
          <a
            href="https://pamelajterrell.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pamela Terrell
          </a>
        </p>
      </div>
    </footer>
  );
}
