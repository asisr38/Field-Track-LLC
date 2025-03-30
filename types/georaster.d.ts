declare module "georaster" {
  export interface GeoRasterData {
    noDataValue: number;
    pixelWidth: number;
    pixelHeight: number;
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    values: number[][];
  }

  export default function parseGeoraster(
    arrayBuffer: ArrayBuffer
  ): Promise<GeoRasterData>;
}

declare module "georaster-layer-for-leaflet" {
  import { Layer } from "leaflet";

  export interface GeoRasterLayerOptions {
    georaster: any;
    opacity?: number;
    resolution?: number;
    debugLevel?: number;
    pane?: string;
    colorModel?: {
      min: number;
      max: number;
      colors: string[];
    };
    pixelValuesToColorFn?: (values: number[]) => string;
  }

  export default class GeoRasterLayer extends Layer {
    constructor(options: GeoRasterLayerOptions);
  }
}
