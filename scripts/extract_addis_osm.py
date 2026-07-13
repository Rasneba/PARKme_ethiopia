"""
Extract Addis Ababa roads and buildings from a local Geofabrik PBF file.

Optimized for small output size (< 3 MB total) suitable for static web serving.

Usage:
  1. Download ethiopia-latest.osm.pbf to temp/ folder
  2. Run: python scripts/extract_addis_osm.py

Output: public/osm-roads.geojson, public/osm-buildings.geojson
"""
import json
import math
import sys
import time
from pathlib import Path

import osmium

BBOX_SOUTH = 8.90
BBOX_WEST = 38.70
BBOX_NORTH = 9.05
BBOX_EAST = 38.87

MAJOR_ROADS = {
    "motorway", "motorway_link", "trunk", "trunk_link",
    "primary", "primary_link", "secondary", "secondary_link",
    "tertiary", "tertiary_link",
    "residential", "unclassified", "service", "living_street",
}

COORD_PREC = 4
MAX_NODES_PER_WAY = 40
MIN_BUILDING_AREA = 250.0


def in_bbox(lon, lat):
    return BBOX_SOUTH <= lat <= BBOX_NORTH and BBOX_WEST <= lon <= BBOX_EAST


def r4(v):
    return round(v, COORD_PREC)


def simplify_coords(coords):
    if len(coords) <= MAX_NODES_PER_WAY:
        return [[r4(x), r4(y)] for x, y in coords]
    step = math.ceil(len(coords) / MAX_NODES_PER_WAY)
    return [[r4(x), r4(y)] for i, (x, y) in enumerate(coords) if i % step == 0]


def ring_area_sqm(coords):
    n = len(coords)
    if n < 3:
        return 0.0
    a = 0.0
    for i in range(n):
        j = (i + 1) % n
        a += coords[i][0] * coords[j][1]
        a -= coords[j][0] * coords[i][1]
    return abs(a) * 111319.9 * 111319.9 * math.cos(math.radians(9.0))


class OsmExtractor(osmium.SimpleHandler):
    def __init__(self):
        super().__init__()
        self.nodes = {}
        self.roads = []
        self.buildings = []
        self.node_count = 0
        self.road_count = 0
        self.building_count = 0
        self.t = time.time()

    def node(self, n):
        if in_bbox(n.location.lon, n.location.lat):
            self.nodes[n.id] = (n.location.lon, n.location.lat)
            self.node_count += 1
            if self.node_count % 200000 == 0:
                elapsed = time.time() - self.t
                print(f"  Nodes: {self.node_count:,} ({elapsed:.0f}s)")

    def way(self, w):
        tags = w.tags
        highway = tags.get("highway", "")
        building = tags.get("building", "")

        if highway in MAJOR_ROADS:
            name = tags.get("name", "")
            if name or highway not in ("residential", "unclassified", "service", "living_street"):
                coords = []
                for ref in w.nodes:
                    if ref.location.valid():
                        lon, lat = ref.location.lon, ref.location.lat
                        pos = self.nodes.get(ref.ref, (lon, lat))
                        if pos and in_bbox(pos[0], pos[1]):
                            coords.append(pos)
                if len(coords) >= 2:
                    props = {"c": highway}
                    if name:
                        props["n"] = name
                    self.roads.append({
                        "type": "Feature",
                        "properties": props,
                        "geometry": {
                            "type": "LineString",
                            "coordinates": simplify_coords(coords),
                        },
                    })
                    self.road_count += 1

        if building:
            coords = []
            for ref in w.nodes:
                if ref.location.valid():
                    lon, lat = ref.location.lon, ref.location.lat
                    pos = self.nodes.get(ref.ref, (lon, lat))
                    if pos and in_bbox(pos[0], pos[1]):
                        coords.append(pos)
            if len(coords) >= 4:
                if coords[0] != coords[-1]:
                    coords.append(coords[0])
                if ring_area_sqm(coords) >= MIN_BUILDING_AREA:
                    simplified = simplify_coords(coords)
                    if len(simplified) >= 4:
                        self.buildings.append({
                            "type": "Feature",
                            "geometry": {
                                "type": "Polygon",
                                "coordinates": [simplified],
                            },
                        })
                        self.building_count += 1

        total = self.road_count + self.building_count
        if total % 10000 == 0 and total > 0:
            elapsed = time.time() - self.t
            print(f"  Roads: {self.road_count:,} | Buildings: {self.building_count:,} ({elapsed:.0f}s)")


def main():
    project_root = Path(__file__).resolve().parent.parent
    pbf_path = project_root / "temp" / "ethiopia-latest.osm.pbf"

    if not pbf_path.exists():
        print(f"ERROR: PBF not found at {pbf_path}")
        print("Download from: https://download.geofabrik.de/africa/ethiopia-latest.osm.pbf")
        sys.exit(1)

    print(f"File: {pbf_path.stat().st_size / 1024 / 1024:.0f} MB")
    print(f"BBox: {BBOX_SOUTH},{BBOX_WEST} -> {BBOX_NORTH},{BBOX_EAST}")
    print()

    t0 = time.time()
    handler = OsmExtractor()
    handler.apply_file(str(pbf_path), locations=True, idx="flex_mem")
    t1 = time.time()

    print(f"\nParsed in {t1 - t0:.0f}s | Nodes: {handler.node_count:,} | Roads: {handler.road_count:,} | Buildings: {handler.building_count:,}")

    public_dir = project_root / "public"
    public_dir.mkdir(exist_ok=True)

    roads_path = public_dir / "osm-roads.geojson"
    with open(roads_path, "w") as f:
        json.dump({"type": "FeatureCollection", "features": handler.roads}, f, separators=(",", ":"))
    print(f"  -> {roads_path.name}: {roads_path.stat().st_size / 1024:.0f} KB")

    buildings_path = public_dir / "osm-buildings.geojson"
    with open(buildings_path, "w") as f:
        json.dump({"type": "FeatureCollection", "features": handler.buildings}, f, separators=(",", ":"))
    print(f"  -> {buildings_path.name}: {buildings_path.stat().st_size / 1024:.0f} KB")

    total = (roads_path.stat().st_size + buildings_path.stat().st_size) / 1024
    print(f"\nTotal: {total:.0f} KB")


if __name__ == "__main__":
    main()
