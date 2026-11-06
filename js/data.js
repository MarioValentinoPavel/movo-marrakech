// Datos de MOVO. Fuente: su web movo-rent.com (precios, simulador, itinerarios, FAQ), su Instagram @movo.ma y su ficha de Google.
// Los textos de las paradas resumen los de su página de itinerarios (sin los precios de entrada, que no se pueden verificar).
window.MOVO = {
  wa: { fr: '33752504830', ma: '212601160963' },
  mail: 'Movoride.contact@gmail.com',

  // Tarifa: la misma lógica que el simulador de su web (script.js, versión 21).
  // Torino: totales exactos para 1, 4, 6, 7, 10, 12 y 15 días; el resto, por tramos diarios.
  // Stunt: por tramos diarios y total redondeado a 50 MAD. Más de 30 días: presupuesto a medida.
  price: {
    base: { stunt: 250, torino: 260 },
    tiers: [[15, 190], [12, 205], [10, 230], [7, 235], [4, 245]],
    torinoExact: { 1: 260, 4: 1000, 6: 1450, 7: 1600, 10: 2300, 12: 2450, 15: 2850 },
    eur: 10.8, usd: 10,  // los cambios que usa su web (indicativos)
    delivery: 4, max: 30,
    total(model, d) {
      if (d > this.max) return null;
      const base = this.base[model];
      const t = this.tiers.find(([min]) => d >= min);
      const rate = t ? t[1] : base;
      if (model === 'torino') return this.torinoExact[d] || d * rate;
      return Math.round((d * rate) / 50) * 50;
    }
  },

  models: { stunt: 'MBK Stunt 50cc', torino: 'MBK Torino 2026 50cc' },

  // Mapa: proyección de osm-svg.html con bbox [31.593, -8.052, 31.693, -7.926] y ancho 1000 (alto 932).
  map: {
    pins: [
      { id: 'airport', x: 207.9, y: 852.1, k: 'pinAir' },
      { id: 'jemaa', x: 499.2, y: 626.5, k: 'pinJemaa' }
    ],
    labels: [
      { k: 'lbMedina', x: 560, y: 560, big: 1 },
      { k: 'lbGueliz', x: 268, y: 585, big: 1 },
      { k: 'lbHiv', x: 372, y: 712 },
      { k: 'lbPalm', x: 690, y: 300, big: 1 },
      { k: 'lbAgdal', x: 548, y: 892 },
      { k: 'lbMajorelle', x: 430, y: 455 }
    ]
  },

  routes: {
    medina: {
      fr: 'Médina & Kasbah', en: 'Medina & Kasbah', es: 'Medina y Kasbah',
      dur: '2–3 h', km: '8–12 km',
      lvl: { fr: 'Facile', en: 'Easy', es: 'Fácil' },
      tip: {
        fr: 'Palais, ruelles et monuments. Idéal tôt le matin, pour éviter la circulation.',
        en: 'Palaces, alleys and monuments. Best early in the morning, to avoid the traffic.',
        es: 'Palacios, callejuelas y monumentos. Mejor a primera hora, para evitar el tráfico.'
      },
      stops: [
        { ll: [31.6258, -7.9891], fr: ['Place Jemaa el-Fna', 'Le cœur de Marrakech, point de départ idéal.'], en: ['Jemaa el-Fna square', 'The heart of Marrakech, the ideal starting point.'], es: ['Plaza Jemaa el-Fna', 'El corazón de Marrakech, el punto de partida ideal.'] },
        { ll: [31.6236, -7.9937], fr: ['Mosquée Koutoubia', 'L’emblème de la ville et son minaret du XIIe siècle.'], en: ['Koutoubia Mosque', 'The city’s emblem and its 12th-century minaret.'], es: ['Mezquita Kutubía', 'El emblema de la ciudad y su minarete del siglo XII.'] },
        { ll: [31.6216, -7.9835], fr: ['Palais de la Bahia', 'Un palais du XIXe siècle, entre patios et jardins.'], en: ['Bahia Palace', 'A 19th-century palace of patios and gardens.'], es: ['Palacio de la Bahía', 'Un palacio del siglo XIX, entre patios y jardines.'] },
        { ll: [31.6316, -7.9872], fr: ['Médersa Ben Youssef', 'Ancienne école coranique, joyau de l’art arabo-andalou.'], en: ['Ben Youssef Madrasa', 'A former Koranic school, a jewel of Arab-Andalusian art.'], es: ['Madrasa Ben Youssef', 'Antigua escuela coránica, joya del arte andalusí.'] },
        { ll: [31.6305, -7.9907], fr: ['Le Jardin Secret', 'Un jardin caché au cœur de la médina, pour finir au calme.'], en: ['Le Jardin Secret', 'A hidden garden in the heart of the medina, to finish in peace.'], es: ['Le Jardin Secret', 'Un jardín escondido en plena medina, para terminar con calma.'] }
      ],
      pts: [[495.8, 625.2], [459.5, 648.5], [543.8, 666.3], [519.3, 573.6], [487.9, 582]],
      d: 'M495.8 625.2L493.7 631.3L477.5 638.1L464.9 631.8L448.4 619.6L447.7 619.9L454.5 624.8L453.7 626.6L456 632.9L456 641L461.5 652.3L459.2 654.2L458.6 657.1L457.3 658.8L457.3 660.8L469.5 661.2L477.9 660.1L482.8 658.6L493.1 658.3L506.1 670.7L513.7 675.1L528.5 681.9L528.6 680.9L534.5 676.9L535.3 674.4L538.8 673.3L535.4 659.6L543.4 658.2L546.2 665.8L540.1 667.5L546.2 665.8L543.4 658.2L552.5 656.3L555.3 657.9L563.5 654.9L560.4 644.9L564.4 642.6L563.6 630.8L560.3 622.2L561.2 610L546.5 608.4L544.4 609L544.3 602.6L546.8 591.1L547.8 590.5L547.1 588.1L544.4 588.9L543.5 588.1L533.7 587.9L522.1 583L518.2 579L520.4 570.1L519.2 568L522.1 566.4L530 569.9L535.5 569.8L544.8 565.9L536.2 562.2L526.6 562.5L524.4 555.2L521.3 550.8L517.2 546.9L516.5 539L520.1 524.2L510.7 519L508.8 518.7L507.2 515.2L501 518.2L493.9 526.2L492.6 531.1L492.5 536.7L487.7 540.7L483.8 542.1L485.8 547.7L483.6 551.4L477.9 549.2L475.6 554.1L473.7 556.3L473.4 562.4L471.4 570.3L470.3 571.9L467.9 572.8L464.8 583.2L459.6 594.9L461.6 604.7L464.9 613.9L469.1 610.6L472.1 606.6L490.4 591.1L493.5 589L496.1 588.3L496.2 584.3L493 585.2L492.7 581.3L487.9 582'
    },
    gueliz: {
      fr: 'Guéliz & ville nouvelle', en: 'Guéliz & new town', es: 'Guéliz y ciudad nueva',
      dur: '2–3 h', km: '10–15 km',
      lvl: { fr: 'Facile', en: 'Easy', es: 'Fácil' },
      tip: {
        fr: 'Le Marrakech moderne : routes larges et circulation fluide, idéal pour débuter.',
        en: 'Modern Marrakech: wide roads and smooth traffic, ideal for beginners.',
        es: 'El Marrakech moderno: calles anchas y tráfico fluido, ideal para empezar.'
      },
      stops: [
        { ll: [31.6340, -8.0080], fr: ['Avenues Mohammed V et Hassan II', 'Les grandes artères du quartier moderne, architecture Art déco.'], en: ['Mohammed V and Hassan II avenues', 'The main avenues of the modern district, with Art Deco buildings.'], es: ['Avenidas Mohammed V y Hassan II', 'Las grandes avenidas del barrio moderno, con edificios art déco.'] },
        { ll: [31.6417, -8.0033], fr: ['Jardin Majorelle', 'Le jardin de Jacques Majorelle, racheté ensuite par Yves Saint Laurent.'], en: ['Majorelle Garden', 'Jacques Majorelle’s garden, later bought by Yves Saint Laurent.'], es: ['Jardín Majorelle', 'El jardín de Jacques Majorelle, que luego compró Yves Saint Laurent.'] },
        { ll: [31.6413, -8.0030], fr: ['Musée Yves Saint Laurent', 'Juste à côté du jardin Majorelle.'], en: ['Yves Saint Laurent Museum', 'Right next to the Majorelle Garden.'], es: ['Museo Yves Saint Laurent', 'Justo al lado del jardín Majorelle.'] },
        { ll: [31.6360, -8.0100], fr: ['Cafés et boutiques de Guéliz', 'Terrasses, boutiques et galeries d’art.'], en: ['Guéliz cafés and boutiques', 'Terraces, boutiques and art galleries.'], es: ['Cafés y tiendas de Guéliz', 'Terrazas, tiendas y galerías de arte.'] }
      ],
      pts: [[348.8, 549.1], [392, 475.2], [394.2, 479.1], [331.9, 531.9]],
      d: 'M348.8 549.1L340.7 552.6L333 535L326.7 517.6L350 512.7L374.5 502.3L377.3 502.2L377.7 500.8L365.7 485.3L377 473.4L387.7 467.2L397.5 484.2L400.6 493L379 500.5L376.6 500.6L375.6 501.9L357 510.1L350 512.7L342.5 514.4L352.2 525.9L353.8 531L352.6 531.8L335.3 540.5L331.9 531.9'
    },
    palm: {
      fr: 'La Palmeraie', en: 'The Palmeraie', es: 'El Palmeral',
      dur: '3–4 h', km: '30–40 km',
      lvl: { fr: 'Facile', en: 'Easy', es: 'Fácil' },
      tip: {
        fr: 'Nature et routes dégagées, à environ 7 km au nord-est de la médina. Idéal en fin d’après-midi.',
        en: 'Nature and open roads, about 7 km north-east of the medina. Best in the late afternoon.',
        es: 'Naturaleza y carreteras despejadas, a unos 7 km al noreste de la medina. Mejor a última hora de la tarde.'
      },
      stops: [
        { ll: [31.6400, -7.9850], fr: ['Départ au nord de la médina', 'Cap au nord-est, vers la Palmeraie.'], en: ['Start north of the medina', 'Head north-east, towards the Palmeraie.'], es: ['Salida al norte de la medina', 'Rumbo al noreste, hacia el palmeral.'] },
        { ll: [31.6700, -7.9600], fr: ['La Palmeraie', 'Une palmeraie historique de 13 000 hectares.'], en: ['The Palmeraie', 'A historic palm grove of 13,000 hectares.'], es: ['El Palmeral', 'Un palmeral histórico de 13.000 hectáreas.'] },
        { ll: [31.6800, -7.9500], fr: ['Riads et architecture', 'Riads, hôtels et spas au milieu des palmiers.'], en: ['Riads and architecture', 'Riads, hotels and spas among the palm trees.'], es: ['Riads y arquitectura', 'Riads, hoteles y spas entre las palmeras.'] },
        { ll: [31.6850, -7.9400], fr: ['Faune locale', 'Hérons garde-bœufs, tourterelles et rapaces.'], en: ['Local wildlife', 'Cattle egrets, turtle doves and birds of prey.'], es: ['Fauna local', 'Garcillas bueyeras, tórtolas y rapaces.'] },
        { ll: [31.6750, -7.9350], fr: ['Coucher de soleil et thé à la menthe', 'La pause du soir, face au soleil couchant entre les palmiers.'], en: ['Sunset and mint tea', 'The evening break, facing the sunset among the palms.'], es: ['Puesta de sol y té con menta', 'La pausa de la tarde, frente al sol poniente entre palmeras.'] }
      ],
      pts: [[532.1, 495], [730.4, 214.6], [822.3, 119.7], [883.7, 68.8], [942.3, 150.9]],
      d: 'M532.1 495L544.2 490.9L549 495.5L555.1 492.4L548.8 483.4L545.1 473.1L556.7 462.3L553.6 444.8L568 442.3L571.4 434.8L585.3 414.1L590.6 402.3L600.8 384.5L606.6 375.4L611.4 369.7L614.4 360.9L622.3 350.6L630.5 333.9L639.8 320.1L644.3 306.7L662.4 279.6L666.8 268L681.3 254.6L683.5 242L689.5 239.5L700.6 229.6L706.1 222.4L714.5 235.6L715.8 234.7L716.9 236.3L730.1 227.9L729.6 226.1L731.6 225L728.8 217.7L731.3 211.9L729.6 208.8L731.5 207.4L737.3 198.1L746.7 194.1L760.1 194L766.4 192.2L769 192.2L777 194.3L786.1 199.5L801.4 203.2L805.1 202.7L821.4 203.8L833.3 208.4L834.3 208.5L835.5 207.4L840 196.8L839.6 189.5L836.9 180.9L832.2 171.4L824.6 164.5L825.6 148.4L823 135.2L823.3 124.1L819.6 101.5L818.7 100L817 99.2L822.4 96.9L836.3 77.9L849.9 74.7L855.9 72.4L869.8 74.6L873.8 74L883.7 68.8L887 64.1L896.9 63.3L899.2 63.8L909.1 70.4L925.3 68L929.3 68.1L947.7 72.4L958.5 76.9L960 78.5L967.4 94L966.8 101L964.6 106.2L947.3 115.4L936.7 120.1L927.1 126.8L918.6 127.5L925 135.4L929.2 138.2L933.4 143.1L942.3 150.9'
    }
  }
};
