# SPDX-License-Identifier: GPL-2.0-only
# Original AERONAUT neutral replacement engine/gear artwork; no photo or logos.
import bpy,numpy as np
from pathlib import Path
def save(name,a,out):
 h,w,_=a.shape;im=bpy.data.images.new(name,width=w,height=h,alpha=False);im.colorspace_settings.name='sRGB';im.pixels.foreach_set(a.astype(np.float32).ravel());im.filepath_raw=str(out/(name+'.png'));im.file_format='PNG';im.save();return im

def atlases(src,out):
 def load(name):
  im=bpy.data.images.load(str(src/name),check_existing=True);a=np.empty(len(im.pixels),np.float32);im.pixels.foreach_get(a);return a.reshape(im.size[1],im.size[0],4)
 # Keep 2048x1024 fuselage and 1024x1024 wing UV artwork at native resolution.
 main=np.ones((2048,2048,4),np.float32);main[1024:,:,:]=load('fuselage.png');main[:1024,:1024,:]=load('wings.png')
 # Own engine paint. Pixel coordinates below follow the licensed AC3D UV layout.
 y,x=np.mgrid[0:1024,0:1024];yt=1023-y
 a=np.ones((1024,1024,4),np.float32);a[:,:,:3]=.94
 core=(x>=635)&(yt<=225);v=.32+.28*(.5+.5*np.cos(x*.19));a[core,:3]=np.repeat(v[core,None],3,axis=1)
 exhaust=(x>=670)&(x<=1015)&(yt>=492)&(yt<=645);v=.12+.08*(.5+.5*np.sin(x*.25+yt*.2));a[exhaust,:3]=np.repeat(v[exhaust,None],3,axis=1)
 for cx,cy,r in [(846,851,171),(889,337,117)]:
  dx=x-cx;dy=yt-cy;d=np.hypot(dx,dy);theta=np.arctan2(dy,dx)
  ring=(d<r)&(d>r*.84);shade=.35+.4*(.5+.5*np.cos(theta));a[ring,:3]=np.repeat(shade[ring,None],3,axis=1)
  inside=d<=r*.84;phase=(theta+(.95*(d/r)**1.4))*18
  v=.055+.42*np.maximum(0,np.cos(phase))**6;a[inside,:3]=np.repeat(v[inside,None],3,axis=1)
  spinner=d<r*.2;v=.08+.18*(1-d/r);a[spinner,:3]=np.repeat(v[spinner,None],3,axis=1)
  spiral=spinner&(np.abs(np.sin(theta-3*d/r))<.08);a[spiral,:3]=.8
 engine=save('engine-neutral',a,out);main[:1024,1024:,:]=a
 exterior=save('exterior-atlas',main,out)
 aux=np.ones((512,512,4),np.float32);aux[:,:,:3]=.55
 # The strut UV image is now original neutral metal, without unverified photo content.
 yy,xx=np.mgrid[0:256,0:256];g=np.ones((256,256,4),np.float32);g[:,:,:3]=(.45+.12*np.sin(xx*.03))[...,None];aux[256:,:256]=g
 for col in [0,128]:
  yy,xx=np.mgrid[0:128,0:128];d=np.hypot(xx-63.5,yy-63.5);t=np.ones((128,128,4),np.float32);v=np.where(d<25,.55,np.where(d<33,.26,.045+.015*np.cos(d*2)));t[:,:,:3]=v[...,None];aux[:128,col:col+128]=t
 gear=save('gear-atlas',aux,out)
 return exterior,gear
