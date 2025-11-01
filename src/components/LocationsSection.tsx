import { useState, useEffect } from "react";
import type { Location, LocationsApiResponse } from "../types";
import LocationModal from "./LocationModal";

export default function LocationsSection() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  //   const [totalPages, setTotalPages] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrar ubicaciones por búsqueda
  const filteredLocations =
    locations?.filter(
      (location) =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.town.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.use.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Paginación local para los resultados filtrados
  const itemsPerPage = 20;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLocations = filteredLocations.slice(startIndex, endIndex);
  const totalFilteredPages = Math.ceil(filteredLocations.length / itemsPerPage);

  const fetchAllLocations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Primero obtener la primera página para saber cuántas páginas hay
      const firstResponse = await fetch(
        `https://thesimpsonsapi.com/api/locations?page=1`
      );
      if (!firstResponse.ok) {
        throw new Error(
          `Error ${firstResponse.status}: ${firstResponse.statusText}`
        );
      }

      const firstData: LocationsApiResponse = await firstResponse.json();
      //   setTotalPages(firstData.pages);

      // Si solo hay una página, usar esos datos
      if (firstData.pages === 1) {
        setLocations(firstData.results);
        setCurrentPage(1);
        return;
      }

      // Si hay múltiples páginas, cargar todas
      const allLocations: Location[] = [...firstData.results];

      // Cargar el resto de páginas en paralelo
      const pagePromises = [];
      for (let page = 2; page <= firstData.pages; page++) {
        pagePromises.push(
          fetch(`https://thesimpsonsapi.com/api/locations?page=${page}`)
            .then((response) => response.json())
            .then((data: LocationsApiResponse) => data.results)
        );
      }

      const additionalPages = await Promise.all(pagePromises);
      additionalPages.forEach((pageResults) => {
        allLocations.push(...pageResults);
      });

      setLocations(allLocations);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching locations:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al cargar ubicaciones"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLocations();
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalFilteredPages) {
      setCurrentPage(page);
    }
  };

  const openLocationModal = (location: Location) => {
    setSelectedLocation(location);
  };

  const closeLocationModal = () => {
    setSelectedLocation(null);
  };

  return (
    <section className="locations-section" style={{ padding: "2rem" }}>
      <div className="section-header">
        <h2 className="section-title">Ubicaciones</h2>
        <p className="section-description">
          Descubre los lugares más emblemáticos de Springfield y más allá
        </p>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Busca ubicaciones de Los Simpson..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Resetear a la primera página al cambiar búsqueda
          }}
          className="search-input"
          style={{
            width: "100%",
            maxWidth: "500px",
            padding: "1rem",
            borderRadius: "25px",
            border: "3px solid #FFD700",
            fontSize: "1rem",
            outline: "none",
            background: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
            transition: "all 0.3s ease",
          }}
        />
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando ubicaciones...</p>
        </div>
      )}

      {/* Estado de error */}
      {error && (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error al cargar ubicaciones</h3>
          <p>{error}</p>
          <button onClick={() => fetchAllLocations()} className="retry-button">
            Reintentar
          </button>
        </div>
      )}

      {/* Lista de ubicaciones */}
      {!loading &&
        !error &&
        searchTerm.trim() !== "" &&
        filteredLocations.length > 0 && (
          <div className="locations-container">
            <div className="locations-grid">
              {paginatedLocations.map((location, index) => (
                <div
                  key={location.id}
                  className="location-card"
                  onClick={() => openLocationModal(location)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="location-image-container">
                    <img
                      src={
                        location.image_path
                          ? `https://cdn.thesimpsonsapi.com/500${location.image_path}`
                          : `https://via.placeholder.com/300x200/FFD700/1E3A8A?text=${encodeURIComponent(
                              location.name.substring(0, 15)
                            )}&font-size=14`
                      }
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes("placeholder")) {
                          target.src = `https://via.placeholder.com/300x200/FFD700/1E3A8A?text=${encodeURIComponent(
                            location.name.substring(0, 15)
                          )}&font-size=14`;
                        }
                      }}
                      alt={location.name}
                      className="location-image"
                      loading="lazy"
                    />
                    <div className="location-overlay">
                      <span className="location-town">{location.town}</span>
                      <span className="location-use">{location.use}</span>
                    </div>
                  </div>
                  <div className="location-info">
                    <h3 className="location-title">{location.name}</h3>
                    <div className="location-details">
                      <span className="location-tag town">
                        📍 {location.town}
                      </span>
                      <span className="location-tag use">
                        🏢 {location.use}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalFilteredPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="pagination-button"
                >
                  « Anterior
                </button>

                <div className="pagination-info">
                  <span>
                    Página {currentPage} de {totalFilteredPages}
                  </span>
                  <span
                    style={{
                      fontSize: "0.9rem",
                      color: "#666",
                      marginLeft: "0.5rem",
                    }}
                  >
                    ({filteredLocations.length} resultados)
                  </span>
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalFilteredPages}
                  className="pagination-button"
                >
                  Siguiente »
                </button>
              </div>
            )}
          </div>
        )}

      {/* Estado vacío */}
      {!loading && !error && searchTerm.trim() === "" && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Comienza tu búsqueda</h3>
          <p>
            Escribe el nombre de una ubicación en el campo de búsqueda para
            explorar los lugares más emblemáticos de Springfield y el universo
            de Los Simpson.
          </p>
        </div>
      )}

      {/* Estado sin resultados */}
      {!loading &&
        !error &&
        searchTerm.trim() !== "" &&
        filteredLocations.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🏙️</div>
            <h3>No se encontraron ubicaciones</h3>
            <p>
              No hay resultados para "<strong>{searchTerm}</strong>". Intenta
              con otro término de búsqueda.
            </p>
          </div>
        )}

      {/* Modal de ubicación */}
      <LocationModal
        location={selectedLocation}
        isOpen={!!selectedLocation}
        onClose={closeLocationModal}
      />
    </section>
  );
}
