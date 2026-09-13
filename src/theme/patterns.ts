export type BackgroundPatternId =
  | 'none'
  | 'waves'
  | 'grid'
  | 'dots'
  | 'mesh'
  | 'hexagons'
  | 'circuit'
  | 'stripes';

export interface BackgroundPatternConfig {
  id: BackgroundPatternId;
  name: string;
  description: string;
  category?: string;
}

export const BACKGROUND_PATTERNS: BackgroundPatternConfig[] = [
  {
    id: 'none',
    name: 'Pure Color (No Pattern)',
    description: 'Clean solid & gradient canvas with zero pattern lines or overlays',
  },
  {
    id: 'waves',
    name: 'Silk Waves',
    description: 'Luminous flowing ambient silk ribbons in your chosen color',
  },
  {
    id: 'grid',
    name: 'Cyber Grid',
    description: 'Minimalist futuristic grid lines tinted in your selected color',
  },
  {
    id: 'dots',
    name: 'Dot Matrix',
    description: 'Crisp high-tech dot matrix array in your chosen color',
  },
  {
    id: 'hexagons',
    name: 'Hex Honeycomb',
    description: 'Geometric honeycomb hexagon mesh illuminated in your color',
  },
  {
    id: 'mesh',
    name: 'Isometric Mesh',
    description: 'Futuristic angled diamond wireframe in your chosen color',
  },
  {
    id: 'circuit',
    name: 'Circuit Traces',
    description: 'Microchip circuit nodes & pathways glowing in your chosen color',
  },
  {
    id: 'stripes',
    name: 'Diagonal Lines',
    description: 'Modern 45° angled velocity lines in your chosen color',
  },
];
