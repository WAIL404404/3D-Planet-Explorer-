
import type { Feature, FeatureCollection as GeoJSONFeatureCollection, Geometry } from 'geojson';

export interface CountryProperties {
  name: string;
}

export type Country = Feature<Geometry, CountryProperties>;

export type FeatureCollection = GeoJSONFeatureCollection<Geometry, CountryProperties>;
