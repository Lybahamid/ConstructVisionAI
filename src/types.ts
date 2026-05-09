/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface Detection {
  label: string;
  confidence: number;
  bbox: BoundingBox;
}

export interface Violation {
  id: string;
  timestamp: string;
  type: string;
  confidence: number;
  bbox: BoundingBox;
  thumbnailUrl?: string;
  workerId?: string;
}

export interface SiteStats {
  totalDetections: number;
  violationsCount: number;
  complianceRate: number;
  classCounts: Record<string, number>;
}
