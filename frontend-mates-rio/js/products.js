/**
 * MATES RÍO - E-COMMERCE DATA & PERSISTENCE LAYER
 * Categories: promos, mates, termos, accesorios, yerbas, equipos
 */

const PRODUCTS_DATA = [
  // ==========================================================================
  // 1. PROMOS & COMBOS (Etiquetas reservadas para promociones y descuentos)
  // ==========================================================================
  {
    "id": "promo-1",
    "name": "Combo Imperial Deluxe Completo",
    "category": "promos",
    "subcategory": "Set Imperial",
    "categoryName": "Promos",
    "price": 94900,
    "originalPrice": 115000,
    "badge": "18% OFF",
    "badgeType": "promo",
    "image": "assets/images/cat_promos.jpg",
    "description": "Set matero completo: Mate Imperial con virola de alpaca cincelada, Termo Media Manija 1L de acero inoxidable, Bombilla Pico de Loro de alpaca y Canasta Matera de cuero.",
    "specs": [
      "Mate Imperial calabaza y alpaca",
      "Termo Acero Inox 1L + Bombilla Alpaca",
      "Canasta Matera de cuero reforzada"
    ],
    "featured": true,
    "inStock": true,
    "cost": 52195,
    "wholesalePrice": 66430,
    "sku": "MR-PRO-001",
    "stock": 12
  },
  {
    "id": "promo-2",
    "name": "Set Matero Camionero + Termo 1L",
    "category": "promos",
    "subcategory": "Set Camionero",
    "categoryName": "Promos",
    "price": 76500,
    "originalPrice": 92000,
    "badge": "17% OFF",
    "badgeType": "promo",
    "image": "assets/images/banner_2.jpg",
    "description": "Combo ideal para la ruta y el día a día. Incluye Mate Camionero de cuero vacuno, Termo de acero inoxidable 1L y Bombilla chata de acero.",
    "specs": [
      "Mate Camionero boca ancha",
      "Termo 1L Acero Inoxidable",
      "Bombilla acero inoxidable incluida"
    ],
    "featured": true,
    "inStock": true,
    "cost": 42075,
    "wholesalePrice": 53550,
    "sku": "MR-PRO-002",
    "stock": 15
  },
  {
    "id": "promo-3",
    "name": "Pack Dúo: Mate Torpedo + Yerba + Bombilla",
    "category": "promos",
    "subcategory": "Pack Regalo",
    "categoryName": "Promos",
    "price": 46900,
    "originalPrice": 56000,
    "badge": "16% OFF",
    "badgeType": "promo",
    "image": "assets/images/prod_mate_torpedo.jpg",
    "description": "Kit listo para regalar o empezar a matear. Mate Torpedo uruguayo forrado en cuero, Bombilla Pico de Loro y Yerba Mate Seleccionada 500g.",
    "specs": [
      "Mate Torpedo cuero vacuno",
      "Bombilla Pico de Loro",
      "Yerba de Autor 500g + Caja de presentación"
    ],
    "featured": false,
    "inStock": true,
    "cost": 25795,
    "wholesalePrice": 32830,
    "sku": "MR-PRO-003",
    "stock": 18
  },
  {
    "id": "promo-4",
    "name": "Combo Ejecutivo Mochila + Imperial + Termo",
    "category": "promos",
    "subcategory": "Set Imperial",
    "categoryName": "Promos",
    "price": 118000,
    "originalPrice": 148000,
    "badge": "20% OFF",
    "badgeType": "promo",
    "image": "assets/images/cat_equipos.jpg",
    "description": "Equipamiento completo con Mochila Matera acolchada, Mate Imperial de alpaca, Termo 1L negro mate, Bombilla de alpaca y Yerbera.",
    "specs": [
      "Mochila Matera impermeable",
      "Mate Imperial + Bombilla Alpaca",
      "Termo 1L Negro Mate + Yerbera"
    ],
    "featured": true,
    "inStock": true,
    "cost": 64900,
    "wholesalePrice": 82600,
    "sku": "MR-PRO-004",
    "stock": 8
  },

  // ==========================================================================
  // 2. MATES (Sin etiquetas comerciales superfluas, nombre y precio limpios)
  // ==========================================================================
  {
    "id": "mate-1",
    "name": "Mate Imperial Virola Cincelada Alpaca",
    "category": "mates",
    "subcategory": "Imperial",
    "categoryName": "Mates",
    "price": 44500,
    "originalPrice": null,
    "badge": "",
    "badgeType": "",
    "image": "assets/images/prod_mate_imperial.jpg",
    "description": "Mate Imperial elaborado con calabaza seleccionada de pared gruesa, forrado en cuero vacuno legítimo con costura uruguaya artesanal y virola de alpaca cincelada a mano.",
    "specs": [
      "Calabaza brasilera seleccionada",
      "Cuero vacuno legítimo y virola de alpaca",
      "4 patas firmes reforzadas"
    ],
    "featured": true,
    "inStock": true,
    "cost": 24475,
    "wholesalePrice": 31150,
    "sku": "MR-MAT-001",
    "stock": 24
  },
  {
    "id": "mate-2",
    "name": "Mate Camionero Uruguayo Cuero Crudo",
    "category": "mates",
    "subcategory": "Camionero",
    "categoryName": "Mates",
    "price": 34900,
    "originalPrice": null,
    "badge": "",
    "badgeType": "",
    "image": "assets/images/prod_mate_camionero.jpg",
    "description": "Mate Camionero de boca ancha que facilita el armado de la montañita. Virola de acero inoxidable pulido espejo y cuerpo de cuero vacuno.",
    "specs": [
      "Calabaza gruesa de boca ancha",
      "Virola de acero inoxidable pulido",
      "Forrado en cuero vacuno"
    ],
    "featured": true,
    "inStock": true,
    "cost": 19195,
    "wholesalePrice": 24430,
    "sku": "MR-MAT-002",
    "stock": 30
  },
  {
    "id": "mate-3",
    "name": "Mate Torpedo Cincelado Cuero Marrón",
    "category": "mates",
    "subcategory": "Torpedo",
    "categoryName": "Mates",
    "price": 36800,
    "originalPrice": null,
    "badge": "",
    "badgeType": "",
    "image": "assets/images/prod_mate_torpedo.jpg",
    "description": "Diseño ergonómico que calza cómodo en la mano. Calabaza seleccionada, forrado en cuero marrón suela y virola cincelada.",
    "specs": [
      "Formato Torpedo ergonómico",
      "Cuero vacuno color suela",
      "Virola de alpaca cincelada"
    ],
    "featured": true,
    "inStock": true,
    "cost": 20240,
    "wholesalePrice": 25760,
    "sku": "MR-MAT-003",
    "stock": 19
  },
  {
    "id": "mate-4",
    "name": "Mate Imperial Algarrobo Torneado & Alpaca",
    "category": "mates",
    "subcategory": "Algarrobo",
    "categoryName": "Mates",
    "price": 38500,
    "originalPrice": null,
    "badge": "",
    "badgeType": "",
    "image": "assets/images/cat_mates.jpg",
    "description": "Madera de algarrobo estacionada y lustrada con cera natural de abejas. No requiere curado complejo ni genera hongos.",
    "specs": [
      "Madera maciza de algarrobo",
      "Virola de alpaca cincelada",
      "Listo para usar"
    ],
    "featured": false,
    "inStock": true,
    "cost": 21175,
    "wholesalePrice": 26950,
    "sku": "MR-MAT-004",
    "stock": 15
  },
  {
    "id": "mate-5",
    "name": "Mate Imperial Deluxe Bronce & Alpaca",
    "category": "mates",
    "subcategory": "Imperial",
    "categoryName": "Mates",
    "price": 51900,
    "originalPrice": null,
    "badge": "",
    "badgeType": "",
    "image": "assets/images/banner_1.jpg",
    "description": "Pieza de orfebrería criolla con apliques en bronce macizo sobre faja de alpaca labrada y cuero vacuno graneado negro.",
    "specs": [
      "Virola y fleje de alpaca con apliques en bronce",
      "Calabaza extra gruesa seleccionada",
      "Incluye caja de presentación"
    ],
    "featured": true,
    "inStock": true,
    "cost": 28545,
    "wholesalePrice": 36330,
    "sku": "MR-MAT-005",
    "stock": 10
  },

  // ==========================================================================
  // 3. TERMOS
  // ==========================================================================
  {
    "id": "termo-1",
    "name": "Termo Media Manija Acero Inox 1 Litro",
    "category": "termos",
    "subcategory": "Media Manija",
    "categoryName": "Termos",
    "price": 46900,
    "originalPrice": null,
    "badge": "",
    "badgeType": "",
    "image": "assets/images/prod_termo_acero.jpg",
    "description": "Termo clásico uruguayo con media manija rebatible y pico cebador de precisión. Doble capa de acero inoxidable con aislamiento al vacío.",
    "specs": [
      "Capacidad 1 Litro • Acero Inoxidable 304",
      "Conservación térmica 24 hs",
      "Pico cebador a rosca incluido"
    ],
    "featured": true,
    "inStock": true,
    "cost": 25795,
    "wholesalePrice": 32830,
    "sku": "MR-TER-001",
    "stock": 28
  },
  {
    "id": "termo-2",
    "name": "Termo Térmico Negro Mate 1.2 Litros",
    "category": "termos",
    "subcategory": "1.2 Litros",
    "categoryName": "Termos",
    "price": 54500,
    "originalPrice": null,
    "badge": "",
    "badgeType": "",
    "image": "assets/images/cat_termos.jpg",
    "description": "Termo de alta resistencia con recubrimiento Powder Coated negro mate antideslizante, manija rígida lateral y tapón cebador.",
    "specs": [
      "Capacidad 1.2 Litros",
      "Acabado Negro Mate antideslizante",
      "Tapa aislante utilizable como vaso"
    ],
    "featured": true,
    "inStock": true,
    "cost": 29975,
    "wholesalePrice": 38150,
    "sku": "MR-TER-002",
    "stock": 20
  },
  {
    "id": "termo-3",
    "name": "Termo Bala Acero Pulido 1 Litro",
    "category": "termos",
    "subcategory": "1 Litro",
    "categoryName": "Termos",
    "price": 38900,
    "originalPrice": null,
    "badge": "",
    "badgeType": "",
    "image": "assets/images/banner_3.jpg",
    "description": "Diseño liviano y compacto que entra en cualquier matera o mochila. Aislamiento térmico de doble pared y pico vertedor.",
    "specs": [
      "Capacidad 1 Litro compacto",
      "Acero inoxidable bicapa",
      "Tapón vertedor matero"
    ],
    "featured": false,
    "inStock": true,
    "cost": 21395,
    "wholesalePrice": 27230,
    "sku": "MR-TER-003",
    "stock": 22
  },

  // ==========================================================================
  // 4. ACCESORIOS (BOMBILLAS, CAJA DE PRESENTACIÓN, YERBERAS)
  // ==========================================================================
  {
    "id": "acc-1",
    "name": "Bombilla Pico de Loro Alpaca Maciza Cincelada",
    "category": "accesorios",
    "subcategory": "Bombillas",
    "categoryName": "Accesorios",
    "price": 18900,
    "originalPrice": null,
    "badge": "",
    "badgeType": "",
    "image": "assets/images/prod_bombilla_alpaca.jpg",
    "description": "Bombilla artesanal de alpaca maciza con curvatura Pico de Loro, caño grueso cincelado y filtro tipo cuchara.",
    "specs": [
      "Alpaca maciza 100% artesanal",
      "Filtro cuchara de alto caudal",
      "Largo 19 cm"
    ],
    "featured": true,
    "inStock": true,
    "cost": 10395,
    "wholesalePrice": 13230,
    "sku": "MR-ACC-001",
    "stock": 40
  },
  {
    "id": "acc-2",
    "name": "Caja de Presentación Personalizable",
    "category": "accesorios",
    "subcategory": "Cajas de Presentación",
    "categoryName": "Accesorios",
    "price": 24900,
    "originalPrice": null,
    "badge": "",
    "badgeType": "",
    "image": "assets/images/cat_accesorios.jpg",
    "description": "Caja de presentación rectangular con interior acolchado y tapa frontal apta para grabado láser en blanco invertido.",
    "specs": [
      "Formato rectangular rígido",
      "Grabado láser frontal en blanco",
      "Interior para mate, termo o bombilla"
    ],
    "featured": true,
    "inStock": true,
    "cost": 13695,
    "wholesalePrice": 17430,
    "sku": "MR-ACC-002",
    "stock": 25
  },
  {
    "id": "acc-3",
    "name": "Set Yerbera y Azucarera en Cuero",
    "category": "accesorios",
    "subcategory": "Yerberas",
    "categoryName": "Accesorios",
    "price": 24500,
    "originalPrice": null,
    "badge": "",
    "badgeType": "",
    "image": "assets/images/cat_accesorios.jpg",
    "description": "Dúo de envases rígidos forrados en cuero vacuno con pico vertedor plástico rebatible.",
    "specs": [
      "Capacidad 350g yerba / 250g azúcar",
      "Forrado en cuero vacuno",
      "Pico dosificador antivuelco"
    ],
    "featured": false,
    "inStock": true,
    "cost": 13475,
    "wholesalePrice": 17150,
    "sku": "MR-ACC-003",
    "stock": 18
  },

  // ==========================================================================
  // 5. YERBAS
  // ==========================================================================
  {
    "id": "yerba-1",
    "name": "Yerba Mate Despalada Tipo Uruguaya 500g",
    "category": "yerbas",
    "subcategory": "Uruguaya",
    "categoryName": "Yerbas",
    "price": 8900,
    "originalPrice": null,
    "badge": "",
    "badgeType": "",
    "image": "assets/images/prod_yerba_organica.jpg",
    "description": "Molienda fina tipo uruguaya (PU1) con estacionamiento natural de 24 meses. Cebadas rendidoras y espumosas.",
    "specs": [
      "Peso neto 500 gramos",
      "Estacionamiento natural 24 meses",
      "Molienda fina despalada"
    ],
    "featured": true,
    "inStock": true,
    "cost": 4895,
    "wholesalePrice": 6230,
    "sku": "MR-YER-001",
    "stock": 50
  },
  {
    "id": "yerba-2",
    "name": "Yerba Mate Orgánica Misionera Barbacuá 500g",
    "category": "yerbas",
    "subcategory": "Orgánica",
    "categoryName": "Yerbas",
    "price": 9500,
    "originalPrice": null,
    "badge": "",
    "badgeType": "",
    "image": "assets/images/cat_yerbas.jpg",
    "description": "Secanza tradicional lenta tipo Barbacuá con notas tostadas y ahumadas suaves.",
    "specs": [
      "Peso neto 500 gramos",
      "Certificación Orgánica Argentina",
      "Secado artesanal Barbacuá"
    ],
    "featured": false,
    "inStock": true,
    "cost": 5225,
    "wholesalePrice": 6650,
    "sku": "MR-YER-002",
    "stock": 35
  },

  // ==========================================================================
  // 6. EQUIPOS DE MATE (CANASTAS Y MOCHILAS)
  // ==========================================================================
  {
    "id": "equipo-1",
    "name": "Canasta Matera Rígida Cuero Vacuno Legítimo",
    "category": "equipos",
    "subcategory": "Canastas",
    "categoryName": "Equipos de Mate",
    "price": 36900,
    "originalPrice": null,
    "badge": "",
    "badgeType": "",
    "image": "assets/images/prod_canasta_cuero.jpg",
    "description": "Canasta matera artesanal confeccionada en cuero vacuno grueso con separador interno para cuatro piezas.",
    "specs": [
      "100% Cuero vacuno legítimo",
      "Divisor interno para 4 elementos",
      "Base rígida reforzada"
    ],
    "featured": true,
    "inStock": true,
    "cost": 20295,
    "wholesalePrice": 25830,
    "sku": "MR-EQU-001",
    "stock": 16
  },
  {
    "id": "equipo-2",
    "name": "Bolso Mochila Matero Impermeable Urbano",
    "category": "equipos",
    "subcategory": "Mochilas",
    "categoryName": "Equipos de Mate",
    "price": 45900,
    "originalPrice": null,
    "badge": "",
    "badgeType": "",
    "image": "assets/images/cat_equipos.jpg",
    "description": "Mochila matera con interior térmico impermeable, sujetadores elásticos para termo de hasta 1.3L y bolsillo para notebook.",
    "specs": [
      "Tela Cordura impermeable + detalles en cuero",
      "Compartimento térmico para equipo completo",
      "Bolsillo acolchado para notebook"
    ],
    "featured": false,
    "inStock": true,
    "cost": 25245,
    "wholesalePrice": 32130,
    "sku": "MR-EQU-002",
    "stock": 14
  }
];

// ==========================================================================
// CATEGORÍAS DE LA TIENDA Y PERSISTENCIA
// ==========================================================================
const CATEGORIES_DATA = [
  {
    id: 'promos',
    name: 'Promos',
    subtitle: 'Combos y sets con descuento',
    badge: 'OFF',
    image: 'assets/images/cat_promos.jpg',
    subcategories: ['Set Imperial', 'Set Camionero', 'Pack Regalo']
  },
  {
    id: 'mates',
    name: 'Mates',
    subtitle: 'Imperiales, camioneros y torpedos',
    badge: '',
    image: 'assets/images/cat_mates.jpg',
    subcategories: ['Imperial', 'Camionero', 'Torpedo', 'Algarrobo']
  },
  {
    id: 'termos',
    name: 'Termos',
    subtitle: 'Acero inoxidable y media manija',
    badge: '',
    image: 'assets/images/cat_termos.jpg',
    subcategories: ['Media Manija', '1.2 Litros', '1 Litro']
  },
  {
    id: 'accesorios',
    name: 'Accesorios',
    subtitle: 'Bombillas, cajas de presentación y yerberas',
    badge: '',
    image: 'assets/images/cat_accesorios.jpg',
    subcategories: ['Bombillas', 'Cajas de Presentación', 'Yerberas']
  },
  {
    id: 'yerbas',
    name: 'Yerbas',
    subtitle: 'Uruguaya despalada y orgánica',
    badge: '',
    image: 'assets/images/cat_yerbas.jpg',
    subcategories: ['Uruguaya', 'Orgánica', 'Compuesta']
  },
  {
    id: 'equipos',
    name: 'Equipos de Mate',
    subtitle: 'Canastas de cuero y mochilas materas',
    badge: '',
    image: 'assets/images/cat_equipos.jpg',
    subcategories: ['Canastas', 'Mochilas']
  }
];

function getActiveCategories() {
  if (typeof localStorage === 'undefined') return CATEGORIES_DATA;
  try {
    const raw = localStorage.getItem('mates_rio_categories');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error leyendo mates_rio_categories:', e);
  }
  return JSON.parse(JSON.stringify(CATEGORIES_DATA));
}

function saveActiveCategories(categories) {
  if (typeof localStorage === 'undefined') return false;
  try {
    localStorage.setItem('mates_rio_categories', JSON.stringify(categories || []));
    return true;
  } catch (e) {
    console.error('Error guardando mates_rio_categories:', e);
    return false;
  }
}

// ==========================================================================
// BANNERS DEL CARRUSEL PRINCIPAL (HOME SLIDES) Y PERSISTENCIA
// ==========================================================================
const HOME_SLIDES_DATA = [
  {
    id: 'slide-1',
    tag: 'Tradición & Diseño Argentino',
    icon: 'fa-crown',
    title: 'Mates Imperiales y Artesanales de Selección',
    subtitle: 'Calabazas gruesas seleccionadas, cuero vacuno genuino con costura uruguaya y virolas de alpaca maciza.',
    description: 'Calabazas gruesas seleccionadas, cuero vacuno genuino con costura uruguaya y virolas de alpaca maciza.',
    image: 'assets/images/banner_1.jpg',
    btnText: 'Explorar Mates',
    btnLink: 'catalogo.html?categoria=mates',
    btnPrimaryText: 'Explorar Mates',
    btnPrimaryLink: 'catalogo.html?categoria=mates',
    btnSecondaryText: 'Personalizar Ahora',
    btnSecondaryLink: 'personaliza-tu-mate.html'
  },
  {
    id: 'slide-2',
    tag: 'Combos con hasta 25% OFF',
    icon: 'fa-percent',
    title: 'Equipate Completo para tus Rondas de Mate',
    subtitle: 'Sets materos completos con termo de acero inoxidable 1L, mate imperial o camionero, bombilla de alpaca y matera de cuero.',
    description: 'Sets materos completos con termo de acero inoxidable 1L, mate imperial o camionero, bombilla de alpaca y matera de cuero.',
    image: 'assets/images/banner_2.jpg',
    btnText: 'Aprovechar Ofertas',
    btnLink: 'promos.html',
    btnPrimaryText: 'Aprovechar Ofertas',
    btnPrimaryLink: 'promos.html',
    btnSecondaryText: 'Consultar por WhatsApp',
    btnSecondaryLink: 'https://wa.me/5493513830111'
  },
  {
    id: 'slide-3',
    tag: 'Compañeros de Ruta',
    icon: 'fa-mountain',
    title: 'Termos Térmicos de Acero Inoxidable',
    subtitle: 'Termos con pico vertedor de precisión y aislamiento al vacío que mantiene la temperatura por 24 horas.',
    description: 'Termos con pico vertedor de precisión y aislamiento al vacío que mantiene la temperatura por 24 horas.',
    image: 'assets/images/banner_3.jpg',
    btnText: 'Ver Termos',
    btnLink: 'catalogo.html?categoria=termos',
    btnPrimaryText: 'Ver Termos',
    btnPrimaryLink: 'catalogo.html?categoria=termos',
    btnSecondaryText: 'Catálogo Completo',
    btnSecondaryLink: 'catalogo.html'
  }
];

function getActiveHomeSlides() {
  if (typeof localStorage === 'undefined') return HOME_SLIDES_DATA;
  try {
    const raw = localStorage.getItem('mates_rio_home_slides');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(s => Object.assign({}, s, {
          subtitle: s.subtitle || s.description || '',
          description: s.description || s.subtitle || '',
          btnText: s.btnText || s.btnPrimaryText || 'Ver Catálogo',
          btnLink: s.btnLink || s.btnPrimaryLink || 'catalogo.html',
          btnPrimaryText: s.btnPrimaryText || s.btnText || 'Ver Catálogo',
          btnPrimaryLink: s.btnPrimaryLink || s.btnLink || 'catalogo.html'
        }));
      }
    }
  } catch (e) {
    console.warn('Error leyendo mates_rio_home_slides:', e);
  }
  return JSON.parse(JSON.stringify(HOME_SLIDES_DATA));
}

function saveActiveHomeSlides(slides) {
  if (typeof localStorage === 'undefined') return false;
  try {
    const normalized = (slides || []).map(s => Object.assign({}, s, {
      subtitle: s.subtitle || s.description || '',
      description: s.description || s.subtitle || '',
      btnText: s.btnText || s.btnPrimaryText || 'Ver Catálogo',
      btnLink: s.btnLink || s.btnPrimaryLink || 'catalogo.html',
      btnPrimaryText: s.btnPrimaryText || s.btnText || 'Ver Catálogo',
      btnPrimaryLink: s.btnPrimaryLink || s.btnLink || 'catalogo.html'
    }));
    localStorage.setItem('mates_rio_home_slides', JSON.stringify(normalized));
    return true;
  } catch (e) {
    console.error('Error guardando mates_rio_home_slides:', e);
    return false;
  }
}

// ==========================================================================
// CONFIGURACIÓN DE BANNER DE FECHAS ESPECIALES / EVENTOS
// ==========================================================================
const DEFAULT_SPECIAL_OCCASION = {
  active: false,
  enabled: false,
  presetId: 'custom',
  position: 'top-bar',
  emoji: '🧉',
  badge: 'PROMO ESPECIAL',
  title: 'Envío Gratis y Grabado Bonificado en Mates Imperiales',
  subtitle: 'Aprovechá 3 cuotas sin interés y 10% OFF extra por transferencia',
  btnText: 'Ver Promos',
  btnLink: 'promos.html',
  ctaText: 'Ver Promos',
  ctaLink: 'promos.html',
  couponCode: '',
  theme: 'patria'
};

function getSpecialOccasionConfig() {
  if (typeof localStorage === 'undefined') return DEFAULT_SPECIAL_OCCASION;
  try {
    const raw = localStorage.getItem('mates_rio_special_occasion');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const merged = Object.assign({}, DEFAULT_SPECIAL_OCCASION, parsed);
        merged.active = !!(merged.active || merged.enabled);
        merged.enabled = merged.active;
        merged.btnText = merged.btnText || merged.ctaText || 'Ver Promos';
        merged.btnLink = merged.btnLink || merged.ctaLink || 'promos.html';
        merged.ctaText = merged.btnText;
        merged.ctaLink = merged.btnLink;
        return merged;
      }
    }
  } catch (e) {
    console.warn('Error leyendo mates_rio_special_occasion:', e);
  }
  return Object.assign({}, DEFAULT_SPECIAL_OCCASION);
}

function saveSpecialOccasionConfig(config) {
  if (typeof localStorage === 'undefined') return false;
  try {
    const merged = Object.assign({}, DEFAULT_SPECIAL_OCCASION, config || {});
    merged.active = !!(config && (config.active !== undefined ? config.active : config.enabled));
    merged.enabled = merged.active;
    merged.btnText = merged.btnText || merged.ctaText || 'Ver Promos';
    merged.btnLink = merged.btnLink || merged.ctaLink || 'promos.html';
    merged.ctaText = merged.btnText;
    merged.ctaLink = merged.btnLink;
    localStorage.setItem('mates_rio_special_occasion', JSON.stringify(merged));
    return true;
  } catch (e) {
    console.error('Error guardando mates_rio_special_occasion:', e);
    return false;
  }
}

// ==========================================================================
// COMPRAS A PROVEEDORES (PANEL DE ADMINISTRACIÓN)
// ==========================================================================
const DEFAULT_SUPPLIER_PURCHASES = [
  {
    id: 'COMP-101',
    date: '2026-11-01',
    supplier: 'Orfebrería Criolla del Sur',
    category: 'Mates / Insumos',
    productId: 'mate-1',
    item: 'Mate Imperial Virola Cincelada Alpaca',
    items: '20x Mate Imperial Virola Cincelada Alpaca',
    quantity: 20,
    unitCost: 24475,
    totalCost: 489500,
    paymentMethod: 'Transferencia Bancaria',
    status: 'Recibido',
    notes: 'Remito #00124 - Lote seleccionado',
    stockAdded: true
  },
  {
    id: 'COMP-102',
    date: '2026-11-02',
    supplier: 'Importadora Térmica CBA',
    category: 'Termos',
    productId: 'termo-1',
    item: 'Termo Media Manija Acero Inox 1 Litro',
    items: '15x Termo Media Manija Acero Inox 1 Litro',
    quantity: 15,
    unitCost: 25795,
    totalCost: 386925,
    paymentMethod: 'Transferencia Bancaria',
    status: 'Recibido',
    notes: 'Factura A #00419',
    stockAdded: true
  }
];

function getSupplierPurchases() {
  if (typeof localStorage === 'undefined') return DEFAULT_SUPPLIER_PURCHASES;
  try {
    const raw = localStorage.getItem('mates_rio_supplier_purchases');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error leyendo mates_rio_supplier_purchases:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_SUPPLIER_PURCHASES));
}

function saveSupplierPurchases(purchases) {
  if (typeof localStorage === 'undefined') return false;
  try {
    localStorage.setItem('mates_rio_supplier_purchases', JSON.stringify(purchases || []));
    return true;
  } catch (e) {
    console.error('Error guardando mates_rio_supplier_purchases:', e);
    return false;
  }
}

// ==========================================================================
// CONFIGURACIÓN DINÁMICA DE PRECIOS DE PERSONALIZACIÓN Y GRABADO POR VOLUMEN
// ==========================================================================
const DEFAULT_CUSTOMIZATION_PRICING = {
  matePrice: 44500,
  termoPrice: 46900,
  cajaPrice: 24900,
  retailEngravingFee: 0, // Bonificado en minorista
  volumeTiers: [
    { minQty: 1, maxQty: 9, engravingCostPerUnit: 0, discountPercent: 0, label: 'Minorista (Grabado Bonificado)' },
    { minQty: 10, maxQty: 24, engravingCostPerUnit: 2500, discountPercent: 25, label: 'Mayorista Inicial (10 a 24 u.)' },
    { minQty: 25, maxQty: 49, engravingCostPerUnit: 1800, discountPercent: 30, label: 'Mayorista Intermedio (25 a 49 u.)' },
    { minQty: 50, maxQty: 9999, engravingCostPerUnit: 1200, discountPercent: 35, label: 'Mayorista Corporativo (+50 u.)' }
  ]
};

function getCustomizationPricingConfig() {
  if (typeof localStorage === 'undefined') return DEFAULT_CUSTOMIZATION_PRICING;
  try {
    const raw = localStorage.getItem('mates_rio_customization_pricing');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return Object.assign({}, DEFAULT_CUSTOMIZATION_PRICING, parsed);
      }
    }
  } catch (e) {
    console.warn('Error leyendo mates_rio_customization_pricing:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_CUSTOMIZATION_PRICING));
}

function saveCustomizationPricingConfig(config) {
  if (typeof localStorage === 'undefined') return false;
  try {
    const merged = Object.assign({}, DEFAULT_CUSTOMIZATION_PRICING, config || {});
    localStorage.setItem('mates_rio_customization_pricing', JSON.stringify(merged));
    return true;
  } catch (e) {
    console.error('Error guardando mates_rio_customization_pricing:', e);
    return false;
  }
}

// ==========================================================================
// CUPONES DE DESCUENTO
// ==========================================================================
const COUPONS = {
  'MATESRIO10': { discount: 0.10, description: '10% OFF en tu compra' },
  'BIENVENIDO': { discount: 0.10, description: '10% OFF de bienvenida' },
  'CORDOBA15': { discount: 0.15, description: '15% OFF especial Córdoba' }
};

// ==========================================================================
// SINCRONIZACIÓN DE PRODUCTOS CON LOCALSTORAGE (ADMIN & TIENDA)
// ==========================================================================
const INITIAL_PRODUCTS_DATA = JSON.parse(JSON.stringify(PRODUCTS_DATA));

function syncProductsFromStorage() {
  if (typeof localStorage === 'undefined') return;
  try {
    // 0. Restaurar copia base limpia para reconstrucción determinística en todos los dispositivos
    const deletedRaw = localStorage.getItem('mates_rio_deleted_products');
    const deletedIds = new Set(deletedRaw ? (JSON.parse(deletedRaw) || []) : []);

    PRODUCTS_DATA.length = 0;
    INITIAL_PRODUCTS_DATA.forEach(baseProd => {
      if (!deletedIds.has(baseProd.id)) {
        PRODUCTS_DATA.push(JSON.parse(JSON.stringify(baseProd)));
      }
    });

    // 1. Cargar productos creados desde el panel (excluyendo eliminados)
    const raw = localStorage.getItem('mates_rio_custom_products');
    if (raw) {
      const customList = JSON.parse(raw);
      if (Array.isArray(customList) && customList.length > 0) {
        const existingMap = new Map(PRODUCTS_DATA.map((p, idx) => [p.id, idx]));
        customList.forEach(prod => {
          if (prod && prod.id && !deletedIds.has(prod.id)) {
            if (existingMap.has(prod.id)) {
              Object.assign(PRODUCTS_DATA[existingMap.get(prod.id)], prod);
            } else {
              PRODUCTS_DATA.push(JSON.parse(JSON.stringify(prod)));
              existingMap.set(prod.id, PRODUCTS_DATA.length - 1);
            }
          }
        });
      }
    }

    // 2. Sincronizar ediciones guardadas desde el panel de admin
    const editsRaw = localStorage.getItem('mates_rio_edited_products');
    if (editsRaw) {
      const edits = JSON.parse(editsRaw) || {};
      PRODUCTS_DATA.forEach(p => {
        if (edits[p.id]) {
          Object.assign(p, edits[p.id]);
        }
      });
    }

    // 3. Sincronizar precios, fotos y stock actualizados en el panel de inventario
    const invRaw = localStorage.getItem('mates_rio_inventory');
    if (invRaw) {
      const inv = JSON.parse(invRaw) || {};
      const existingIds = new Set(PRODUCTS_DATA.map(p => p.id));

      // Si en inventory existe un producto custom que aún no estaba en PRODUCTS_DATA, incorporarlo
      Object.values(inv).forEach(item => {
        if (item && item.id && item.name && item.price && !existingIds.has(item.id) && !deletedIds.has(item.id)) {
          PRODUCTS_DATA.push(JSON.parse(JSON.stringify(item)));
          existingIds.add(item.id);
        }
      });

      PRODUCTS_DATA.forEach(p => {
        if (inv[p.id]) {
          const item = inv[p.id];
          if (typeof item.name === 'string' && item.name) p.name = item.name;
          if (typeof item.price === 'number') p.price = item.price;
          if (typeof item.originalPrice !== 'undefined') p.originalPrice = item.originalPrice;
          if (typeof item.cost === 'number') p.cost = item.cost;
          if (typeof item.wholesalePrice === 'number') p.wholesalePrice = item.wholesalePrice;
          if (typeof item.retailMarginPercent === 'number') p.retailMarginPercent = item.retailMarginPercent;
          if (typeof item.wholesaleMarginPercent === 'number') p.wholesaleMarginPercent = item.wholesaleMarginPercent;
          if (typeof item.inStock === 'boolean') p.inStock = item.inStock;
          if (typeof item.stock === 'number') p.stock = item.stock;
          if (typeof item.sku === 'string' && item.sku) p.sku = item.sku;
          if (typeof item.image === 'string' && item.image) p.image = item.image;
          if (Array.isArray(item.images) && item.images.length > 0) p.images = item.images;
          if (typeof item.category === 'string' && item.category) p.category = item.category;
          if (typeof item.categoryName === 'string' && item.categoryName) p.categoryName = item.categoryName;
          if (typeof item.subcategory === 'string') p.subcategory = item.subcategory;
          if (typeof item.description === 'string' && item.description) p.description = item.description;
          if (item.specs && (Array.isArray(item.specs) || typeof item.specs === 'object')) p.specs = item.specs;
          if (typeof item.badge === 'string') p.badge = item.badge;
          if (typeof item.badgeType === 'string') p.badgeType = item.badgeType;
          if (typeof item.featured === 'boolean') p.featured = item.featured;
        }
      });
    }
  } catch (e) {
    console.warn('Error al sincronizar productos de catálogo e inventario:', e);
  }
}

syncProductsFromStorage();
window.syncProductsFromStorage = syncProductsFromStorage;


// ==========================================================================
// 8. MOTOR DE SINCRONIZACIÓN AUTOMÁTICA EN TIEMPO REAL (MULTI-DISPOSITIVO)
// Garantiza que cualquier cambio realizado por un administrador se guarde y
// aplique automáticamente en el acto, reflejándose en tiempo real en otras
// computadoras, teléfonos, clientes registrados y visitantes sin sesión.
// ==========================================================================
(function() {
  const KEY_MAP = {
    mates_rio_custom_products: 'customProducts',
    mates_rio_edited_products: 'editedProducts',
    mates_rio_deleted_products: 'deletedProducts',
    mates_rio_inventory: 'inventory',
    mates_rio_categories: 'categories',
    mates_rio_home_slides: 'homeSlides',
    mates_rio_special_occasion: 'specialOccasion',
    mates_rio_customization_pricing: 'customizationPricing',
    mates_rio_supplier_purchases: 'supplierPurchases',
    mates_rio_orders: 'orders',
    mates_rio_wholesale_orders: 'wholesaleOrders',
    mates_rio_wholesale_clients: 'wholesaleClients',
    mates_rio_wholesale_accounts: 'wholesaleAccounts',
    mates_rio_users_db: 'usersDb',
    mates_rio_audit_log: 'auditLog'
  };

  // Claves exclusivas de personalización del administrador (para detectar si hay cambios reales para inicializar el servidor)
  const ADMIN_CUSTOMIZATION_KEYS = [
    'mates_rio_custom_products',
    'mates_rio_edited_products',
    'mates_rio_deleted_products',
    'mates_rio_categories',
    'mates_rio_home_slides',
    'mates_rio_special_occasion',
    'mates_rio_customization_pricing',
    'mates_rio_inventory'
  ];

  const REVERSE_KEY_MAP = {};
  Object.keys(KEY_MAP).forEach((lsKey) => {
    REVERSE_KEY_MAP[KEY_MAP[lsKey]] = lsKey;
  });

  function getCandidateApiUrls() {
    const urls = [];
    const customUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('mates_rio_custom_api_url') : null;
    if (customUrl) {
      urls.push(customUrl.replace(/\/$/, '') + (customUrl.includes('/store-state') ? '' : '/store-state'));
    }
    if (window.MATES_RIO_API_URL) {
      urls.push(window.MATES_RIO_API_URL.replace(/\/$/, '') + '/store-state');
    }
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname || 'localhost';
      if (window.location.protocol.startsWith('http')) {
        if (window.location.port === '5000') {
          urls.push(window.location.origin + '/api/store-state');
        } else {
          // Si es HTTPS (por ejemplo un túnel devtunnels/ngrok), priorizar mismo origen primero
          if (window.location.protocol === 'https:') {
            urls.push(window.location.origin + '/api/store-state');
          }
          urls.push(`http://${hostname}:5000/api/store-state`);
          urls.push(window.location.origin + '/api/store-state');
          urls.push('http://localhost:5000/api/store-state');
          urls.push('http://127.0.0.1:5000/api/store-state');
        }
      } else {
        urls.push('http://localhost:5000/api/store-state');
        urls.push('http://127.0.0.1:5000/api/store-state');
      }
    } else {
      urls.push('http://localhost:5000/api/store-state');
    }
    return [...new Set(urls.filter(Boolean))];
  }

  let activeApiUrl = null;
  let lastKnownServerTimestamp = 0;
  let lastKnownServerVersion = 0;
  let hasCompletedInitialPull = false;
  let pushDebounceTimer = null;
  let pendingPatch = {};
  let sseSource = null;

  const syncChannel = typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('mates_rio_live_sync')
    : null;

  function collectLocalStoreState() {
    const payload = {};
    let hasAdminCustomizations = false;
    Object.keys(KEY_MAP).forEach((lsKey) => {
      const raw = localStorage.getItem(lsKey);
      if (raw !== null) {
        if (ADMIN_CUSTOMIZATION_KEYS.includes(lsKey)) {
          hasAdminCustomizations = true;
        }
        try {
          payload[KEY_MAP[lsKey]] = JSON.parse(raw);
        } catch (e) {
          payload[KEY_MAP[lsKey]] = raw;
        }
      }
    });
    return { payload, hasAdminCustomizations };
  }

  function refreshAllPageViews() {
    try {
      if (typeof window.syncProductsFromStorage === 'function') {
        window.syncProductsFromStorage();
      }
      if (typeof window.initInventoryDB === 'function') {
        window._isInitialSeeding = true;
        try {
          window.initInventoryDB();
        } finally {
          window._isInitialSeeding = false;
        }
      }
      if (typeof window.renderSpecialOccasionBanner === 'function') {
        window.renderSpecialOccasionBanner();
      }
      if (typeof window.initSlider === 'function') {
        window.initSlider();
      }
      if (typeof window.renderCategoriesGrid === 'function') {
        window.renderCategoriesGrid();
      }
      if (typeof window.renderCatalogCategoryPills === 'function') {
        window.renderCatalogCategoryPills();
      }
      if (typeof window.renderProducts === 'function') {
        window.renderProducts();
      }
      if (typeof window.syncStudioPricingFromAdmin === 'function') {
        window.syncStudioPricingFromAdmin();
      }
      if (typeof window.renderWholesaleProducts === 'function') {
        window.renderWholesaleProducts();
      }
      if (typeof window.renderInventoryTable === 'function') {
        window.renderInventoryTable();
      }
      if (typeof window.populateCategorySelects === 'function') {
        window.populateCategorySelects();
      }
      if (typeof window.renderAdminSlidesList === 'function') {
        window.renderAdminSlidesList();
      }
      if (typeof window.renderAdminCategoriesGrid === 'function') {
        window.renderAdminCategoriesGrid();
      }
      if (typeof window.renderOccasionSettings === 'function') {
        window.renderOccasionSettings();
      }
      if (typeof window.renderCustomizerPricingAdmin === 'function') {
        window.renderCustomizerPricingAdmin();
      }
      if (typeof window.renderOrdersTable === 'function') {
        window.renderOrdersTable();
      }
      if (typeof window.renderWholesaleOrdersTable === 'function') {
        window.renderWholesaleOrdersTable();
      }
      if (typeof window.renderUsersTable === 'function') {
        window.renderUsersTable();
      }
      if (typeof window.renderPurchasesSection === 'function') {
        window.renderPurchasesSection();
      }
      if (typeof window.renderAuditTable === 'function') {
        window.renderAuditTable();
      }
      if (typeof window.updateKPIs === 'function') {
        window.updateKPIs();
      }
      if (typeof window.renderDashboardRecentOrders === 'function') {
        window.renderDashboardRecentOrders();
      }
      if (typeof state !== 'undefined' && state) {
        try {
          const ordRaw = localStorage.getItem('mates_rio_orders');
          if (ordRaw) state.orders = JSON.parse(ordRaw);
          const usrRaw = localStorage.getItem('mates_rio_users_db');
          if (usrRaw) state.usersDb = JSON.parse(usrRaw);
        } catch (err) {}
      }
    } catch (e) {
      console.warn('Error refrescando vistas tras sincronización:', e);
    }
  }

  function applyRemoteStateToLocal(remoteData) {
    if (!remoteData || typeof remoteData !== 'object') return false;
    let anyChanged = false;
    window._isApplyingCloudSync = true;
    try {
      Object.keys(REVERSE_KEY_MAP).forEach((serverKey) => {
        if (remoteData[serverKey] !== undefined && remoteData[serverKey] !== null) {
          const lsKey = REVERSE_KEY_MAP[serverKey];
          const serialized = typeof remoteData[serverKey] === 'string'
            ? remoteData[serverKey]
            : JSON.stringify(remoteData[serverKey]);
          if (localStorage.getItem(lsKey) !== serialized) {
            localStorage.setItem(lsKey, serialized);
            anyChanged = true;
          }
        }
      });
      if (remoteData.updatedAt) {
        lastKnownServerTimestamp = Number(remoteData.updatedAt);
        localStorage.setItem('mates_rio_state_updated_at', String(lastKnownServerTimestamp));
      }
      if (remoteData.version) {
        lastKnownServerVersion = Number(remoteData.version);
      }
    } finally {
      window._isApplyingCloudSync = false;
    }

    if (anyChanged || !hasCompletedInitialPull) {
      refreshAllPageViews();
    }
    return anyChanged;
  }

  async function fetchWithFallback(options = {}) {
    const isGet = !options.method || options.method.toUpperCase() === 'GET';
    const cacheBuster = `?t=${Date.now()}`;
    const baseCandidates = activeApiUrl ? [activeApiUrl, ...getCandidateApiUrls()] : getCandidateApiUrls();

    for (const url of [...new Set(baseCandidates)]) {
      try {
        const targetUrl = isGet ? `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}` : url;
        const res = await fetch(targetUrl, options);
        if (res.ok) {
          const json = await res.json();
          if (json && json.success && json.data) {
            activeApiUrl = url;
            connectRealtimeStream(url);
            return json;
          }
        }
      } catch (e) {
        // Intentar siguiente URL candidata
      }
    }

    // Fallback de lectura estática en el mismo origen/puerto (para celulares conectados por Live Server o túnel de un solo puerto)
    if (isGet && typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
      try {
        const staticMirrorUrl = `assets/store-state.json${cacheBuster}`;
        const res = await fetch(staticMirrorUrl, { method: 'GET', cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json && json.success && json.data) {
            return json;
          }
        }
      } catch (e) {}
    }

    return null;
  }

  function connectRealtimeStream(baseApiUrl) {
    if (sseSource || typeof EventSource === 'undefined' || !baseApiUrl) return;
    try {
      const streamUrl = baseApiUrl.replace(/\/$/, '') + '/stream';
      sseSource = new EventSource(streamUrl);
      sseSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.success && parsed.data) {
            const remoteTs = Number(parsed.data.updatedAt || 0);
            const remoteVer = Number(parsed.data.version || 0);
            if (remoteTs > 0 && (remoteTs !== lastKnownServerTimestamp || remoteVer !== lastKnownServerVersion)) {
              applyRemoteStateToLocal(parsed.data);
            }
          }
        } catch (err) {}
      };
      sseSource.onerror = () => {
        try {
          sseSource.close();
        } catch (e) {}
        sseSource = null;
      };
    } catch (e) {
      sseSource = null;
    }
  }

  async function pushStoreStateToServer(patchObj) {
    const bodyObj = patchObj || collectLocalStoreState().payload;
    if (!bodyObj || Object.keys(bodyObj).length === 0) return;

    const json = await fetchWithFallback({
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyObj)
    });

    if (json && json.success && json.data) {
      if (json.data.updatedAt) {
        lastKnownServerTimestamp = Number(json.data.updatedAt);
        window._isApplyingCloudSync = true;
        localStorage.setItem('mates_rio_state_updated_at', String(lastKnownServerTimestamp));
        window._isApplyingCloudSync = false;
      }
      if (json.data.version) {
        lastKnownServerVersion = Number(json.data.version);
      }
    }

    if (syncChannel) {
      try {
        syncChannel.postMessage({
          type: 'STORE_STATE_UPDATED',
          updatedAt: lastKnownServerTimestamp,
          version: lastKnownServerVersion
        });
      } catch (e) {}
    }
  }

  async function flushPendingPatchesNow() {
    if (pushDebounceTimer) {
      clearTimeout(pushDebounceTimer);
      pushDebounceTimer = null;
    }
    const patchToSend = Object.keys(pendingPatch).length > 0
      ? { ...pendingPatch }
      : collectLocalStoreState().payload;
    pendingPatch = {};
    await pushStoreStateToServer(patchToSend);
  }

  async function pullStoreStateFromServer() {
    // Si hay cambios locales del admin pendientes de enviarse en este mismo instante, enviarlos primero
    if (Object.keys(pendingPatch).length > 0) {
      await flushPendingPatchesNow();
      return;
    }

    const json = await fetchWithFallback({ method: 'GET', cache: 'no-store' });
    if (!json || !json.success || !json.data) return;

    const serverState = json.data;
    const serverUpdated = Number(serverState.updatedAt || 0);
    const serverVersion = Number(serverState.version || 0);
    const { payload, hasAdminCustomizations } = collectLocalStoreState();
    const localUpdated = Number(localStorage.getItem('mates_rio_state_updated_at') || 0);

    // Si el dispositivo local tiene personalizaciones del admin más recientes que el servidor, preservarlas y subirlas al servidor
    if (hasAdminCustomizations && localUpdated > serverUpdated) {
      hasCompletedInitialPull = true;
      await pushStoreStateToServer(payload);
      return;
    }

    // Si el servidor aún no fue inicializado (updatedAt === 0) y este navegador tiene personalizaciones del admin, inicializar servidor
    if (serverUpdated === 0 && hasAdminCustomizations) {
      hasCompletedInitialPull = true;
      await pushStoreStateToServer(payload);
      return;
    }

    // El servidor es la fuente única de verdad para todos los dispositivos (computadoras, celulares, usuarios con o sin sesión)
    if (serverUpdated > 0 && (!hasCompletedInitialPull || serverUpdated !== lastKnownServerTimestamp || serverVersion !== lastKnownServerVersion)) {
      applyRemoteStateToLocal(serverState);
      hasCompletedInitialPull = true;
    } else {
      hasCompletedInitialPull = true;
    }
  }

  // Comprobar si la URL trae un hash de sincronización directa (#sync=...)
  function checkUrlSyncHash() {
    if (typeof window === 'undefined' || !window.location || !window.location.hash) return;
    const hash = window.location.hash;
    if (hash.startsWith('#sync=')) {
      const raw = hash.substring(6);
      try {
        let parsed = null;
        try {
          const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(raw))));
          parsed = JSON.parse(jsonStr);
        } catch (e1) {
          try {
            parsed = JSON.parse(decodeURIComponent(raw));
          } catch (e2) {}
        }

        if (parsed && typeof parsed === 'object') {
          const dataToApply = parsed.data || parsed;
          applyRemoteStateToLocal(dataToApply);
          try {
            const cleanUrl = window.location.pathname + window.location.search;
            if (window.history && window.history.replaceState) {
              window.history.replaceState(null, '', cleanUrl);
            } else {
              window.location.hash = '';
            }
          } catch (err) {}
          pushStoreStateToServer(dataToApply);
          if (typeof window.showAdminToast === 'function') {
            window.showAdminToast('¡Catálogo sincronizado exitosamente desde el enlace directo!', 'fa-cloud-arrow-down');
          }
        }
      } catch (err) {
        console.warn('No se pudo decodificar el enlace de sincronización:', err);
      }
    }
  }

  // Interceptar localStorage.setItem para sincronizar automáticamente al instante cualquier cambio hecho en el Admin
  const _origSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    const prevValue = this === window.localStorage ? this.getItem(key) : null;
    _origSetItem.call(this, key, value);

    // Ignorar si estamos aplicando datos del servidor, haciendo seeding inicial por defecto, o si el valor no cambió
    if (
      this === window.localStorage &&
      !window._isApplyingCloudSync &&
      !window._isInitialSeeding &&
      prevValue !== value
    ) {
      const mappedKey = KEY_MAP[key];
      if (mappedKey) {
        try {
          pendingPatch[mappedKey] = JSON.parse(value);
        } catch (e) {
          pendingPatch[mappedKey] = value;
        }

        if (syncChannel) {
          try {
            syncChannel.postMessage({ type: 'STORE_STATE_UPDATED', updatedAt: Date.now() });
          } catch (e) {}
        }

        // Auto-aplicar en las vistas abiertas de inmediato y enviar al servidor automáticamente en 50ms
        clearTimeout(pushDebounceTimer);
        pushDebounceTimer = setTimeout(() => {
          const patchToSend = { ...pendingPatch };
          pendingPatch = {};
          pushStoreStateToServer(patchToSend);
        }, 50);
      }
    }
  };

  // Escuchar cambios instantáneos entre pestañas abiertas del mismo navegador (incluso sin sesión)
  window.addEventListener('storage', (e) => {
    if (e.key && (KEY_MAP[e.key] || e.key === 'mates_rio_state_updated_at')) {
      refreshAllPageViews();
    }
  });

  if (syncChannel) {
    syncChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'STORE_STATE_UPDATED') {
        pullStoreStateFromServer();
        refreshAllPageViews();
      }
    };
  }

  window.addEventListener('hashchange', checkUrlSyncHash);
  checkUrlSyncHash();

  // Sincronizar inmediatamente al cargar, al enfocar o cambiar visibilidad, y cada 2.5 segundos
  pullStoreStateFromServer();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      checkUrlSyncHash();
      pullStoreStateFromServer();
    });
  }

  window.addEventListener('focus', () => {
    pullStoreStateFromServer();
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      pullStoreStateFromServer();
    }
  });

  setInterval(() => {
    if (!document.hidden) {
      pullStoreStateFromServer();
    }
  }, 2500);

  // Gestor unificado de sincronización y respaldo
  window.MatesRioSyncManager = {
    exportData() {
      const { payload } = collectLocalStoreState();
      return {
        brand: 'Mates Río',
        version: lastKnownServerVersion || 1,
        updatedAt: Number(localStorage.getItem('mates_rio_state_updated_at') || Date.now()),
        exportedAt: new Date().toISOString(),
        data: payload
      };
    },

    exportString() {
      const full = this.exportData();
      return JSON.stringify(full, null, 2);
    },

    exportCompactToken() {
      const full = this.exportData();
      try {
        return btoa(unescape(encodeURIComponent(JSON.stringify(full))));
      } catch (e) {
        return JSON.stringify(full);
      }
    },

    generateShareLink() {
      const token = this.exportCompactToken();
      const origin = window.location.origin;
      const path = window.location.pathname.replace(/admin\.html$/, 'index.html');
      return `${origin}${path}#sync=${encodeURIComponent(token)}`;
    },

    importData(rawInput) {
      if (!rawInput || typeof rawInput !== 'string') return false;
      let text = rawInput.trim();

      // Si es un enlace completo con #sync=...
      if (text.includes('#sync=')) {
        text = text.split('#sync=')[1];
      }

      let parsed = null;
      try {
        const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(text))));
        parsed = JSON.parse(jsonStr);
      } catch (e1) {
        try {
          parsed = JSON.parse(text);
        } catch (e2) {}
      }

      if (!parsed || typeof parsed !== 'object') {
        throw new Error('El formato del código o archivo no es válido.');
      }

      const storeObj = parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed;
      applyRemoteStateToLocal(storeObj);
      pushStoreStateToServer(storeObj);
      return true;
    },

    downloadBackup() {
      const jsonStr = this.exportString();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      a.href = url;
      a.download = `mates_rio_respaldo_catalogo_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 200);
    },

    getStats() {
      const { payload, hasAdminCustomizations } = collectLocalStoreState();
      const customCount = Array.isArray(payload.customProducts) ? payload.customProducts.length : 0;
      const editedCount = payload.editedProducts && typeof payload.editedProducts === 'object' ? Object.keys(payload.editedProducts).length : 0;
      const invCount = payload.inventory && typeof payload.inventory === 'object' ? Object.keys(payload.inventory).length : 0;
      const slidesCount = Array.isArray(payload.homeSlides) ? payload.homeSlides.length : 0;
      const lastTs = Number(localStorage.getItem('mates_rio_state_updated_at') || lastKnownServerTimestamp || 0);

      return {
        hasAdminCustomizations,
        customCount,
        editedCount,
        invCount,
        slidesCount,
        lastUpdatedAt: lastTs,
        activeApiUrl: activeApiUrl || 'Local / Ephemeral'
      };
    },

    syncNow() {
      return flushPendingPatchesNow().then(() => pullStoreStateFromServer());
    }
  };

  window.MatesRioCloudSync = {
    pull: pullStoreStateFromServer,
    push: pushStoreStateToServer,
    pushNow: flushPendingPatchesNow,
    refresh: refreshAllPageViews
  };
})();
