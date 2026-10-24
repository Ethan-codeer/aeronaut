# SPDX-License-Identifier: GPL-2.0-only
# Minimal AC3Db reader; preserves native hierarchy, UV coordinates and surface flags.
import shlex,json,struct
from pathlib import Path
class Reader:
 def __init__(self,p):self.lines=p.read_text().splitlines();self.i=0;self.materials=[]
 def line(self):
  x=self.lines[self.i];self.i+=1;return x.strip()
 def obj(self,kind):
  o={'kind':kind,'name':'','verts':[],'surfaces':[],'children':[],'loc':[0,0,0],'rot':[1,0,0,0,1,0,0,0,1],'texture':None,'repeat':[1,1],'offset':[0,0],'crease':30}
  while self.i<len(self.lines):
   a=shlex.split(self.line())
   if not a:continue
   k=a[0]
   if k=='name':o['name']=a[1]
   elif k=='texture':o['texture']=a[1]
   elif k=='loc':o['loc']=list(map(float,a[1:]))
   elif k=='rot':o['rot']=list(map(float,a[1:]))
   elif k=='texrep':o['repeat']=list(map(float,a[1:]))
   elif k=='texoff':o['offset']=list(map(float,a[1:]))
   elif k=='crease':o['crease']=float(a[1])
   elif k=='data':
    n=int(a[1]);s=''
    while len(s)<n:s+=self.line()+'\n'
   elif k=='numvert':o['verts']=[list(map(float,self.line().split())) for _ in range(int(a[1]))]
   elif k=='numsurf':
    for _ in range(int(a[1])):
     flags=int(self.line().split()[1],16);mat=0;a=self.line().split()
     if a[0]=='mat':mat=int(a[1]);a=self.line().split()
     assert a[0]=='refs'
     refs=[self.line().split() for _ in range(int(a[1]))]
     o['surfaces'].append({'flags':flags,'mat':mat,'refs':[(int(r[0]),float(r[1]),float(r[2])) for r in refs]})
   elif k=='kids':
    for _ in range(int(a[1])):
     a=self.line().split();assert a[0]=='OBJECT';o['children'].append(self.obj(a[1]))
    return o
  raise ValueError('Truncated AC object')
 def read(self):
  assert self.line().startswith('AC3D')
  while self.i<len(self.lines):
   a=shlex.split(self.line())
   if a[0]=='MATERIAL':
    m={'name':a[1]}
    for k,n in [('rgb',3),('amb',3),('emis',3),('spec',3),('shi',1),('trans',1)]:
     j=a.index(k);v=list(map(float,a[j+1:j+1+n]));m[k]=v if n>1 else v[0]
    self.materials.append(m)
   elif a[0]=='OBJECT':return self.obj(a[1])
def flatten(o):
 yield o
 for c in o['children']:yield from flatten(c)
