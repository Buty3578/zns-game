// Unique instance IDs; kind selects the existing, tested handling model.
export const vehicleKind=v=>v?.kind||v?.id;
export const DISTRICT_VEHICLES=[
 {id:'quarter-car',kind:'car',body:'coupe',name:'Купе «Ритм» · Скейт-квартал',x:185,z:44,yaw:0,color:'#85bfd1'},
 {id:'moscow-truck',kind:'car',body:'truck',name:'Грузовик «Бит-доставка» · Московский',x:300,z:44,yaw:0,color:'#d7ad75'},
 {id:'sol-bike',kind:'bike',name:'Мотоцикл «Закат» · Солнцево',x:450,z:44,yaw:0,color:'#e29c80'},
 {id:'hills-pickup',kind:'car',body:'pickup',name:'Электропикап «Грань» · Воробьёвы горы',x:610,z:44,yaw:0,color:'#a8b7bb'},
 {id:'red-car',kind:'car',body:'coupe',name:'Купе «Красная волна»',x:970,z:44,yaw:0,color:'#b66969'},
 {id:'vdnh-truck',kind:'car',body:'truck',name:'Грузовик «Павильон» · ВДНХ',x:1155,z:44,yaw:0,color:'#8eb795'},
 {id:'island-bike',kind:'bike',name:'Мотоцикл «Остров»',x:1345,z:24,yaw:0,color:'#b7a0d5'}
];
export const vehiclePlaces=DISTRICT_VEHICLES.map(v=>({...v,hint:'V / «Сесть» рядом с транспортом. X — остановиться и выйти. Скейт доступен кнопкой B.'}));
