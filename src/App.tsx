import { useState, useEffect } from "react";
import "./App.css";

// Importar componentes
import Header from "./components/Header";
import HomeSection from "./components/HomeSection";
import CharactersSection from "./components/CharactersSection";
import EpisodesSection from "./components/EpisodesSection";
import LocationsSection from "./components/LocationsSection";

// Importar tipos
import type { SectionType } from "./types";

function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSection, setCurrentSection] = useState<SectionType>("home");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSectionChange = (section: SectionType) => {
    if (section !== currentSection) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSection(section);
        setIsTransitioning(false);
      }, 300);
    }
  };

  return (
    <div className={`app ${isLoaded ? "loaded" : ""}`}>
      <Header
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
      />

      <main
        className={`main-content ${isTransitioning ? "transitioning" : ""}`}
      >
        {currentSection === "home" && <HomeSection />}
        {currentSection === "characters" && <CharactersSection />}
        {currentSection === "episodes" && <EpisodesSection />}
        {currentSection === "locations" && <LocationsSection />}
      </main>

      <footer className="footer">
        <div className="footer-container">
          <p className="footer-text">
            © 2024 SimSoms - Los Simpsons Universe. Datos proporcionados por{" "}
            <a
              href="https://thesimpsonsapi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              The Simpsons API
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
