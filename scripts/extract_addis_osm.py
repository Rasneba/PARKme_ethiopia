"""
Extract Addis Ababa roads and buildings from a local Geofabrik PBF file.

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

# Addis Ababa bounding box: south, west, north, east
# Wider area to capture the full metro + surroundings
BBOX_SOUTH = 8.85
BBOX_WEST = 38.65
BBOX_NORTH = 9.10
BBOX_EAST = 38.92

ROAD_TAGS = {
    "motorway", "trunk", "primary", "secondary", "tertiary",
    "residential", "unclassified", "service", "living_street",
    "footway", "path", "cycleway", "pedestrian",
}

MAX_NODES_PER_WAY = 300


def in_bbox(lon, lat):
    return BBOX_SOUTH <= lat <= BBOX_NORTH and BBOX_WEST <= lon <= BBOX_EAST


def simplify_coords(coords):
    if len(coords) <= MAX_NODES_PER_WAY:
        return coords
    step = math.ceil(len(coords) / MAX_NODES_PER_WAY)
    return [coords[i] for i in range(0, len(coords), step)]


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
            if self.node_count % 100000 == 0:
                elapsed = time.time() - self.t
                print(f"  Nodes: {self.node_count:,} in bbox ({elapsed:.0f}s)")

    def way(self, w):
        tags = w.tags
        highway = tags.get("highway", "")
        building = tags.get("building", "")

        if highway in ROAD_TAGS:
            coords = []
            for ref in w.nodes:
                if ref.location.valid():
                    lon, lat = ref.location.lon, ref.location.lat
                    if in_bbox(lon, lat) or ref.ref in self.nodes:
                        pos = self.nodes.get(ref.ref, (lon, lat))
                        coords.append(list(pos))
            if len(coords) >= 2:
                self.roads.append({
                    "type": "Feature",
                    "properties": {
                        "class": highway,
                        "name": tags.get("name", ""),
                        "oneway": tags.get("oneway", ""),
                        "lanes": tags.get("lanes", ""),
                    },
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
                    if in_bbox(lon, lat) or ref.ref in self.nodes:
                        pos = self.nodes.get(ref.ref, (lon, lat))
                        coords.append(list(pos))
            if len(coords) >= 4:
                if coords[0] != coords[-1]:
                    coords.append(coords[0])
                props = {"name": tags.get("name", "")}
                if building != "yes":
                    props["type"] = building
                self.buildings.append({
                    "type": "Feature",
                    "properties": props,
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [coords],
                    },
                })
                self.building_count += 1

        if (self.road_count + self.building_count) % 5000 == 0 and (self.road_count + self.building_count) > 0:
            elapsed = time.time() - self.t
            print(f"  Roads: {self.road_count:,} | Buildings: {self.building_count:,} ({elapsed:.0f}s)")


def main():
    project_root = Path(__file__).resolve().parent.parent
    pbf_path = project_root / "temp" / "ethiopia-latest.osm.pbf"

    if not pbf_path.exists():
        print(f"ERROR: PBF file not found at {pbf_path}")
        print("Download it from: https://download.geofabrik.de/africa/ethiopia-latest.osm.pbf")
        print("Save it to the temp/ folder in the project root.")
        sys.exit(1)

    print(f"Processing: {pbf_path}")
    print(f"BBox: {BBOX_SOUTH},{BBOX_WEST} to {BBOX_NORTH},{BBOX_EAST} (Addis Ababa)")
    print(f"File size: {pbf_path.stat().st_size / 1024 / 1024:.0f} MB")
    print()

    t0 = time.time()
    handler = OsmExtractor()
    handler.apply_file(str(pbf_path), locations=True, idx="flex_mem")
    t1 = time.time()

    print(f"\nParsing complete in {t1 - t0:.0f}s")
    print(f"  Nodes in bbox: {handler.node_count:,}")
    print(f"  Roads: {handler.road_count:,}")
    print(f"  Buildings: {handler.building_count:,}")

    public_dir = project_root / "public"
    public_dir.mkdir(exist_ok=True)

    roads_geo = {"type": "FeatureCollection", "features": handler.roads}
    roads_path = public_dir / "osm-roads.geojson"
    with open(roads_path, "w") as f:
        json.dump(roads_geo, f, separators=(",", ":"))
    print(f"\n  -> {roads_path.name}: {roads_path.stat().st_size / 1024:.0f} KB")

    buildings_geo = {"type": "FeatureCollection", "features": handler.buildings}
    buildings_path = public_dir / "osm-buildings.geojson"
    with open(buildings_path, "w") as f:
        json.dump(buildings_geo, f, separators=(",", ":"))
    print(f"  -> {buildings_path.name}: {buildings_path.stat().st_size / 1024:.0f} KB")

    total = (roads_path.stat().st_size + buildings_path.stat().st_size) / 1024
    print(f"\nDone! Total: {total:.0f} KB in public/")


if __name__ == "__main__":
    main()
