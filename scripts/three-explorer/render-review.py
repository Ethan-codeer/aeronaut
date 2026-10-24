# Optional: blender --background --threads 4 --python scripts/three-explorer/render-review.py
import bpy,math
from mathutils import Vector
from pathlib import Path
base=Path(__file__).resolve().parents[2]
output=Path('/tmp/aeronaut-3d-review');output.mkdir(parents=True,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(base/'public/models/three-explorer/generic-twinjet.glb'))
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=16;scene.cycles.use_denoising=False;scene.render.threads_mode='FIXED';scene.render.threads=4;scene.render.resolution_x=1100;scene.render.resolution_y=700;scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('World');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.12,.18,.25,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.5
for pos,power,size in [((15,-20,35),5500,25),((-25,0,20),4500,22),((0,20,25),6000,18)]:
 data=bpy.data.lights.new('Softbox','AREA');data.energy=power;data.shape='DISK';data.size=size;obj=bpy.data.objects.new('Softbox',data);scene.collection.objects.link(obj);obj.location=pos;obj.rotation_euler=(Vector((0,0,3))-obj.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.12));floor=bpy.context.object;mat=bpy.data.materials.new('Floor');mat.diffuse_color=(.023,.046,.072,1);floor.data.materials.append(mat)
cam=bpy.data.cameras.new('ReviewCamera');camera=bpy.data.objects.new('ReviewCamera',cam);scene.collection.objects.link(camera);scene.camera=camera;cam.type='ORTHO';cam.ortho_scale=56
for label,position in [('overview',(45,-57,28)),('front',(0,-65,10)),('top',(0,-.1,65)),('side',(65,-8,14))]:
 cam.ortho_scale=68 if label=='top' else 56;camera.location=position;camera.rotation_euler=(Vector((0,0,3.5))-camera.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=str(output/f'model-{label}.png');bpy.ops.render.render(write_still=True)
