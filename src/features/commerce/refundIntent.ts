import{refundInput,type RefundInput}from'./resolutionModel';
// Save before mutation. An unknown response must reuse its original payload/key.
export function refundIntents(scope:string,storage:Pick<Storage,'getItem'|'setItem'|'removeItem'>){const key=(id:string)=>`ayuzee-refund-v1:${scope}:${id}`;return{
 read(id:string):RefundInput|null{const v=storage.getItem(key(id));return v?refundInput.parse(JSON.parse(v)):null;},
 save(id:string,input:RefundInput){const value=refundInput.parse(input),existing=this.read(id);if(existing&&JSON.stringify(existing)!==JSON.stringify(value))throw Error('Resume the saved refund request before preparing another.');storage.setItem(key(id),JSON.stringify(value));},
 clear(id:string){storage.removeItem(key(id));}
};}
export type RefundIntents=ReturnType<typeof refundIntents>;
