"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    d3: any;
    topojson: any;
  }
}

interface Facility {
  n: string;
  lat: number;
  lon: number;
  c: string;
  t: string;
  op: string;
  p: string;
  y: string;
  ag?: string;
}

const FACILITIES: Facility[] = [
  // ===== USA =====
  {n:"Kennedy Space Center",lat:28.572,lon:-80.648,c:"USA",t:"launch",op:"NASA",p:"Primary US crewed launch site. SLS/Artemis programs.",y:"1962"},
  {n:"Cape Canaveral SFS",lat:28.489,lon:-80.578,c:"USA",t:"launch",op:"USSF / SpaceX",p:"High-cadence Falcon 9 & Vulcan launches.",y:"1950"},
  {n:"SpaceX Starbase",lat:25.997,lon:-97.157,c:"USA",t:"launch",op:"SpaceX",p:"World's largest rocket (Starship) dev & launch. Boca Chica, TX.",y:"2014"},
  {n:"Vandenberg SFB",lat:34.742,lon:-120.572,c:"USA",t:"launch",op:"USSF / SpaceX / ULA",p:"West coast polar & sun-synchronous orbit launches.",y:"1957"},
  {n:"Wallops Flight Facility",lat:37.940,lon:-75.466,c:"USA",t:"launch",op:"NASA / Rocket Lab",p:"Suborbital & Antares/Cygnus ISS resupply.",y:"1945"},
  {n:"Blue Origin Launch Site One",lat:31.422,lon:-104.757,c:"USA",t:"launch",op:"Blue Origin",p:"West Texas suborbital site for New Shepard.",y:"2015"},
  {n:"Mojave Air & Space Port",lat:35.059,lon:-118.151,c:"USA",t:"launch",op:"Private",p:"Horizontal launch/test center (Virgin Galactic, Stratolaunch).",y:"1935"},
  {n:"Spaceport America",lat:32.990,lon:-106.975,c:"USA",t:"launch",op:"Virgin Galactic",p:"Purpose-built commercial tourism spaceport, NM.",y:"2011"},
  {n:"Kodiak Launch Complex",lat:57.436,lon:-152.338,c:"USA",t:"launch",op:"Alaska Aerospace",p:"High-latitude polar orbit from Pacific Spaceport, Alaska.",y:"1998"},
  {n:"Johnson Space Center",lat:29.559,lon:-95.090,c:"USA",t:"control",op:"NASA",p:"Human Spaceflight Mission Control. Astronaut training.",y:"1961"},
  {n:"SpaceX Mission Control",lat:33.921,lon:-118.328,c:"USA",t:"control",op:"SpaceX",p:"Commercial mission control at Hawthorne HQ.",y:"2002"},
  {n:"Jet Propulsion Laboratory",lat:34.201,lon:-118.171,c:"USA",t:"research",op:"NASA / Caltech",p:"Robotic deep space exploration. Mars rovers, Voyager, JWST ops.",y:"1936"},
  {n:"Goddard Space Flight Center",lat:38.991,lon:-76.853,c:"USA",t:"research",op:"NASA",p:"Hub for space telescopes (Hubble/JWST) & Earth observation.",y:"1959"},
  {n:"Marshall Space Flight Center",lat:34.646,lon:-86.665,c:"USA",t:"research",op:"NASA",p:"SLS rocket dev. Propulsion research. ISS payloads.",y:"1960"},
  {n:"Ames Research Center",lat:37.415,lon:-122.063,c:"USA",t:"research",op:"NASA",p:"Astrobiology, aeronautics, supercomputing. Kepler mission.",y:"1939"},
  {n:"Langley Research Center",lat:37.086,lon:-76.376,c:"USA",t:"research",op:"NASA",p:"Oldest NASA center. Aeronautics & atmospheric sciences.",y:"1917"},
  {n:"Johns Hopkins APL",lat:39.165,lon:-76.898,c:"USA",t:"research",op:"JHU/APL",p:"DART, New Horizons, Parker Solar Probe.",y:"1942"},
  {n:"Goldstone DSN",lat:35.427,lon:-116.890,c:"USA",t:"tracking",op:"NASA / JPL",p:"Deep Space Network — key interplanetary communication node.",y:"1958"},
  {n:"NASA Headquarters",lat:38.883,lon:-77.016,c:"USA",t:"agency",op:"NASA",p:"Administrative HQ, Washington D.C. Policy & programs.",y:"1958"},
  {n:"Mauna Kea Observatories",lat:19.821,lon:-155.468,c:"USA",t:"observatory",op:"Multiple",p:"Premier site. Keck 10m, Subaru, Gemini North.",y:"1967"},
  {n:"Kitt Peak Natl Observatory",lat:31.964,lon:-111.600,c:"USA",t:"observatory",op:"NSF / NOIRLab",p:"Largest optical/radio telescope collection. DESI instrument.",y:"1958"},
  {n:"Green Bank Observatory",lat:38.433,lon:-79.840,c:"USA",t:"observatory",op:"NSF / GBO",p:"Largest steerable radio dish (100m). Radio Quiet Zone.",y:"1957"},
  {n:"Very Large Array (VLA)",lat:34.079,lon:-107.618,c:"USA",t:"observatory",op:"NSF / NRAO",p:"27 radio antennas in Y-shape, Socorro, New Mexico.",y:"1980"},
  {n:"Michoud Assembly Facility",lat:30.023,lon:-89.925,c:"USA",t:"manufacturing",op:"NASA / Boeing",p:"Production of massive SLS rocket core stages.",y:"1961"},
  {n:"Boeing Space (Seattle)",lat:47.524,lon:-122.308,c:"USA",t:"manufacturing",op:"Boeing",p:"Starliner, SLS upper stage. Major defense & space.",y:"1916"},
  {n:"Lockheed Martin Space",lat:39.568,lon:-104.845,c:"USA",t:"manufacturing",op:"Lockheed Martin",p:"Orion capsule, GPS satellites, missile defense. Littleton, CO.",y:"1926"},
  {n:"Stennis Space Center",lat:30.365,lon:-89.601,c:"USA",t:"testing",op:"NASA",p:"Safety-critical high-pressure engine testing for SLS.",y:"1961"},
  {n:"White Sands Test Facility",lat:32.503,lon:-106.609,c:"USA",t:"testing",op:"NASA",p:"Hazardous materials & propulsion testing, New Mexico.",y:"1963"},
  {n:"Neil Armstrong Test Facility",lat:41.362,lon:-81.821,c:"USA",t:"testing",op:"NASA",p:"World's largest vacuum chamber for full spacecraft testing.",y:"1969"},
  // ===== INDIA =====
  {n:"Satish Dhawan Space Centre",lat:13.733,lon:80.235,c:"India",t:"launch",op:"ISRO",p:"India's main spaceport. PSLV, GSLV, LVM3 missions.",y:"1971"},
  {n:"Kulasekarapattinam SSLV",lat:8.370,lon:77.723,c:"India",t:"launch",op:"ISRO",p:"New dedicated site for Small Satellite Launch Vehicles.",y:"2024"},
  {n:"Thumba Rocket Station",lat:8.537,lon:76.866,c:"India",t:"launch",op:"ISRO",p:"India's first rocket site. Atmospheric research & sounding rockets.",y:"1962"},
  {n:"ISTRAC Bengaluru",lat:12.953,lon:77.587,c:"India",t:"control",op:"ISRO",p:"Mission Control for Indian planetary missions.",y:"1972"},
  {n:"Master Control Facility Hassan",lat:13.005,lon:76.103,c:"India",t:"control",op:"ISRO",p:"Satellite control center. Manages INSAT/GSAT fleet.",y:"1982"},
  {n:"VSSC Thiruvananthapuram",lat:8.524,lon:76.927,c:"India",t:"research",op:"ISRO",p:"Vikram Sarabhai Space Centre. Rocket & vehicle development.",y:"1962"},
  {n:"SAC Ahmedabad",lat:23.042,lon:72.554,c:"India",t:"research",op:"ISRO",p:"Space Applications Centre. Payload & sensor instrumentation.",y:"1972"},
  {n:"Indian Deep Space Network",lat:12.893,lon:77.371,c:"India",t:"tracking",op:"ISRO",p:"IDSN at Byalalu. 32m antenna for Chandrayaan & Mars missions.",y:"2008"},
  {n:"Antariksh Bhavan (ISRO HQ)",lat:12.954,lon:77.588,c:"India",t:"agency",op:"ISRO",p:"ISRO headquarters in Bengaluru. Policy & coordination.",y:"1969"},
  {n:"Indian Astronomical Obs Hanle",lat:32.779,lon:78.964,c:"India",t:"observatory",op:"IIA",p:"One of world's highest observatories at 4,500m in Ladakh.",y:"2001"},
  {n:"U.R. Rao Satellite Centre",lat:12.937,lon:77.599,c:"India",t:"manufacturing",op:"ISRO",p:"Primary satellite design & manufacturing, Bengaluru.",y:"1972"},
  {n:"IPRC Mahendragiri",lat:8.310,lon:77.505,c:"India",t:"testing",op:"ISRO",p:"Cryogenic propulsion testing (SIL-critical ops).",y:"1993"},
  // ===== CHINA =====
  {n:"Wenchang Spaceport",lat:19.614,lon:110.951,c:"China",t:"launch",op:"CNSA",p:"Heavy-lift center for Long March 5/7. Crewed & deep space.",y:"2014"},
  {n:"Jiuquan Launch Center",lat:40.958,lon:100.291,c:"China",t:"launch",op:"CNSA",p:"First Chinese site (Gobi Desert). Hub for crewed Shenzhou.",y:"1958"},
  {n:"Xichang Satellite Launch Center",lat:28.246,lon:102.027,c:"China",t:"launch",op:"CNSA",p:"GEO satellite launches. BeiDou navigation constellation.",y:"1984"},
  {n:"Taiyuan Satellite Launch Center",lat:38.849,lon:111.608,c:"China",t:"launch",op:"CNSA",p:"Sun-synchronous & polar orbits. Weather & Earth obs.",y:"1988"},
  {n:"Beijing Aerospace Command Center",lat:39.988,lon:116.356,c:"China",t:"control",op:"CNSA",p:"Mission control for Shenzhou, Tiangong, Chang'e, Tianwen.",y:"1996"},
  {n:"Chinese Academy of Space Tech",lat:39.979,lon:116.342,c:"China",t:"research",op:"CAST / CASC",p:"Primary spacecraft R&D. Shenzhou, Tianzhou, Chang'e design.",y:"1968"},
  {n:"Xi'an Satellite Control Center",lat:34.341,lon:108.939,c:"China",t:"tracking",op:"CNSA / PLA",p:"Main satellite tracking & control. Overseas ground stations.",y:"1967"},
  {n:"CNSA Headquarters",lat:39.913,lon:116.407,c:"China",t:"agency",op:"CNSA",p:"China National Space Administration, Beijing.",y:"1993"},
  {n:"FAST Radio Telescope",lat:25.653,lon:106.857,c:"China",t:"observatory",op:"NAOC / CAS",p:"World's largest single-dish (500m). Pulsar & SETI research.",y:"2016"},
  {n:"CASC Manufacturing",lat:39.960,lon:116.325,c:"China",t:"manufacturing",op:"CASC",p:"China Aerospace Science & Tech Corp. Long March rockets.",y:"1999"},
  // ===== EUROPE =====
  {n:"Guiana Space Centre (Kourou)",lat:5.232,lon:-52.769,c:"French Guiana",t:"launch",op:"ESA / CNES / Arianespace",p:"Europe's main spaceport. Equatorial for Ariane 6, Vega-C.",y:"1968"},
  {n:"Esrange Space Center",lat:67.893,lon:21.104,c:"Sweden",t:"launch",op:"SSC",p:"Sounding rockets, balloons & planned orbital above Arctic.",y:"1966"},
  {n:"SaxaVord Spaceport",lat:60.823,lon:-0.773,c:"UK",t:"launch",op:"SaxaVord UK",p:"UK's first vertical orbital launch site (Shetland).",y:"2023"},
  {n:"Sutherland Spaceport",lat:58.513,lon:-4.638,c:"UK",t:"launch",op:"Orbex",p:"Scottish vertical launch. Orbex Prime for small sats.",y:"2023"},
  {n:"Andøya Spaceport",lat:69.294,lon:16.021,c:"Norway",t:"launch",op:"Andøya Space",p:"Northernmost orbital launch. Polar orbit small-sats.",y:"2023"},
  {n:"ESOC Mission Control",lat:49.871,lon:8.625,c:"Germany",t:"control",op:"ESA",p:"ESA Mission Control Darmstadt. All ESA science missions.",y:"1967"},
  {n:"CNES Toulouse Space Centre",lat:43.563,lon:1.481,c:"France",t:"control",op:"CNES",p:"France's main space ops. Satellite control & Earth obs.",y:"1968"},
  {n:"ESTEC Technical Centre",lat:52.219,lon:4.420,c:"Netherlands",t:"research",op:"ESA",p:"Technical heart of ESA; spacecraft test facility. Noordwijk.",y:"1968"},
  {n:"DLR Cologne",lat:50.854,lon:7.125,c:"Germany",t:"research",op:"DLR",p:"European Astronaut Centre & engine testing.",y:"1969"},
  {n:"RAL Space",lat:51.575,lon:-1.314,c:"UK",t:"research",op:"STFC",p:"Space instrumentation & sensor testing. Harwell.",y:"1957"},
  {n:"Centre Spatial de Liège",lat:50.583,lon:5.562,c:"Belgium",t:"research",op:"ULiège",p:"Space instrument testing. JWST, Gaia contributions.",y:"1962"},
  {n:"Madrid DSN Complex",lat:40.431,lon:-4.248,c:"Spain",t:"tracking",op:"NASA / INTA",p:"Essential deep space communications link.",y:"1964"},
  {n:"Kiruna Tracking Station",lat:67.857,lon:20.964,c:"Sweden",t:"tracking",op:"ESA / SSC",p:"Critical for Earth-observation satellites. ESTRACK.",y:"1966"},
  {n:"ESA Cebreros Station",lat:40.453,lon:-4.368,c:"Spain",t:"tracking",op:"ESA",p:"35m deep space antenna. Juice, BepiColombo.",y:"2005"},
  {n:"ESA Headquarters",lat:48.845,lon:2.303,c:"France",t:"agency",op:"ESA",p:"European Space Agency HQ Paris. 22 member states.",y:"1975"},
  {n:"CNES Headquarters",lat:48.848,lon:2.304,c:"France",t:"agency",op:"CNES",p:"French Space Agency. Ariane originator.",y:"1961"},
  {n:"UKSA Headquarters",lat:51.570,lon:-1.311,c:"UK",t:"agency",op:"UKSA",p:"UK Space Agency Swindon. Commercial space growth.",y:"2010"},
  {n:"DLR Headquarters",lat:50.865,lon:7.117,c:"Germany",t:"agency",op:"DLR",p:"German Aerospace Center. 10,000 staff, 30+ sites.",y:"1969"},
  {n:"ASI Headquarters",lat:41.854,lon:12.473,c:"Italy",t:"agency",op:"ASI",p:"Italian Space Agency Rome. ISS, Vega, COSMO-SkyMed.",y:"1988"},
  {n:"Airbus Defence & Space",lat:48.139,lon:11.571,c:"Germany",t:"manufacturing",op:"Airbus",p:"European spacecraft. Orion ESM, Ariane, Eurostar.",y:"2000"},
  {n:"Thales Alenia Space",lat:43.612,lon:7.052,c:"France",t:"manufacturing",op:"Thales / Leonardo",p:"ISS modules. Telecom & observation satellites. Cannes.",y:"2007"},
  {n:"Roque de los Muchachos",lat:28.764,lon:-17.892,c:"Spain",t:"observatory",op:"IAC",p:"Gran Telescopio Canarias 10.4m. Largest optical telescope.",y:"1985"},
  {n:"Jodrell Bank Observatory",lat:53.236,lon:-2.307,c:"UK",t:"observatory",op:"Univ. of Manchester",p:"Lovell 76m dish. UNESCO Heritage. Radio pioneer.",y:"1945"},
  // ===== RUSSIA =====
  {n:"Baikonur Cosmodrome",lat:45.965,lon:63.305,c:"Kazakhstan (leased)",t:"launch",op:"Roscosmos",p:"First spaceport. Sputnik (1957), Gagarin (1961). ISS crew.",y:"1955"},
  {n:"Vostochny Cosmodrome",lat:51.884,lon:128.334,c:"Russia",t:"launch",op:"Roscosmos",p:"New far-east civil launch facility.",y:"2016"},
  {n:"Plesetsk Cosmodrome",lat:62.926,lon:40.578,c:"Russia",t:"launch",op:"Russian MoD",p:"Primary military launch. Highest frequency military satellites.",y:"1957"},
  {n:"TsUP Moscow Mission Control",lat:55.884,lon:37.823,c:"Russia",t:"control",op:"Roscosmos",p:"Mission Control at Korolyov. ISS Russian segment.",y:"1960"},
  {n:"Keldysh Research Center",lat:55.759,lon:37.580,c:"Russia",t:"research",op:"Roscosmos",p:"Advanced propulsion (electric, nuclear). Key R&D institute.",y:"1933"},
  {n:"Roscosmos Headquarters",lat:55.764,lon:37.625,c:"Russia",t:"agency",op:"Roscosmos",p:"Russian space agency. Moscow.",y:"1992"},
  // ===== JAPAN =====
  {n:"Tanegashima Space Center",lat:30.400,lon:130.970,c:"Japan",t:"launch",op:"JAXA",p:"Japan's main orbital launch complex. H-IIA, H3.",y:"1969"},
  {n:"Uchinoura Space Center",lat:31.251,lon:131.079,c:"Japan",t:"launch",op:"JAXA",p:"Scientific satellites & sounding rockets. Epsilon.",y:"1962"},
  {n:"Hokkaido Spaceport",lat:42.503,lon:143.440,c:"Japan",t:"launch",op:"Interstellar Technologies",p:"Commercial spaceport in Taiki, Hokkaido.",y:"2021"},
  {n:"Tsukuba Space Center",lat:36.065,lon:140.131,c:"Japan",t:"control",op:"JAXA",p:"Control of Kibo ISS module & astronaut ops.",y:"1972"},
  {n:"ISAS Space Science",lat:35.558,lon:139.396,c:"Japan",t:"research",op:"JAXA / ISAS",p:"Institute of Space & Astronautical Science. Hayabusa.",y:"1964"},
  {n:"JAXA Headquarters",lat:35.668,lon:139.741,c:"Japan",t:"agency",op:"JAXA",p:"Japan Aerospace Exploration Agency, Tokyo.",y:"2003"},
  // ===== MIDDLE EAST =====
  {n:"MBRSC Dubai",lat:25.231,lon:55.273,c:"UAE",t:"control",op:"MBRSC",p:"Hope Mars Mission control & satellite development.",y:"2006"},
  {n:"UAE Space Agency HQ",lat:24.424,lon:54.434,c:"UAE",t:"agency",op:"UAESA",p:"Oversight of UAE Space Law & Mars/Moon programs.",y:"2014"},
  {n:"Es'hailSat Control Centre",lat:25.286,lon:51.533,c:"Qatar",t:"control",op:"Es'hailSat",p:"Operations for Qatar's Es'hail-1 and Es'hail-2 satellites.",y:"2013"},
  {n:"King Abdulaziz City (KACST)",lat:24.713,lon:46.675,c:"Saudi Arabia",t:"research",op:"KACST",p:"Saudi satellite development and space R&D.",y:"1977"},
  {n:"Oman Satellite Ground Station",lat:23.585,lon:58.405,c:"Oman",t:"tracking",op:"Oman Govt",p:"Regional tracking for communication satellites.",y:"1974"},
  // ===== SOUTH KOREA =====
  {n:"Naro Space Center",lat:34.432,lon:127.535,c:"South Korea",t:"launch",op:"KARI",p:"First South Korean orbital launch site. Nuri (KSLV-II).",y:"2009"},
  {n:"KARI Headquarters",lat:36.372,lon:127.363,c:"South Korea",t:"agency",op:"KARI",p:"Korea Aerospace Research Institute, Daejeon.",y:"1989"},
  {n:"KASI",lat:36.399,lon:127.374,c:"South Korea",t:"research",op:"KASI",p:"Korea Astronomy & Space Science Institute.",y:"1974"},
  // ===== OTHER ASIA =====
  {n:"Semnan Space Center",lat:35.235,lon:53.921,c:"Iran",t:"launch",op:"ISA",p:"Iran's primary orbital site. Simorgh & Safir rockets.",y:"2008"},
  {n:"Palmachim Airbase",lat:31.897,lon:34.691,c:"Israel",t:"launch",op:"ISA / IAI",p:"Shavit launches westward over Mediterranean.",y:"1988"},
  // ===== AMERICAS =====
  {n:"Alcântara Space Center",lat:-2.373,lon:-44.396,c:"Brazil",t:"launch",op:"AEB",p:"Near-equatorial site with high launch efficiency.",y:"1990"},
  {n:"CSA Headquarters",lat:45.522,lon:-73.394,c:"Canada",t:"agency",op:"CSA",p:"Canadian Space Agency. Canadarm, RADARSAT, astronauts.",y:"1989"},
  {n:"CONAE Headquarters",lat:-34.590,lon:-58.506,c:"Argentina",t:"agency",op:"CONAE",p:"Argentine space agency. SAOCOM radar satellites.",y:"1991"},
  {n:"ESA Malargüe Station",lat:-35.776,lon:-69.398,c:"Argentina",t:"tracking",op:"ESA",p:"35m deep space antenna in Mendoza. Southern ESTRACK.",y:"2012"},
  // ===== OCEANIA =====
  {n:"Rocket Lab LC-1",lat:-39.262,lon:177.865,c:"New Zealand",t:"launch",op:"Rocket Lab",p:"World's busiest private orbital spaceport.",y:"2016"},
  {n:"Woomera Test Range",lat:-31.160,lon:136.830,c:"Australia",t:"launch",op:"Australian DoD",p:"Historic site (4th nation to orbit 1967).",y:"1947"},
  {n:"Arnhem Space Centre",lat:-12.443,lon:136.815,c:"Australia",t:"launch",op:"ELA",p:"Equatorial Launch Australia. Commercial launches.",y:"2022"},
  {n:"Canberra DSN",lat:-35.401,lon:148.982,c:"Australia",t:"tracking",op:"NASA / CSIRO",p:"Southern hemisphere's key deep space node.",y:"1965"},
  {n:"Australian Space Agency",lat:-35.282,lon:149.129,c:"Australia",t:"agency",op:"ASA",p:"National space agency, Canberra.",y:"2018"},
  {n:"ESA New Norcia Station",lat:-31.048,lon:116.192,c:"Australia",t:"tracking",op:"ESA",p:"ESA deep space. 35m antenna. Mars Express, Rosetta.",y:"2002"},
  // ===== AFRICA =====
  {n:"Overberg Test Range",lat:-34.582,lon:20.316,c:"South Africa",t:"testing",op:"Denel",p:"Propulsion and aerospace missile testing.",y:"1980"},
  {n:"SKA Observatory (Mid)",lat:-30.722,lon:21.411,c:"South Africa",t:"observatory",op:"SKAO",p:"World's largest radio array (under construction). 197 dishes.",y:"2024"},
  // ===== OTHER =====
  {n:"Turkish Space Agency",lat:39.927,lon:32.851,c:"Turkey",t:"agency",op:"TUA",p:"National space agency Ankara. TURKSAT satellites.",y:"2018"},
  {n:"ESO Paranal (VLT)",lat:-24.628,lon:-70.404,c:"Chile",t:"observatory",op:"ESO",p:"Home to the Very Large Telescope (VLT). 4×8.2m mirrors.",y:"1998"},
  {n:"ALMA Observatory",lat:-23.019,lon:-67.753,c:"Chile",t:"observatory",op:"ESO / NRAO / NAOJ",p:"66 radio antennas at 5,000m in Atacama Desert.",y:"2011"},
  {n:"La Silla Observatory",lat:-29.257,lon:-70.730,c:"Chile",t:"observatory",op:"ESO",p:"ESO's first Chile site. Discovered first exoplanet (1995).",y:"1969"},
  {n:"Vera C. Rubin Observatory",lat:-30.245,lon:-70.749,c:"Chile",t:"observatory",op:"NSF / DOE",p:"8.4m telescope. LSST 10-year sky survey starts 2025.",y:"2025"},
];

// ================================================================
// TYPE CONFIG — dark space palette
// ================================================================
const TYPE_CFG: Record<string, { color: string; bg: string; label: string; icon: string; bdr: string }> = {
  launch:        { color:"#f85149", bg:"rgba(248,81,73,0.12)",   label:"Launch Site",      icon:"🚀", bdr:"rgba(248,81,73,0.35)"   },
  control:       { color:"#58a6ff", bg:"rgba(88,166,255,0.12)",  label:"Mission Control",  icon:"🎛️",  bdr:"rgba(88,166,255,0.35)"  },
  research:      { color:"#bc8cff", bg:"rgba(188,140,255,0.12)", label:"Research Center",  icon:"🔬", bdr:"rgba(188,140,255,0.35)" },
  tracking:      { color:"#3fb950", bg:"rgba(63,185,80,0.12)",   label:"Tracking Station", icon:"📡", bdr:"rgba(63,185,80,0.35)"   },
  observatory:   { color:"#d4a853", bg:"rgba(212,168,83,0.12)",  label:"Observatory",      icon:"🔭", bdr:"rgba(212,168,83,0.35)"  },
  agency:        { color:"#f0883e", bg:"rgba(240,136,62,0.12)",  label:"Space Agency HQ",  icon:"🏛️", bdr:"rgba(240,136,62,0.35)"  },
  manufacturing: { color:"#39d2c0", bg:"rgba(57,210,192,0.12)",  label:"Manufacturing",    icon:"🏭", bdr:"rgba(57,210,192,0.35)"  },
  testing:       { color:"#f778ba", bg:"rgba(247,120,186,0.12)", label:"Test Facility",    icon:"⚡", bdr:"rgba(247,120,186,0.35)" },
};

// ================================================================
// AGENCY CONFIG
// ================================================================
const AGENCY_CFG: Record<string, { label: string; color: string; bg: string; bdr: string; icon: string; match: string[] | null }> = {
  NASA:       { label:"NASA",       color:"#58a6ff", bg:"rgba(88,166,255,0.1)",  bdr:"rgba(88,166,255,0.3)",  icon:"🇺🇸", match:["NASA","NASA / Boeing","NASA / JPL","NASA / Caltech","NASA / INTA","NASA / CSIRO","NSF / NOIRLab","NSF / GBO","NSF / NRAO","NSF / DOE","JHU/APL"] },
  SpaceX:     { label:"SpaceX",     color:"#e6edf3", bg:"rgba(230,237,243,0.08)",bdr:"rgba(230,237,243,0.25)",icon:"🚀", match:["SpaceX","USSF / SpaceX","USSF / SpaceX / ULA"] },
  ESA:        { label:"ESA",        color:"#39d2c0", bg:"rgba(57,210,192,0.1)",  bdr:"rgba(57,210,192,0.3)",  icon:"🇪🇺", match:["ESA","ESA / CNES / Arianespace","ESO","ESO / NRAO / NAOJ"] },
  ISRO:       { label:"ISRO",       color:"#f0883e", bg:"rgba(240,136,62,0.1)",  bdr:"rgba(240,136,62,0.3)",  icon:"🇮🇳", match:["ISRO"] },
  CNSA:       { label:"CNSA",       color:"#f85149", bg:"rgba(248,81,73,0.1)",   bdr:"rgba(248,81,73,0.3)",   icon:"🇨🇳", match:["CNSA","CNSA / PLA","CAST / CASC","CASC","NAOC / CAS"] },
  JAXA:       { label:"JAXA",       color:"#bc8cff", bg:"rgba(188,140,255,0.1)", bdr:"rgba(188,140,255,0.3)", icon:"🇯🇵", match:["JAXA","JAXA / ISAS"] },
  Roscosmos:  { label:"Roscosmos",  color:"#58c6d9", bg:"rgba(88,198,217,0.1)",  bdr:"rgba(88,198,217,0.3)",  icon:"🇷🇺", match:["Roscosmos","Russian MoD"] },
  CNES:       { label:"CNES",       color:"#6699ff", bg:"rgba(102,153,255,0.1)", bdr:"rgba(102,153,255,0.3)", icon:"🇫🇷", match:["CNES"] },
  DLR:        { label:"DLR",        color:"#a78bfa", bg:"rgba(167,139,250,0.1)", bdr:"rgba(167,139,250,0.3)", icon:"🇩🇪", match:["DLR"] },
  Commercial: { label:"Commercial", color:"#3fb950", bg:"rgba(63,185,80,0.1)",   bdr:"rgba(63,185,80,0.3)",   icon:"💼", match:["Blue Origin","Virgin Galactic","Rocket Lab","Boeing","Lockheed Martin","Airbus","Thales / Leonardo","Alaska Aerospace","Interstellar Technologies","Private","Andøya Space","SSC","SaxaVord UK","Orbex","ELA"] },
  Other:      { label:"Other",      color:"#8b949e", bg:"rgba(139,148,158,0.1)", bdr:"rgba(139,148,158,0.3)", icon:"🌐", match: null },
};

function getAgency(f: Facility): string {
  for (const [k, v] of Object.entries(AGENCY_CFG)) {
    if (k === "Other") continue;
    if (v.match && v.match.some(m => f.op === m || f.op.includes(m))) return k;
  }
  return "Other";
}

// ================================================================
// PAGE COMPONENT
// ================================================================
export default function SpaceInfrastructurePage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [scriptCount, setScriptCount] = useState(0);
  const initialized = useRef(false);

  const onScriptLoad = () => setScriptCount(c => c + 1);

  useEffect(() => {
    if (scriptCount < 2 || initialized.current) return;
    initialized.current = true;
    return initMap() ?? undefined;
  }, [scriptCount]);

  function initMap(): (() => void) | undefined {
    const d3 = window.d3;
    const topojson = window.topojson;
    if (!d3 || !topojson || !mapContainerRef.current) return;

    // Tag each facility with its agency group
    FACILITIES.forEach(f => { f.ag = getAgency(f); });

    // Filter state
    let act = new Set(Object.keys(TYPE_CFG));
    let actAg = new Set(Object.keys(AGENCY_CFG));
    let sTerm = "";

    function gf() {
      const s = sTerm.toLowerCase();
      return FACILITIES.filter(f =>
        act.has(f.t) && actAg.has(f.ag!) &&
        (s === "" || f.n.toLowerCase().includes(s) || f.c.toLowerCase().includes(s) || f.op.toLowerCase().includes(s))
      );
    }

    // Map dimensions
    const mc = mapContainerRef.current;
    let W = mc.clientWidth;
    let H = Math.max(420, W * 0.52);

    // D3 SVG setup
    const svg = d3.select("#infra-map").attr("width", W).attr("height", H);
    const proj = d3.geoNaturalEarth1().scale(W / 5.4).translate([W / 2, H / 2]);
    const pathG = d3.geoPath().projection(proj);

    // Drop shadow filter
    const defs = svg.append("defs");
    const sh = defs.append("filter").attr("id", "infra-ds").attr("x", "-100%").attr("y", "-100%").attr("width", "300%").attr("height", "300%");
    sh.append("feDropShadow").attr("dx", 0).attr("dy", 1).attr("stdDeviation", 2.5).attr("flood-color", "#000").attr("flood-opacity", 0.5);

    // Background & ocean
    svg.append("rect").attr("id", "infra-bg").attr("width", W).attr("height", H).attr("fill", "#080f1a").attr("rx", 14);
    svg.append("path").attr("id", "infra-sphere").datum({ type: "Sphere" }).attr("d", pathG).attr("fill", "#0d1f38").attr("stroke", "#1a3a5c").attr("stroke-width", 1.2);
    svg.append("path").attr("id", "infra-grat").datum(d3.geoGraticule10()).attr("d", pathG).attr("fill", "none").attr("stroke", "#0f2035").attr("stroke-width", 0.3);

    const landG = svg.append("g").attr("id", "infra-land");
    const mkrG  = svg.append("g").attr("id", "infra-markers");

    // ── Tooltip ──────────────────────────────────────────────────
    const tE = document.getElementById("infra-tt");

    function showTooltip(ev: MouseEvent, f: Facility) {
      if (!tE) return;
      const c = TYPE_CFG[f.t];
      tE.style.borderLeft   = `4px solid ${c.color}`;
      tE.style.borderTop    = `1.5px solid ${c.bdr}`;
      tE.style.borderRight  = `1.5px solid ${c.bdr}`;
      tE.style.borderBottom = `1.5px solid ${c.bdr}`;
      tE.innerHTML = `
        <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px">
          <div style="width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;background:${c.bg};border:1.5px solid ${c.bdr}">${c.icon}</div>
          <div>
            <div style="font-size:14px;font-weight:700;color:#e6edf3;line-height:1.3">${f.n}</div>
            <div style="font-size:9.5px;letter-spacing:.08em;margin-top:2px;font-weight:700;text-transform:uppercase;color:${c.color}">${c.label}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:78px 1fr;gap:4px 10px;font-size:11.5px;line-height:1.5;padding:10px 0;border-top:1px solid ${c.bdr};border-bottom:1px solid ${c.bdr}">
          <span style="color:#8b949e;font-weight:500">Country</span><span style="color:#e6edf3;font-weight:600">${f.c}</span>
          <span style="color:#8b949e;font-weight:500">Operator</span><span style="color:#e6edf3">${f.op}</span>
          <span style="color:#8b949e;font-weight:500">Established</span><span style="color:#e6edf3">${f.y}</span>
          <span style="color:#8b949e;font-weight:500">Coordinates</span><span style="color:#484f58;font-size:10px">${Math.abs(f.lat).toFixed(2)}°${f.lat >= 0 ? "N" : "S"}, ${Math.abs(f.lon).toFixed(2)}°${f.lon >= 0 ? "E" : "W"}</span>
        </div>
        <div style="margin-top:9px;font-size:11.5px;color:#8b949e;line-height:1.6">${f.p}</div>`;
      moveTooltip(ev);
      tE.classList.add("show");
    }
    function moveTooltip(ev: MouseEvent) {
      if (!tE) return;
      tE.style.left = Math.min(ev.clientX + 16, window.innerWidth - 360) + "px";
      tE.style.top  = Math.max(ev.clientY - 8, 10) + "px";
    }
    function hideTooltip() { tE?.classList.remove("show"); }

    // ── Markers ──────────────────────────────────────────────────
    function drawMarkers() {
      mkrG.selectAll("*").remove();
      gf().forEach((f: Facility) => {
        const coords = proj([f.lon, f.lat]);
        if (!coords) return;
        const [x, y] = coords;
        const cfg = TYPE_CFG[f.t];
        const ring = mkrG.append("circle").attr("cx", x).attr("cy", y).attr("r", 6)
          .attr("fill", "none").attr("stroke", cfg.color).attr("stroke-width", 0.8).attr("opacity", 0.25);
        mkrG.append("circle").attr("cx", x).attr("cy", y).attr("r", 4).attr("fill", "#080f1a").attr("opacity", 0.9);
        mkrG.append("circle").attr("cx", x).attr("cy", y).attr("r", 3.2)
          .attr("fill", cfg.color).attr("filter", "url(#infra-ds)").attr("opacity", 0.92)
          .style("cursor", "pointer")
          .on("mouseenter", function(this: SVGCircleElement, ev: MouseEvent) {
            d3.select(this).transition().duration(80).attr("r", 7).attr("opacity", 1);
            ring.transition().duration(80).attr("r", 15).attr("stroke-width", 2).attr("opacity", 0.55);
            showTooltip(ev, f);
          })
          .on("mousemove", function(_ev: MouseEvent, _d: unknown) {
            const ev = (_ev as unknown) as MouseEvent;
            moveTooltip(ev);
          })
          .on("mouseleave", function(this: SVGCircleElement) {
            d3.select(this).transition().duration(180).attr("r", 3.2).attr("opacity", 0.92);
            ring.transition().duration(180).attr("r", 6).attr("stroke-width", 0.8).attr("opacity", 0.25);
            hideTooltip();
          });
      });
      const fl = gf();
      const total = FACILITIES.length;
      const countries = new Set(FACILITIES.map(f => f.c)).size;
      const clbl = document.getElementById("infra-clbl");
      if (clbl) clbl.textContent = `${fl.length} of ${total} facilities · ${countries} countries`;
      const tlbl = document.getElementById("infra-tlbl");
      if (tlbl) tlbl.textContent = `${total} facilities · ${countries} countries`;
    }

    // ── Filter UI helpers ─────────────────────────────────────────
    const BASE = "display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:18px;cursor:pointer;font-size:10.5px;font-family:Inter,sans-serif;white-space:nowrap;transition:all .15s;outline:none";

    function makeSep(): HTMLSpanElement {
      const sp = document.createElement("span");
      sp.dataset.sp = "";
      sp.style.cssText = "display:inline-block;width:1px;height:20px;background:#30363d;margin:0 3px;vertical-align:middle;flex-shrink:0";
      return sp;
    }

    function updateFilterUI() {
      const agFiltered = FACILITIES.filter(f => actAg.has(f.ag!));
      const avail = [...new Set(agFiltered.map(f => f.t))];
      const allTypeOn = avail.length > 0 && act.size >= avail.length;

      // Show All types button
      const aBtn = document.querySelector<HTMLButtonElement>("#infra-flts [data-all-types]");
      if (aBtn) {
        aBtn.textContent = allTypeOn ? "Hide All" : "Show All";
        aBtn.style.cssText = `${BASE};font-weight:600;border:1.5px solid ${allTypeOn ? "#58a6ff" : "#30363d"};background:${allTypeOn ? "rgba(88,166,255,0.12)" : "#161b22"};color:${allTypeOn ? "#58a6ff" : "#8b949e"}`;
      }
      document.querySelectorAll<HTMLElement>("#infra-flts [data-type]").forEach(b => {
        const k = b.dataset.type!;
        const on = act.has(k);
        const v = TYPE_CFG[k];
        b.style.cssText = `${BASE};font-weight:${on ? "600" : "400"};border:1.5px solid ${on ? v.bdr : "#30363d"};background:${on ? v.bg : "#161b22"};color:${on ? v.color : "#8b949e"}`;
        const ct = b.querySelector<HTMLElement>("[data-ct]");
        if (ct) { ct.style.background = on ? v.color + "22" : "#1c2333"; ct.style.color = on ? v.color : "#8b949e"; }
      });

      // Show All agency button
      const aaOn = actAg.size === Object.keys(AGENCY_CFG).length;
      const agAll = document.querySelector<HTMLButtonElement>("#infra-aflts [data-all-agency]");
      if (agAll) {
        agAll.textContent = aaOn ? "Hide All" : "Show All";
        agAll.style.cssText = `${BASE};font-weight:600;border:1.5px solid ${aaOn ? "#58a6ff" : "#30363d"};background:${aaOn ? "rgba(88,166,255,0.12)" : "#161b22"};color:${aaOn ? "#58a6ff" : "#8b949e"}`;
      }
      document.querySelectorAll<HTMLElement>("#infra-aflts [data-ag]").forEach(b => {
        const k = b.dataset.ag!;
        const on = actAg.has(k);
        const v = AGENCY_CFG[k];
        b.style.cssText = `${BASE};font-weight:${on ? "600" : "400"};border:1.5px solid ${on ? v.bdr : "#30363d"};background:${on ? v.bg : "#161b22"};color:${on ? v.color : "#8b949e"}`;
        const ct = b.querySelector<HTMLElement>("[data-ct]");
        if (ct) { ct.style.background = on ? v.color + "22" : "#1c2333"; ct.style.color = on ? v.color : "#8b949e"; }
      });
    }

    function rebuildTypes() {
      document.querySelectorAll("#infra-flts [data-type]").forEach(b => b.remove());
      const agFiltered = FACILITIES.filter(f => actAg.has(f.ag!));
      const avail = [...new Set(agFiltered.map(f => f.t))];
      const pruned = new Set([...act].filter(t => avail.includes(t)));
      act = pruned.size > 0 ? pruned : new Set(avail);
      const fE = document.getElementById("infra-flts");
      if (!fE) return;
      Object.entries(TYPE_CFG).forEach(([k, v]) => {
        const cnt = agFiltered.filter(f => f.t === k).length;
        if (cnt === 0) return;
        const b = document.createElement("button");
        b.dataset.type = k;
        b.style.cssText = `${BASE};font-weight:600;border:1.5px solid ${v.bdr};background:${v.bg};color:${v.color}`;
        b.innerHTML = `<span style="font-size:12px">${v.icon}</span><span>${v.label}</span><span data-ct style="padding:0 5px;border-radius:8px;font-size:9.5px;font-weight:700;background:${v.color}22;color:${v.color}">${cnt}</span>`;
        b.addEventListener("click", () => { act.has(k) ? act.delete(k) : act.add(k); updateFilterUI(); drawMarkers(); });
        b.addEventListener("mouseenter", () => { b.style.transform = "translateY(-1px)"; b.style.boxShadow = "0 2px 8px rgba(0,0,0,.3)"; });
        b.addEventListener("mouseleave", () => { b.style.transform = ""; b.style.boxShadow = ""; });
        fE.appendChild(b);
      });
    }

    // ── Build agency filter bar ───────────────────────────────────
    const afE = document.getElementById("infra-aflts");
    if (afE) {
      afE.querySelectorAll("button,[data-sp]").forEach(el => el.remove());
      const agAll = document.createElement("button");
      agAll.dataset.allAgency = "";
      agAll.style.cssText = `${BASE};font-weight:600;border:1.5px solid #58a6ff;background:rgba(88,166,255,0.12);color:#58a6ff`;
      agAll.textContent = "Hide All";
      agAll.addEventListener("click", () => {
        actAg = actAg.size === Object.keys(AGENCY_CFG).length ? new Set() : new Set(Object.keys(AGENCY_CFG));
        rebuildTypes(); updateFilterUI(); drawMarkers();
      });
      afE.appendChild(agAll);
      afE.appendChild(makeSep());
      Object.entries(AGENCY_CFG).forEach(([k, v]) => {
        const cnt = FACILITIES.filter(f => f.ag === k).length;
        if (cnt === 0) return;
        const b = document.createElement("button");
        b.dataset.ag = k;
        b.style.cssText = `${BASE};font-weight:600;border:1.5px solid ${v.bdr};background:${v.bg};color:${v.color}`;
        b.innerHTML = `<span style="font-size:12px">${v.icon}</span><span>${v.label}</span><span data-ct style="padding:0 5px;border-radius:8px;font-size:9.5px;font-weight:700;background:${v.color}22;color:${v.color}">${cnt}</span>`;
        b.addEventListener("click", () => { actAg.has(k) ? actAg.delete(k) : actAg.add(k); rebuildTypes(); updateFilterUI(); drawMarkers(); });
        b.addEventListener("mouseenter", () => { b.style.transform = "translateY(-1px)"; b.style.boxShadow = "0 2px 8px rgba(0,0,0,.3)"; });
        b.addEventListener("mouseleave", () => { b.style.transform = ""; b.style.boxShadow = ""; });
        afE.appendChild(b);
      });
    }

    // ── Build type filter bar ─────────────────────────────────────
    const fE = document.getElementById("infra-flts");
    if (fE) {
      fE.querySelectorAll("button,[data-sp]").forEach(el => el.remove());
      const aBtn = document.createElement("button");
      aBtn.dataset.allTypes = "";
      aBtn.style.cssText = `${BASE};font-weight:600;border:1.5px solid #58a6ff;background:rgba(88,166,255,0.12);color:#58a6ff`;
      aBtn.textContent = "Hide All";
      aBtn.addEventListener("click", () => {
        const avail = [...new Set(FACILITIES.filter(f => actAg.has(f.ag!)).map(f => f.t))];
        act = act.size === avail.length ? new Set() : new Set(avail);
        updateFilterUI(); drawMarkers();
      });
      fE.appendChild(aBtn);
      fE.appendChild(makeSep());
      rebuildTypes();
    }

    // ── Load world atlas ──────────────────────────────────────────
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then((w: any) => {
      landG.selectAll("path").data(topojson.feature(w, w.objects.countries).features).enter()
        .append("path").attr("d", pathG)
        .attr("fill", "#1a2a42").attr("stroke", "#2d4a6a").attr("stroke-width", 0.75).attr("stroke-linejoin", "round");
      landG.append("path").attr("fill", "none").attr("stroke", "#243857").attr("stroke-width", 0.6).attr("stroke-linejoin", "round")
        .datum(topojson.mesh(w, w.objects.countries, (a: any, b: any) => a !== b)).attr("d", pathG);
      landG.append("path").attr("fill", "none").attr("stroke", "#1e3a5a").attr("stroke-width", 1)
        .datum(topojson.mesh(w, w.objects.countries, (a: any, b: any) => a === b)).attr("d", pathG);
      const ld = document.getElementById("infra-ld");
      if (ld) ld.style.display = "none";
      drawMarkers(); updateFilterUI();
    }).catch(() => {
      [[-100,40,"N. AMERICA"],[-60,-15,"S. AMERICA"],[15,48,"EUROPE"],[25,5,"AFRICA"],[78,35,"ASIA"],[135,-27,"OCEANIA"],[55,25,"MID EAST"]].forEach(([lo, la, t]) => {
        const p = proj([lo as number, la as number]);
        if (p) landG.append("text").attr("x", p[0]).attr("y", p[1]).attr("text-anchor", "middle")
          .attr("fill", "#2d4a6a").attr("font-size", W > 700 ? 12 : 9).attr("font-family", "Inter,sans-serif")
          .attr("font-weight", "600").attr("letter-spacing", ".12em").text(t as string);
      });
      const ld = document.getElementById("infra-ld");
      if (ld) ld.style.display = "none";
      drawMarkers(); updateFilterUI();
    });

    // ── Resize ────────────────────────────────────────────────────
    function handleResize() {
      if (!mc) return;
      W = mc.clientWidth;
      H = Math.max(420, W * 0.52);
      svg.attr("width", W).attr("height", H);
      proj.scale(W / 5.4).translate([W / 2, H / 2]);
      svg.select("#infra-bg").attr("width", W).attr("height", H);
      svg.select("#infra-sphere").attr("d", pathG);
      svg.select("#infra-grat").attr("d", pathG);
      landG.selectAll("path").each(function(this: SVGPathElement) {
        const e = d3.select(this);
        const datum = e.datum();
        if (datum) e.attr("d", pathG(datum));
      });
      drawMarkers();
    }

    function handleSearch(e: Event) {
      sTerm = (e.target as HTMLInputElement).value;
      drawMarkers(); updateFilterUI();
    }

    window.addEventListener("resize", handleResize);
    document.getElementById("infra-srch")?.addEventListener("input", handleSearch);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.getElementById("infra-srch")?.removeEventListener("input", handleSearch);
    };
  }

  return (
    <div className="animate-fade-in">
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"
        strategy="afterInteractive"
        onLoad={onScriptLoad}
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js"
        strategy="afterInteractive"
        onLoad={onScriptLoad}
      />

      {/* Tooltip styles */}
      <style>{`
        #infra-tt {
          position: fixed;
          background: rgba(13,17,23,0.97);
          backdrop-filter: blur(12px);
          border-radius: 14px;
          padding: 16px 18px;
          max-width: 340px;
          z-index: 9999;
          pointer-events: none;
          box-shadow: 0 12px 40px rgba(0,0,0,.65), 0 0 0 1px rgba(255,255,255,.04);
          display: none;
        }
        #infra-tt.show {
          display: block;
          animation: infra-tts .12s ease;
        }
        @keyframes infra-tts {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
      `}</style>

      {/* ── Page Header ── */}
      <div className="border-b border-[#30363d] bg-[#161b22]/60 backdrop-blur-sm">
        <div className="content-container py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1a73e8] to-[#58a6ff] flex items-center justify-center text-2xl shadow-lg shadow-[#1a73e8]/20">
                🌍
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Global Space Infrastructure</h1>
                <div id="infra-clbl" className="text-xs text-[#8b949e] mt-0.5">Loading…</div>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58] text-sm pointer-events-none select-none">🔍</span>
              <input
                id="infra-srch"
                type="text"
                placeholder="Search name, country, operator…"
                className="bg-[#1c2333] border border-[#30363d] rounded-lg pl-9 pr-4 py-2 text-sm text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#58a6ff] w-64 sm:w-72 transition-all duration-150"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Agency Filter Row ── */}
      <div className="bg-[#161b22]/40" style={{ borderBottom: "1px dashed #30363d" }}>
        <div className="content-container">
          <div id="infra-aflts" className="py-2 flex flex-wrap items-center gap-1.5 min-h-[44px]">
            <span className="text-[10px] font-semibold text-[#484f58] uppercase tracking-widest mr-1 shrink-0">Agency</span>
          </div>
        </div>
      </div>

      {/* ── Type Filter Row ── */}
      <div className="border-b border-[#30363d] bg-[#161b22]/40">
        <div className="content-container">
          <div id="infra-flts" className="py-2 flex flex-wrap items-center gap-1.5 min-h-[44px]">
            <span className="text-[10px] font-semibold text-[#484f58] uppercase tracking-widest mr-1 shrink-0">Type</span>
          </div>
        </div>
      </div>

      {/* ── Map ── */}
      <div className="content-container py-4">
        <div
          ref={mapContainerRef}
          className="rounded-xl overflow-hidden border border-[#30363d] shadow-2xl shadow-black/60 relative w-full"
          style={{ background: "#080f1a" }}
        >
          <div
            id="infra-ld"
            className="absolute inset-0 flex items-center justify-center z-10 gap-3 text-sm text-[#8b949e]"
            style={{ background: "rgba(8,15,26,0.92)", borderRadius: "12px" }}
          >
            <div className="w-5 h-5 border-2 border-[#30363d] border-t-[#58a6ff] rounded-full animate-spin" />
            Loading world map…
          </div>
          <svg id="infra-map" className="block w-full" />
        </div>
      </div>

      {/* ── Tooltip ── */}
      <div id="infra-tt" />

      {/* ── Footer bar ── */}
      <div className="content-container pb-6">
        <div className="flex items-center justify-between text-[10.5px] text-[#484f58]">
          <span>Hover markers for details · Click categories to filter</span>
          <span id="infra-tlbl" />
        </div>
      </div>
    </div>
  );
}
