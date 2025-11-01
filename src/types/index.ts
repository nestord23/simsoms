// Interfaces para los datos de la API real de Los Simpsons

export interface Character {
  id: number;
  age?: number;
  birthdate?: string;
  gender: string;
  name: string;
  occupation?: string;
  portrait_path: string;
  phrases?: string[];
  status: string;
  description?: string;
  first_appearance_ep?: string;
  first_appearance_sh?: string;
}

export interface ApiResponse {
  count: number;
  next: string | null;
  prev: string | null;
  pages: number;
  results: Character[];
}

// Interfaces para episodios
export interface Episode {
  id: number;
  airdate: string;
  episode_number: number;
  image_path: string;
  name: string;
  season: number;
  synopsis: string;
}

export interface EpisodesApiResponse {
  count: number;
  next: string | null;
  prev: string | null;
  pages: number;
  results: Episode[];
}

// Interfaces para ubicaciones
export interface Location {
  id: number;
  name: string;
  image_path: string;
  town: string;
  use: string;
}

export interface LocationsApiResponse {
  count: number;
  next: string | null;
  prev: string | null;
  pages: number;
  results: Location[];
}

// Tipos para navegación
export type SectionType = "home" | "characters" | "episodes" | "locations";

// Props para componentes
export interface HeaderProps {
  currentSection: SectionType;
  onSectionChange: (section: SectionType) => void;
}
