export const ARGENTINA_LOCATIONS = {
  "Buenos Aires": [
    "Bahia Blanca",
    "La Plata",
    "Lomas de Zamora",
    "Mar del Plata",
    "Merlo",
    "Moron",
    "Quilmes",
    "San Isidro",
    "San Justo",
    "Tigre"
  ],
  "Catamarca": [
    "Andalgala",
    "Belen",
    "Recreo",
    "San Fernando del Valle de Catamarca",
    "Santa Maria",
    "Tinogasta"
  ],
  "Chaco": [
    "Barranqueras",
    "Charata",
    "General Jose de San Martin",
    "Juan Jose Castelli",
    "Presidencia Roque Saenz Pena",
    "Resistencia",
    "Villa Angela"
  ],
  "Chubut": [
    "Comodoro Rivadavia",
    "Esquel",
    "Puerto Madryn",
    "Rawson",
    "Trelew"
  ],
  "Ciudad Autonoma de Buenos Aires": [
    "Agronomia",
    "Balvanera",
    "Belgrano",
    "Caballito",
    "Flores",
    "Palermo",
    "Recoleta",
    "Villa Crespo"
  ],
  "Cordoba": [
    "Alta Gracia",
    "Bell Ville",
    "Cordoba",
    "Cosquin",
    "Jesus Maria",
    "Rio Cuarto",
    "Rio Tercero",
    "San Francisco",
    "Villa Carlos Paz",
    "Villa Maria"
  ],
  "Corrientes": [
    "Corrientes",
    "Curuzu Cuatia",
    "Goya",
    "Ituzaingo",
    "Mercedes",
    "Paso de los Libres",
    "Santo Tome"
  ],
  "Entre Rios": [
    "Colon",
    "Concordia",
    "Concepcion del Uruguay",
    "Gualeguay",
    "Gualeguaychu",
    "Parana",
    "Villaguay"
  ],
  "Formosa": [
    "Clorinda",
    "El Colorado",
    "Formosa",
    "Ingeniero Juarez",
    "Las Lomitas",
    "Pirane"
  ],
  "Jujuy": [
    "Humahuaca",
    "La Quiaca",
    "Libertador General San Martin",
    "Palpala",
    "Perico",
    "San Pedro de Jujuy",
    "San Salvador de Jujuy",
    "Tilcara"
  ],
  "La Pampa": [
    "General Pico",
    "General Acha",
    "Intendente Alvear",
    "Realico",
    "Santa Rosa",
    "Toay"
  ],
  "La Rioja": [
    "Aimogasta",
    "Chamical",
    "Chepes",
    "Chilecito",
    "La Rioja"
  ],
  "Mendoza": [
    "General Alvear",
    "Godoy Cruz",
    "Guaymallen",
    "Las Heras",
    "Lujan de Cuyo",
    "Maipu",
    "Mendoza",
    "San Martin",
    "San Rafael"
  ],
  "Misiones": [
    "Eldorado",
    "Leandro N. Alem",
    "Obera",
    "Posadas",
    "Puerto Iguazu",
    "San Vicente"
  ],
  "Neuquen": [
    "Centenario",
    "Cutral Co",
    "Neuquen",
    "Plottier",
    "San Martin de los Andes",
    "Villa La Angostura",
    "Zapala"
  ],
  "Rio Negro": [
    "Bariloche",
    "Cipolletti",
    "General Roca",
    "Ingeniero Jacobacci",
    "Rio Colorado",
    "Viedma"
  ],
  "Salta": [
    "Cafayate",
    "General Guemes",
    "General Mosconi",
    "Metan",
    "Oran",
    "Rosario de Lerma",
    "Salta",
    "Tartagal"
  ],
  "San Juan": [
    "Caucete",
    "Chimbas",
    "Jachal",
    "Rawson",
    "Rivadavia",
    "San Juan",
    "Santa Lucia"
  ],
  "San Luis": [
    "Juana Koslay",
    "La Punta",
    "Merlo",
    "San Luis",
    "Villa Mercedes"
  ],
  "Santa Cruz": [
    "Caleta Olivia",
    "El Calafate",
    "Las Heras",
    "Pico Truncado",
    "Puerto Deseado",
    "Rio Gallegos"
  ],
  "Santa Fe": [
    "Casilda",
    "Esperanza",
    "Rafaela",
    "Reconquista",
    "Rosario",
    "San Justo",
    "Santa Fe",
    "Santo Tome",
    "Venado Tuerto",
    "Villa Gobernador Galvez"
  ],
  "Santiago del Estero": [
    "Anatuya",
    "Bandera",
    "Frias",
    "La Banda",
    "Santiago del Estero",
    "Termas de Rio Hondo"
  ],
  "Tierra del Fuego": [
    "Rio Grande",
    "Tolhuin",
    "Ushuaia"
  ],
  "Tucuman": [
    "Aguilares",
    "Concepcion",
    "Famailla",
    "Monteros",
    "San Miguel de Tucuman",
    "Tafi Viejo",
    "Yerba Buena"
  ]
};

export const ARG_PROVINCES = Object.keys(ARGENTINA_LOCATIONS).sort((a, b) =>
  a.localeCompare(b, "es")
);

export function getCitiesByProvince(province) {
  const cities = ARGENTINA_LOCATIONS[province] || [];
  return [...cities].sort((a, b) => a.localeCompare(b, "es"));
}
