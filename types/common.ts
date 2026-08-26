export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type Status = 'active' | 'inactive' | 'resolved' | 'pending';

export type LatLng = {
  lat: number;
  lng: number;
};

export type BoundingBox = {
  north: number;
  south: number;
  east: number;
  west: number;
};
