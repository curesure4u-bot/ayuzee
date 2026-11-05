import ts from 'typescript';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const name=node=>node&&(ts.isIdentifier(node)||ts.isStringLiteral(node))?node.text:undefined;
const parse=(text,path)=>ts.createSourceFile(path,text,ts.ScriptTarget.Latest,true,path.endsWith('x')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
export function schemaNames(text){
 const file=parse(text,'types.ts');
 const database=file.statements.find(n=>ts.isTypeAliasDeclaration(n)&&n.name.text==='Database');
 const publicSchema=database?.type.members?.find(n=>name(n.name)==='public')?.type;
 if(!publicSchema||!ts.isTypeLiteralNode(publicSchema))throw Error('Generated public schema contract missing');
 const members=key=>new Set(publicSchema.members.find(n=>name(n.name)===key)?.type.members?.map(n=>name(n.name)).filter(Boolean)||[]);
 return {relations:new Set([...members('Tables'),...members('Views')]),functions:members('Functions')};
}
function uncast(node){while(ts.isAsExpression(node)||ts.isParenthesizedExpression(node)||ts.isTypeAssertionExpression(node)||ts.isNonNullExpression(node))node=node.expression;return node;}
export function inspectSource(text,path,schema){
 const absolute=resolve(root,path),file=parse(text,absolute),aliases=new Set(),declarations=[],issues=[],dynamic=[];
 // Binding identifiers needs no imported types or semantic diagnostics. Use a
 // one-file program so a shadowed parameter/local cannot be mistaken for the
 // real client, and never instantiate the large SDK query-result types here.
 const options={noResolve:true,noLib:true,noEmit:true};
 const host={...ts.createCompilerHost(options),getSourceFile:p=>p===absolute?file:undefined,
  fileExists:p=>p===absolute,readFile:p=>p===absolute?text:undefined};
 const checker=ts.createProgram([absolute],options,host).getTypeChecker();
 const symbol=node=>checker.getSymbolAtLocation(node);
 for(const statement of file.statements){
  if(!ts.isImportDeclaration(statement)||!ts.isStringLiteral(statement.moduleSpecifier))continue;
  if(!/(?:^|\/)integrations\/supabase\/client$/.test(statement.moduleSpecifier.text))continue;
  for(const item of statement.importClause?.namedBindings?.elements||[])if((item.propertyName?.text||item.name.text)==='supabase')aliases.add(symbol(item.name));
 }
 const collect=node=>{if(ts.isVariableDeclaration(node)&&ts.isIdentifier(node.name)&&node.initializer)declarations.push(node);ts.forEachChild(node,collect);};collect(file);
 for(let changed=true;changed;){changed=false;for(const d of declarations){const base=uncast(d.initializer),target=symbol(d.name);if(ts.isIdentifier(base)&&aliases.has(symbol(base))&&!aliases.has(target)){aliases.add(target);changed=true;}}}
 const visit=node=>{
  if(ts.isCallExpression(node)&&ts.isPropertyAccessExpression(node.expression)){
   const method=node.expression.name.text,base=uncast(node.expression.expression);
   if(['from','rpc'].includes(method)&&ts.isIdentifier(base)&&aliases.has(symbol(base))){
    const argument=node.arguments[0],position=file.getLineAndCharacterOfPosition(node.getStart(file));
    const location={file:path,line:position.line+1,column:position.character+1,method};
    if(argument&&(ts.isStringLiteral(argument)||ts.isNoSubstitutionTemplateLiteral(argument))){
     const known=method==='from'?schema.relations:schema.functions;
     if(!known.has(argument.text))issues.push({...location,object:argument.text,kind:method==='from'?'missing-relation':'missing-rpc'});
    }else dynamic.push({...location,kind:'dynamic-reference-needs-review'});
   }
  }
  ts.forEachChild(node,visit);
 };visit(file);return {issues,dynamic};
}
// Developer machines usually have ripgrep. Minimal CI runners may not. Keep the
// same source boundary without making an optional system binary a release gate.
export function listSourceFiles(directory,run=execFileSync){
 let files;
 try{files=run('rg',['--files','.'],{cwd:directory,encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean).map(p=>p.replace(/^\.\//,''));}
 catch(error){
  if(error.code!=='ENOENT')throw error;
  files=[];
  const walk=(path,prefix='')=>{for(const entry of readdirSync(path,{withFileTypes:true})){
   if(entry.name.startsWith('.')||entry.name==='node_modules')continue;
   const name=prefix+entry.name;
   if(entry.isDirectory())walk(join(path,entry.name),name+'/');
   else if(entry.isFile())files.push(name);
  }};walk(directory);
 }
 return files.filter(p=>/\.tsx?$/.test(p)&&p.split('/').at(-1)!=='types.ts').sort();
}
export function collectSchemaContracts(){
 const schema=schemaNames(readFileSync(resolve(root,'src/integrations/supabase/types.ts'),'utf8'));
 const files=listSourceFiles(resolve(root,'src')).map(file=>'src/'+file);
 const issues=[],dynamic=[];
 for(const file of files){const result=inspectSource(readFileSync(resolve(root,file),'utf8'),file,schema);issues.push(...result.issues);dynamic.push(...result.dynamic);}
 issues.sort((a,b)=>a.file.localeCompare(b.file)||a.line-b.line);
 return {scope:'Source AST compared with generated live public schema; no environment files, network, queries or provider calls',checkedFiles:files.length,knownRelations:schema.relations.size,knownFunctions:schema.functions.size,missingObjects:[...new Set(issues.map(i=>i.object))].sort(),issues,dynamicReferences:dynamic};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const report=collectSchemaContracts(),target=process.argv.indexOf('--write');
 if(target>=0){if(!process.argv[target+1])throw Error('--write needs a path');writeFileSync(resolve(root,process.argv[target+1]),JSON.stringify(report,null,2)+'\n');}
 console.log(`Schema preflight: ${report.checkedFiles} source files; ${report.issues.length} unresolved literal calls to ${report.missingObjects.length} missing public objects; ${report.dynamicReferences.length} dynamic calls need review.`);
 if(process.argv.includes('--check')&&report.issues.length){
  for(const i of report.issues.slice(0,20))console.error(`${i.file}:${i.line}:${i.column}: ${i.kind}: ${i.object}`);
  console.error('Schema preflight failed. Full TypeScript checking has not passed. Run schema:inventory for the complete list.');process.exitCode=2;
 }
}
