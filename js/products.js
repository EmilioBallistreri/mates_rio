// Base de datos de productos de Mates Río
const PRODUCTS_DATA = [
  // PROMOS
  {
    id: "promo-1",
    name: "Combo Río Imperial Black + Termo 1L + Bombilla Alpaca",
    category: "promos",
    categoryName: "PROMOS",
    price: 84900,
    originalPrice: 99900,
    badge: "OFERTA TOP",
    badgeType: "promo",
    rating: 5.0,
    reviewsCount: 38,
    image: "assets/images/cat_promos.jpg",
    description: "El combo definitivo para los amantes del buen mate. Incluye Mate Imperial forrado en cuero vacuno negro con virola de alpaca cincelada a mano, Termo de acero inoxidable 1L doble capa térmica (mantiene 24hs) y Bombilla pico de loro de alpaca maciza. ¡Viene en caja de madera de regalo!",
    specs: {
      material: "Calabaza gruesa de Brasil y cuero vacuno legítimo",
      virola: "Alpaca maciza cincelada artesanalmente",
      termo: "Acero inoxidable 18/8 de 1 Litro con tapón cebador",
      bombilla: "Alpaca pico de loro 19cm con filtro desarmable",
      garantia: "Garantía artesanal de 6 meses"
    },
    inStock: true
  },
  {
    id: "promo-2",
    name: "Set Matero Camionero Marrón + Matera de Cuero Vacuno",
    category: "promos",
    categoryName: "PROMOS",
    price: 72500,
    originalPrice: 85000,
    badge: "20% OFF",
    badgeType: "promo",
    rating: 4.9,
    reviewsCount: 26,
    image: "assets/images/banner_2.jpg",
    description: "Llevá tu pasión matera a todos lados. Incluye Mate Camionero con virola lisa de acero quirúrgico, bombilla cincelada y la exclusiva Matera de cuero vacuno color suela con manija reforzada y compartimentos.",
    specs: {
      material: "Cuero vaqueta legítimo argentino",
      virola: "Acero inoxidable pulido espejo",
      matera: "Cuero vacuno curtido vegetal con herrajes de bronce",
      bombilla: "Bombillón curvo con resorte limpiable",
      garantia: "Garantía artesanal de 6 meses"
    },
    inStock: true
  },
  {
    id: "promo-3",
    name: "Dúo Matero Amigos: 2 Mates Torpedo + 2 Bombillas Pico de Loro",
    category: "promos",
    categoryName: "PROMOS",
    price: 59900,
    originalPrice: 69900,
    badge: "COMBO DÚO",
    badgeType: "promo",
    rating: 4.8,
    reviewsCount: 19,
    image: "assets/images/cat_mates.jpg",
    description: "Ideal para regalar o compartir. Dos mates modelo Torpedo uruguayo en tonos negro y tostado con virolas de alpaca pulida, acompañados por dos bombillas de alpaca maciza.",
    specs: {
      material: "Calabaza seleccionada con 4 patas de apoyo reforzadas",
      virola: "Alpaca maciza pulida",
      bombilla: "2 Bombillas pico de loro estándar de 18cm",
      garantia: "Garantía de satisfacción Mates Río"
    },
    inStock: true
  },

  // MATES
  {
    id: "mate-1",
    name: "Mate Imperial Artesanal Cuero Negro & Virola Cincelada",
    category: "mates",
    categoryName: "MATES",
    price: 46500,
    originalPrice: null,
    badge: "MÁS VENDIDO",
    badgeType: "bestseller",
    rating: 5.0,
    reviewsCount: 84,
    image: "assets/images/prod_mate_imperial.jpg",
    description: "La joya de Mates Río. Elaborado a mano sobre calabaza gruesa de origen brasileño, forrado en cuero vacuno negro con costura uruguaya a la vista. Virola y base de alpaca cincelada con motivos florales gauchescos únicos.",
    specs: {
      material: "Calabaza gruesa de exportación",
      forrado: "Cuero vacuno seleccionado teñido en negro mate",
      virola: "Alpaca cincelada a mano por orfebres argentinos",
      base: "Fuelle con base de alpaca repujada",
      alturaAprox: "12 a 14 cm"
    },
    inStock: true
  },
  {
    id: "mate-2",
    name: "Mate Torpedo Uruguayo Cuero Tostado & Virola de Alpaca",
    category: "mates",
    categoryName: "MATES",
    price: 34200,
    originalPrice: 38000,
    badge: "CLÁSICO",
    badgeType: "new",
    rating: 4.9,
    reviewsCount: 52,
    image: "assets/images/cat_mates.jpg",
    description: "El formato tradicional uruguayo por excelencia. Forma estilizada con boca angosta que permite conservar la montañita de yerba mate por mucho más tiempo sin lavarse.",
    specs: {
      material: "Calabaza natural curada",
      forrado: "Cuero vaqueta color caramelo/tostado",
      virola: "Alpaca lisa pulida a mano",
      apoyo: "Costura reforzada con base firme",
      alturaAprox: "11 a 13 cm"
    },
    inStock: true
  },
  {
    id: "mate-3",
    name: "Mate Camionero Cuero Crudo con Costura Encerada",
    category: "mates",
    categoryName: "MATES",
    price: 36800,
    originalPrice: null,
    badge: "TRADICIÓN",
    badgeType: "featured",
    rating: 4.8,
    reviewsCount: 41,
    image: "assets/images/banner_1.jpg",
    description: "Boca ancha tipo camionero que facilita el cebado continuo y el cambio de yerba. Diseñado para acompañarte en tus jornadas de trabajo, viajes y rondas con amigos.",
    specs: {
      material: "Calabaza de paredes gruesas",
      forrado: "Cuero curtido vegetal de máxima resistencia",
      virola: "Acero inoxidable calidad quirúrgica",
      alturaAprox: "11 cm",
      diametroBoca: "9 cm"
    },
    inStock: true
  },
  {
    id: "mate-4",
    name: "Mate Imperial Deluxe Base Esculpida Alpaca 100%",
    category: "mates",
    categoryName: "MATES",
    price: 52000,
    originalPrice: 58000,
    badge: "EDICIÓN LIMITADA",
    badgeType: "promo",
    rating: 5.0,
    reviewsCount: 33,
    image: "assets/images/prod_mate_imperial.jpg",
    description: "Una pieza de colección. Cincelado completo en virola y base pie realzado. Cada pieza es irrepetible por tratarse de un fruto natural seleccionado entre cientos.",
    specs: {
      material: "Calabaza premium seleccionada",
      virolaYBase: "Alpaca maciza cincelada en relieve",
      cuero: "Cuero vacuno labrado con tratamiento antihumedad",
      incluye: "Certificado de autenticidad artesanal"
    },
    inStock: true
  },

  // TERMOS
  {
    id: "termo-1",
    name: "Termo Media Manija Cuero Acero Inoxidable 1L",
    category: "termos",
    categoryName: "TERMOS",
    price: 42900,
    originalPrice: null,
    badge: "MÁS VENDIDO",
    badgeType: "bestseller",
    rating: 4.9,
    reviewsCount: 67,
    image: "assets/images/cat_termos.jpg",
    description: "El termo preferido para cebar cómodamente con una sola mano. Fabricado en acero inoxidable 18/8 de doble pared con cámara de vacío. Manija ergonómica revestida en cuero vacuno artesanal y tapón vertedor de precisión a rosca.",
    specs: {
      capacidad: "1000 ml (1 Litro)",
      aislacion: "Doble pared con vacío térmico (24hs frío / 24hs calor)",
      manija: "Acero con funda de cuero vacuno cosido a mano",
      tapon: "Pico matero vertedor de flujo continuo libre de goteo",
      material: "Acero inoxidable grado alimenticio 18/8 libre de BPA"
    },
    inStock: true
  },
  {
    id: "termo-2",
    name: "Termo Adventure Acero 1.3L Verde Bosque",
    category: "termos",
    categoryName: "TERMOS",
    price: 64000,
    originalPrice: 72000,
    badge: "GRAN CAPACIDAD",
    badgeType: "promo",
    rating: 5.0,
    reviewsCount: 45,
    image: "assets/images/banner_3.jpg",
    description: "Capacidad de 1.3 litros pensado para viajes largos, campings o mateadas de todo el día. Resistente a golpes y caídas gracias a su cuerpo de acero reforzado con acabado en pintura en polvo texturada verde.",
    specs: {
      capacidad: "1300 ml (1.3 Litros)",
      resistencia: "Cuerpo de acero de alto impacto",
      mantenimiento: "Conserva agua caliente por más de 28 horas",
      tapa: "Tapa térmica que funciona como taza / vaso auxiliar"
    },
    inStock: true
  },
  {
    id: "termo-3",
    name: "Termo Bala Mate Black 1L con Pico Matero Precision",
    category: "termos",
    categoryName: "TERMOS",
    price: 38500,
    originalPrice: null,
    badge: "NUEVO INGRESO",
    badgeType: "new",
    rating: 4.8,
    reviewsCount: 31,
    image: "assets/images/banner_1.jpg",
    description: "Diseño elegante y sobrio en acabado negro mate antideslizante. Silueta compacta que entra perfecto en cualquier matera o mochila. Tapón cebador que no salpica.",
    specs: {
      capacidad: "1000 ml",
      acabado: "Pintura texturada Matte Black de alta adherencia",
      tapon: "Pico vertedor 360 cebador exacto",
      garantia: "Garantía de hermeticidad total"
    },
    inStock: true
  },

  // ACCESORIOS
  {
    id: "acc-1",
    name: "Bombilla Pico de Loro Alpaca Maciza Cincelada",
    category: "accesorios",
    categoryName: "ACCESORIOS",
    price: 16900,
    originalPrice: 19500,
    badge: "FAVORITO",
    badgeType: "featured",
    rating: 5.0,
    reviewsCount: 92,
    image: "assets/images/cat_accesorios.jpg",
    description: "Bombilla artesanal curva modelo Pico de Loro, labrada a mano en alpaca maciza. Su ángulo ergonómico permite tomar mate con máxima comodidad y su filtro tipo cuchara no se tapa jamás.",
    specs: {
      material: "Alpaca maciza de primera calidad",
      largo: "19 cm",
      boquilla: "Pico ancho pulido suave al tacto",
      filtro: "Filtro cuchara microperforado de alta densidad",
      limpieza: "Incluye cepillo limpiador de regalo"
    },
    inStock: true
  },
  {
    id: "acc-2",
    name: "Bombillón Cuchara Cincelado Flor de Liz en Alpaca",
    category: "accesorios",
    categoryName: "ACCESORIOS",
    price: 18500,
    originalPrice: null,
    badge: "ORFEBRERÍA",
    badgeType: "new",
    rating: 4.9,
    reviewsCount: 37,
    image: "assets/images/cat_accesorios.jpg",
    description: "Trabajo fino de orfebrería tradicional con detalle en flor de liz y anillo central repujado. Ideal para mates camioneros e imperiales de boca amplia.",
    specs: {
      material: "Alpaca orfebre pulida brillo espejo",
      largo: "21 cm",
      filtro: "Cuchara amplia con doble ranurado"
    },
    inStock: true
  },
  {
    id: "acc-3",
    name: "Despolvillador de Yerba Mate Acrílico Premium",
    category: "accesorios",
    categoryName: "ACCESORIOS",
    price: 9200,
    originalPrice: 11000,
    badge: "INNOVADOR",
    badgeType: "promo",
    rating: 4.7,
    reviewsCount: 54,
    image: "assets/images/banner_2.jpg",
    description: "Disminuye la acidez y evita que el mate se lave rápido. Separa el polvo excesivo de la yerba en segundos mediante un suave movimiento, dejando las hojas y palos ideales para un cebado perfecto.",
    specs: {
      material: "Acrílico cristal de alto impacto con filtro interno de acero inoxidable",
      capacidad: "Hasta 250g de yerba",
      facilidad: "Lavable en segundos, sistema a rosca hermético"
    },
    inStock: true
  },
  {
    id: "acc-4",
    name: "Set Yerbera y Azucarera de Cuero con Pico Vertedor",
    category: "accesorios",
    categoryName: "ACCESORIOS",
    price: 19800,
    originalPrice: null,
    badge: "ARTESANAL",
    badgeType: "new",
    rating: 4.9,
    reviewsCount: 28,
    image: "assets/images/banner_2.jpg",
    description: "Dúo contenedor forrado en cuero vacuno pespunteado. Picos vertedores de plástico reforzado anti derrame con tapa a presión para cebar sin ensuciar.",
    specs: {
      material: "Lata interna de hojalata sanitaria forrada en cuero vacuno",
      capacidad: "Yerbera 350g / Azucarera 250g",
      tapa: "Pico dosificador retráctil"
    },
    inStock: true
  },

  // YERBAS
  {
    id: "yerba-1",
    name: "Yerba Mate Artesanal Barbaquá Seleccionada 500g",
    category: "yerbas",
    categoryName: "YERBAS",
    price: 5200,
    originalPrice: null,
    badge: "SECADO A LEÑA",
    badgeType: "featured",
    rating: 5.0,
    reviewsCount: 63,
    image: "assets/images/cat_yerbas.jpg",
    description: "Elaborada con el ancestral método barbaquá: secado lento a leña durante 24 horas y estacionamiento natural prolongado de 24 meses. Notas ahumadas equilibradas, cuerpo robusto y cero acidez.",
    specs: {
      estacionamiento: "24 meses natural",
      tipoSecado: "Barbaquá con maderas nobles",
      origen: "Misiones, Argentina",
      peso: "500 gramos",
      molienda: "Tradicional con palo equilibrado"
    },
    inStock: true
  },
  {
    id: "yerba-2",
    name: "Yerba Mate Orgánica Certificada 100% Natural 500g",
    category: "yerbas",
    categoryName: "YERBAS",
    price: 5800,
    originalPrice: null,
    badge: "ORGÁNICA",
    badgeType: "new",
    rating: 4.9,
    reviewsCount: 42,
    image: "assets/images/cat_yerbas.jpg",
    description: "Cultivada sin agroquímicos ni pesticidas en campos protegidos. Cosecha manual de hojas maduras y estacionamiento natural. Sabor suave, herbáceo y duradero.",
    specs: {
      certificacion: "Orgánica Argentina y USDA Organic",
      estacionamiento: "18 meses en cámaras de madera",
      origen: "Oberá, Misiones",
      peso: "500 gramos"
    },
    inStock: true
  },
  {
    id: "yerba-3",
    name: "Blend Serrano Especial: Menta, Poleo & Peperina 500g",
    category: "yerbas",
    categoryName: "YERBAS",
    price: 4900,
    originalPrice: 5600,
    badge: "15% OFF",
    badgeType: "promo",
    rating: 4.8,
    reviewsCount: 39,
    image: "assets/images/cat_yerbas.jpg",
    description: "La combinación perfecta entre la mejor yerba mate estacionada y hierbas aromáticas serranas cosechadas a mano. Refrescante, digestiva y con aroma inconfundible.",
    specs: {
      ingredientes: "Yerba mate con palo, poleo silvestre, menta piperita y peperina cordobesa",
      beneficios: "Digestiva y refrescante",
      peso: "500 gramos"
    },
    inStock: true
  },

  // EQUIPOS DE MATE
  {
    id: "equipo-1",
    name: "Mochila Matera Cuero Genuino Suela con Separadores",
    category: "equipos",
    categoryName: "EQUIPOS DE MATE",
    price: 89900,
    originalPrice: 105000,
    badge: "PREMIUM",
    badgeType: "bestseller",
    rating: 5.0,
    reviewsCount: 47,
    image: "assets/images/cat_equipos.jpg",
    description: "La cúspide del diseño matero. Confeccionada 100% en cuero vacuno flor con herrajes de bronce pulido y cierres metálicos YKK. Interior impermeable acolchado con separadores regulables para termo Stanley de hasta 1.9L, mate imperial, yerbera y accesorios.",
    specs: {
      material: "100% Cuero Vacuno Genuino Curtido Vegetal",
      medidas: "38cm alto x 26cm ancho x 16cm profundidad",
      interior: "Forro acolchado impermeable con sujetadores elásticos",
      correas: "Correas acolchadas reforzadas regulables",
      bolsillos: "Bolsillo frontal para llaves, celular y bombillas"
    },
    inStock: true
  },
  {
    id: "equipo-2",
    name: "Canasta Matera Rústica de Cuero y Madera Maciza",
    category: "equipos",
    categoryName: "EQUIPOS DE MATE",
    price: 44500,
    originalPrice: null,
    badge: "ARTESANAL",
    badgeType: "featured",
    rating: 4.9,
    reviewsCount: 35,
    image: "assets/images/prod_canasta_matera.jpg",
    description: "Canasta clásica criolla confeccionada en cuero de suela grueso de 3mm con remaches cobrizos y manija de madera noble torneada. Firmeza absoluta para que tu termo y mate viajen erguidos y sin riesgo de volcarse.",
    specs: {
      material: "Cuero de suela curtido artesanal",
      manija: "Madera de nogal torneada a mano",
      capacidad: "Entra termo de 1L a 1.9L + mate + yerbera",
      origen: "Fabricación 100% artesanal en Buenos Aires"
    },
    inStock: true
  },
  {
    id: "equipo-3",
    name: "Bolso Matero Térmico Impermeable Cordura Black",
    category: "equipos",
    categoryName: "EQUIPOS DE MATE",
    price: 37800,
    originalPrice: 42000,
    badge: "RESISTENTE",
    badgeType: "promo",
    rating: 4.8,
    reviewsCount: 29,
    image: "assets/images/banner_2.jpg",
    description: "Para quienes buscan practicidad y ligereza. Tela Cordura ripstop antidesgarro e impermeable con aislación térmica de espuma de polietileno. Mantiene la temperatura y protege tus piezas de golpes.",
    specs: {
      material: "Cordura 600D impermeable de alta densidad",
      correa: "Bandolera desmontable y regulable con hombrera acolchada",
      compartimentos: "Sujetador interno para termo y mate",
      lavable: "Apto lavado a mano"
    },
    inStock: true
  }
];

// Categorías del sitio exactamente como lo pidió el cliente
const CATEGORIES_DATA = [
  { id: "promos", name: "PROMOS", label: "Combos & Ofertas", image: "assets/images/cat_promos.jpg", count: 3, badge: "Hasta 25% OFF" },
  { id: "mates", name: "MATES", label: "Imperiales & Torpedos", image: "assets/images/cat_mates.jpg", count: 4, badge: "Más Vendidos" },
  { id: "termos", name: "TERMOS", label: "Acero Inox & Cuero", image: "assets/images/cat_termos.jpg", count: 3, badge: "Térmicos 24hs" },
  { id: "accesorios", name: "ACCESORIOS", label: "Bombillas & Yerberas", image: "assets/images/cat_accesorios.jpg", count: 4, badge: "Alpaca Pura" },
  { id: "yerbas", name: "YERBAS", label: "Barbaquá & Orgánicas", image: "assets/images/cat_yerbas.jpg", count: 3, badge: "Selección Autor" },
  { id: "equipos", name: "EQUIPOS DE MATE", label: "Mochilas & Canastas", image: "assets/images/cat_equipos.jpg", count: 3, badge: "Cuero Genuino" }
];
