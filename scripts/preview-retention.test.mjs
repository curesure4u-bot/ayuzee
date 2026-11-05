import{test}from'node:test';
import assert from'node:assert/strict';
import{readFileSync,readdirSync,existsSync}from'node:fs';
import{createHash}from'node:crypto';
import{resolve}from'node:path';
import{fileURLToPath}from'node:url';
import ts from'typescript';
const root=fileURLToPath(new URL('../',import.meta.url));const read=p=>readFileSync(resolve(root,p),'utf8');const inventory=JSON.parse(read('docs/review/preview-feature-inventory.json'));
test('all retained implementations match their recorded original content',()=>{
 assert.equal(inventory.retainedFiles,inventory.retainedModules.length);assert.equal(inventory.previewScreens,inventory.features.length);
 const paths=new Set();for(const item of inventory.retainedModules){assert.match(item.source,/^src\/[\w./-]+\.tsx?$/);assert.equal(item.retainedSource,'retained-previews/'+item.source);assert.ok(!paths.has(item.retainedSource));paths.add(item.retainedSource);assert.equal(createHash('sha256').update(read(item.retainedSource)).digest('hex'),item.sha256,item.source);}
});
test('every retained screen has an inert preview entry and review metadata',()=>{
 const ids=new Set();for(const item of inventory.features){assert.ok(!ids.has(item.featureId));ids.add(item.featureId);assert.ok(item.title&&item.purpose);assert.ok(item.sqlPlans);assert.ok(item.decision);const source=read(item.source),file=ts.createSourceFile(item.source,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);const imports=file.statements.filter(ts.isImportDeclaration);assert.equal(imports.length,1,item.source);assert.equal(imports[0].moduleSpecifier.text,'@/features/previews/PreservedFeaturePreview',item.source);assert.ok(source.includes(JSON.stringify(item.featureId)));let calls=0;function visit(n){if(ts.isCallExpression(n))calls++;ts.forEachChild(n,visit);}visit(file);assert.equal(calls,0,item.source);}
});
test('active source cannot import retained implementations or erase live-schema provenance',()=>{
 const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(resolve(dir,e.name)):/\.tsx?$/.test(e.name)?[resolve(dir,e.name)]:[]);
 for(const p of walk(resolve(root,'src'))){const source=readFileSync(p,'utf8'),file=ts.createSourceFile(p,source,ts.ScriptTarget.Latest,true,p.endsWith('x')?ts.ScriptKind.TSX:ts.ScriptKind.TS);function check(n){let spec;if((ts.isImportDeclaration(n)||ts.isExportDeclaration(n))&&n.moduleSpecifier&&ts.isStringLiteral(n.moduleSpecifier))spec=n.moduleSpecifier.text;if(ts.isCallExpression(n)&&n.expression.kind===ts.SyntaxKind.ImportKeyword&&ts.isStringLiteral(n.arguments[0]))spec=n.arguments[0].text;if(spec)assert.ok(!spec.includes('retained-previews'),p);ts.forEachChild(n,check);}check(file);}
 const provenance=JSON.parse(read('src/integrations/supabase/schema-provenance.json'));assert.equal(createHash('sha256').update(read('src/integrations/supabase/types.ts')).digest('hex'),provenance.sha256);assert.ok(existsSync(resolve(root,'docs/review/FEATURES_FOR_DECISION.md')));
});
