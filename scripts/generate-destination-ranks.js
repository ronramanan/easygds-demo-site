#!/usr/bin/env node

/**
 * generate-destination-ranks.js
 *
 * Generates a static DESTINATION_POPULARITY_RANK lookup object for hotel/tour
 * destination autocomplete sorting. Combines two open data sources:
 *
 *   1. GeoNames cities15000.txt — population data for 25,000+ cities
 *   2. Wikidata sitelink counts  — global prominence / tourism signal
 *
 * Composite score: 0.4 * population_percentile + 0.6 * sitelinks_percentile
 * (sitelinks weighted higher because tourism fame matters more than raw size)
 *
 * Usage:
 *   node scripts/generate-destination-ranks.js
 *
 * Output:
 *   Prints a JavaScript constant to stdout (pipe to file or copy-paste into scripts.js)
 *   Also writes scripts/destination-ranks-output.js for convenience
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { createUnzip } = require('zlib');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const GEONAMES_URL = 'https://download.geonames.org/export/dump/cities15000.zip';
const WIKIDATA_SPARQL_URL = 'https://query.wikidata.org/sparql';
const TOP_N = 2000;                    // Number of destinations to output
const CANDIDATE_POOL = 5000;           // Take top N by population before scoring
const WIKIDATA_BATCH_SIZE = 50;        // GeoNames IDs per SPARQL query
const WIKIDATA_DELAY_MS = 1200;        // Delay between batches (be polite to WDQS)
const POP_WEIGHT = 0.4;
const SITELINKS_WEIGHT = 0.6;

const OVERRIDES_PATH = path.join(__dirname, 'tourism-overrides.json');
const OUTPUT_PATH = path.join(__dirname, 'destination-ranks-output.js');

// Country-level tourism rank (UNWTO international arrivals, top 50)
// Used as fallback tier in the final output
const COUNTRY_TOURISM_RANK = {
    FR: 1, ES: 2, US: 3, TR: 4, IT: 5,
    MX: 6, GB: 7, DE: 8, TH: 9, AE: 10,
    CN: 11, GR: 12, AT: 13, MY: 14, JP: 15,
    PT: 16, SA: 17, IN: 18, HR: 19, NL: 20,
    HU: 21, MA: 22, PL: 23, CZ: 24, SG: 25,
    ID: 26, AU: 27, KR: 28, VN: 29, EG: 30,
    IE: 31, DK: 32, HK: 33, IL: 34, SE: 35,
    CH: 36, BE: 37, CA: 38, ZA: 39, BR: 40,
    AR: 41, DO: 42, PE: 43, CO: 44, TW: 45,
    NZ: 46, PH: 47, KH: 48, LK: 49, NO: 50
};

// ---------------------------------------------------------------------------
// Utility: HTTP fetch with redirect following
// ---------------------------------------------------------------------------

function fetchUrl(url, options = {}) {
    return new Promise((resolve, reject) => {
        const proto = url.startsWith('https') ? https : http;
        const req = proto.get(url, {
            headers: {
                'User-Agent': 'EasyGDS-DestinationRanker/1.0 (build script)',
                'Accept': options.accept || '*/*',
                ...(options.headers || {})
            }
        }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchUrl(res.headers.location, options).then(resolve, reject);
            }
            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode} for ${url}`));
                res.resume();
                return;
            }
            if (options.raw) {
                resolve(res);
                return;
            }
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        });
        req.on('error', reject);
    });
}

// ---------------------------------------------------------------------------
// Step 1: Download and parse GeoNames cities15000.txt
// ---------------------------------------------------------------------------

async function downloadAndParseGeoNames() {
    console.error('[1/5] Downloading GeoNames cities15000.zip ...');

    const zipPath = path.join(__dirname, 'cities15000.zip');
    const txtPath = path.join(__dirname, 'cities15000.txt');

    // Check if we already have the txt file (cache for re-runs)
    if (fs.existsSync(txtPath)) {
        console.error('      Using cached cities15000.txt');
    } else {
        const zipBuffer = await fetchUrl(GEONAMES_URL);
        fs.writeFileSync(zipPath, zipBuffer);
        console.error('      Downloaded. Extracting ...');

        // Extract using built-in zlib (zip contains a single .txt file)
        // For simplicity, use a child process with unzip or tar
        const { execSync } = require('child_process');
        try {
            // Try PowerShell Expand-Archive on Windows
            execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${__dirname}' -Force"`, { stdio: 'pipe' });
        } catch {
            try {
                // Try unzip on Unix
                execSync(`unzip -o "${zipPath}" -d "${__dirname}"`, { stdio: 'pipe' });
            } catch {
                throw new Error('Cannot extract zip. Install unzip or use Windows PowerShell.');
            }
        }
        console.error('      Extracted.');
    }

    // Parse the TSV
    console.error('      Parsing cities ...');
    const content = fs.readFileSync(txtPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());

    const cities = [];
    for (const line of lines) {
        const cols = line.split('\t');
        if (cols.length < 15) continue;

        const geonamesId = cols[0];
        const name = cols[1];
        const asciiname = cols[2];
        const featureClass = cols[6];
        const featureCode = cols[7];
        const countryCode = cols[8];
        const population = parseInt(cols[14], 10) || 0;

        // Only populated places
        if (featureClass !== 'P') continue;

        cities.push({
            geonamesId,
            name,
            asciiname: asciiname || name,
            countryCode,
            population,
            featureCode,
            tourismBoost: false
        });
    }

    console.error(`      Parsed ${cities.length} populated places.`);
    return cities;
}

// ---------------------------------------------------------------------------
// Step 2: Merge tourism overrides
// ---------------------------------------------------------------------------

function mergeTourismOverrides(cities) {
    console.error('[2/5] Merging tourism overrides ...');

    if (!fs.existsSync(OVERRIDES_PATH)) {
        console.error('      No overrides file found, skipping.');
        return cities;
    }

    const overrides = JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf-8')).overrides;
    const existingIds = new Set(cities.map(c => c.geonamesId));

    let added = 0;
    for (const ov of overrides) {
        if (!existingIds.has(ov.geonamesId)) {
            cities.push({
                geonamesId: ov.geonamesId,
                name: ov.name,
                asciiname: ov.asciiname || ov.name.toLowerCase(),
                countryCode: ov.countryCode,
                population: ov.population || 0,
                featureCode: 'TOURISM',
                tourismBoost: true
            });
            added++;
        } else {
            // Mark existing entry as tourism-boosted
            const existing = cities.find(c => c.geonamesId === ov.geonamesId);
            if (existing) existing.tourismBoost = true;
        }
    }

    console.error(`      Added ${added} new overrides, boosted ${overrides.length - added} existing.`);
    return cities;
}

// ---------------------------------------------------------------------------
// Step 3: Select candidate pool (top N by population + all tourism overrides)
// ---------------------------------------------------------------------------

function selectCandidates(cities) {
    console.error('[3/5] Selecting candidate pool ...');

    // Sort by population descending
    cities.sort((a, b) => b.population - a.population);

    // Take top CANDIDATE_POOL by population
    const topByPop = cities.slice(0, CANDIDATE_POOL);
    const topIds = new Set(topByPop.map(c => c.geonamesId));

    // Ensure all tourism-boosted entries are included
    const tourismExtras = cities.filter(c => c.tourismBoost && !topIds.has(c.geonamesId));
    const candidates = [...topByPop, ...tourismExtras];

    console.error(`      ${candidates.length} candidates (${CANDIDATE_POOL} by pop + ${tourismExtras.length} tourism extras).`);
    return candidates;
}

// ---------------------------------------------------------------------------
// Step 4: Query Wikidata for sitelink counts
// ---------------------------------------------------------------------------

async function fetchWikidataSitelinks(candidates) {
    console.error('[4/5] Querying Wikidata for sitelink counts ...');

    // Check for cached sitelinks (use --use-cache flag to skip Wikidata fetch)
    const cachePath = path.join(__dirname, 'sitelinks-cache.json');
    if (process.argv.includes('--use-cache') && fs.existsSync(cachePath)) {
        console.error('      Using cached sitelinks from ' + cachePath);
        const cached = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
        let withSitelinks = 0;
        for (const c of candidates) {
            c.sitelinks = cached[c.geonamesId] || 0;
            if (c.sitelinks > 0) withSitelinks++;
        }
        console.error(`      Got sitelinks for ${withSitelinks}/${candidates.length} candidates (from cache).`);
        return candidates;
    }

    const geonamesIds = candidates.map(c => c.geonamesId);
    const sitelinkMap = new Map(); // geonamesId -> sitelinks count

    const batches = [];
    for (let i = 0; i < geonamesIds.length; i += WIKIDATA_BATCH_SIZE) {
        batches.push(geonamesIds.slice(i, i + WIKIDATA_BATCH_SIZE));
    }

    console.error(`      ${batches.length} batches of ${WIKIDATA_BATCH_SIZE} ...`);

    let completedBatches = 0;
    let failedBatches = 0;

    for (const batch of batches) {
        const values = batch.map(id => `"${id}"`).join(' ');
        const query = `
            SELECT ?geonamesId ?sitelinks WHERE {
                VALUES ?geonamesId { ${values} }
                ?item wdt:P1566 ?geonamesId .
                ?item wikibase:sitelinks ?sitelinks .
            }
        `;

        const url = `${WIKIDATA_SPARQL_URL}?query=${encodeURIComponent(query)}&format=json`;

        // Retry up to 3 times on failure
        let success = false;
        for (let attempt = 0; attempt < 3 && !success; attempt++) {
            try {
                if (attempt > 0) {
                    console.error(`      Retrying batch (attempt ${attempt + 1})...`);
                    await new Promise(r => setTimeout(r, 3000 * attempt));
                }
                const buf = await fetchUrl(url, {
                    accept: 'application/sparql-results+json',
                    headers: { 'Accept': 'application/sparql-results+json' }
                });
                const data = JSON.parse(buf.toString('utf-8'));

                for (const binding of data.results.bindings) {
                    const gid = binding.geonamesId.value;
                    const sl = parseInt(binding.sitelinks.value, 10) || 0;
                    // Keep highest sitelink count if multiple entities share a GeoNames ID
                    sitelinkMap.set(gid, Math.max(sitelinkMap.get(gid) || 0, sl));
                }
                success = true;
            } catch (err) {
                if (attempt === 2) {
                    failedBatches++;
                    console.error(`      Batch failed after 3 attempts: ${err.message}`);
                }
            }
        }

        completedBatches++;
        if (completedBatches % 20 === 0 || completedBatches === batches.length) {
            console.error(`      Progress: ${completedBatches}/${batches.length} batches` +
                (failedBatches ? ` (${failedBatches} failed)` : ''));
        }

        // Rate limit
        if (completedBatches < batches.length) {
            await new Promise(r => setTimeout(r, WIKIDATA_DELAY_MS));
        }
    }

    // Cache sitelinks for faster re-runs
    const cacheData = Object.fromEntries(sitelinkMap);
    fs.writeFileSync(cachePath, JSON.stringify(cacheData), 'utf-8');
    console.error(`      Cached sitelinks to ${cachePath}`);

    // Attach sitelinks to candidates
    let withSitelinks = 0;
    for (const c of candidates) {
        c.sitelinks = sitelinkMap.get(c.geonamesId) || 0;
        if (c.sitelinks > 0) withSitelinks++;
    }

    console.error(`      Got sitelinks for ${withSitelinks}/${candidates.length} candidates.`);
    return candidates;
}

// ---------------------------------------------------------------------------
// Step 5: Compute composite scores and output top 2000
// ---------------------------------------------------------------------------

function computeAndOutput(candidates) {
    console.error('[5/5] Computing composite scores and generating output ...');

    // ---- Safety net: estimate sitelinks for large cities with Wikidata data gaps ----
    // Some major cities (Barcelona, Singapore, Venice, Munich, etc.) have GeoNames IDs
    // that Wikidata maps to minor entities, resulting in sitelinks=0 or sitelinks=1
    // despite being world-famous destinations. For any city in the top 1000 by
    // population with suspiciously low sitelinks (<=5), we estimate from the median.
    const SAFETY_NET_POP_POOL = 1000;
    const SAFETY_NET_SITELINKS_THRESHOLD = 5;
    const sortedByPop = [...candidates].sort((a, b) => b.population - a.population);
    const topPopIds = new Set(sortedByPop.slice(0, SAFETY_NET_POP_POOL).map(c => c.geonamesId));

    const nonZeroSL = candidates.filter(c => c.sitelinks > SAFETY_NET_SITELINKS_THRESHOLD).map(c => c.sitelinks).sort((a, b) => a - b);
    const medianSL = nonZeroSL[Math.floor(nonZeroSL.length / 2)] || 50;

    let safetyNetCount = 0;
    for (const c of candidates) {
        const needsSafetyNet = c.sitelinks <= SAFETY_NET_SITELINKS_THRESHOLD &&
            (topPopIds.has(c.geonamesId) || c.tourismBoost);
        if (needsSafetyNet) {
            // Estimate proportionally: higher pop rank → higher estimated sitelinks
            const popRankIdx = sortedByPop.findIndex(x => x.geonamesId === c.geonamesId);
            const popFraction = Math.max(0, 1 - (popRankIdx / SAFETY_NET_POP_POOL));
            // Tourism-boosted entries get at least median sitelinks
            const minFraction = c.tourismBoost ? 1.0 : 0.5;
            c.sitelinks = Math.round(medianSL * Math.max(minFraction, 0.5 + popFraction));
            c.estimatedSitelinks = true;
            safetyNetCount++;
            console.error(`      Safety net: ${c.name}, ${c.countryCode} — estimated sitelinks: ${c.sitelinks} (pop rank: ${popRankIdx + 1}${c.tourismBoost ? ', tourism' : ''})`);
        }
    }
    if (safetyNetCount > 0) {
        console.error(`      Applied safety net to ${safetyNetCount} cities (median sitelinks: ${medianSL}).`);
    }

    // Compute percentiles
    const popValues = candidates.map(c => c.population).sort((a, b) => a - b);
    const slValues = candidates.map(c => c.sitelinks).sort((a, b) => a - b);

    function percentile(arr, val) {
        // Fraction of values that are <= val
        let count = 0;
        for (const v of arr) {
            if (v <= val) count++;
            else break;
        }
        return (count / arr.length) * 100;
    }

    // Score each candidate
    for (const c of candidates) {
        let popPct = percentile(popValues, c.population);
        const slPct = percentile(slValues, c.sitelinks);

        // Tourism-boosted entries: floor population percentile at 50%
        // (famous destinations like Venice/Phuket/Santorini shouldn't be penalized for small populations)
        const tourismPopFloor = c.tourismBoost ? 50 : 0;
        popPct = Math.max(popPct, tourismPopFloor);

        // Tourism-boosted entries also get a sitelinks bonus
        const slBonus = c.tourismBoost ? 10 : 0;

        c.compositeScore = POP_WEIGHT * popPct + SITELINKS_WEIGHT * Math.min(100, slPct + slBonus);
    }

    // Sort by composite score descending (highest = most popular)
    candidates.sort((a, b) => b.compositeScore - a.compositeScore);

    // Deduplicate by key (same asciiname:country can appear multiple times)
    const seen = new Set();
    const deduped = [];
    for (const c of candidates) {
        const key = normalizeKey(c.asciiname, c.countryCode);
        if (!seen.has(key)) {
            seen.add(key);
            deduped.push(c);
        }
    }

    // Take top N
    const topN = deduped.slice(0, TOP_N);

    // Generate JavaScript output
    const lines = [];
    lines.push('// Destination popularity rank — top ~2,000 destinations worldwide.');
    lines.push('// Composite of GeoNames population + Wikidata sitelink count (global prominence).');
    lines.push('// Generated by: node scripts/generate-destination-ranks.js');
    lines.push(`// Generated on: ${new Date().toISOString().split('T')[0]}`);
    lines.push('// Lower rank = more popular destination. Key format: "asciiname:CC"');
    lines.push('const DESTINATION_POPULARITY_RANK = {');

    // Group into tiers for readability
    const tiers = [
        { label: 'Rank 1-50: Global mega-destinations', start: 0, end: 50 },
        { label: 'Rank 51-200: Major international destinations', start: 50, end: 200 },
        { label: 'Rank 201-500: Well-known destinations', start: 200, end: 500 },
        { label: 'Rank 501-1000: Notable destinations', start: 500, end: 1000 },
        { label: 'Rank 1001-2000: Regional destinations', start: 1000, end: 2000 }
    ];

    for (const tier of tiers) {
        const slice = topN.slice(tier.start, Math.min(tier.end, topN.length));
        if (slice.length === 0) continue;

        lines.push(`    // ${tier.label}`);

        // Format 5 entries per line for compactness
        for (let i = 0; i < slice.length; i += 5) {
            const chunk = slice.slice(i, i + 5);
            const entries = chunk.map((c, j) => {
                const rank = tier.start + i + j + 1;
                const key = normalizeKey(c.asciiname, c.countryCode);
                return `"${key}": ${rank}`;
            });
            const comma = (tier.start + i + chunk.length < topN.length) ? ',' : '';
            lines.push(`    ${entries.join(', ')}${comma}`);
        }
    }

    lines.push('};');

    // Also output the country tourism rank
    lines.push('');
    lines.push('// Country-level tourism rank — top ~50 countries by international tourist arrivals.');
    lines.push('// Used as fallback when a destination is not in DESTINATION_POPULARITY_RANK.');
    lines.push('// Source: UNWTO World Tourism Barometer.');
    lines.push('const COUNTRY_TOURISM_RANK = {');
    const countryEntries = Object.entries(COUNTRY_TOURISM_RANK);
    for (let i = 0; i < countryEntries.length; i += 5) {
        const chunk = countryEntries.slice(i, i + 5);
        const formatted = chunk.map(([k, v]) => `${k}: ${v}`).join(', ');
        const comma = (i + chunk.length < countryEntries.length) ? ',' : '';
        lines.push(`    ${formatted}${comma}`);
    }
    lines.push('};');

    const output = lines.join('\n');

    // Write to file
    fs.writeFileSync(OUTPUT_PATH, output, 'utf-8');
    console.error(`\nOutput written to: ${OUTPUT_PATH}`);
    console.error(`Top 20 destinations:`);
    for (let i = 0; i < Math.min(20, topN.length); i++) {
        const c = topN[i];
        console.error(`  ${i + 1}. ${c.name}, ${c.countryCode} (pop: ${c.population.toLocaleString()}, sitelinks: ${c.sitelinks}, score: ${c.compositeScore.toFixed(1)})`);
    }

    // Also print a few known disambiguation cases
    console.error('\nDisambiguation check:');
    const checkPairs = [
        ['london', 'GB', 'london', 'CA'],
        ['sydney', 'AU', 'sydney', 'CA'],
        ['paris', 'FR', 'paris', 'US'],
        ['melbourne', 'AU', 'melbourne', 'US'],
    ];

    // Also check previously-missing major cities
    console.error('\nSafety-net cities check:');
    const safetyCheck = [
        'barcelona:ES', 'singapore:SG', 'venice:IT', 'florence:IT',
        'munich:DE', 'naples:IT', 'phuket:TH', 'sevilla:ES',
        'santorini:GR', 'bali:ID', 'dubrovnik:HR', 'kyoto:JP'
    ];
    for (const key of safetyCheck) {
        const rank = topN.findIndex(c => normalizeKey(c.asciiname, c.countryCode) === key) + 1;
        console.error(`  ${key} = rank ${rank || 'NOT FOUND'}`);
    }
    for (const [name1, cc1, name2, cc2] of checkPairs) {
        const key1 = `${name1}:${cc1}`;
        const key2 = `${name2}:${cc2}`;
        const rank1 = topN.findIndex(c => normalizeKey(c.asciiname, c.countryCode) === key1) + 1;
        const rank2 = topN.findIndex(c => normalizeKey(c.asciiname, c.countryCode) === key2) + 1;
        console.error(`  ${name1}:${cc1} = rank ${rank1 || 'not found'}, ${name2}:${cc2} = rank ${rank2 || 'not found'}`);
    }

    // Print to stdout for piping
    console.log(output);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeKey(asciiname, countryCode) {
    return asciiname
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        + ':' + countryCode.toUpperCase();
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    console.error('=== Destination Popularity Rank Generator ===\n');

    let cities = await downloadAndParseGeoNames();
    cities = mergeTourismOverrides(cities);
    const candidates = selectCandidates(cities);
    await fetchWikidataSitelinks(candidates);
    computeAndOutput(candidates);

    console.error('\nDone!');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
