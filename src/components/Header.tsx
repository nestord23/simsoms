import type { HeaderProps } from "../types";

export default function Header({
  currentSection,
  onSectionChange,
}: HeaderProps) {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-section">
          <h1 className="logo-text">SimSoms</h1>
          <span className="logo-subtitle">Los Simpsons Universe</span>
        </div>
        <nav className="nav">
          <button
            className={`nav-button ${
              currentSection === "home" ? "active" : ""
            }`}
            onClick={() => onSectionChange("home")}
          >
            Inicio
          </button>
          <button
            className={`nav-button ${
              currentSection === "characters" ? "active" : ""
            }`}
            onClick={() => onSectionChange("characters")}
          >
            Personajes
          </button>
          <button
            className={`nav-button ${
              currentSection === "episodes" ? "active" : ""
            }`}
            onClick={() => onSectionChange("episodes")}
          >
            Episodios
          </button>
          <button
            className={`nav-button ${
              currentSection === "locations" ? "active" : ""
            }`}
            onClick={() => onSectionChange("locations")}
          >
            Ubicaciones
          </button>
        </nav>
      </div>
    </header>
  );
}
