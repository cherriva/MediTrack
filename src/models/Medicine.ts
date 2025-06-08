// src/models/Medicine.ts

export interface MedicineInput {
  id: string;                  // UUID generado en el front
  name: string;
  source: 'manual' | 'cima';
  cima_id?: string;
  dose?: string;
  via_admin?: string;
  form?: string;
  lab?: string;
  needs_rx?: boolean;
  image_url?: string;
  leaflet_url?: string;
}

