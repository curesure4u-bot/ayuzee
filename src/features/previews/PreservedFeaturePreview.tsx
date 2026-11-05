import{Link}from'react-router-dom';
import{featurePreviews}from'./catalog';
export function PreservedFeaturePreview({featureId}:{featureId:string}){
 const feature=featurePreviews.find(f=>f.featureId===featureId);
 return <section className="mx-auto my-12 max-w-2xl rounded-3xl border border-orange-200 bg-white p-7 sm:p-12" aria-label="Feature preview"><p className="font-semibold text-orange-900">Preview · services unavailable</p><h1 className="mt-5 text-3xl font-semibold text-slate-900">{feature?.title??'Feature preview'}</h1><p className="mt-5 text-lg leading-relaxed text-slate-700">{feature?.purpose??'This feature is awaiting review and implementation.'}</p><p className="mt-4 text-lg leading-relaxed text-slate-700">This area is preserved for review. It does not load private records, save changes or perform service actions.</p><Link to="/" className="mt-7 inline-flex min-h-12 items-center rounded-xl bg-orange-700 px-6 text-lg font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Back to home</Link></section>;
}
