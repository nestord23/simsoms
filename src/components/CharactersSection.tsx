import { useState, useEffect, useCallback } from "react";
import type { Character, ApiResponse } from "../types";

export default function CharactersSection() {
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar todos los personajes (para búsqueda local)
  const loadAllCharacters = async () => {
    setLoading(true);
    setError(null);
    const allChars: Character[] = [];

    try {
      const baseUrl =
        import.meta.env.VITE_API_BASE_URL || "https://thesimpsonsapi.com/api";
      let page = 1;
      let hasMore = true;

      // Cargar las primeras 5 páginas para tener suficientes personajes para búsqueda
      while (hasMore && page <= 5) {
        const response = await fetch(`${baseUrl}/characters?page=${page}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();
        allChars.push(...data.results);

        hasMore = data.next !== null;
        page++;
      }

      setAllCharacters(allChars);
      setFilteredCharacters(allChars.slice(0, 20)); // Mostrar los primeros 20
      setTotalPages(Math.ceil(allChars.length / 20));
      setCurrentPage(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setAllCharacters([]);
      setFilteredCharacters([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para filtrar personajes por nombre
  const filterCharacters = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        // Si no hay búsqueda, mostrar todos los personajes paginados
        const startIndex = (currentPage - 1) * 20;
        const endIndex = startIndex + 20;
        setFilteredCharacters(allCharacters.slice(startIndex, endIndex));
        setTotalPages(Math.ceil(allCharacters.length / 20));
      } else {
        // Filtrar por nombre (insensible a mayúsculas/minúsculas)
        const query = searchQuery.toLowerCase();
        const filtered = allCharacters.filter((character) =>
          character.name.toLowerCase().includes(query)
        );
        setFilteredCharacters(filtered);
        setTotalPages(Math.ceil(filtered.length / 20));
        setCurrentPage(1);
      }
    },
    [allCharacters, currentPage]
  );

  // Cargar personajes iniciales
  useEffect(() => {
    loadAllCharacters();
  }, []);

  // Efecto para filtrar cuando cambia el término de búsqueda
  useEffect(() => {
    if (allCharacters.length > 0) {
      filterCharacters(searchTerm);
    }
  }, [searchTerm, allCharacters, filterCharacters]);

  // Función para manejar la búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterCharacters(searchTerm);
  };

  // Función para cambiar página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (!searchTerm.trim()) {
      // Si no hay búsqueda, paginar todos los personajes
      const startIndex = (page - 1) * 20;
      const endIndex = startIndex + 20;
      setFilteredCharacters(allCharacters.slice(startIndex, endIndex));
    }
  };

  // Función para obtener la URL de imagen según documentación oficial
  const getImageUrl = (
    imagePath: string,
    requestedSize?: "small" | "medium" | "large"
  ) => {
    if (!imagePath) return "/placeholder-character.jpg";

    const baseImageUrl =
      import.meta.env.VITE_API_IMAGES_BASE_URL ||
      "https://cdn.thesimpsonsapi.com";

    // Mapear tamaños según documentación oficial
    const sizeMap = {
      small: import.meta.env.VITE_IMAGE_SIZE_SMALL || "200",
      medium: import.meta.env.VITE_IMAGE_SIZE_MEDIUM || "500",
      large: import.meta.env.VITE_IMAGE_SIZE_LARGE || "1280",
    };

    const size = sizeMap[requestedSize || "medium"];

    // Formato correcto según docs: https://cdn.thesimpsonsapi.com/{size}{image_path}
    // NO hay slash entre {size} e {image_path}
    return `${baseImageUrl}/${size}${imagePath}`;
  };

  // Componente de imagen con manejo de errores mejorado
  const CharacterImage = ({
    character,
    index,
  }: {
    character: Character;
    index: number;
  }) => {
    const [imgSrc, setImgSrc] = useState(
      getImageUrl(character.portrait_path, "small")
    );
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleImageError = () => {
      console.log(`Error cargando imagen para ${character.name}:`, imgSrc);
      if (!hasError) {
        setHasError(true);
        // Placeholder más atractivo con el nombre del personaje
        const shortName = character.name.split(" ")[0]; // Solo primer nombre
        setImgSrc(
          `https://via.placeholder.com/500x600/FFD700/1E3A8A?text=${encodeURIComponent(
            shortName
          )}&font-size=24`
        );
      }
      setIsLoading(false);
    };

    const handleImageLoad = () => {
      setIsLoading(false);
    };

    return (
      <div className="character-image-wrapper" style={{ position: "relative" }}>
        {isLoading && !hasError && (
          <div className="image-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
        <img
          src={imgSrc}
          alt={character.name}
          className={`character-image ${hasError ? "placeholder-image" : ""}`}
          loading="lazy"
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{
            animationDelay: `${index * 0.1}s`,
            opacity: isLoading ? 0.5 : 1,
            transition: "opacity 0.3s ease",
          }}
        />
      </div>
    );
  };

  return (
    <section className="section characters-section">
      <h2 className="section-title">Personajes</h2>
      <p className="section-description">
        Conoce a todos los habitantes de Springfield
      </p>

      {/* Buscador */}
      <div className="search-container">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar personajes... (ej: Homer, Marge, Bart)"
              className="search-input"
            />
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? "🔄" : "🔍"}
            </button>
          </div>
        </form>

        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              setCurrentPage(1);
              const startIndex = 0;
              const endIndex = 20;
              setFilteredCharacters(allCharacters.slice(startIndex, endIndex));
              setTotalPages(Math.ceil(allCharacters.length / 20));
            }}
            className="clear-search"
          >
            Mostrar todos los personajes
          </button>
        )}
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Buscando personajes...</p>
        </div>
      )}

      {/* Estado de error */}
      {error && (
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={() => loadAllCharacters()}>Reintentar</button>
        </div>
      )}

      {/* Resultados */}
      {!loading && !error && filteredCharacters.length > 0 && (
        <div className="characters-results">
          <div className="results-header">
            <p className="results-count">
              {searchTerm
                ? `Se encontraron ${filteredCharacters.length} personajes para "${searchTerm}"`
                : `Mostrando ${filteredCharacters.length} personajes`}
            </p>
          </div>

          <div className="characters-grid">
            {filteredCharacters.map((character: Character, index: number) => (
              <div
                key={character.id}
                className="character-card clickable"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="character-image-container">
                  <CharacterImage character={character} index={index} />
                  <div className="character-status">{character.status}</div>
                </div>

                <div className="character-info">
                  <h3 className="character-name">{character.name}</h3>

                  <div className="character-details">
                    {character.gender && (
                      <span className="character-tag gender">
                        {character.gender}
                      </span>
                    )}
                    {character.occupation && (
                      <span className="character-tag occupation">
                        {character.occupation}
                      </span>
                    )}
                  </div>

                  {character.first_appearance_ep && (
                    <p className="character-appearance">
                      <strong>Primera aparición:</strong>{" "}
                      {character.first_appearance_ep}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
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
                  Página {currentPage} de {totalPages}
                </span>
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="pagination-button"
              >
                Siguiente »
              </button>
            </div>
          )}
        </div>
      )}

      {/* Estado vacío */}
      {!loading && !error && filteredCharacters.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No se encontraron personajes</h3>
          <p>
            {searchTerm
              ? `No hay resultados para "${searchTerm}". Intenta con otro término.`
              : "No hay personajes disponibles en este momento."}
          </p>
        </div>
      )}
    </section>
  );
}
