import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const voiceDir = path.join(rootDir, 'public', 'voice');
const outDir = path.join(rootDir, 'src', 'lib');
const outFile = path.join(outDir, 'voiceManifest.json');

const manifest = {};

if (fs.existsSync(voiceDir)) {
  const langDirs = fs.readdirSync(voiceDir, { withFileTypes: true });

  for (const langDir of langDirs) {
    if (!langDir.isDirectory()) continue;
    const lang = langDir.name;
    const fullLangPath = path.join(voiceDir, lang);
    const files = fs.readdirSync(fullLangPath);

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (ext === '.mp3' || ext === '.m4a') {
        const basename = path.basename(file, ext);
        const key = `${lang}/${basename}`;
        manifest[key] = `/voice/${lang}/${file}`;
      }
    }
  }
}

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
console.log(`[gen-voice-manifest] Wrote ${Object.keys(manifest).length} clips to src/lib/voiceManifest.json`);
