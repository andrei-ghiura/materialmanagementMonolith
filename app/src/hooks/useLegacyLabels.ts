import { useTranslation } from 'react-i18next';

// Legacy label mapping for gradual migration
const LEGACY_LABEL_MAP: Record<string, string> = {
    'add': 'common.add',
    'MaterialListView': 'navigation.materials',
    'salveaza': 'common.save',
    'stare': 'material.state',
    'tip': 'material.type',
    'confirm': 'common.confirm',
    'detaliiMaterial': 'material.materialDetails',
    'descriere': 'material.description',
    'nume': 'material.name',
    'createdAt': 'material.createdAt',
    'updatedAt': 'material.updatedAt',
    'componente': 'material.components',
    'filtruStare': 'filters.stateFilter',
    'filtruData': 'filters.dateFilter',
    'demo': 'common.demo',
    'scan': 'material.scanQr',
    'adauga': 'common.add',
    'detalii': 'common.details',
    'sterge': 'common.delete',
    'adaugaComponenta': 'material.addComponent',
    'exportEticheta': 'material.exportLabel',
    'type': 'material.materialType',
    'cod_unic_aviz': 'material.uniqueCode',
    'specie': 'material.species',
    'data': 'material.date',
    'apv': 'material.apv',
    'lat': 'material.latitude',
    'log': 'material.longitude',
    'nr_placuta_rosie': 'material.redPlateNumber',
    'lungime': 'material.length',
    'diametru': 'material.diameter',
    'volum_placuta_rosie': 'material.redPlateVolume',
    'volum_total': 'material.totalVolume',
    'volum_net_paletizat': 'material.netPalletizedVolume',
    'volum_brut_paletizat': 'material.grossPalletizedVolume',
    'nr_bucati': 'material.pieces',
    'observatii': 'material.observations'
};

/**
 * Hook to get legacy labels with i18n support
 * This allows gradual migration from the old labels system
 */
export const useLegacyLabels = () => {
    const { t } = useTranslation();

    const getLabel = (key: string): string => {
        const i18nKey = LEGACY_LABEL_MAP[key];
        if (i18nKey) {
            return t(i18nKey);
        }

        // Fallback to key if not found in mapping
        return key;
    };

    // Create a labels object similar to the old one for compatibility
    const labels = new Proxy({}, {
        get: (target, prop: string) => {
            return getLabel(prop);
        }
    });

    return labels;
};

export default useLegacyLabels;
