// DEPRECATED: Use useI18n hook instead
// This file is kept for backward compatibility during migration
import { useLegacyLabels } from './hooks/useLegacyLabels';

// For backward compatibility, export a function that returns the labels
export const getLabels = () => {
  // This will only work inside a React component
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useLegacyLabels();
};

// Legacy static export (deprecated)
const labels = {
  add: "Adauga",
  MaterialListView: "Materiale",
  salveaza: "Salveaza",
  stare: "Stare",
  tip: "Tip",
  confirm: "Confirma",
  detaliiMaterial: "Detalii material",
  descriere: "Descriere",
  nume: "Nume",
  createdAt: "Creat la",
  updatedAt: "Modificat la",
  componente: "Componente",
  filtruStare: "Filtru stare",
  filtruData: "Filtru data",
  demo: "DEMO",
  scan: "Scaneaza QR",
  adauga: "Adauga material",
  detalii: "Detalii material",
  sterge: "Sterge material",
  adaugaComponenta: "Adauga componenta prin scanare QR",
  exportEticheta: "Exporta eticheta",
  type: "Tip Material",
  cod_unic_aviz: "Cod Unic Aviz/Număr Factură",
  specie: "Specie Lemn",
  data: "Data",
  apv: "APV",
  lat: "Latitudine",
  log: "Longitudine",
  nr_placuta_rosie: "Număr Placuta Rosie",
  lungime: "Lungime",
  diametru: "Diametru",
  volum_placuta_rosie: "Volum Placuta Rosie",
  volum_total: "Volum Total",
  volum_net_paletizat: "Volum Net Paletizat",
  volum_brut_paletizat: "Volum Brut Paletizat",
  nr_bucati: "Număr Bucăți",
  observatii: "Observații",
};

export default labels;