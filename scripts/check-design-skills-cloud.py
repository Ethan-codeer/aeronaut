import subprocess,json,selectors,time
from pathlib import Path
root=str(Path(__file__).resolve().parent.parent)
p=subprocess.Popen(['codex','-c','sqlite_home="/tmp/aero-codex-state"','app-server','--stdio'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=open('/tmp/aero-skills-server.log','w'),text=True,cwd=root)
try:
 def send(x):p.stdin.write(json.dumps(x)+'\n');p.stdin.flush()
 sel=selectors.DefaultSelector();sel.register(p.stdout,selectors.EVENT_READ)
 def response(i):
  end=time.time()+35
  while time.time()<end:
   if not sel.select(1):continue
   line=p.stdout.readline()
   if not line:raise RuntimeError('app-server exited')
   x=json.loads(line)
   if x.get('id')==i:return x
  raise TimeoutError('no RPC response')
 send({'id':1,'method':'initialize','params':{'clientInfo':{'name':'aeronaut-skill-check','version':'1.0.0'},'capabilities':{'experimentalApi':True}}});r=response(1)
 if 'error' in r:raise RuntimeError(r['error'])
 send({'method':'initialized','params':{}})
 send({'id':2,'method':'skills/list','params':{'cwds':[root],'forceReload':True}});r=response(2)
 if 'error' in r:raise RuntimeError(r['error'])
 wanted={'frontend-design','ui-ux-pro-max','aeronaut-design-system'};items=[]
 for group in r['result']['data']:
  for s in group.get('skills',[]):
   if s['name'] in wanted and str(s.get('path','')).startswith(root+'/.agents/skills/'):
    items.append({k:s.get(k) for k in ['name','path','scope','enabled']})
  if group.get('errors'):print('discoveryErrors',group['errors'])
 assert {s['name'] for s in items}==wanted,items
 for s in items:assert open(s['path']).read().startswith('---\n')
 out={'method':'Codex app-server skills/list forceReload; direct SKILL.md reads','cwd':root,'skills':items,'passed':True,'date':'2026-10-24','limitation':'Current cloud executor discovery verified; chat catalog may require a new task/session to refresh. No model turn or UI acceptance test was run.'}
 open(root+'/docs/design-skills-cloud-check.json','w').write(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out))
finally:
 p.terminate()
 try:p.wait(timeout=5)
 except subprocess.TimeoutExpired:p.kill();p.wait()
