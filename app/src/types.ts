export interface Material {
    _id: string;
    humanId?: string;
    id?: string;
    type: string;
    cod_unic_aviz?: string;
    specie: string;
    data?: string;
    apv?: string;
    lat?: string;
    log?: string;
    nr_placuta_rosie?: string;
    lungime?: string;
    diametru?: string;
    volum_placuta_rosie?: string;
    volum_total?: string;
    volum_net_paletizat?: string;
    volum_brut_paletizat?: string;/*  */
    nr_bucati?: string;
    observatii?: string;
    componente?: string[];
}