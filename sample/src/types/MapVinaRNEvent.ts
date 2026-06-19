import { type SyntheticEvent } from "react";

export type MapVinaRNEvent<
  T extends string,
  P = GeoJSON.Feature,
  V = Element,
> = SyntheticEvent<V, { type: T; payload: P }>;
