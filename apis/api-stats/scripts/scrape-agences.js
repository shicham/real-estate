/**
 * SCRAPER D'AGENCES IMMOBILIÈRES (Google Places API + Pages Jaunes)
 * Node.js 18+
 * 
 * Dépendances :
 * npm install axios cheerio csv-writer dotenv
 */

const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
require("dotenv").config();

// ============================
// CONFIGURATION
// ============================
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY; // obligatoire pour Google Places
const CITY = "Paris"; // Ville ciblée
const QUERY = "agence immobilière";

// ============================
// CSV CONFIG
// ============================
const csvWriter = createCsvWriter({
  path: "agences_immobilieres.csv",
  header: [
    { id: "name", title: "Nom agence" },
    { id: "address", title: "Adresse" },
    { id: "phone", title: "Téléphone" },
    { id: "website", title: "Site web" },
    { id: "source", title: "Source" }
  ]
});

// ============================
// 1️⃣ MÉTHODE : GOOGLE PLACES API (RECOMMANDÉ)
// ============================

async function scrapeGooglePlaces() {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURI(
    QUERY + " " + CITY
  )}&key=${GOOGLE_API_KEY}`;

  const { data } = await axios.get(url);
  if (!data.results) return [];

  const results = [];

  for (const place of data.results) {
    // Détails supplémentaires (téléphone + site)
    const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&key=${GOOGLE_API_KEY}`;
    const detail = await axios.get(detailUrl);

    results.push({
      name: place.name || "",
      address: place.formatted_address || "",
      phone: detail.data.result?.formatted_phone_number || "",
      website: detail.data.result?.website || "",
      source: "Google Places"
    });
  }

  return results;
}

// ============================
// 2️⃣ MÉTHODE : SCRAPING PAGES JAUNES (HTML)
// ============================

async function scrapePagesJaunes() {
  const url = `https://www.pagesjaunes.fr/recherche/${CITY.replace(
    " ",
    "+"
  )}/agence+immobiliere`;

  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const results = [];

  $(".bi-bloc").each((_, el) => {
    const name = $(el).find(".denomination > a").text().trim();
    const address = $(el).find(".adresse > a").text().trim();
    const phone = $(el).find(".num > strong").text().trim();
    const website = $(el).find(".site-internet > a").attr("href") || "";

    results.push({
      name,
      address,
      phone,
      website,
      source: "Pages Jaunes"
    });
  });

  return results;
}

// ============================
// EXÉCUTION & EXPORT CSV
// ============================

async function main() {
  console.log("Scraping en cours...");

  let results = [];

  // ----- GOOGLE PLACES -----
  if (GOOGLE_API_KEY) {
    console.log("📡 Google Places API activé");
    const googleResults = await scrapeGooglePlaces();
    console.log(`Google Places → ${googleResults.length} agences trouvées`);
    results.push(...googleResults);
  } else {
    console.log("⚠️ Clé Google non trouvée – Google Places désactivé");
  }

  // ----- PAGES JAUNES -----
  console.log("📡 Scraping Pages Jaunes...");
  const pjResults = await scrapePagesJaunes();
  console.log(`Pages Jaunes → ${pjResults.length} agences trouvées`);
  results.push(...pjResults);

  // Écriture CSV
  if (results.length > 0) {
    await csvWriter.writeRecords(results);
    console.log(`\n📁 CSV généré : agences_immobilieres.csv`);
  } else {
    console.log("❌ Aucune donnée trouvée.");
  }
}

main().catch(err => console.error(err));