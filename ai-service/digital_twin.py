import networkx as nx
import json, os, random
from datetime import datetime

G = nx.Graph()
# Build from railway_sections
sections = []
try:
    with open(os.path.join(os.path.dirname(__file__), "../backend/data/railway_sections.json")) as f:
        sections=json.load(f)
except:
    try:
        with open(os.path.join(os.path.dirname(__file__), "historical_operations.csv")) as f: pass
        sections=[
            {"id":"SEC001","name":"NDLS - AGC","stations":["New Delhi","Mathura","Agra Cantt"]},
            {"id":"SEC002","name":"AGC - BPL","stations":["Agra","Gwalior","Jhansi","Bhopal"]},
        ]
    except: sections=[]

# fallback synthetic sections if still empty
if not sections:
    sections=[{"id":f"SEC{i:03d}","name":f"SEC{i}","stations":[f"S{i}A", f"S{i}B"]} for i in range(1,6)]

for sec in sections:
    stations=sec.get("stations",[sec["id"]+"-A", sec["id"]+"-B"])
    for s in stations:
        G.add_node(s, type="station", zone=sec.get("zone","NR"))
    # add junction nodes for sections with >2 stations
    for i in range(len(stations)-1):
        G.add_edge(stations[i], stations[i+1], sectionId=sec["id"], sectionName=sec.get("name", sec["id"]), lengthKm=sec.get("lengthKm",100))

# Assets
assets=[]
try:
    with open(os.path.join(os.path.dirname(__file__), "../backend/data/assets.json")) as f:
        assets_data=json.load(f)
    for a in assets_data:
        assets.append({**a, "twinState": "AVAILABLE", "history": ["AVAILABLE"]})
except:
    assets=[{"id":f"AST{i:03d}","name":f"TRACK Km {i}","type":"TRACK","sectionId":"SEC001","twinState":"AVAILABLE","history":["AVAILABLE"]} for i in range(1,10)]

# if assets empty, use dummy
if not assets:
    assets=[{"id":"AST001","name":"TRACK","type":"TRACK","sectionId":"SEC001","twinState":"AVAILABLE","history":["AVAILABLE"]}]

def get_graph():
    nodes=[{"id":n, **G.nodes[n]} for n in G.nodes]
    edges=[{"source":u,"target":v, **G.edges[u,v]} for u,v in G.edges]
    return {"nodes":nodes, "edges":edges, "stats":{"stations": len([n for n in G.nodes if G.nodes[n].get("type")=="station"]), "sections": len(edges)}}

def get_assets():
    return assets

def get_asset(asset_id):
    for a in assets:
        if a["id"]==asset_id: return a
    return None

def transition(asset_id, new_state):
    a=get_asset(asset_id)
    if not a: return None
    valid=["AVAILABLE","UNDER_MAINTENANCE","BLOCKED","DEGRADED"]
    if new_state not in valid: return None
    a["twinState"]=new_state
    a["history"].append(f"{new_state}@{datetime.now().isoformat()}")
    if len(a["history"])>20: a["history"]=a["history"][-20:]
    return a

def block_lifecycle(section_id, asset_ids, action="start"):
    # When block starts: AVAILABLE -> BLOCKED -> UNDER_MAINTENANCE -> AVAILABLE (on complete)
    results=[]
    for aid in asset_ids:
        a=get_asset(aid)
        if not a: continue
        if action=="start":
            # AVAILABLE -> BLOCKED
            if a["twinState"]=="AVAILABLE":
                transition(aid, "BLOCKED")
                results.append({"asset":aid, "from":"AVAILABLE","to":"BLOCKED"})
        elif action=="maintenance":
            # BLOCKED -> UNDER_MAINTENANCE
            if a["twinState"]=="BLOCKED":
                transition(aid, "UNDER_MAINTENANCE")
                results.append({"asset":aid, "from":"BLOCKED","to":"UNDER_MAINTENANCE"})
        elif action=="complete":
            # UNDER_MAINTENANCE/BLOCKED -> AVAILABLE
            transition(aid, "AVAILABLE")
            results.append({"asset":aid, "to":"AVAILABLE"})
        elif action=="degrade":
            transition(aid, "DEGRADED")
            results.append({"asset":aid, "to":"DEGRADED"})
    return results

def metrics():
    counts={}
    for a in assets:
        counts[a["twinState"]]=counts.get(a["twinState"],0)+1
    return {"totalAssets": len(assets), "byState": counts, "graphNodes": G.number_of_nodes(), "graphEdges": G.number_of_edges()}
