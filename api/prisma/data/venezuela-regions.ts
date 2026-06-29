export interface RegionSeed {
  code: string;
  name: string;
}

/** Venezuelan states + Distrito Capital — ISO-style codes for multi-country reuse. */
export const VENEZUELA_REGIONS: readonly RegionSeed[] = [
  { code: 'AMA', name: 'Amazonas' },
  { code: 'ANZ', name: 'Anzoátegui' },
  { code: 'APU', name: 'Apure' },
  { code: 'ARA', name: 'Aragua' },
  { code: 'BAR', name: 'Barinas' },
  { code: 'BOL', name: 'Bolívar' },
  { code: 'CAR', name: 'Carabobo' },
  { code: 'COJ', name: 'Cojedes' },
  { code: 'DTA', name: 'Delta Amacuro' },
  { code: 'DC', name: 'Distrito Capital' },
  { code: 'FAL', name: 'Falcón' },
  { code: 'GUA', name: 'Guárico' },
  { code: 'LAR', name: 'Lara' },
  { code: 'MER', name: 'Mérida' },
  { code: 'MIR', name: 'Miranda' },
  { code: 'MON', name: 'Monagas' },
  { code: 'NES', name: 'Nueva Esparta' },
  { code: 'POR', name: 'Portuguesa' },
  { code: 'SUC', name: 'Sucre' },
  { code: 'TAC', name: 'Táchira' },
  { code: 'TRU', name: 'Trujillo' },
  { code: 'VAR', name: 'La Guaira' },
  { code: 'YAR', name: 'Yaracuy' },
  { code: 'ZUL', name: 'Zulia' },
] as const;

export const VENEZUELA_COUNTRY = {
  code: 'VEN',
  name: 'Venezuela',
} as const;

export const VENEZUELA_EARTHQUAKE_2026 = {
  name: 'Terremoto Venezuela 2026',
  type: 'EARTHQUAKE' as const,
  startDate: new Date('2026-06-28T00:00:00.000Z'),
} as const;
