import{matchPath}from'react-router-dom';
import{featurePreviews}from'./catalog';
export function preservedPreviewForPath(pathname:string){return featurePreviews.flatMap(feature=>feature.routes.map(path=>({feature,path}))).sort((a,b)=>b.path.length-a.path.length).find(({path})=>matchPath({path,end:true},pathname))?.feature;}
