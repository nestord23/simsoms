import { useEffect } from "react";
import type { Location } from "../types";

interface LocationModalProps {
  location: Location | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationModal({
  location,
  isOpen,
  onClose,
}: LocationModalProps) {
  // Manejar tecla ESC para cerrar el modal y control de scroll
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      // Guardar la posición actual del scroll
      const scrollY = window.scrollY;
      const body = document.body;
      const html = document.documentElement;

      // Bloquear scroll completamente
      document.addEventListener("keydown", handleEscKey);
      body.classList.add("modal-open");
      body.style.top = `-${scrollY}px`;
      body.style.position = "fixed";
      body.style.width = "100%";
      html.style.overflow = "hidden";

      // Restaurar posición cuando se cierre
      return () => {
        document.removeEventListener("keydown", handleEscKey);
        body.classList.remove("modal-open");
        body.style.top = "";
        body.style.position = "";
        body.style.width = "";
        html.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen, onClose]);

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen || !location) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content location-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="location-modal-content">
          <h2 className="location-modal-title">{location.name}</h2>

          <div className="location-modal-two-columns">
            {/* Columna Izquierda - Información Principal */}
            <div className="location-modal-left-column">
              <div className="location-info-section">
                <h3 className="section-title">📍 Información Principal</h3>

                <div className="location-info-item">
                  <div className="info-icon">🏙️</div>
                  <div className="info-content">
                    <h4>Ciudad</h4>
                    <p>{location.town}</p>
                  </div>
                </div>

                <div className="location-info-item">
                  <div className="info-icon">🏢</div>
                  <div className="info-content">
                    <h4>Tipo de Lugar</h4>
                    <p>{location.use}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha - Descripción y Detalles */}
            <div className="location-modal-right-column">
              <div className="location-info-section">
                <h3 className="section-title">📝 Descripción</h3>

                <div className="location-description">
                  <p>
                    <strong>{location.name}</strong> es{" "}
                    {location.use.toLowerCase()}
                    ubicado en <strong>{location.town}</strong>. Esta es una de
                    las ubicaciones icónicas del universo de Los Simpson.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
