import{intentSchema,type ReservationIntent}from'./checkoutModel';
export function intentStorage(userId:string,workspace:string,storage:Pick<Storage,'getItem'|'setItem'|'removeItem'>){
 const key=`ayuzee.checkout.pending:${userId}:${workspace}`;
 return{read():ReservationIntent|null{const value=storage.getItem(key);return value?intentSchema.parse(JSON.parse(value)):null;},write(intent:ReservationIntent){storage.setItem(key,JSON.stringify(intentSchema.parse(intent)));},clear(){storage.removeItem(key);}};
}
