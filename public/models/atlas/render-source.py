import bpy,math,json
from pathlib import Path
from mathutils import Vector
base=Path(__file__).resolve().parents[3]
records=json.loads((base/'data/atlas-models.json').read_text())
for rec in records:
 bpy.ops.wm.read_factory_settings(use_empty=True)
 bpy.ops.import_scene.gltf(filepath=str(base/('public'+rec['url'])))
 scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=64;scene.cycles.use_denoising=False;scene.render.threads_mode='FIXED';scene.render.threads=4;scene.render.resolution_x=900;scene.render.resolution_y=573;scene.render.resolution_percentage=100
 scene.world=bpy.data.worlds.new('World');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.12,.18,.25,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.6
 l=rec['dimensionsMetres']['length'];s=rec['dimensionsMetres']['wingspan'];k=l/40
 for pos,power,size in [((15,-20,35),6500,25),((-25,0,20),5000,22),((0,20,25),7500,18)]:
  data=bpy.data.lights.new('Softbox','AREA');data.energy=power*k*k;data.shape='DISK';data.size=size*k;obj=bpy.data.objects.new('Softbox',data);scene.collection.objects.link(obj);obj.location=Vector(pos)*k;obj.rotation_euler=(Vector((0,0,4*k))-obj.location).to_track_quat('-Z','Y').to_euler()
 bpy.ops.mesh.primitive_plane_add(size=1000,location=(0,0,-.12));floor=bpy.context.object;mat=bpy.data.materials.new('Floor');mat.diffuse_color=(.023,.046,.072,1);floor.data.materials.append(mat)
 cam=bpy.data.cameras.new('ReviewCamera');camera=bpy.data.objects.new('ReviewCamera',cam);scene.collection.objects.link(camera);scene.camera=camera;cam.type='ORTHO';cam.ortho_scale=max(l,s)*1.38
 camera.location=Vector((45,-57,28))*k;camera.rotation_euler=(Vector((0,0,4*k))-camera.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(base/'public/models/atlas'/f"{rec['aircraftSlug']}-poster.png");bpy.ops.render.render(write_still=True)
