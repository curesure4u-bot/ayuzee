// One-time reviewed migration tool: retain undeployed feature source and expose previews.
// Never executes SQL or alters the verified live-schema types.
import ts from 'typescript';
import{readFileSync,readdirSync,existsSync,mkdirSync,writeFileSync,renameSync}from'node:fs';
import{resolve,dirname,relative}from'node:path';
import{fileURLToPath}from'node:url';
import{createHash}from'node:crypto';
const root=fileURLToPath(new URL('../',import.meta.url));
const scan=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.name.startsWith('.')?[]:e.isDirectory()?scan(resolve(dir,e.name)):/\.tsx?$/.test(e.name)?[resolve(dir,e.name)]:[]);
const files=scan(resolve(root,'src'));const sources=new Map(files.map(p=>[relative(root,p),readFileSync(p,'utf8')]));const ast=new Map([...sources].map(([p,s])=>[p,ts.createSourceFile(p,s,ts.ScriptTarget.Latest,true,p.endsWith('x')?ts.ScriptKind.TSX:ts.ScriptKind.TS)]));
function modulePath(spec,from){const base=spec.startsWith('@/')?resolve(root,'src',spec.slice(2)):spec.startsWith('.')?resolve(root,dirname(from),spec):null;if(!base)return;return[base,base+'.tsx',base+'.ts',resolve(base,'index.tsx'),resolve(base,'index.ts')].map(p=>relative(root,p)).find(p=>sources.has(p));}
const imports=new Map(),parents=new Map();
for(const[p,file]of ast){const deps=new Set();function visit(n){if((ts.isImportDeclaration(n)||ts.isExportDeclaration(n))&&n.moduleSpecifier&&ts.isStringLiteral(n.moduleSpecifier)){const target=modulePath(n.moduleSpecifier.text,p);if(target)deps.add(target);}if(ts.isCallExpression(n)&&n.expression.kind===ts.SyntaxKind.ImportKeyword&&ts.isStringLiteral(n.arguments[0])){const target=modulePath(n.arguments[0].text,p);if(target)deps.add(target);}ts.forEachChild(n,visit);}visit(file);imports.set(p,deps);for(const d of deps){if(!parents.has(d))parents.set(d,new Set());parents.get(d).add(p);}}
const lazy=ast.get('src/routes/lazyPages.ts'),boundaries=new Set(),componentFiles=new Map();
for(const st of lazy.statements)if(ts.isVariableStatement(st))for(const d of st.declarationList.declarations){let target;function visit(n){if(ts.isCallExpression(n)&&n.expression.kind===ts.SyntaxKind.ImportKeyword&&ts.isStringLiteral(n.arguments[0]))target=modulePath(n.arguments[0].text,'src/routes/lazyPages.ts');ts.forEachChild(n,visit);}visit(d);if(target){componentFiles.set(d.name.getText(lazy),target);boundaries.add(target);}}
const report=JSON.parse(readFileSync(resolve(process.argv[2]??resolve(root,'docs/architecture/schema-contract-baseline.json')),'utf8'));
const seeds=new Set(report.issues.filter(i=>!i.file.startsWith('src/features/')).map(i=>i.file));
const protectedFile=p=>p.startsWith('src/features/')||p.startsWith('src/integrations/')||p.startsWith('src/routes/')||p==='src/App.tsx';
const retained=new Set(seeds),pending=[...seeds],protectedEdges=[];
while(pending.length){const node=pending.pop();for(const parent of parents.get(node)??[]){if(protectedFile(parent)){if(!(parent.startsWith('src/routes/')&&boundaries.has(node)))protectedEdges.push({parent,node});continue;}if(!retained.has(parent)){retained.add(parent);pending.push(parent);}}}
const wrappers=[...retained].filter(p=>boundaries.has(p)).sort();
const routes=new Map();function routeWalk(n,parent=''){
 const opening=ts.isJsxElement(n)?n.openingElement:ts.isJsxSelfClosingElement(n)?n:null;
 let current=parent;
 if(opening&&opening.tagName.getText()==='Route'){
  const attributes=opening.attributes.properties;const pathAttr=attributes.find(a=>ts.isJsxAttribute(a)&&a.name.getText()==='path');const segment=pathAttr?.initializer&&ts.isStringLiteral(pathAttr.initializer)?pathAttr.initializer.text:'';
  current=segment.startsWith('/')?segment:('/'+[parent,segment].filter(Boolean).join('/')).replace(/\/{2,}/g,'/');
  const element=attributes.find(a=>ts.isJsxAttribute(a)&&a.name.getText()==='element');
  if(element){function component(c){if((ts.isJsxSelfClosingElement(c)||ts.isJsxOpeningElement(c))&&/^P\./.test(c.tagName.getText())){const p=componentFiles.get(c.tagName.getText().slice(2));if(p){if(!routes.has(p))routes.set(p,new Set());routes.get(p).add(current||'/');}}ts.forEachChild(c,component);}component(element);}
 }
 ts.forEachChild(n,c=>routeWalk(c,current));
}routeWalk(ast.get('src/routes/AppRoutes.tsx'));
const hash=s=>createHash('sha256').update(s).digest('hex');
function heading(p){const text=sources.get(p);const match=text.match(/<h1\b[^>]*>([^<{}]{3,100})<\/h1>/);return match&&!/not found|no .*found|error|unavailable/i.test(match[1])?match[1].replace(/\s+/g,' ').trim():p.split('/').at(-1).replace(/\.tsx?$/,'').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/([A-Z])([A-Z][a-z])/g,'$1 $2');}
function dependencySeeds(p,seen=new Set()){if(seen.has(p))return[];seen.add(p);return[...(seeds.has(p)?[p]:[]),...[...imports.get(p)??[]].flatMap(d=>dependencySeeds(d,seen))];}
const inventory=wrappers.map(p=>{const relevant=new Set(dependencySeeds(p));const apis=[...new Set(report.issues.filter(i=>relevant.has(i.file)).map(i=>i.object).filter(Boolean))].sort();return{featureId:p.replace(/^src\//,'').replace(/\.tsx?$/,'').replaceAll('/','-'),title:heading(p),routes:[...routes.get(p)??[]].sort(),source:p,retainedSource:'retained-previews/'+p,sha256:hash(sources.get(p)),missingApis:apis,contractIssues:report.issues.filter(i=>relevant.has(i.file)&&i.message).map(i=>i.message),decision:'Pending user review'};});
const summary={retainedFiles:retained.size,previewScreens:wrappers.length,protectedEdges,retainedModules:[...retained].sort().map(p=>({source:p,retainedSource:'retained-previews/'+p,sha256:hash(sources.get(p))})),features:inventory};
const out=resolve(root,'docs/review/preview-feature-inventory.json');
if(!process.argv.includes('--apply')){console.log(JSON.stringify({...summary,features:undefined,retainedModules:undefined,sample:inventory.slice(0,8)},null,2));process.exit(0);}
if(protectedEdges.length)throw Error('Protected dependency edges need manual review before migration: '+JSON.stringify(protectedEdges));
// Applying requires a saved plan. Archives must be absent so no prior source is overwritten.
for(const p of retained)if(existsSync(resolve(root,'retained-previews',p)))throw Error('Retained source already exists: '+p);
for(const p of retained){const to=resolve(root,'retained-previews',p);mkdirSync(dirname(to),{recursive:true});renameSync(resolve(root,p),to);if(hash(readFileSync(to,'utf8'))!==hash(sources.get(p)))throw Error('Retention integrity failure: '+p);}
for(const item of inventory){const file=ast.get(item.source),exports=[];for(const st of file.statements){if(!st.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword))continue;if(st.modifiers.some(m=>m.kind===ts.SyntaxKind.DefaultKeyword))continue;if((ts.isFunctionDeclaration(st)||ts.isClassDeclaration(st))&&st.name)exports.push(st.name.text);if(ts.isVariableStatement(st))for(const d of st.declarationList.declarations)if(ts.isIdentifier(d.name))exports.push(d.name.text);}const src=`// Original implementation retained at ${item.retainedSource}. Backend not released.\nimport {PreservedFeaturePreview} from '@/features/previews/PreservedFeaturePreview';\nfunction Preview(_props:Readonly<Record<string,unknown>>){return <PreservedFeaturePreview featureId=${JSON.stringify(item.featureId)}/>;}\nexport default Preview;\n${exports.map(n=>'export const '+n+'=Preview;').join('\n')}\n`;mkdirSync(dirname(resolve(root,item.source)),{recursive:true});writeFileSync(resolve(root,item.source),src.trimEnd()+'\n');}
mkdirSync(dirname(out),{recursive:true});if(existsSync(out)){const previous=JSON.parse(readFileSync(out,'utf8'));summary.features=[...previous.features,...summary.features];summary.retainedModules=[...previous.retainedModules,...summary.retainedModules];summary.retainedFiles=summary.retainedModules.length;summary.previewScreens=summary.features.length;}writeFileSync(out,JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({retainedFiles:retained.size,previewScreens:inventory.length,inventory:relative(root,out)}));
