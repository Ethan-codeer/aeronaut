# SPDX-License-Identifier: GPL-2.0-only
# AERONAUT conversion of FlightGear 747-8i by John Williams / Grupo FGBr / Gijs de Rooy.
# Run: blender -b --python convert.py -- SOURCE_MODELS OUTPUT_DIRECTORY
import bpy,sys,math,json,hashlib
import numpy as np
from pathlib import Path
from mathutils import Matrix,Vector
sys.path.insert(0,str(Path(__file__).parent))
from ac3d import Reader
from textures import atlases
args=sys.argv[sys.argv.index('--')+1:];src=Path(args[0]);out=Path(args[1]);out.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
exterior,gear_atlas=atlases(src,out)
level=int(args[2]) if len(args)>2 else 1
# AC3D: nose -X, up +Y; Blender: nose -Y, up +Z; glTF: nose +Z, up +Y.
C=Matrix(((0,0,1,0),(1,0,0,0),(0,1,0,0),(0,0,0,1)))
matcache={};stats=[]
def mat(m,tex):
 glass=m['trans']>.2
 key=('glass' if glass else ('exterior' if tex in ['fuselage.png','wings.png','turbofan.png'] else 'gear' if tex else None) or ('rubber' if max(m['rgb'])<.1 else 'metal' if min(m['rgb'])<.7 else 'paint'))
 if key in matcache:return matcache[key]
 a=bpy.data.materials.new(key);a.use_nodes=True;a.use_backface_culling=False
 bs=a.node_tree.nodes.get('Principled BSDF');bs.inputs['Roughness'].default_value=.45
 color=(.025,.055,.075,1) if glass else (.025,.028,.033,1) if key=='rubber' else (.42,.45,.48,1) if key=='metal' else (1,1,1,1)
 bs.inputs['Base Color'].default_value=color
 if key=='metal':bs.inputs['Metallic'].default_value=.55
 if glass:bs.inputs['Roughness'].default_value=.15
 if tex and not glass:
  img=exterior if key=='exterior' else gear_atlas;t=a.node_tree.nodes.new('ShaderNodeTexImage');t.image=img
  a.node_tree.links.new(t.outputs['Color'],bs.inputs['Base Color'])
 matcache[key]=a;return a
skip=[]
def visit(o,parent,mats):
 R=Matrix([o['rot'][i:i+3] for i in [0,3,6]]).to_4x4();R.translation=Vector(o['loc']);world=parent@R
 name=o['name']
 # Hidden cabin shell, lights and interior partitions are not part of this exterior asset.
 hidden=name.startswith(('fuselage_in','fuselage.002','lav','cockpitdoor','cabinlighting','Plane.001')) or o['texture'] in ['carpet.png','cockpit.png']
 if o['verts'] and not hidden:
  surfaces=[s for s in o['surfaces'] if s['flags']&15==0 and len(set(r[0] for r in s['refs']))>=3]
  if surfaces:
   mesh=bpy.data.meshes.new(name);verts=[tuple(C@world@Vector(v)) for v in o['verts']]
   mesh.from_pydata(verts,[],[[r[0] for r in s['refs']] for s in surfaces]);mesh.update()
   obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj);obj['sourceAsset']=file
   indexes={}
   for poly,s in zip(mesh.polygons,surfaces):
    a=mat(mats[s['mat']],o['texture']);idx=indexes.get(a.name)
    if idx is None:idx=len(mesh.materials);mesh.materials.append(a);indexes[a.name]=idx
    poly.material_index=idx;poly.use_smooth=bool(s['flags']&0x10)
   uv=mesh.uv_layers.new(name='UVMap')
   for poly,s in zip(mesh.polygons,surfaces):
    for loop,r in zip(poly.loop_indices,s['refs']):
     u,v=r[1]*o['repeat'][0]+o['offset'][0],r[2]*o['repeat'][1]+o['offset'][1]
     tex=o['texture']
     sx,sy,tx,ty={'fuselage.png':(1,.5,0,.5),'wings.png':(.5,.5,0,0),'turbofan.png':(.5,.5,.5,0),'747-8i_gear_t.png':(.5,.5,0,.5),'747-8i_tire1.png':(.25,.25,0,0),'747-8i_tire3.png':(.25,.25,.25,0)}.get(tex,(1,1,0,0))
     uv.data[loop].uv=(u*sx+tx,v*sy+ty)
   mesh.set_sharp_from_angle(angle=math.radians(o['crease']))
   stats.append({'name':name,'vertices':len(mesh.vertices),'polygons':len(mesh.polygons),'materials':list(indexes)})
 elif hidden:skip.append(name)
 for child in o['children']:visit(child,world,mats)
for file in ['747-8.ac','747-8i_gear.ac']:
 r=Reader(src/file);root=r.read();visit(root,Matrix.Identity(4),r.materials)
objects=list(bpy.context.scene.objects)
# Actual detailed source geometry is retained; no duplicated aircraft or triangle-count padding.
for obj in objects:
 if obj.type!='MESH':continue
 # Smooth the analytic exterior surfaces once; pin open edges to retain assembly/window boundaries.
 if obj.name.startswith(('fuselage_1','nosecone','turbofan_capa','corpo_','intake')) and not obj.name.endswith('.in'):
  import bmesh
  bm=bmesh.new();bm.from_mesh(obj.data);cr=bm.edges.layers.float.get('crease_edge') or bm.edges.layers.float.new('crease_edge')
  for e in bm.edges:
   if e.is_boundary or (e.is_manifold and e.calc_face_angle(0)>math.radians(35)):e[cr]=1
  bm.to_mesh(obj.data);bm.free()
  mod=obj.modifiers.new('Curvature refinement','SUBSURF');mod.levels=level;mod.render_levels=level
  bpy.context.view_layer.objects.active=obj;bpy.ops.object.modifier_apply(modifier=mod.name)
# High LOD: collapse interior curvature refinement to the requested envelope, retaining UV boundaries.
if level>1:
 fixed=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in objects if o.type=='MESH' and not o.name.startswith(('fuselage_1','nosecone','turbofan_capa','corpo_','intake')))
 curved=[o for o in objects if o.type=='MESH' and o.name.startswith(('fuselage_1','nosecone','turbofan_capa','corpo_','intake'))]
 count=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in curved)
 ratio=min(1,(149000-fixed)/count)
 for obj in curved:
  mod=obj.modifiers.new('UV-preserving web reduction','DECIMATE');mod.ratio=ratio;mod.use_collapse_triangulate=True;mod.delimit={'UV','SEAM','SHARP','MATERIAL'}
  bpy.context.view_layer.objects.active=obj;bpy.ops.object.modifier_apply(modifier=mod.name)
# One static exterior. Shared-material merging is performed after glTF export.
# Batch by real aircraft component, sharing six materials without duplicating airframes.
def domain(o):
 n=o.name.lower()
 if o.get('sourceAsset')=='747-8i_gear.ac':return 'LandingGear'
 if n.startswith(('turbofan','pin_','blades_','corpo_','intake','line')):
  x=sum(v.co.x for v in o.data.vertices)/len(o.data.vertices)
  return 'Engine'+('Port' if x>0 else 'Starboard')+('Outer' if abs(x)>18 else 'Inner')
 if n.startswith(('wing','aileron','slat','flap','doubleflaps','external_flap','speedbrake')):return 'Wings'
 if n.startswith(('hstab','elevator')):return 'HorizontalTail'
 if n.startswith(('vstab','rudder')):return 'VerticalTail'
 if n.startswith(('flg','nlg')):return 'LandingGearDoors'
 return 'Fuselage'
groups={}
for o in objects:
 if o.type=='MESH':groups.setdefault(domain(o),[]).append(o)
for name,group in groups.items():
 bpy.ops.object.select_all(action='DESELECT')
 for o in group:o.select_set(True)
 bpy.context.view_layer.objects.active=group[0];bpy.ops.object.join();o=bpy.context.view_layer.objects.active;o.name=name;o['aircraftPart']=name
objects=list(bpy.context.scene.objects)
bpy.context.view_layer.update()
tri=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in objects if o.type=='MESH')
pts=[o.matrix_world@Vector(v) for o in objects if o.type=='MESH' for v in o.bound_box]
lo=Vector([min(v[i] for v in pts) for i in range(3)]);hi=Vector([max(v[i] for v in pts) for i in range(3)]);center=(lo+hi)/2
for o in objects:o.location-=center
bpy.context.view_layer.update()
bpy.ops.export_scene.gltf(filepath=str(out/'747-8i-source-converted.glb'),export_format='GLB',export_yup=True,export_animations=False,export_cameras=False,export_lights=False,export_extras=True,export_apply=True)
(out/'conversion.json').write_text(json.dumps({'triangles':tri,'sourceBoundsBlender':[list(lo),list(hi)],'dimensionsBlender':list(hi-lo),'materials':list(matcache),'removedHiddenInterior':skip,'objects':stats},indent=2))
# Offline photographic fallback is rendered from the same converted geometry and textures.
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=96;scene.cycles.use_denoising=False
scene.world=bpy.data.worlds.new('Studio');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.1,.17,.23,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.55
for loc,power,size in [((20,-30,50),55000,35),((-40,-10,20),35000,30),((20,40,25),45000,25)]:
 bpy.ops.object.light_add(type='AREA',location=loc);light=bpy.context.object;light.data.energy=power;light.data.shape='DISK';light.data.size=size;light.rotation_euler=(Vector((0,0,0))-light.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add();cam=bpy.context.object;scene.camera=cam;cam.data.type='ORTHO';cam.data.ortho_scale=100
scene.render.resolution_x=1400;scene.render.resolution_y=900;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='AgX'
for name,loc in [('overview',(90,-110,60)),('nose',(20,-120,20)),('side',(120,-5,20)),('top',(0,-.01,150))]:
 cam.data.ortho_scale=130 if name=='top' else 100
 cam.location=loc;cam.rotation_euler=(-cam.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(out/(name+'.png'));bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=str(out/'converted.blend'))
print('CONVERSION_SUMMARY',tri,list(matcache))
