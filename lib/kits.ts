export type CategoriaFiltro =
  | 'Todos'
  | 'Deco'
  | 'Sonido'
  | 'Luces'
  | 'Pantallas'
  | 'Combo Total'
  | 'Cumple'
  | '15 Años'
  | 'Bautismo'
  | 'Boda';

export interface Kit {
  id: number;
  nombre: string;
  categoria: string; // e.g., 'Cumple', '15 Años', 'Boda', 'Bautismo', 'Empresa', 'Sonido', 'Luces', 'Pantallas', 'Combo Total'
  grupo: 'Deco' | 'Audiovisual';
  tags: CategoriaFiltro[];
  precioPublico: number;
  precioDecoradora: number;
  garantia: number; // 300000 para deco, 500000 para audiovisual
  descripcion: string;
  incluye: string[];
  noIncluye: string[];
  fotos: string[];
  videoUrl: string;
  rating: number;
  reseñas: number;
  disponible: boolean;
  fechasOcupadasBase?: string[]; // YYYY-MM-DD
}

export interface ItemRotura {
  id: string;
  nombre: string;
  precio: number;
}

export const PRECIOS_ROTURA: ItemRotura[] = [
  { id: 'panel', nombre: 'Panel', precio: 450000 },
  { id: 'cilindro', nombre: 'Cilindro', precio: 180000 },
  { id: 'arco', nombre: 'Arco', precio: 350000 },
  { id: 'parlante', nombre: 'Parlante', precio: 2000000 },
  { id: 'proyector', nombre: 'Proyector', precio: 3500000 },
  { id: 'tv', nombre: 'TV', precio: 3500000 },
  { id: 'microfono', nombre: 'Micrófono', precio: 400000 },
];

export const COSTO_DELIVERY_CDE = 80000;
export const COSTO_UPSELL_SONIDO_CASA = 350000;

export const formatGuaranies = (monto: number): string => {
  return `Gs. ${monto.toLocaleString('es-PY')}`;
};

const FOTOS_INFANTIL = [
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?auto=format&fit=crop&w=900&q=80',
];

const FOTOS_15_BODA = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=900&q=80',
];

const FOTOS_BAUTISMO = [
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80',
];

const FOTOS_EMPRESA = [
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=900&q=80',
];

const FOTOS_AUDIOVISUAL = [
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=900&q=80',
];

const INCLUYE_DECO_BASE = [
  'Panel circular desmontable 1.80m con funda sublimada',
  '3 Mesas cilíndricas con fundas temáticas a medida',
  'Arco de hierro desmontable para globos',
  'Set de 6 bandejas y alzadores para dulces',
  'Alfombra de piso combinada + Personajes en MDF / Fibrofácil',
  'Luz LED cálida o letrero Neón "Feliz Cumple"',
  'Bolso transportador práctico (entra en cualquier auto)',
];

const NO_INCLUYE_DECO_BASE = [
  'Globos de látex (descartables)',
  'Dulces, torta ni bocaditos',
  'Armado en el local (es sistema Pegue y Monte en 15 minutos)',
];

const NO_INCLUYE_AUDIO_BASE = [
  'Operador de DJ durante toda la noche',
  'Generador eléctrico externo',
  'Extensión de más de 25 metros',
];

export const KITS: Kit[] = [
  // ================= DECO INFANTIL (1 - 14) =================
  {
    id: 1,
    nombre: 'Safari Baby',
    categoria: 'Cumple',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Cumple'],
    precioPublico: 650000,
    precioDecoradora: 450000,
    garantia: 300000,
    descripcion:
      'El favorito para primer añito y cumples infantiles. Temática selva pastel con leoncito, jirafa y hojas tropicales. Se arma en 15 minutos sin herramientas.',
    incluye: [...INCLUYE_DECO_BASE, 'Figuras Safari Baby en MDF de alta definición'],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: FOTOS_INFANTIL,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 5.0,
    reseñas: 42,
    disponible: true,
  },
  {
    id: 2,
    nombre: 'Princesa Rosa',
    categoria: 'Cumple',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Cumple'],
    precioPublico: 650000,
    precioDecoradora: 450000,
    garantia: 300000,
    descripcion:
      'Un sueño real en tonos rosa pastel y dorado. Incluye castillo sublimado, corona luminosa y alzadores dorados estilo realeza.',
    incluye: [...INCLUYE_DECO_BASE, 'Corona LED dorada y carruaje calado'],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_INFANTIL[1], FOTOS_INFANTIL[0], FOTOS_INFANTIL[2], FOTOS_INFANTIL[3], FOTOS_INFANTIL[4]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.9,
    reseñas: 38,
    disponible: true,
  },
  {
    id: 3,
    nombre: 'Dino Party',
    categoria: 'Cumple',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Cumple'],
    precioPublico: 650000,
    precioDecoradora: 450000,
    garantia: 300000,
    descripcion:
      'Aventura jurásica para los más chicos. T-Rex, Triceratops, follaje verde y cilindros texturados listos para montar.',
    incluye: [...INCLUYE_DECO_BASE, '3 Dinosaurios 3D de pie + Hojas Monstera'],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_INFANTIL[2], FOTOS_INFANTIL[0], FOTOS_INFANTIL[1], FOTOS_INFANTIL[3], FOTOS_INFANTIL[4]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.8,
    reseñas: 29,
    disponible: true,
  },
  {
    id: 4,
    nombre: 'Granja Feliz',
    categoria: 'Cumple',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Cumple'],
    precioPublico: 650000,
    precioDecoradora: 450000,
    garantia: 300000,
    descripcion:
      'Inspirado en La Granja de Zenón. Incluye granero rojo, Bartolito, La Vaca Lola y mini fardos decorativos.',
    incluye: [...INCLUYE_DECO_BASE, 'Personajes de la Granja + Rueda de carreta decorativa'],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_INFANTIL[3], FOTOS_INFANTIL[0], FOTOS_INFANTIL[1], FOTOS_INFANTIL[2], FOTOS_INFANTIL[4]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.9,
    reseñas: 34,
    disponible: true,
  },
  {
    id: 5,
    nombre: 'Stitch Azul',
    categoria: 'Cumple',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Cumple'],
    precioPublico: 750000,
    precioDecoradora: 500000,
    garantia: 300000,
    descripcion:
      '¡Tendencia total en Ciudad del Este! Kit premium de Stitch Ohana con tabla de surf, flores hawaianas y neón azul.',
    incluye: [...INCLUYE_DECO_BASE, 'Stitch gigante 1m + Tabla de surf temática + Neón Ohana'],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_INFANTIL[4], FOTOS_INFANTIL[0], FOTOS_INFANTIL[1], FOTOS_INFANTIL[2], FOTOS_INFANTIL[3]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 5.0,
    reseñas: 56,
    disponible: true,
  },
  {
    id: 6,
    nombre: 'Mickey Clásico',
    categoria: 'Cumple',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Cumple'],
    precioPublico: 650000,
    precioDecoradora: 450000,
    garantia: 300000,
    descripcion:
      'El clásico que nunca falla en rojo, negro y amarillo con orejitas de Mickey y posatortas temáticos.',
    incluye: [...INCLUYE_DECO_BASE, 'Silueta orejas Mickey 3D + Mano enguantada display'],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: FOTOS_INFANTIL,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.8,
    reseñas: 25,
    disponible: true,
  },
  {
    id: 7,
    nombre: 'Minnie Rosa',
    categoria: 'Cumple',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Cumple'],
    precioPublico: 650000,
    precioDecoradora: 450000,
    garantia: 300000,
    descripcion:
      'Minnie Mouse en versión rosa pastel y lunares blancos. Ideal para 1 a 5 años con moño gigante iluminado.',
    incluye: [...INCLUYE_DECO_BASE, 'Moño rosa acolchado + Display Minnie 90cm'],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_INFANTIL[1], FOTOS_INFANTIL[3], FOTOS_INFANTIL[0], FOTOS_INFANTIL[2], FOTOS_INFANTIL[4]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.9,
    reseñas: 31,
    disponible: true,
  },
  {
    id: 8,
    nombre: 'Mariposas',
    categoria: 'Cumple',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Cumple'],
    precioPublico: 650000,
    precioDecoradora: 450000,
    garantia: 300000,
    descripcion:
      'Jardín encantado de mariposas en lila y rosa con alas luminosas LED para fotos espectaculares.',
    incluye: [...INCLUYE_DECO_BASE, '2 Mariposas gigantes LED de pie + Flores de tela'],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_INFANTIL[2], FOTOS_INFANTIL[4], FOTOS_INFANTIL[0], FOTOS_INFANTIL[1], FOTOS_INFANTIL[3]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.9,
    reseñas: 27,
    disponible: true,
  },
  {
    id: 9,
    nombre: 'Fútbol',
    categoria: 'Cumple',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Cumple'],
    precioPublico: 650000,
    precioDecoradora: 450000,
    garantia: 300000,
    descripcion:
      'Para fanáticos de la cancha: alfombra tipo césped sintético, trofeo Copa del Mundo y pelotas decorativas.',
    incluye: [...INCLUYE_DECO_BASE, 'Alfombra césped verde + Réplica Copa del Mundo + Pelotas'],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_INFANTIL[3], FOTOS_INFANTIL[2], FOTOS_INFANTIL[0], FOTOS_INFANTIL[1], FOTOS_INFANTIL[4]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.8,
    reseñas: 33,
    disponible: true,
  },
  {
    id: 10,
    nombre: 'Kuromi',
    categoria: 'Cumple',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Cumple'],
    precioPublico: 750000,
    precioDecoradora: 500000,
    garantia: 300000,
    descripcion:
      'El personaje más pedido por las nenas: Kuromi aesthetic en lila, negro y fucsia con neón incluido.',
    incluye: [...INCLUYE_DECO_BASE, 'Display Kuromi + My Melody + Letrero Neón Lila'],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_INFANTIL[4], FOTOS_INFANTIL[1], FOTOS_INFANTIL[0], FOTOS_INFANTIL[2], FOTOS_INFANTIL[3]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 5.0,
    reseñas: 48,
    disponible: true,
  },
  {
    id: 11,
    nombre: 'Conejita',
    categoria: 'Cumple',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Cumple'],
    precioPublico: 650000,
    precioDecoradora: 450000,
    garantia: 300000,
    descripcion:
      'Ternura absoluta en tonos nude, durazno y blanco. Ideal para primer añito o bautismo.',
    incluye: [...INCLUYE_DECO_BASE, 'Conejitas florales en MDF + Flores secas boho'],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: FOTOS_INFANTIL,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.9,
    reseñas: 19,
    disponible: true,
  },
  {
    id: 12,
    nombre: 'Osito Teddy',
    categoria: 'Cumple',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Cumple'],
    precioPublico: 650000,
    precioDecoradora: 450000,
    garantia: 300000,
    descripcion:
      'Osito Teddy en globo aerostático con tonos beige, caramelo y celeste pastel. Súper delicado.',
    incluye: [...INCLUYE_DECO_BASE, 'Osito de peluche gigante + Cubos BABY/NOMBRE'],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_INFANTIL[1], FOTOS_INFANTIL[0], FOTOS_INFANTIL[3], FOTOS_INFANTIL[2], FOTOS_INFANTIL[4]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.9,
    reseñas: 28,
    disponible: true,
  },
  {
    id: 13,
    nombre: 'Plim Plim',
    categoria: 'Cumple',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Cumple'],
    precioPublico: 750000,
    precioDecoradora: 500000,
    garantia: 300000,
    descripcion:
      'El payasito héroe del corazón con todos sus amigos. Colores vibrantes y panel sublimado HD nuevo.',
    incluye: [...INCLUYE_DECO_BASE, 'Set completo personajes Plim Plim + Número luminoso'],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_INFANTIL[2], FOTOS_INFANTIL[3], FOTOS_INFANTIL[0], FOTOS_INFANTIL[1], FOTOS_INFANTIL[4]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 5.0,
    reseñas: 39,
    disponible: true,
  },
  {
    id: 14,
    nombre: 'Arcoíris',
    categoria: 'Cumple',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Cumple'],
    precioPublico: 650000,
    precioDecoradora: 450000,
    garantia: 300000,
    descripcion:
      'Arcoíris boho pastel con nubes sonrientes. Fresco, alegre y adaptable para cualquier edad.',
    incluye: [...INCLUYE_DECO_BASE, 'Arcoíris MDF calado + Nubes LED cálidas'],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_INFANTIL[3], FOTOS_INFANTIL[4], FOTOS_INFANTIL[0], FOTOS_INFANTIL[1], FOTOS_INFANTIL[2]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.8,
    reseñas: 22,
    disponible: true,
  },

  // ================= 15 AÑOS / BODA (15 - 22) =================
  {
    id: 15,
    nombre: '15 Dorado Lujo',
    categoria: '15 Años',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', '15 Años'],
    precioPublico: 1300000,
    precioDecoradora: 850000,
    garantia: 300000,
    descripcion:
      'Impactante puesta en escena para 15 años con panel shimmer wall dorado brillante, neón "Mis 15" y cilindros espejados.',
    incluye: [
      'Panel Shimmer Wall de lentejuelas doradas + Estructura reforzada',
      '3 Cilindros dorados premium + Mesa principal',
      'Letrero Neón "Mis 15" + Número 15 gigante iluminado',
      'Arreglos florales permanentes de alta gama',
      'Alfombra beige de gala + Posatortas con cristales',
    ],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: FOTOS_15_BODA,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 5.0,
    reseñas: 45,
    disponible: true,
  },
  {
    id: 16,
    nombre: '15 Rosa Gold',
    categoria: '15 Años',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', '15 Años'],
    precioPublico: 1300000,
    precioDecoradora: 850000,
    garantia: 300000,
    descripcion:
      'Glamour en Rose Gold con lentejuelas brillantes, flores rosas empolvadas y detalles metálicos.',
    incluye: [
      'Panel Shimmer Rose Gold + Arco romano doble',
      '3 Cilindros vestidura Rose Gold',
      'Neón LED "Quince Años" + Sitial princesa opcional',
      'Set de 8 piezas de pastelería doradas',
    ],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_15_BODA[1], FOTOS_15_BODA[0], FOTOS_15_BODA[2], FOTOS_15_BODA[3], FOTOS_15_BODA[4]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 5.0,
    reseñas: 37,
    disponible: true,
  },
  {
    id: 17,
    nombre: '15 Lila Elegante',
    categoria: '15 Años',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', '15 Años'],
    precioPublico: 1200000,
    precioDecoradora: 800000,
    garantia: 300000,
    descripcion:
      'Tonos lavanda, lila y plata para una noche mágica. Incluye mariposas LED y flores de seda.',
    incluye: [
      'Doble panel romano lila y glitter plata',
      '3 Cilindros + Bandejas espejadas',
      'Neón "Mis 15" + Mariposas gigantes luminosas',
      'Alfombra blanca peluda premium',
    ],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_15_BODA[2], FOTOS_15_BODA[0], FOTOS_15_BODA[1], FOTOS_15_BODA[3], FOTOS_15_BODA[4]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.9,
    reseñas: 26,
    disponible: true,
  },
  {
    id: 18,
    nombre: 'Neón 15',
    categoria: '15 Años',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', '15 Años'],
    precioPublico: 1200000,
    precioDecoradora: 800000,
    garantia: 300000,
    descripcion:
      'Estilo fiesta Glow & TikTok spot. Fondo negro mate con aros LED RGB, esferas disco y letreros flúor.',
    incluye: [
      'Panel negro + Aro LED RGB multicolor',
      '6 Esferas espejadas tipo boliche de distintos tamaños',
      '2 Letreros Neón ("Let\'s Party" + "Mis 15")',
      'Cilindros metalizados plata',
    ],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_15_BODA[3], FOTOS_15_BODA[1], FOTOS_15_BODA[0], FOTOS_15_BODA[2], FOTOS_15_BODA[4]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.9,
    reseñas: 31,
    disponible: true,
  },
  {
    id: 19,
    nombre: 'Graduación',
    categoria: '15 Años',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', '15 Años'],
    precioPublico: 1200000,
    precioDecoradora: 800000,
    garantia: 300000,
    descripcion:
      'Escenario fotográfico para colaciones, defensas de tesis y fiestas de egreso en negro y dorado.',
    incluye: [
      'Panel circular negro/dorado + Birrete 3D',
      'Letrero Neón "Felicidades Graduado" / "Promo 2026"',
      '3 Cilindros de gala + Copa brindis gigante',
      'Alfombra roja de entrada',
    ],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_15_BODA[4], FOTOS_15_BODA[0], FOTOS_15_BODA[1], FOTOS_15_BODA[2], FOTOS_15_BODA[3]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.8,
    reseñas: 21,
    disponible: true,
  },
  {
    id: 20,
    nombre: 'Cumple Adulto',
    categoria: 'Cumple',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Cumple', '15 Años'],
    precioPublico: 900000,
    precioDecoradora: 600000,
    garantia: 300000,
    descripcion:
      'Diseño sofisticado en negro, dorado y blanco o terracota para celebrar 30, 40, 50 o 60 años con estilo.',
    incluye: [
      'Panel circular con aro dorado + Neón "Happy Birthday"',
      '3 Mesas cilíndricas elegantes',
      'Números LED intercambiables para la edad',
      'Set de posatortas negros y dorados',
    ],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: FOTOS_15_BODA,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.9,
    reseñas: 40,
    disponible: true,
  },
  {
    id: 21,
    nombre: 'Boda Boho',
    categoria: 'Boda',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Boda', '15 Años'],
    precioPublico: 1500000,
    precioDecoradora: 950000,
    garantia: 300000,
    descripcion:
      'Romántico estilo Boho Chic con pampas naturales, arcos de madera y arreglos florales en tonos marfil y terracota.',
    incluye: [
      'Arco triangular o circular con flores boho y pampas grass',
      'Letrero Neón "Better Together" / "Recién Casados"',
      'Mesa desestructurada + 3 Cilindros lino beige',
      'Faroles rústicos con velas LED cálidas + Alfombra de yute',
    ],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_15_BODA[0], FOTOS_15_BODA[3], FOTOS_15_BODA[1], FOTOS_15_BODA[2], FOTOS_15_BODA[4]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 5.0,
    reseñas: 34,
    disponible: true,
  },
  {
    id: 22,
    nombre: 'Boda Blanco',
    categoria: 'Boda',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Boda', '15 Años'],
    precioPublico: 1500000,
    precioDecoradora: 950000,
    garantia: 300000,
    descripcion:
      'Clásico nupcial en blanco puro y dorado imperial. Perfecto para boda civil, religiosa o aniversario de bodas.',
    incluye: [
      'Doble panel blanco + Arco de rosas blancas de seda premium',
      '3 Columnas doradas con cristales + Mesa para torta nupcial',
      'Neón "Mr & Mrs" + Candelabros LED',
      'Alfombra blanca de gala',
    ],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_15_BODA[3], FOTOS_15_BODA[0], FOTOS_15_BODA[1], FOTOS_15_BODA[2], FOTOS_15_BODA[4]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 5.0,
    reseñas: 29,
    disponible: true,
  },

  // ================= BAUTISMO / BABY (23 - 27) =================
  {
    id: 23,
    nombre: 'Bautismo Nena',
    categoria: 'Bautismo',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Bautismo'],
    precioPublico: 700000,
    precioDecoradora: 480000,
    garantia: 300000,
    descripcion:
      'Delicadeza angelical en blanco, rosa pálido y dorado con Espíritu Santo iluminado y flores blancas.',
    incluye: [
      ...INCLUYE_DECO_BASE,
      'Espíritu Santo calado con luz cálida + Cruz dorada + Letrero "Mi Bautismo"',
    ],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: FOTOS_BAUTISMO,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.9,
    reseñas: 24,
    disponible: true,
  },
  {
    id: 24,
    nombre: 'Bautismo Nene',
    categoria: 'Bautismo',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Bautismo'],
    precioPublico: 700000,
    precioDecoradora: 480000,
    garantia: 300000,
    descripcion:
      'Combinación serena en blanco, celeste cielo y dorado con angelito y detalles religiosos finos.',
    incluye: [
      ...INCLUYE_DECO_BASE,
      'Espíritu Santo iluminado + Cáliz decorativo + Letrero "Mi Bautismo"',
    ],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_BAUTISMO[1], FOTOS_BAUTISMO[0], FOTOS_BAUTISMO[2], FOTOS_BAUTISMO[3], FOTOS_BAUTISMO[4]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.9,
    reseñas: 22,
    disponible: true,
  },
  {
    id: 25,
    nombre: 'Baby Shower Nena',
    categoria: 'Bautismo',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Bautismo'],
    precioPublico: 700000,
    precioDecoradora: 480000,
    garantia: 300000,
    descripcion:
      'Dulce espera en rosa pastel y dorado con cubos transparentes BABY, osita y neón "Oh Baby".',
    incluye: [...INCLUYE_DECO_BASE, '4 Cubos BABY con globos internos + Neón "Oh Baby"'],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_BAUTISMO[2], FOTOS_BAUTISMO[0], FOTOS_BAUTISMO[1], FOTOS_BAUTISMO[3], FOTOS_BAUTISMO[4]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 5.0,
    reseñas: 35,
    disponible: true,
  },
  {
    id: 26,
    nombre: 'Baby Shower Nene',
    categoria: 'Bautismo',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Bautismo'],
    precioPublico: 700000,
    precioDecoradora: 480000,
    garantia: 300000,
    descripcion:
      'Bienvenida para el bebé en celeste, beige y blanco con cubos BABY, elefantito y neón "Oh Baby".',
    incluye: [...INCLUYE_DECO_BASE, '4 Cubos BABY + Neón "Oh Baby" + Osito de peluche'],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_BAUTISMO[3], FOTOS_BAUTISMO[0], FOTOS_BAUTISMO[1], FOTOS_BAUTISMO[2], FOTOS_BAUTISMO[4]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.9,
    reseñas: 30,
    disponible: true,
  },
  {
    id: 27,
    nombre: 'Primera Comunión',
    categoria: 'Bautismo',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Bautismo'],
    precioPublico: 800000,
    precioDecoradora: 550000,
    garantia: 300000,
    descripcion:
      'Montaje solemne con follaje de olivo, cáliz dorado, espigas de trigo y cruz iluminada.',
    incluye: [
      ...INCLUYE_DECO_BASE,
      'Panel blanco con guirnalda de eucalipto + Cáliz dorado 3D + Neón "Mi Comunión"',
    ],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_BAUTISMO[4], FOTOS_BAUTISMO[0], FOTOS_BAUTISMO[1], FOTOS_BAUTISMO[2], FOTOS_BAUTISMO[3]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 5.0,
    reseñas: 27,
    disponible: true,
  },

  // ================= EMPRESA (28 - 30) =================
  {
    id: 28,
    nombre: 'Navidad',
    categoria: 'Empresa',
    grupo: 'Deco',
    tags: ['Todos', 'Deco'],
    precioPublico: 850000,
    precioDecoradora: 580000,
    garantia: 300000,
    descripcion:
      'Set navideño para cenas de fin de año, comercios de CDE o fotos familiares con árbol nevado y cascanueces.',
    incluye: [
      'Panel navideño rojo/dorado + Árbol decorado con luces',
      'Cascanueces decorativo + Cajas de regalo iluminadas',
      '3 Cilindros temáticos + Posatortas dorados',
    ],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: FOTOS_EMPRESA,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.9,
    reseñas: 18,
    disponible: true,
  },
  {
    id: 29,
    nombre: 'Empresa',
    categoria: 'Empresa',
    grupo: 'Deco',
    tags: ['Todos', 'Deco'],
    precioPublico: 900000,
    precioDecoradora: 600000,
    garantia: 300000,
    descripcion:
      'Backdrop corporativo para lanzamientos de marca, aniversarios de tienda en el microcentro o brindis empresarial.',
    incluye: [
      'Estructura circular/rectangular neutra personalizable',
      '2 Pedestales ejecutivos + Alfombra corporativa',
      'Iluminación focal LED para destacar tu logo',
    ],
    noIncluye: ['Vinilo impreso con logo propio (se cotiza aparte si desea conservarlo)'],
    fotos: [FOTOS_EMPRESA[1], FOTOS_EMPRESA[0], FOTOS_EMPRESA[2], FOTOS_EMPRESA[3], FOTOS_EMPRESA[4]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.9,
    reseñas: 25,
    disponible: true,
  },
  {
    id: 30,
    nombre: 'Kit Mini Foto',
    categoria: 'Empresa',
    grupo: 'Deco',
    tags: ['Todos', 'Deco', 'Cumple'],
    precioPublico: 350000,
    precioDecoradora: 250000,
    garantia: 300000,
    descripcion:
      'Rincón express para fotos o mesa de torta en departamentos o espacios reducidos. Económico y súper rápido.',
    incluye: [
      '1 Aro circular 1.50m con tela a elección',
      '1 Cilindro principal + 3 Posatortas',
      '1 Letrero Neón "Feliz Cumple"',
    ],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_EMPRESA[2], FOTOS_EMPRESA[3], FOTOS_EMPRESA[0], FOTOS_EMPRESA[1], FOTOS_EMPRESA[4]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.8,
    reseñas: 49,
    disponible: true,
  },

  // ================= AUDIOVISUAL (31 - 38) =================
  {
    id: 31,
    nombre: 'Kit Sonido Fiesta Casa',
    categoria: 'Sonido',
    grupo: 'Audiovisual',
    tags: ['Todos', 'Sonido'],
    precioPublico: 350000,
    precioDecoradora: 250000,
    garantia: 500000,
    descripcion:
      'Potencia nítida por Bluetooth o cable para cumples en casa o quincho hasta 50 personas. Conectás tu celular y listo.',
    incluye: [
      '1 Parlante activo profesional 15" con Bluetooth',
      '1 Micrófono inalámbrico para animación o karaoke',
      '1 Trípode reforzado de altura regulable',
      'Cables de alimentación y auxiliar incluidos',
    ],
    noIncluye: NO_INCLUYE_AUDIO_BASE,
    fotos: FOTOS_AUDIOVISUAL,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 5.0,
    reseñas: 64,
    disponible: true,
  },
  {
    id: 32,
    nombre: 'Kit Sonido Salón',
    categoria: 'Sonido',
    grupo: 'Audiovisual',
    tags: ['Todos', 'Sonido'],
    precioPublico: 650000,
    precioDecoradora: 450000,
    garantia: 500000,
    descripcion:
      'Sonido contundente con graves profundos para salones de eventos, 15 años o bodas hasta 150 personas.',
    incluye: [
      '2 Parlantes activos 15" de alta potencia con trípodes',
      '1 Subwoofer Bajo 18" para golpe de pista',
      '2 Micrófonos inalámbricos UHF',
      '1 Mezcladora (Consola) de 6 canales con Bluetooth',
    ],
    noIncluye: NO_INCLUYE_AUDIO_BASE,
    fotos: [FOTOS_AUDIOVISUAL[1], FOTOS_AUDIOVISUAL[0], FOTOS_AUDIOVISUAL[2], FOTOS_AUDIOVISUAL[3], FOTOS_AUDIOVISUAL[4]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 5.0,
    reseñas: 41,
    disponible: true,
  },
  {
    id: 33,
    nombre: 'Kit Luces Fiesta',
    categoria: 'Luces',
    grupo: 'Audiovisual',
    tags: ['Todos', 'Luces'],
    precioPublico: 400000,
    precioDecoradora: 280000,
    garantia: 500000,
    descripcion:
      'Transformá tu patio o quincho en una discoteca al instante. Luces audiorrítmicas automáticas que siguen la música.',
    incluye: [
      '1 Trípode T de iluminación',
      '4 Tachos Par LED RGBW audiorrítmicos',
      '1 Efecto Derby / Láser multipunto',
      '1 Máquina de humo compacta con 1 litro de líquido incluido',
    ],
    noIncluye: NO_INCLUYE_AUDIO_BASE,
    fotos: [FOTOS_AUDIOVISUAL[2], FOTOS_AUDIOVISUAL[0], FOTOS_AUDIOVISUAL[1], FOTOS_AUDIOVISUAL[3], FOTOS_AUDIOVISUAL[4]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.9,
    reseñas: 38,
    disponible: true,
  },
  {
    id: 34,
    nombre: 'Kit Luces Pro',
    categoria: 'Luces',
    grupo: 'Audiovisual',
    tags: ['Todos', 'Luces'],
    precioPublico: 850000,
    precioDecoradora: 600000,
    garantia: 500000,
    descripcion:
      'Iluminación de nivel profesional para 15 años, bodas y eventos grandes con cabezales móviles Beam.',
    incluye: [
      '2 Cabezales móviles Beam 7R con tótems iluminados',
      '6 Tachos Par LED perimetrales para ambientación',
      'Láser RGB + Flash estroboscópico',
      'Máquina de humo de alto caudal 1500W',
    ],
    noIncluye: NO_INCLUYE_AUDIO_BASE,
    fotos: [FOTOS_AUDIOVISUAL[3], FOTOS_AUDIOVISUAL[2], FOTOS_AUDIOVISUAL[0], FOTOS_AUDIOVISUAL[1], FOTOS_AUDIOVISUAL[4]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 5.0,
    reseñas: 23,
    disponible: true,
  },
  {
    id: 35,
    nombre: 'Kit Cine en Casa',
    categoria: 'Pantallas',
    grupo: 'Audiovisual',
    tags: ['Todos', 'Pantallas'],
    precioPublico: 450000,
    precioDecoradora: 320000,
    garantia: 500000,
    descripcion:
      'Proyector Full HD de alto brillo + Pantalla gigante con trípode de 120 pulgadas. Ideal para partidos de la Albirroja, películas o videos de homenaje.',
    incluye: [
      'Proyector Full HD 4500 lúmenes con entrada HDMI y USB',
      'Pantalla retráctil de 120" con trípode estable',
      'Cable HDMI de 5 metros + Prolongador eléctrico',
    ],
    noIncluye: ['Notebook o reproductor externo'],
    fotos: [FOTOS_AUDIOVISUAL[4], FOTOS_AUDIOVISUAL[0], FOTOS_AUDIOVISUAL[1], FOTOS_AUDIOVISUAL[2], FOTOS_AUDIOVISUAL[3]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.9,
    reseñas: 32,
    disponible: true,
  },
  {
    id: 36,
    nombre: 'Kit Pantalla TV',
    categoria: 'Pantallas',
    grupo: 'Audiovisual',
    tags: ['Todos', 'Pantallas'],
    precioPublico: 400000,
    precioDecoradora: 280000,
    garantia: 500000,
    descripcion:
      'Smart TV 4K de 55" montado en pedestal móvil con ruedas. Perfecto para pasar fotos del cumpleañero, karaoke o stands en eventos.',
    incluye: [
      'Smart TV 55" 4K Ultra HD',
      'Pedestal metálico de piso regulable con bandeja',
      'Control remoto + Cable HDMI + Pendrive de prueba',
    ],
    noIncluye: NO_INCLUYE_AUDIO_BASE,
    fotos: [FOTOS_AUDIOVISUAL[0], FOTOS_AUDIOVISUAL[4], FOTOS_AUDIOVISUAL[1], FOTOS_AUDIOVISUAL[2], FOTOS_AUDIOVISUAL[3]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 4.9,
    reseñas: 27,
    disponible: true,
  },
  {
    id: 37,
    nombre: 'Kit Pantalla LED',
    categoria: 'Pantallas',
    grupo: 'Audiovisual',
    tags: ['Todos', 'Pantallas'],
    precioPublico: 1800000,
    precioDecoradora: 1200000,
    garantia: 500000,
    descripcion:
      'Pantalla LED P3 de alta resolución de 2m x 1m para impacto visual total a plena luz del día o de noche.',
    incluye: [
      'Pantalla LED 2 metros x 1 metro (Gabinetes P3 Indoor/Outdoor)',
      'Procesador de video + Notebook de disparo configurada',
      'Estructura de soporte segura',
    ],
    noIncluye: ['Generador externo en caso de baja tensión'],
    fotos: [FOTOS_AUDIOVISUAL[3], FOTOS_AUDIOVISUAL[4], FOTOS_AUDIOVISUAL[0], FOTOS_AUDIOVISUAL[1], FOTOS_AUDIOVISUAL[2]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 5.0,
    reseñas: 19,
    disponible: true,
  },
  {
    id: 38,
    nombre: 'Kit Fiesta Total',
    categoria: 'Combo Total',
    grupo: 'Audiovisual',
    tags: ['Todos', 'Combo Total', 'Deco', 'Sonido', 'Luces', 'Pantallas'],
    precioPublico: 1450000,
    precioDecoradora: 1000000,
    garantia: 500000,
    descripcion:
      '¡El combo definitivo para olvidarte de todo! Incluye 1 Kit de Decoración a elección + Sonido Salón + Luces Fiesta + TV 55" con pedestal.',
    incluye: [
      '1 Kit de Decoración completo a elección',
      'Kit Sonido Salón (2 Parlantes + Bajo + 2 Micrófonos + Mezcladora)',
      'Kit Luces Fiesta con máquina de humo',
      'Smart TV 55" con pedestal para fotos y karaoke',
    ],
    noIncluye: NO_INCLUYE_DECO_BASE,
    fotos: [FOTOS_15_BODA[0], FOTOS_AUDIOVISUAL[0], FOTOS_AUDIOVISUAL[2], FOTOS_INFANTIL[0], FOTOS_AUDIOVISUAL[4]],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    rating: 5.0,
    reseñas: 68,
    disponible: true,
  },
];

// ================= DATOS DE EJEMPLO DE 5 RESERVAS PARA PROBAR EL ADMIN =================
export type EstadoReserva = 'Pendiente' | 'Pagó 50%' | 'Retirado' | 'Devuelto';
export type EstadoDevolucion = 'OK' | 'Roto' | 'Sucio';

export interface Reserva {
  id: string;
  kitId: number;
  kitNombre: string;
  clienteNombre: string;
  clienteCi: string;
  clienteWhatsapp: string;
  direccionFiesta: string;
  modalidadEntrega: 'retiro' | 'delivery';
  costoDelivery: number;
  agregaSonidoCasa: boolean;
  costoUpsell: number;
  esDecoradora: boolean;
  fechaRetiro: string; // YYYY-MM-DD
  fechaDevolucion: string; // YYYY-MM-DD
  precioTotal: number;
  sena50: number;
  saldoPendiente: number;
  garantia: number;
  metodoPago: 'transferencia' | 'bancard' | 'pix';
  comprobanteNombre?: string;
  estado: EstadoReserva;
  estadoDevolucion?: EstadoDevolucion;
  itemsRotos?: string[];
  descuentoGarantia?: number;
  garantiaDevuelta?: number;
  creadoEn: string;
}

const getRelativeDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const RESERVAS_EJEMPLO: Reserva[] = [
  {
    id: 'PYM-2026-001',
    kitId: 5,
    kitNombre: 'Stitch Azul',
    clienteNombre: 'María Fernanda Benítez',
    clienteCi: '4.582.910',
    clienteWhatsapp: '0983 412 890',
    direccionFiesta: 'Barrio Boquerón II, cerca del Lago de la República, CDE',
    modalidadEntrega: 'delivery',
    costoDelivery: 80000,
    agregaSonidoCasa: true,
    costoUpsell: 350000,
    esDecoradora: false,
    fechaRetiro: getRelativeDate(0),
    fechaDevolucion: getRelativeDate(1),
    precioTotal: 1180000, // 750.000 + 350.000 + 80.000
    sena50: 590000,
    saldoPendiente: 590000,
    garantia: 300000,
    metodoPago: 'transferencia',
    comprobanteNombre: 'comprobante_itau_590mil.jpg',
    estado: 'Pagó 50%',
    creadoEn: getRelativeDate(-2),
  },
  {
    id: 'PYM-2026-002',
    kitId: 15,
    kitNombre: '15 Dorado Lujo',
    clienteNombre: 'Liz Paola Duarte (Decoradora)',
    clienteCi: '3.910.445',
    clienteWhatsapp: '0973 551 209',
    direccionFiesta: 'Salón Imperio, Km 7 Monday, Ciudad del Este',
    modalidadEntrega: 'retiro',
    costoDelivery: 0,
    agregaSonidoCasa: false,
    costoUpsell: 0,
    esDecoradora: true,
    fechaRetiro: getRelativeDate(0),
    fechaDevolucion: getRelativeDate(1),
    precioTotal: 850000,
    sena50: 425000,
    saldoPendiente: 425000,
    garantia: 300000,
    metodoPago: 'pix',
    estado: 'Retirado',
    creadoEn: getRelativeDate(-3),
  },
  {
    id: 'PYM-2026-003',
    kitId: 38,
    kitNombre: 'Kit Fiesta Total',
    clienteNombre: 'Carlos Alberto Giménez',
    clienteCi: '5.120.338',
    clienteWhatsapp: '0981 902 114',
    direccionFiesta: 'Quincho Los Laureles, Área 4, Ciudad del Este',
    modalidadEntrega: 'delivery',
    costoDelivery: 80000,
    agregaSonidoCasa: false,
    costoUpsell: 0,
    esDecoradora: false,
    fechaRetiro: getRelativeDate(2),
    fechaDevolucion: getRelativeDate(3),
    precioTotal: 1530000,
    sena50: 765000,
    saldoPendiente: 765000,
    garantia: 500000,
    metodoPago: 'bancard',
    estado: 'Pendiente',
    creadoEn: getRelativeDate(0),
  },
  {
    id: 'PYM-2026-004',
    kitId: 1,
    kitNombre: 'Safari Baby',
    clienteNombre: 'Romina Villalba',
    clienteCi: '4.899.102',
    clienteWhatsapp: '0994 220 715',
    direccionFiesta: 'Km 4 Super Carretera, Hernandarias / CDE',
    modalidadEntrega: 'retiro',
    costoDelivery: 0,
    agregaSonidoCasa: false,
    costoUpsell: 0,
    esDecoradora: false,
    fechaRetiro: getRelativeDate(-1),
    fechaDevolucion: getRelativeDate(0),
    precioTotal: 650000,
    sena50: 325000,
    saldoPendiente: 0,
    garantia: 300000,
    metodoPago: 'transferencia',
    comprobanteNombre: 'sipap_familiar_325.png',
    estado: 'Retirado',
    creadoEn: getRelativeDate(-4),
  },
  {
    id: 'PYM-2026-005',
    kitId: 32,
    kitNombre: 'Kit Sonido Salón',
    clienteNombre: 'Rodrigo Melgarejo',
    clienteCi: '3.671.882',
    clienteWhatsapp: '0985 771 330',
    direccionFiesta: ' Paraná Country Club, Hernandarias',
    modalidadEntrega: 'delivery',
    costoDelivery: 80000,
    agregaSonidoCasa: false,
    costoUpsell: 0,
    esDecoradora: false,
    fechaRetiro: getRelativeDate(-3),
    fechaDevolucion: getRelativeDate(-2),
    precioTotal: 730000,
    sena50: 365000,
    saldoPendiente: 0,
    garantia: 500000,
    metodoPago: 'bancard',
    estado: 'Devuelto',
    estadoDevolucion: 'OK',
    itemsRotos: [],
    descuentoGarantia: 0,
    garantiaDevuelta: 500000,
    creadoEn: getRelativeDate(-5),
  },
];
