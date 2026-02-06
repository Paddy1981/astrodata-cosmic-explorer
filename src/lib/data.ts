// Static data for the Cosmic Explorer platform

export interface Location {
  name: string;
  country: string;
  lat: number;
  lon: number;
  type: "city" | "town" | "observatory" | "village" | "island" | "research";
  population?: number;
}

export const LOCATIONS: Record<string, Location> = {
  mumbai: { name: "Mumbai", country: "India", lat: 19.076, lon: 72.8777, type: "city", population: 20000000 },
  delhi: { name: "Delhi", country: "India", lat: 28.6139, lon: 77.209, type: "city", population: 16000000 },
  bangalore: { name: "Bangalore", country: "India", lat: 12.9716, lon: 77.5946, type: "city", population: 8400000 },
  london: { name: "London", country: "UK", lat: 51.5074, lon: -0.1278, type: "city", population: 8900000 },
  newyork: { name: "New York", country: "USA", lat: 40.7128, lon: -74.006, type: "city", population: 8300000 },
  tokyo: { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503, type: "city", population: 13960000 },
  sydney: { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093, type: "city", population: 5312000 },
  capetown: { name: "Cape Town", country: "South Africa", lat: -33.9249, lon: 18.4241, type: "city", population: 4618000 },
  paris: { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522, type: "city", population: 2161000 },
  dubai: { name: "Dubai", country: "UAE", lat: 25.2048, lon: 55.2708, type: "city", population: 3331000 },
  hanle: { name: "Hanle Observatory", country: "India", lat: 32.78, lon: 78.96, type: "observatory" },
  mauna_kea: { name: "Mauna Kea Observatory", country: "USA", lat: 19.8207, lon: -155.4681, type: "observatory" },
  paranal: { name: "Paranal Observatory", country: "Chile", lat: -24.6275, lon: -70.4044, type: "observatory" },
  arecibo: { name: "Arecibo", country: "Puerto Rico", lat: 18.3464, lon: -66.7528, type: "observatory" },
  sutherland: { name: "Sutherland Observatory", country: "South Africa", lat: -32.3792, lon: 20.8108, type: "observatory" },
  beijing: { name: "Beijing", country: "China", lat: 39.9042, lon: 116.4074, type: "city", population: 21540000 },
  moscow: { name: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6173, type: "city", population: 12500000 },
  saopaulo: { name: "São Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333, type: "city", population: 12300000 },
  cairo: { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357, type: "city", population: 10230000 },
  nairobi: { name: "Nairobi", country: "Kenya", lat: -1.2921, lon: 36.8219, type: "city", population: 4397000 },
};

export interface MeteorShower {
  name: string;
  peak: string;
  peakDate: [number, number]; // [month, day]
  zhr: number; // zenithal hourly rate
  speed: number; // km/s
  parentBody: string;
  radiant: string;
  description: string;
  bestViewing: string;
}

export const METEOR_SHOWERS: MeteorShower[] = [
  {
    name: "Quadrantids",
    peak: "Jan 3-4",
    peakDate: [1, 3],
    zhr: 120,
    speed: 41,
    parentBody: "Asteroid 2003 EH1",
    radiant: "Boötes",
    description: "One of the strongest annual showers with a sharp peak lasting only a few hours.",
    bestViewing: "Pre-dawn, Northern Hemisphere",
  },
  {
    name: "Lyrids",
    peak: "Apr 22-23",
    peakDate: [4, 22],
    zhr: 18,
    speed: 49,
    parentBody: "Comet C/1861 G1 (Thatcher)",
    radiant: "Lyra",
    description: "One of the oldest known meteor showers, observed for 2,700 years.",
    bestViewing: "After midnight, both hemispheres",
  },
  {
    name: "Eta Aquariids",
    peak: "May 5-6",
    peakDate: [5, 5],
    zhr: 50,
    speed: 66,
    parentBody: "Comet 1P/Halley",
    radiant: "Aquarius",
    description: "Fast meteors from Halley's Comet debris, best seen from the Southern Hemisphere.",
    bestViewing: "Pre-dawn, Southern Hemisphere favored",
  },
  {
    name: "Delta Aquariids",
    peak: "Jul 28-29",
    peakDate: [7, 28],
    zhr: 20,
    speed: 41,
    parentBody: "Comet 96P/Machholz",
    radiant: "Aquarius",
    description: "A steady shower that overlaps with the early Perseids.",
    bestViewing: "After midnight, Southern Hemisphere favored",
  },
  {
    name: "Perseids",
    peak: "Aug 12-13",
    peakDate: [8, 12],
    zhr: 100,
    speed: 59,
    parentBody: "Comet 109P/Swift-Tuttle",
    radiant: "Perseus",
    description: "The most popular meteor shower! Bright, fast meteors with frequent fireballs.",
    bestViewing: "After midnight, Northern Hemisphere",
  },
  {
    name: "Draconids",
    peak: "Oct 8-9",
    peakDate: [10, 8],
    zhr: 10,
    speed: 20,
    parentBody: "Comet 21P/Giacobini-Zinner",
    radiant: "Draco",
    description: "Slow-moving meteors best seen in the evening rather than after midnight.",
    bestViewing: "Evening, Northern Hemisphere",
  },
  {
    name: "Orionids",
    peak: "Oct 21-22",
    peakDate: [10, 21],
    zhr: 20,
    speed: 66,
    parentBody: "Comet 1P/Halley",
    radiant: "Orion",
    description: "Fast meteors from Halley's Comet with persistent trains.",
    bestViewing: "After midnight, both hemispheres",
  },
  {
    name: "Taurids",
    peak: "Nov 4-5",
    peakDate: [11, 4],
    zhr: 5,
    speed: 27,
    parentBody: "Comet 2P/Encke",
    radiant: "Taurus",
    description: "Slow, bright fireballs known as 'Halloween fireballs'. Low rate but spectacular.",
    bestViewing: "Midnight, both hemispheres",
  },
  {
    name: "Leonids",
    peak: "Nov 17-18",
    peakDate: [11, 17],
    zhr: 15,
    speed: 71,
    parentBody: "Comet 55P/Tempel-Tuttle",
    radiant: "Leo",
    description: "Famous for producing meteor storms roughly every 33 years (last in 2001).",
    bestViewing: "After midnight, both hemispheres",
  },
  {
    name: "Geminids",
    peak: "Dec 13-14",
    peakDate: [12, 13],
    zhr: 150,
    speed: 35,
    parentBody: "Asteroid 3200 Phaethon",
    radiant: "Gemini",
    description: "The king of meteor showers! Bright, abundant, multi-colored meteors.",
    bestViewing: "All night, both hemispheres",
  },
  {
    name: "Ursids",
    peak: "Dec 22-23",
    peakDate: [12, 22],
    zhr: 10,
    speed: 33,
    parentBody: "Comet 8P/Tuttle",
    radiant: "Ursa Minor",
    description: "A modest shower near the winter solstice, occasionally producing surprise bursts.",
    bestViewing: "Pre-dawn, Northern Hemisphere",
  },
];

export interface StarStory {
  name: string;
  scientificName: string;
  constellation: string;
  magnitude: number;
  distance: string;
  spectralType: string;
  cultures: {
    culture: string;
    name: string;
    story: string;
  }[];
  scientificFacts: string[];
}

export const STAR_STORIES: StarStory[] = [
  {
    name: "Polaris",
    scientificName: "Alpha Ursae Minoris",
    constellation: "Ursa Minor",
    magnitude: 1.98,
    distance: "433 light-years",
    spectralType: "F7Ib",
    cultures: [
      { culture: "Greek", name: "Kynosoura", story: "Associated with Callisto, transformed into a bear by Zeus and placed in the sky to forever circle the pole." },
      { culture: "Norse", name: "Veraldar Nagli", story: "Called the 'World Spike' - the nail around which the entire sky revolves." },
      { culture: "Indian", name: "Dhruva Tara", story: "Named after Prince Dhruva whose devotion to Vishnu was so great he was granted an eternal, unmoving place in the sky." },
      { culture: "Chinese", name: "Tianshu", story: "The 'Celestial Pivot' - the emperor's star around which all other stars pay homage." },
      { culture: "Arab", name: "Al-Judayy", story: "Used for centuries by desert navigators as the unwavering guide star." },
    ],
    scientificFacts: [
      "Polaris is actually a triple star system",
      "It's a Cepheid variable star, pulsing with a period of about 4 days",
      "It hasn't always been the North Star - Earth's axis precesses over 26,000 years",
      "In about 12,000 years, Vega will be the new 'North Star'",
    ],
  },
  {
    name: "Sirius",
    scientificName: "Alpha Canis Majoris",
    constellation: "Canis Major",
    magnitude: -1.46,
    distance: "8.6 light-years",
    spectralType: "A1V",
    cultures: [
      { culture: "Egyptian", name: "Sopdet", story: "The heliacal rising of Sirius marked the flooding of the Nile and the Egyptian New Year. The star was associated with the goddess Isis." },
      { culture: "Greek", name: "Seirios", story: "The 'scorching' star that brought the 'dog days' of summer. When it rose with the Sun, ancient Greeks believed it brought fever and drought." },
      { culture: "Polynesian", name: "Rehua", story: "One of the most important navigation stars, guiding voyagers across the vast Pacific Ocean." },
      { culture: "Aboriginal Australian", name: "Larrpan", story: "In Yolngu tradition, Sirius is a fishing eagle, and the Orion stars are his canoe." },
      { culture: "Dogon (Mali)", name: "Sigui Tolo", story: "The Dogon people knew about Sirius B (a white dwarf) centuries before Western astronomers - one of archaeology's enduring mysteries." },
    ],
    scientificFacts: [
      "Brightest star in the night sky",
      "Sirius B is a white dwarf roughly the size of Earth but with the mass of the Sun",
      "The system is moving toward us at 5.5 km/s",
      "At 8.6 light-years, it's one of our nearest stellar neighbors",
    ],
  },
  {
    name: "Pleiades",
    scientificName: "M45 (Open Cluster)",
    constellation: "Taurus",
    magnitude: 1.6,
    distance: "444 light-years",
    spectralType: "B-type stars",
    cultures: [
      { culture: "Greek", name: "Pleiades", story: "The Seven Sisters - daughters of Atlas and Pleione. Zeus placed them in the sky to escape the pursuit of Orion." },
      { culture: "Japanese", name: "Subaru", story: "The car company Subaru is named after this cluster! The logo shows 6 stars of the Pleiades." },
      { culture: "Maori", name: "Matariki", story: "The rising of Matariki marks the Maori New Year - a time for remembrance, celebration, and new beginnings." },
      { culture: "Hindu", name: "Krittika", story: "The six celestial nurses (Krittikas) who raised Kartikeya, the god of war, each giving him a face - hence his six heads." },
      { culture: "Cherokee", name: "Ani'tsutsa", story: "The 'Boys' - seven boys who danced so ecstatically they rose into the sky, becoming stars." },
    ],
    scientificFacts: [
      "Contains over 1,000 stars but only 6-7 are visible to the naked eye",
      "The stars are about 100 million years old - very young in stellar terms",
      "The cluster is slowly being torn apart by gravitational forces",
      "Surrounded by reflection nebulae that glow blue from starlight",
    ],
  },
  {
    name: "Betelgeuse",
    scientificName: "Alpha Orionis",
    constellation: "Orion",
    magnitude: 0.5,
    distance: "700 light-years",
    spectralType: "M1-M2 Ia",
    cultures: [
      { culture: "Arabic", name: "Yad al-Jawza", story: "The 'Hand of the Central One' - marking the right shoulder of the great hunter constellation." },
      { culture: "Aboriginal Australian", name: "Baidam", story: "In some traditions, it represents a hunter pursuing the sisters of the Pleiades across the sky." },
      { culture: "Chinese", name: "Shen Su Si", story: "Part of the Shen constellation, one of the 28 lunar mansions used in Chinese astronomy." },
      { culture: "Brazilian Tupi", name: "Part of Ema", story: "Orion's stars form part of a great celestial rhea (ema) running across the Milky Way." },
    ],
    scientificFacts: [
      "A red supergiant so large that if placed at the Sun's position, it would engulf Mars's orbit",
      "The Great Dimming of 2019-2020 was caused by ejected dust clouds",
      "Expected to explode as a supernova within the next 100,000 years",
      "When it explodes, it will be visible in daylight for weeks",
    ],
  },
  {
    name: "Vega",
    scientificName: "Alpha Lyrae",
    constellation: "Lyra",
    magnitude: 0.03,
    distance: "25 light-years",
    spectralType: "A0V",
    cultures: [
      { culture: "Arabic", name: "Al-Nasr al-Waqi", story: "The 'Swooping Eagle' - one of two great eagle stars in the summer sky." },
      { culture: "Chinese/Japanese", name: "Zhinu / Orihime", story: "The Weaving Girl star, separated from her lover (Altair) by the Milky Way river. They meet once a year on the 7th day of the 7th month." },
      { culture: "Zoroastrian", name: "Vanant", story: "One of the four Royal Stars that guarded the four quarters of the heavens." },
      { culture: "Hindu", name: "Abhijit", story: "Sometimes called the 28th Nakshatra - 'the Victorious One'. Lord Krishna declared 'Among the Nakshatras, I am Abhijit.'" },
    ],
    scientificFacts: [
      "Was the first star (other than the Sun) to be photographed (1850)",
      "Rotates so fast it's oblate - 23% wider at the equator",
      "Has a debris disk that may contain planets",
      "Will become the North Star in about 12,000 years due to axial precession",
      "Once used as the zero-point standard for stellar magnitude and photometric systems",
    ],
  },
  {
    name: "Antares",
    scientificName: "Alpha Scorpii",
    constellation: "Scorpius",
    magnitude: 1.06,
    distance: "550 light-years",
    spectralType: "M1.5Iab",
    cultures: [
      { culture: "Greek", name: "Antares", story: "Meaning 'Rival of Mars' due to its reddish color. When Mars passes near, the two seem to compete in brilliance." },
      { culture: "Persian", name: "Satevis", story: "One of the four Royal Stars of Persia, guarding the western sky." },
      { culture: "Polynesian", name: "Rehua", story: "An important navigation star for Pacific voyagers, representing a high chief among the stars." },
      { culture: "Egyptian", name: "Serqet", story: "Associated with the scorpion goddess Serqet who guarded the canopic jars of the dead." },
    ],
    scientificFacts: [
      "A red supergiant 700 times the Sun's diameter",
      "If placed at the center of our solar system, it would extend beyond the orbit of Mars",
      "Has a hot blue companion star, Antares B, visible only through telescopes",
      "Will likely end its life as a supernova",
    ],
  },
  {
    name: "Canopus",
    scientificName: "Alpha Carinae",
    constellation: "Carina",
    magnitude: -0.74,
    distance: "310 light-years",
    spectralType: "A9II",
    cultures: [
      { culture: "Egyptian", name: "Kahi Nub", story: "The 'Golden Floor' star, used to orient temples in southern Egypt." },
      { culture: "Hindu", name: "Agastya", story: "Named after the great sage Agastya who civilized southern India. His rising marked the calming of ocean waters." },
      { culture: "Aboriginal Australian", name: "Womba", story: "A male eaglehawk; its appearance signified the changing of seasons." },
      { culture: "Bedouin", name: "Suhayl", story: "A guide star for desert navigation, its beauty was proverbial - 'as beautiful as Suhayl.'" },
    ],
    scientificFacts: [
      "Second brightest star in the night sky after Sirius",
      "Used by spacecraft as a navigation reference point",
      "About 10,000 times more luminous than the Sun",
      "Not visible from latitudes above ~37°N (invisible from most of Europe and northern USA)",
    ],
  },
  {
    name: "Rigel",
    scientificName: "Beta Orionis",
    constellation: "Orion",
    magnitude: 0.13,
    distance: "860 light-years",
    spectralType: "B8Ia",
    cultures: [
      { culture: "Arabic", name: "Rijl Jawza al-Yusra", story: "The 'Left Foot of the Central One' - marking the leg of the great celestial hunter." },
      { culture: "Maori", name: "Puanga", story: "In some Maori traditions, Rigel's rising (not the Pleiades) marks the New Year." },
      { culture: "Norse", name: "Orwandil's Toe", story: "When Thor carried the giant Orwandil across the frozen river, one toe froze. Thor broke it off and threw it into the sky, where it became this bright star." },
    ],
    scientificFacts: [
      "A blue supergiant roughly 120,000 times more luminous than the Sun",
      "If placed at the distance of Sirius (8.6 ly), it would appear as bright as the full Moon",
      "Has at least 3 companion stars in its system",
      "At only ~8 million years old, it will likely explode as a supernova far sooner than Betelgeuse",
    ],
  },
];

export interface SkyBingoObjective {
  id: string;
  name: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Expert";
  points: number;
  hint: string;
  description: string;
}

export const SKY_BINGO_OBJECTIVES: SkyBingoObjective[] = [
  { id: "b1", name: "Red Giant Star", category: "Stars", difficulty: "Easy", points: 5, hint: "Look for Betelgeuse or Aldebaran - distinctly orange/red stars", description: "Spot a visibly red or orange star" },
  { id: "b2", name: "Blue Star", category: "Stars", difficulty: "Easy", points: 5, hint: "Rigel in Orion or Spica in Virgo", description: "Find a bright blue-white star" },
  { id: "b3", name: "Double Star", category: "Stars", difficulty: "Medium", points: 10, hint: "Mizar and Alcor in the Big Dipper's handle", description: "Resolve a naked-eye double star" },
  { id: "b4", name: "Variable Star", category: "Stars", difficulty: "Hard", points: 20, hint: "Algol in Perseus changes brightness every 2.87 days", description: "Observe a star whose brightness changes" },
  { id: "b5", name: "Spiral Galaxy", category: "Galaxies", difficulty: "Medium", points: 15, hint: "Andromeda Galaxy (M31) is visible to the naked eye in dark skies", description: "Spot a spiral galaxy (binoculars help!)" },
  { id: "b6", name: "Planet at Opposition", category: "Planets", difficulty: "Medium", points: 10, hint: "Check when Mars, Jupiter, or Saturn are at opposition", description: "Observe a planet at its brightest (opposition)" },
  { id: "b7", name: "Meteor!", category: "Events", difficulty: "Easy", points: 5, hint: "Watch during any meteor shower peak for best odds", description: "See a shooting star" },
  { id: "b8", name: "ISS Pass", category: "Satellites", difficulty: "Easy", points: 5, hint: "Check spotthestation.nasa.gov for visible passes", description: "Watch the ISS fly overhead" },
  { id: "b9", name: "Crescent Moon", category: "Moon", difficulty: "Easy", points: 5, hint: "Best seen a few days after New Moon in evening sky", description: "Observe a thin crescent moon" },
  { id: "b10", name: "Earthshine", category: "Moon", difficulty: "Medium", points: 10, hint: "When the Moon is a thin crescent, look for the dark side faintly lit", description: "See Earth's reflected light on the Moon's dark side" },
  { id: "b11", name: "Open Cluster", category: "Deep Sky", difficulty: "Easy", points: 5, hint: "The Pleiades (M45) are the easiest to spot", description: "Find an open star cluster" },
  { id: "b12", name: "Nebula", category: "Deep Sky", difficulty: "Hard", points: 20, hint: "The Orion Nebula (M42) is visible as a fuzzy patch in Orion's sword", description: "Observe a nebula (binoculars help)" },
  { id: "b13", name: "Milky Way Band", category: "Deep Sky", difficulty: "Medium", points: 15, hint: "Need very dark skies and no Moon. Look toward Sagittarius in summer", description: "See the Milky Way stretching across the sky" },
  { id: "b14", name: "Jupiter's Moons", category: "Planets", difficulty: "Medium", points: 10, hint: "Even basic binoculars show the 4 Galilean moons as dots near Jupiter", description: "Resolve Jupiter's Galilean moons with binoculars" },
  { id: "b15", name: "Saturn's Rings", category: "Planets", difficulty: "Hard", points: 25, hint: "Need a telescope with at least 25x magnification", description: "See Saturn's rings through a telescope" },
  { id: "b16", name: "Zodiac Constellation", category: "Constellations", difficulty: "Easy", points: 5, hint: "Start with easy ones like Leo or Scorpius", description: "Identify any zodiac constellation" },
  { id: "b17", name: "The Big Dipper", category: "Constellations", difficulty: "Easy", points: 5, hint: "Seven bright stars in Ursa Major, visible all year from the Northern Hemisphere", description: "Find the Big Dipper asterism" },
  { id: "b18", name: "Conjunction", category: "Events", difficulty: "Medium", points: 15, hint: "Check when two planets appear close together", description: "Observe two planets close together in the sky" },
  { id: "b19", name: "Fireball Meteor", category: "Events", difficulty: "Hard", points: 30, hint: "Watch during major showers (Perseids, Geminids) for fireballs", description: "Witness a meteor brighter than Venus" },
  { id: "b20", name: "Zodiacal Light", category: "Deep Sky", difficulty: "Expert", points: 40, hint: "Faint triangular glow along the ecliptic, best in spring evening or autumn morning", description: "See the faint glow of interplanetary dust" },
  { id: "b21", name: "Satellite Flare", category: "Satellites", difficulty: "Medium", points: 10, hint: "Some satellites briefly flare very bright as sunlight reflects off them", description: "See a satellite suddenly brighten" },
  { id: "b22", name: "Lunar Eclipse", category: "Moon", difficulty: "Medium", points: 20, hint: "Check upcoming eclipse dates - the Moon turns coppery red", description: "Observe the Moon passing through Earth's shadow" },
  { id: "b23", name: "Comet", category: "Small Bodies", difficulty: "Expert", points: 50, hint: "Follow astronomy news for currently visible comets", description: "Spot a comet (tail optional)" },
  { id: "b24", name: "Five Planets", category: "Planets", difficulty: "Hard", points: 30, hint: "Rare alignment when Mercury, Venus, Mars, Jupiter, and Saturn are all visible", description: "See five planets in one night" },
  { id: "b25", name: "Orion's Belt", category: "Constellations", difficulty: "Easy", points: 5, hint: "Three bright stars in a line - one of the easiest patterns to find", description: "Identify the three stars of Orion's Belt" },
];

export interface ExoplanetData {
  name: string;
  distance: number;
  radius: number;
  mass: number;
  type: string;
  discoveryYear: number;
  method: string;
  starType: string;
  habitable: boolean;
  description: string;
}

export const NOTABLE_EXOPLANETS: ExoplanetData[] = [
  { name: "Proxima Centauri b", distance: 4.24, radius: 1.07, mass: 1.17, type: "Earth-like", discoveryYear: 2016, method: "Radial Velocity", starType: "M5.5V", habitable: true, description: "The closest known exoplanet to Earth, orbiting in the habitable zone of our nearest stellar neighbor." },
  { name: "TRAPPIST-1e", distance: 39.6, radius: 0.92, mass: 0.69, type: "Earth-like", discoveryYear: 2017, method: "Transit", starType: "M8V", habitable: true, description: "Part of the remarkable 7-planet system, considered the most likely to harbor liquid water." },
  { name: "Kepler-442b", distance: 1206, radius: 1.34, mass: 2.36, type: "Super-Earth", discoveryYear: 2015, method: "Transit", starType: "K", habitable: true, description: "One of the most Earth-like planets discovered, with an Earth Similarity Index of 0.84." },
  { name: "K2-18b", distance: 124, radius: 2.61, mass: 8.63, type: "Mini-Neptune", discoveryYear: 2015, method: "Transit", starType: "M2.5V", habitable: true, description: "JWST detected possible biosignature gas dimethyl sulfide in its atmosphere." },
  { name: "TOI-700d", distance: 101.4, radius: 1.19, mass: 1.72, type: "Earth-like", discoveryYear: 2020, method: "Transit", starType: "M2V", habitable: true, description: "First Earth-size habitable-zone planet discovered by TESS." },
  { name: "51 Pegasi b", distance: 50.9, radius: 12.0, mass: 150, type: "Gas Giant", discoveryYear: 1995, method: "Radial Velocity", starType: "G2IV", habitable: false, description: "The first exoplanet discovered around a Sun-like star. Its discovery won the 2019 Nobel Prize in Physics." },
  { name: "HD 209458b (Osiris)", distance: 159, radius: 15.0, mass: 220, type: "Gas Giant", discoveryYear: 1999, method: "Transit", starType: "G0V", habitable: false, description: "First exoplanet observed transiting its star and first with an atmosphere detected." },
  { name: "WASP-76b", distance: 640, radius: 20.8, mass: 291, type: "Gas Giant", discoveryYear: 2013, method: "Transit", starType: "F7V", habitable: false, description: "An ultra-hot Jupiter where iron vaporizes on the day side and rains down on the night side." },
  { name: "Kepler-452b", distance: 1402, radius: 1.63, mass: 5.0, type: "Super-Earth", discoveryYear: 2015, method: "Transit", starType: "G2V", habitable: true, description: "Dubbed 'Earth's Cousin' - orbits a Sun-like star at nearly the same distance as Earth." },
  { name: "GJ 1214b", distance: 48, radius: 2.68, mass: 6.55, type: "Mini-Neptune", discoveryYear: 2009, method: "Transit", starType: "M4.5V", habitable: false, description: "Possibly a 'water world' with a thick steam atmosphere and no solid surface." },
];

export const PLANETS = [
  { name: "Mercury", symbol: "☿", color: "#a0a0a0", orbitDays: 87.97, radiusKm: 2439.7, distanceAU: 0.387 },
  { name: "Venus", symbol: "♀", color: "#e8c76a", orbitDays: 224.7, radiusKm: 6051.8, distanceAU: 0.723 },
  { name: "Earth", symbol: "🜨", color: "#4a90d9", orbitDays: 365.25, radiusKm: 6371, distanceAU: 1.0 },
  { name: "Mars", symbol: "♂", color: "#c1440e", orbitDays: 686.98, radiusKm: 3389.5, distanceAU: 1.524 },
  { name: "Jupiter", symbol: "♃", color: "#c99039", orbitDays: 4332.59, radiusKm: 69911, distanceAU: 5.203 },
  { name: "Saturn", symbol: "♄", color: "#e8d191", orbitDays: 10759.22, radiusKm: 58232, distanceAU: 9.537 },
  { name: "Uranus", symbol: "♅", color: "#7ec8e3", orbitDays: 30688.5, radiusKm: 25362, distanceAU: 19.19 },
  { name: "Neptune", symbol: "♆", color: "#3f54ba", orbitDays: 60182, radiusKm: 24622, distanceAU: 30.07 },
];

export const HISTORICAL_EVENTS: { year: number; event: string; lightYears?: number }[] = [
  { year: 1969, event: "Apollo 11 Moon Landing" },
  { year: 1990, event: "Hubble Space Telescope Launched" },
  { year: 2019, event: "First Black Hole Image (M87*)" },
  { year: 1687, event: "Newton's Principia Published" },
  { year: 1905, event: "Einstein's Special Relativity" },
  { year: 1609, event: "Galileo's First Telescope Observations" },
  { year: 1543, event: "Copernicus: Heliocentric Model" },
  { year: 1054, event: "Crab Nebula Supernova Observed" },
  { year: 2015, event: "LIGO Detects Gravitational Waves" },
  { year: 1977, event: "Voyager 1 & 2 Launched" },
  { year: 2022, event: "JWST First Images" },
  { year: 1957, event: "Sputnik - First Satellite" },
  { year: 1961, event: "Yuri Gagarin - First Human in Space" },
  { year: 2012, event: "Curiosity Rover Lands on Mars" },
  { year: 1930, event: "Pluto Discovered" },
  { year: 1846, event: "Neptune Discovered" },
  { year: 1781, event: "Uranus Discovered by William Herschel" },
  { year: 1572, event: "Tycho's Supernova Observed" },
  { year: 2020, event: "SpaceX First Crewed Mission" },
  { year: 1992, event: "First Exoplanet Confirmed" },
];

export const DEEP_SKY_OBJECTS = [
  { name: "Andromeda Galaxy", catalog: "M31", type: "Spiral Galaxy", distance: 2500000, constellation: "Andromeda", magnitude: 3.4, description: "Nearest major galaxy to the Milky Way, visible to the naked eye." },
  { name: "Orion Nebula", catalog: "M42", type: "Emission Nebula", distance: 1344, constellation: "Orion", magnitude: 4.0, description: "One of the brightest nebulae, a stellar nursery visible to the naked eye." },
  { name: "Pleiades", catalog: "M45", type: "Open Cluster", distance: 444, constellation: "Taurus", magnitude: 1.6, description: "The Seven Sisters - one of the nearest and most recognizable star clusters." },
  { name: "Crab Nebula", catalog: "M1", type: "Supernova Remnant", distance: 6500, constellation: "Taurus", magnitude: 8.4, description: "Remnant of a supernova observed in 1054 AD by Chinese astronomers." },
  { name: "Ring Nebula", catalog: "M57", type: "Planetary Nebula", distance: 2283, constellation: "Lyra", magnitude: 8.8, description: "A dying star's outer layers forming a beautiful ring shape." },
  { name: "Whirlpool Galaxy", catalog: "M51", type: "Spiral Galaxy", distance: 23000000, constellation: "Canes Venatici", magnitude: 8.4, description: "A grand-design spiral galaxy interacting with a smaller companion." },
  { name: "Eagle Nebula", catalog: "M16", type: "Emission Nebula", distance: 7000, constellation: "Serpens", magnitude: 6.0, description: "Home of the famous 'Pillars of Creation' photographed by Hubble." },
  { name: "Hercules Cluster", catalog: "M13", type: "Globular Cluster", distance: 25100, constellation: "Hercules", magnitude: 5.8, description: "One of the brightest globular clusters, containing 300,000 stars." },
];

export const SPECTROSCOPY_ELEMENTS = [
  { symbol: "H", name: "Hydrogen", wavelength: 656, color: "#ff0000", type: "element" },
  { symbol: "He", name: "Helium", wavelength: 587, color: "#ffff00", type: "element" },
  { symbol: "Na", name: "Sodium", wavelength: 589, color: "#ffaa00", type: "element" },
  { symbol: "K", name: "Potassium", wavelength: 766, color: "#cc0000", type: "element" },
  { symbol: "Fe", name: "Iron", wavelength: 527, color: "#00cc00", type: "element" },
  { symbol: "H2O", name: "Water", wavelength: 940, color: "#0066ff", type: "molecule" },
  { symbol: "CO2", name: "Carbon Dioxide", wavelength: 4260, color: "#ff6600", type: "molecule" },
  { symbol: "CH4", name: "Methane", wavelength: 3300, color: "#00ff66", type: "molecule" },
  { symbol: "O2", name: "Oxygen", wavelength: 760, color: "#3399ff", type: "molecule" },
  { symbol: "O3", name: "Ozone", wavelength: 9600, color: "#9933ff", type: "molecule" },
  { symbol: "N2", name: "Nitrogen", wavelength: 337, color: "#6600cc", type: "molecule" },
  { symbol: "NH3", name: "Ammonia", wavelength: 10000, color: "#009999", type: "molecule" },
  { symbol: "CO", name: "Carbon Monoxide", wavelength: 4700, color: "#cc3300", type: "molecule" },
  { symbol: "Ti", name: "Titanium", wavelength: 498, color: "#00cccc", type: "element" },
  { symbol: "V", name: "Vanadium", wavelength: 520, color: "#33cc33", type: "element" },
];

export const DISCOVERY_BADGES = [
  { id: "first_light", name: "First Light", icon: "🔭", description: "Make your first spectroscopic discovery", requirement: 1 },
  { id: "element_hunter", name: "Element Hunter", icon: "⚛️", description: "Detect 5 different elements", requirement: 5 },
  { id: "water_world", name: "Water World Finder", icon: "💧", description: "Find water vapor in an exoplanet atmosphere", requirement: 1 },
  { id: "biosignature", name: "Biosignature Seeker", icon: "🧬", description: "Detect a potential biosignature (O2 or O3)", requirement: 1 },
  { id: "carbon_seeker", name: "Carbon Seeker", icon: "🔥", description: "Find carbon compounds (CO2, CH4, or CO)", requirement: 1 },
  { id: "noble_expert", name: "Noble Gas Expert", icon: "✨", description: "Detect helium in a gas giant atmosphere", requirement: 1 },
  { id: "metal_detector", name: "Metal Detector", icon: "🔩", description: "Find metallic elements (Fe, Ti, V, Na, K)", requirement: 3 },
  { id: "planet_explorer", name: "Planet Explorer", icon: "🪐", description: "Analyze 5 different exoplanet atmospheres", requirement: 5 },
  { id: "master_spectro", name: "Master Spectroscopist", icon: "🎓", description: "Detect 10 unique chemical species", requirement: 10 },
  { id: "periodic_pioneer", name: "Periodic Pioneer", icon: "📊", description: "Detect every element and molecule available", requirement: 15 },
];

export const ZODIAC_SIGNS = [
  { name: "Aries", symbol: "♈", element: "Fire", quality: "Cardinal", ruler: "Mars", dates: "Mar 21 - Apr 19", rashi: "Mesha" },
  { name: "Taurus", symbol: "♉", element: "Earth", quality: "Fixed", ruler: "Venus", dates: "Apr 20 - May 20", rashi: "Vrishabha" },
  { name: "Gemini", symbol: "♊", element: "Air", quality: "Mutable", ruler: "Mercury", dates: "May 21 - Jun 20", rashi: "Mithuna" },
  { name: "Cancer", symbol: "♋", element: "Water", quality: "Cardinal", ruler: "Moon", dates: "Jun 21 - Jul 22", rashi: "Karka" },
  { name: "Leo", symbol: "♌", element: "Fire", quality: "Fixed", ruler: "Sun", dates: "Jul 23 - Aug 22", rashi: "Simha" },
  { name: "Virgo", symbol: "♍", element: "Earth", quality: "Mutable", ruler: "Mercury", dates: "Aug 23 - Sep 22", rashi: "Kanya" },
  { name: "Libra", symbol: "♎", element: "Air", quality: "Cardinal", ruler: "Venus", dates: "Sep 23 - Oct 22", rashi: "Tula" },
  { name: "Scorpio", symbol: "♏", element: "Water", quality: "Fixed", ruler: "Mars/Pluto", dates: "Oct 23 - Nov 21", rashi: "Vrischika" },
  { name: "Sagittarius", symbol: "♐", element: "Fire", quality: "Mutable", ruler: "Jupiter", dates: "Nov 22 - Dec 21", rashi: "Dhanu" },
  { name: "Capricorn", symbol: "♑", element: "Earth", quality: "Cardinal", ruler: "Saturn", dates: "Dec 22 - Jan 19", rashi: "Makara" },
  { name: "Aquarius", symbol: "♒", element: "Air", quality: "Fixed", ruler: "Saturn/Uranus", dates: "Jan 20 - Feb 18", rashi: "Kumbha" },
  { name: "Pisces", symbol: "♓", element: "Water", quality: "Mutable", ruler: "Jupiter/Neptune", dates: "Feb 19 - Mar 20", rashi: "Meena" },
];
