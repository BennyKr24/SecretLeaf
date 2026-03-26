import fs from 'fs';
import path from 'path';

const sourcesFile = path.resolve('./CANNABIS_RESEARCH_SOURCES.json');
const wikiFile = path.resolve('./apps/web/src/data/terpira/wiki.ts');

// Lese die neuen Quellen
const sourcesData = JSON.parse(fs.readFileSync(sourcesFile, 'utf-8'));
const newSources = sourcesData.sources;

// Lese die aktuelle wiki.ts
let wikiContent = fs.readFileSync(wikiFile, 'utf-8');

// Extrahiere die sourceRegister als String
const sourceRegisterStart = wikiContent.indexOf('export const sourceRegister: TerpiraSource[] = [');
const sourceRegisterEnd = wikiContent.indexOf('];', sourceRegisterStart) + 2;

// Generiere neue sourceRegister TypeScript
const sourceRegisterCode = `export const sourceRegister: TerpiraSource[] = [
${newSources.map(source => `  {
    id: "${source.id}",
    title: "${source.title.replace(/"/g, '\\"')}",
    publisher: "${source.publisher.replace(/"/g, '\\"')}",
    year: "${source.year}",
    url: "${source.url}",
    doi: ${source.doi ? `"${source.doi}"` : 'null'}
  }`).join(',\n')}
];\n`;

// Ersetze
const newContent = wikiContent.slice(0, sourceRegisterStart) + sourceRegisterCode + wikiContent.slice(sourceRegisterEnd);

fs.writeFileSync(wikiFile, newContent, 'utf-8');
console.log(`✅ ${newSources.length} Quellen in sourceRegister integriert`);
