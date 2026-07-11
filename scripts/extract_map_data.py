import json
import os

MAP_DIR = r"C:\Users\Administrator\Downloads\ROE Maps"
OUTPUT_FILE = r"C:\Users\Administrator\Desktop\ROEDEX\src\data\staticMapNodes.json"
COLLISION_OUTPUT_FILE = r"C:\Users\Administrator\Desktop\ROEDEX\src\data\collisionData.json"

TARGET_LAYERS = {
    "Forest.tmj": ["Monster indicator", "Tree indicator", "Flowers", "treasure", "Rocks", "bushes", "bushes2", "Free zone indicator", "MAIN PATH", "SECONDARY PATH"],
    "Mine_bottom.tmj": ["ore", "monster"],
    "Mine_top.tmj": ["rough"] # Maybe rough is ore? We'll see.
}

TARGET_COLLISION_LAYERS = {
    "Forest.tmj": ["stumpcollider", "Cliffs1", "Cliffs2", "RiverCollisions", "RocksCollider"],
    "Mine_bottom.tmj": [],
    "Mine_top.tmj": []
}

def extract_nodes():
    all_nodes = {}
    all_collisions = {}
    
    for map_file in TARGET_LAYERS.keys():
        target_layers = TARGET_LAYERS[map_file]
        collision_layers = TARGET_COLLISION_LAYERS.get(map_file, [])
        path = os.path.join(MAP_DIR, map_file)
        if not os.path.exists(path):
            print(f"Skipping {map_file}, not found.")
            continue
            
        print(f"Parsing {map_file}...")
        with open(path, 'r', encoding='utf-8') as f:
            map_data = json.load(f)
            
        map_name = map_file.replace(".tmj", "")
        all_nodes[map_name] = {}
        all_collisions[map_name] = {}
        
        def process_layers(layers):
            for l in layers:
                if l.get("type") == "group":
                    process_layers(l.get("layers", []))
                elif l.get("type") == "tilelayer":
                    name = l.get("name")
                    if name in target_layers:
                        if name not in all_nodes[map_name]:
                            all_nodes[map_name][name] = []
                        
                        chunks = l.get("chunks", [])
                        for c in chunks:
                            cx = c.get("x", 0)
                            cy = c.get("y", 0)
                            cwidth = c.get("width", 0)
                            data = c.get("data", [])
                            
                            for i, tile_id in enumerate(data):
                                if tile_id != 0:
                                    rel_x = i % cwidth
                                    rel_y = i // cwidth
                                    abs_x = cx + rel_x
                                    abs_y = cy + rel_y
                                    all_nodes[map_name][name].append({"x": abs_x, "y": abs_y, "id": tile_id})
                                    
                elif l.get("type") == "objectgroup":
                    name = l.get("name")
                    if name in collision_layers:
                        if name not in all_collisions[map_name]:
                            all_collisions[map_name][name] = []
                        
                        objects = l.get("objects", [])
                        for obj in objects:
                            # We keep the basic bounding box and polygon if it exists
                            col_obj = {
                                "id": obj.get("id"),
                                "x": obj.get("x"),
                                "y": obj.get("y"),
                                "width": obj.get("width"),
                                "height": obj.get("height")
                            }
                            if "polygon" in obj:
                                col_obj["polygon"] = obj["polygon"]
                            all_collisions[map_name][name].append(col_obj)

        process_layers(map_data.get("layers", []))
        
        # Print summary
        print("  -- Nodes --")
        for k, v in all_nodes[map_name].items():
            print(f"  {k}: {len(v)} nodes")
        print("  -- Collisions --")
        for k, v in all_collisions[map_name].items():
            print(f"  {k}: {len(v)} objects")

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as out:
        json.dump(all_nodes, out, separators=(',', ':'))
    with open(COLLISION_OUTPUT_FILE, 'w', encoding='utf-8') as out2:
        json.dump(all_collisions, out2, separators=(',', ':'))
        
    print(f"Extraction complete! Saved to {OUTPUT_FILE} and {COLLISION_OUTPUT_FILE}")

if __name__ == "__main__":
    extract_nodes()
