import { useState, useEffect } from "react";
import type { Episode, EpisodesApiResponse } from "../types";

export default function EpisodesSection() {
  const [seasonEpisodes, setSeasonEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeason, setSelectedSeason] = useState<number>(1); // Inicializar siempre en temporada 1

  // Filtrar episodios solo por búsqueda (ya están filtrados por temporada)
  const filteredEpisodes =
    seasonEpisodes?.filter((episode) => {
      const matchesSearch =
        episode.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        episode.synopsis.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    }) || [];

  // Temporadas disponibles (1-35 basado en la serie)
  const availableSeasons = Array.from({ length: 35 }, (_, i) => i + 1);

  const fetchSeasonEpisodes = async (season: number) => {
    try {
      setLoading(true);
      setError(null);

      // Cargamos de forma más eficiente: solo las páginas necesarias hasta encontrar todos los episodios de la temporada
      const seasonEpisodesData: Episode[] = [];
      let page = 1;
      let hasMorePages = true;
      let foundEpisodes = false;

      while (hasMorePages) {
        const response = await fetch(`/api/episodes?page=${page}`);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data: EpisodesApiResponse = await response.json();

        // Filtrar episodios de la temporada solicitada
        const pageSeasonEpisodes = data.results.filter(
          (episode) => episode.season === season
        );

        if (pageSeasonEpisodes.length > 0) {
          seasonEpisodesData.push(...pageSeasonEpisodes);
          foundEpisodes = true;
        } else if (foundEpisodes) {
          // Si ya encontramos episodios de la temporada pero en esta página no hay ninguno,
          // es probable que ya hayamos pasado todos los episodios de esa temporada
          break;
        }

        // Verificar si hay más páginas
        hasMorePages = data.next !== null;
        page++;

        // Límite de seguridad para evitar bucles infinitos
        if (page > 50) break;
      }

      setSeasonEpisodes(seasonEpisodesData);
    } catch (err) {
      console.error("Error fetching episodes:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar episodios"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeasonEpisodes(selectedSeason);
  }, [selectedSeason]);

  const openEpisodeModal = (episode: Episode) => {
    setSelectedEpisode(episode);
    document.body.classList.add("modal-open");
  };

  const closeEpisodeModal = () => {
    setSelectedEpisode(null);
    document.body.classList.remove("modal-open");
  };

  return (
    <section className="episodes-section" style={{ padding: "2rem" }}>
      {/* Header con título y descripción */}
      <div className="episodes-header">
        <h1 className="episodes-main-title">🎬 Explorador de Episodios</h1>
        <p className="episodes-subtitle">
          Descubre y explora todos los episodios de Los Simpson organizados por
          temporada
        </p>
      </div>

      {/* Contenedor de búsqueda y filtros mejorado */}
      <div className="search-filters-container">
        <div className="search-filters-wrapper">
          {/* Sección de búsqueda */}
          <div className="search-section">
            <div className="search-label-container">
              <h3 className="filter-section-title">🔍 Buscar Episodios</h3>
              <span className="filter-section-subtitle">
                Encuentra episodios por nombre o sinopsis
              </span>
            </div>
            <div className="search-input-wrapper">
              <div className="search-icon">🔍</div>
              <input
                type="text"
                placeholder="Escribe el nombre del episodio o palabras clave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-modern"
              />
              {searchTerm && (
                <button
                  className="clear-search-btn"
                  onClick={() => setSearchTerm("")}
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Sección de filtro por temporada */}
          <div className="season-filter-section">
            <div className="filter-label-container">
              <h3 className="filter-section-title">📺 Filtrar por Temporada</h3>
              <span className="filter-section-subtitle">
                Selecciona una temporada específica
              </span>
            </div>
            <div className="season-selector-wrapper">
              <div className="season-icon">📺</div>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
                className="season-selector-modern"
              >
                {availableSeasons.map((season) => (
                  <option key={season} value={season}>
                    Temporada {season}{" "}
                    {season === 1
                      ? "(Clásica)"
                      : season <= 10
                      ? "(Era Dorada)"
                      : season <= 20
                      ? "(Era Moderna)"
                      : "(Era Actual)"}
                  </option>
                ))}
              </select>
              <div className="select-arrow">▼</div>
            </div>
          </div>
        </div>

        {/* Información de resultados */}
        <div className="results-info-card">
          <div className="results-stats">
            <div className="stat-item">
              <span className="stat-number">{filteredEpisodes.length}</span>
              <span className="stat-label">Episodios encontrados</span>
            </div>
            <div className="stat-divider">|</div>
            <div className="stat-item">
              <span className="stat-number">Temporada {selectedSeason}</span>
              <span className="stat-label">Seleccionada</span>
            </div>
            {searchTerm && (
              <>
                <div className="stat-divider">|</div>
                <div className="stat-item">
                  <span className="stat-number">"{searchTerm}"</span>
                  <span className="stat-label">Búsqueda activa</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando episodios...</p>
        </div>
      )}

      {/* Estado de error */}
      {error && (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error al cargar episodios</h3>
          <p>{error}</p>
          <button
            onClick={() => fetchSeasonEpisodes(selectedSeason)}
            className="retry-button"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Lista de episodios */}
      {!loading && !error && filteredEpisodes.length > 0 && (
        <div className="episodes-container">
          {/* Contador de resultados */}

          <div className="episodes-grid">
            {filteredEpisodes.map((episode, index) => (
              <div
                key={episode.id}
                className="episode-card"
                onClick={() => openEpisodeModal(episode)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="episode-image-container">
                  <img
                    src={
                      episode.image_path
                        ? `https://cdn.thesimpsonsapi.com/500${episode.image_path}`
                        : `https://via.placeholder.com/300x200/FFD700/1E3A8A?text=S${episode.season}E${episode.episode_number}&font-size=16`
                    }
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes("placeholder")) {
                        target.src = `https://via.placeholder.com/300x200/FFD700/1E3A8A?text=S${episode.season}E${episode.episode_number}&font-size=16`;
                      }
                    }}
                    alt={episode.name}
                    className="episode-image"
                    loading="lazy"
                  />
                  <div className="episode-overlay">
                    <span className="episode-season">
                      Temporada {episode.season}
                    </span>
                    <span className="episode-number">
                      Episodio {episode.episode_number}
                    </span>
                  </div>
                </div>
                <div className="episode-info">
                  <h3 className="episode-title">{episode.name}</h3>
                  <p className="episode-airdate">{episode.airdate}</p>
                  <p className="episode-synopsis">
                    {episode.synopsis.length > 100
                      ? `${episode.synopsis.substring(0, 100)}...`
                      : episode.synopsis}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {!loading && !error && filteredEpisodes.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📺</div>
          <h3>No se encontraron episodios</h3>
          <p>
            {searchTerm
              ? `No hay resultados para "${searchTerm}" en la temporada ${selectedSeason}. Intenta con otro término o cambia de temporada.`
              : `No hay episodios disponibles en la temporada ${selectedSeason}.`}
          </p>
        </div>
      )}

      {/* Modal de episodio */}
      {selectedEpisode && (
        <div className="modal-overlay" onClick={closeEpisodeModal}>
          <div
            className="modal-content episode-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={closeEpisodeModal}>
              ✕
            </button>

            <div className="episode-modal-content">
              <div className="episode-modal-info">
                <div className="episode-badges">
                  <span className="season-badge">
                    Temporada {selectedEpisode.season}
                  </span>
                  <span className="episode-badge">
                    Episodio {selectedEpisode.episode_number}
                  </span>
                </div>
                <h2 className="episode-modal-title">{selectedEpisode.name}</h2>
                <p className="episode-modal-airdate">
                  <strong>Fecha de emisión:</strong> {selectedEpisode.airdate}
                </p>
              </div>

              <div className="episode-modal-synopsis">
                <h3>Sinopsis</h3>
                <p>{selectedEpisode.synopsis}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
