export default function HomeSection() {
  return (
    <section className="section home-section">
      <div className="hero">
        <h2 className="hero-title">Bienvenido a SimSoms</h2>
        <p className="hero-description">
          Explora el universo completo de Los Simpsons. Descubre personajes,
          episodios y ubicaciones de la serie más icónica de la televisión.
        </p>
        <div className="hero-stats">
          <div className="stat-card">
            <span className="stat-number">800+</span>
            <span className="stat-label">Personajes</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">750+</span>
            <span className="stat-label">Episodios</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">200+</span>
            <span className="stat-label">Ubicaciones</span>
          </div>
        </div>
      </div>
    </section>
  );
}
