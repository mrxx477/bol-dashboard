// Hourly data for "Vandaag" (today)
export const hourlyDataToday = [
  { hour: '00:00', bestellingen: 0, omzet: 0, verkocht: 0 },
  { hour: '01:00', bestellingen: 0, omzet: 0, verkocht: 0 },
  { hour: '02:00', bestellingen: 0, omzet: 0, verkocht: 0 },
  { hour: '03:00', bestellingen: 0, omzet: 0, verkocht: 0 },
  { hour: '04:00', bestellingen: 0, omzet: 0, verkocht: 0 },
  { hour: '05:00', bestellingen: 0, omzet: 0, verkocht: 0 },
  { hour: '06:00', bestellingen: 0, omzet: 0, verkocht: 0 },
  { hour: '07:00', bestellingen: 0, omzet: 0, verkocht: 0 },
  { hour: '08:00', bestellingen: 2, omzet: 14.24, verkocht: 2 },
  { hour: '09:00', bestellingen: 2, omzet: 18.44, verkocht: 2 },
  { hour: '10:00', bestellingen: 2, omzet: 14.83, verkocht: 2 },
  { hour: '11:00', bestellingen: 2, omzet: 14.83, verkocht: 2 },
  { hour: '12:00', bestellingen: 2, omzet: 14.09, verkocht: 2 },
  { hour: '13:00', bestellingen: 1, omzet: 8.22, verkocht: 1 },
  { hour: '14:00', bestellingen: 0, omzet: 0, verkocht: 0 },
  { hour: '15:00', bestellingen: 0, omzet: 0, verkocht: 0 },
  { hour: '16:00', bestellingen: 0, omzet: 0, verkocht: 0 },
  { hour: '17:00', bestellingen: 0, omzet: 0, verkocht: 0 },
  { hour: '18:00', bestellingen: 0, omzet: 0, verkocht: 0 },
  { hour: '19:00', bestellingen: 0, omzet: 0, verkocht: 0 },
  { hour: '20:00', bestellingen: 0, omzet: 0, verkocht: 0 },
  { hour: '21:00', bestellingen: 0, omzet: 0, verkocht: 0 },
  { hour: '22:00', bestellingen: 0, omzet: 0, verkocht: 0 },
  { hour: '23:00', bestellingen: 0, omzet: 0, verkocht: 0 },
];

// Afgelopen 7 dagen — per day
export const weeklyData = [
  { dag: '25 jun', bestellingen: 8,  omzet: 62.34,  verkocht: 9  },
  { dag: '26 jun', bestellingen: 12, omzet: 94.21,  verkocht: 13 },
  { dag: '27 jun', bestellingen: 6,  omzet: 48.90,  verkocht: 7  },
  { dag: '28 jun', bestellingen: 15, omzet: 121.45, verkocht: 16 },
  { dag: '29 jun', bestellingen: 9,  omzet: 73.12,  verkocht: 10 },
  { dag: '30 jun', bestellingen: 11, omzet: 86.78,  verkocht: 12 },
  { dag: '01 jul', bestellingen: 11, omzet: 84.65,  verkocht: 11 },
];

// Afgelopen 28 dagen — weekly buckets
export const monthlyData = [
  { dag: 'wk 1', bestellingen: 48,  omzet: 378.20, verkocht: 52 },
  { dag: 'wk 2', bestellingen: 61,  omzet: 492.10, verkocht: 68 },
  { dag: 'wk 3', bestellingen: 55,  omzet: 441.80, verkocht: 59 },
  { dag: 'wk 4', bestellingen: 72,  omzet: 583.40, verkocht: 79 },
];

export const statsToday = {
  bestellingen: 11,
  omzet: 84.65,
  verkocht: 11,
};

// Meest verkocht — vandaag
export const topVerkocht = [
  { rank: 1, artikel: 'Gymston Weerstandsbanden S...', ean: '8719699763661', categorie: 'weerstandsband', volume: 5, emoji: '🏋️' },
  { rank: 2, artikel: 'Gymston - Weerstandsbanden...', ean: '8719699763111', categorie: 'weerstandsband', volume: 2, emoji: '🏋️' },
  { rank: 3, artikel: 'Wallix® Luxe Pasjeshouder -...', ean: '8720256153559', categorie: 'creditcardhouder', volume: 2, emoji: '💳' },
  { rank: 4, artikel: 'Statch Uitschuifbare...', ean: '8720256315278', categorie: 'creditcardhouder', volume: 1, emoji: '💳' },
  { rank: 5, artikel: 'Statch Portemonnee Luxe...', ean: '8720256315353', categorie: 'portemonnee', volume: 1, emoji: '👛' },
];

// Meest omzet — vandaag
export const topOmzet = [
  { rank: 1, artikel: 'Gymston Weerstandsbanden S...', ean: '8719699763661', categorie: 'weerstandsband', volume: 28.70, emoji: '🏋️' },
  { rank: 2, artikel: 'Wallix® Luxe Pasjeshouder -...', ean: '8720256153559', categorie: 'creditcardhouder', volume: 24.72, emoji: '💳' },
  { rank: 3, artikel: 'Statch Portemonnee Luxe...', ean: '8720256315353', categorie: 'portemonnee', volume: 14.83, emoji: '👛' },
  { rank: 4, artikel: 'Statch Uitschuifbare...', ean: '8720256315278', categorie: 'creditcardhouder', volume: 8.22, emoji: '💳' },
  { rank: 5, artikel: 'Gymston - Weerstandsbanden...', ean: '8719699763111', categorie: 'weerstandsband', volume: 8.18, emoji: '🏋️' },
];

export type OrderStatus = 'open' | 'verzonden' | 'geannuleerd';

export interface Order {
  bestelnummer: string;
  datum: string;
  productnaam: string;
  aantal: number;
  bedrag: number;
  status: OrderStatus;
}

export const orders: Order[] = [
  { bestelnummer: '7382910283', datum: '2026-07-01', productnaam: 'Gymston Weerstandsbanden Set', aantal: 1, bedrag: 28.70, status: 'open' },
  { bestelnummer: '7382910284', datum: '2026-07-01', productnaam: 'Wallix® Luxe Pasjeshouder', aantal: 2, bedrag: 49.44, status: 'open' },
  { bestelnummer: '7382910285', datum: '2026-07-01', productnaam: 'Gymston Weerstandsbanden Set', aantal: 1, bedrag: 28.70, status: 'verzonden' },
  { bestelnummer: '7382910286', datum: '2026-06-30', productnaam: 'Statch Portemonnee Luxe', aantal: 1, bedrag: 14.83, status: 'verzonden' },
  { bestelnummer: '7382910287', datum: '2026-06-30', productnaam: 'Gymston Weerstandsbanden Set', aantal: 1, bedrag: 28.70, status: 'verzonden' },
  { bestelnummer: '7382910288', datum: '2026-06-30', productnaam: 'Wallix® Luxe Pasjeshouder', aantal: 1, bedrag: 24.72, status: 'verzonden' },
  { bestelnummer: '7382910289', datum: '2026-06-29', productnaam: 'Statch Uitschuifbare Kaarthouder', aantal: 1, bedrag: 8.22, status: 'verzonden' },
  { bestelnummer: '7382910290', datum: '2026-06-29', productnaam: 'Gymston - Weerstandsbanden', aantal: 1, bedrag: 8.18, status: 'open' },
  { bestelnummer: '7382910291', datum: '2026-06-29', productnaam: 'Wallix® Luxe Pasjeshouder', aantal: 1, bedrag: 24.72, status: 'verzonden' },
  { bestelnummer: '7382910292', datum: '2026-06-28', productnaam: 'Gymston Weerstandsbanden Set', aantal: 2, bedrag: 57.40, status: 'verzonden' },
  { bestelnummer: '7382910293', datum: '2026-06-28', productnaam: 'Statch Portemonnee Luxe', aantal: 1, bedrag: 14.83, status: 'geannuleerd' },
  { bestelnummer: '7382910294', datum: '2026-06-27', productnaam: 'Wallix® Luxe Pasjeshouder', aantal: 2, bedrag: 49.44, status: 'verzonden' },
];

export type ProductStatus = 'actief' | 'inactief' | 'uitverkocht';

export interface Product {
  ean: string;
  titel: string;
  prijs: number;
  bolKosten: number;
  marge: number;
  voorraad: number;
  status: ProductStatus;
}

export const products: Product[] = [
  { ean: '8719699763661', titel: 'Gymston Weerstandsbanden Set (5 stuks)', prijs: 28.70, bolKosten: 4.88, marge: 35.2, voorraad: 84, status: 'actief' },
  { ean: '8719699763111', titel: 'Gymston Weerstandsbanden (losse set)', prijs: 8.18, bolKosten: 1.39, marge: 28.4, voorraad: 7, status: 'actief' },
  { ean: '8720256153559', titel: 'Wallix® Luxe Pasjeshouder RFID', prijs: 24.72, bolKosten: 4.20, marge: 41.3, voorraad: 112, status: 'actief' },
  { ean: '8720256315278', titel: 'Statch Uitschuifbare Kaarthouder', prijs: 8.22, bolKosten: 1.40, marge: 22.8, voorraad: 3, status: 'actief' },
  { ean: '8720256315353', titel: 'Statch Portemonnee Luxe Leer', prijs: 14.83, bolKosten: 2.52, marge: 38.6, voorraad: 46, status: 'actief' },
];

export interface InventoryItem {
  ean: string;
  titel: string;
  voorraad: number;
  minimum: number;
  inkomend: number;
  locatie: string;
  status: 'ok' | 'laag' | 'kritiek' | 'uitverkocht';
}

export const inventory: InventoryItem[] = [
  { ean: '8719699763661', titel: 'Gymston Weerstandsbanden Set', voorraad: 84, minimum: 20, inkomend: 0, locatie: 'FBB', status: 'ok' },
  { ean: '8719699763111', titel: 'Gymston Weerstandsbanden (los)', voorraad: 7, minimum: 15, inkomend: 50, locatie: 'FBB', status: 'laag' },
  { ean: '8720256153559', titel: 'Wallix® Luxe Pasjeshouder', voorraad: 112, minimum: 25, inkomend: 0, locatie: 'FBB', status: 'ok' },
  { ean: '8720256315278', titel: 'Statch Uitschuifbare Kaarthouder', voorraad: 3, minimum: 10, inkomend: 100, locatie: 'FBB', status: 'kritiek' },
  { ean: '8720256315353', titel: 'Statch Portemonnee Luxe', voorraad: 46, minimum: 15, inkomend: 0, locatie: 'FBB', status: 'ok' },
];

export const financialSummary = {
  omzetMaand: 2189.90,
  commissieMaand: 372.28,
  btwMaand: 380.70,
  uitbetalingEstimate: 1436.92,
};

export const financialMonthData = [
  { dag: '1 jun', omzet: 94.21, commissie: 16.02, btw: 16.38, netto: 61.81 },
  { dag: '2 jun', omzet: 62.34, commissie: 10.60, btw: 10.84, netto: 40.90 },
  { dag: '3 jun', omzet: 121.45, commissie: 20.65, btw: 21.12, netto: 79.68 },
  { dag: '4 jun', omzet: 84.90, commissie: 14.43, btw: 14.76, netto: 55.71 },
  { dag: '5 jun', omzet: 48.72, commissie: 8.28, btw: 8.47, netto: 31.97 },
  { dag: '6 jun', omzet: 108.33, commissie: 18.42, btw: 18.83, netto: 71.08 },
  { dag: '7 jun', omzet: 73.12, commissie: 12.43, btw: 12.71, netto: 47.98 },
  { dag: '8 jun', omzet: 95.44, commissie: 16.22, btw: 16.60, netto: 62.62 },
  { dag: '9 jun', omzet: 67.88, commissie: 11.54, btw: 11.80, netto: 44.54 },
  { dag: '10 jun', omzet: 142.10, commissie: 24.16, btw: 24.72, netto: 93.22 },
  { dag: '11 jun', omzet: 88.50, commissie: 15.05, btw: 15.39, netto: 58.06 },
  { dag: '12 jun', omzet: 54.20, commissie: 9.21, btw: 9.42, netto: 35.57 },
  { dag: '13 jun', omzet: 116.78, commissie: 19.85, btw: 20.31, netto: 76.62 },
  { dag: '14 jun', omzet: 79.34, commissie: 13.49, btw: 13.80, netto: 52.05 },
  { dag: '15 jun', omzet: 133.60, commissie: 22.71, btw: 23.24, netto: 87.65 },
  { dag: '16 jun', omzet: 91.22, commissie: 15.51, btw: 15.86, netto: 59.85 },
  { dag: '17 jun', omzet: 68.90, commissie: 11.71, btw: 11.98, netto: 45.21 },
  { dag: '18 jun', omzet: 104.55, commissie: 17.77, btw: 18.18, netto: 68.60 },
  { dag: '19 jun', omzet: 82.10, commissie: 13.96, btw: 14.28, netto: 53.86 },
  { dag: '20 jun', omzet: 57.44, commissie: 9.77, btw: 9.99, netto: 37.68 },
  { dag: '21 jun', omzet: 126.80, commissie: 21.56, btw: 22.06, netto: 83.18 },
  { dag: '22 jun', omzet: 72.30, commissie: 12.29, btw: 12.57, netto: 47.44 },
  { dag: '23 jun', omzet: 148.90, commissie: 25.31, btw: 25.90, netto: 97.69 },
  { dag: '24 jun', omzet: 86.78, commissie: 14.75, btw: 15.09, netto: 56.94 },
  { dag: '25 jun', omzet: 62.34, commissie: 10.60, btw: 10.84, netto: 40.90 },
  { dag: '26 jun', omzet: 94.21, commissie: 16.02, btw: 16.38, netto: 61.81 },
  { dag: '27 jun', omzet: 48.90, commissie: 8.31, btw: 8.51, netto: 32.08 },
  { dag: '28 jun', omzet: 121.45, commissie: 20.65, btw: 21.12, netto: 79.68 },
  { dag: '29 jun', omzet: 73.12, commissie: 12.43, btw: 12.71, netto: 47.98 },
  { dag: '30 jun', omzet: 86.78, commissie: 14.75, btw: 15.09, netto: 56.94 },
  { dag: '1 jul', omzet: 84.65, commissie: 14.39, btw: 14.73, netto: 55.53 },
];

// Keep old exports for compatibility with other pages
export const chartData = weeklyData.map(d => ({
  date: d.dag,
  omzet: d.omzet,
  bestellingen: d.bestellingen,
  verkocht: d.verkocht,
}));
