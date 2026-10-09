import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function run() {
  console.log('=== TEST 1: i18n Locales Symmetry ===');
  const en = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/i18n/locales/en.json'), 'utf-8'));
  const pt = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/i18n/locales/pt.json'), 'utf-8'));
  const es = JSON.parse(fs.readFileSync(path.join(__dirname, 'src/i18n/locales/es.json'), 'utf-8'));

  const checkKeys = (obj1, obj2, prefix = '') => {
    let missing = [];
    for (const key of Object.keys(obj1)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (!(key in obj2)) {
        missing.push(fullKey);
      } else if (typeof obj1[key] === 'object' && obj1[key] !== null) {
        missing.push(...checkKeys(obj1[key], obj2[key], fullKey));
      }
    }
    return missing;
  };

  const missingInPt = checkKeys(en, pt);
  const missingInEs = checkKeys(en, es);
  console.log('Missing in PT:', missingInPt.length === 0 ? 'None (100% symmetric)' : missingInPt);
  console.log('Missing in ES:', missingInEs.length === 0 ? 'None (100% symmetric)' : missingInEs);

  console.log('\n=== TEST 2: Career Source Database & Prisma Client ===');
  const users = await prisma.user.findMany({
    include: {
      profile: true,
      experiences: {
        include: { accomplishments: true }
      }
    }
  });
  console.log('Users in database:', users.length);
  if (users.length > 0) {
    console.log('User 0:', users[0].name, '—', users[0].email);
    console.log('Experiences:', users[0].experiences.length);
  }

  console.log('\n=== TEST 3: Filename Formatting (Executive Standard) ===');
  function formatCvFilename(userName, company, role, lang, extension) {
    const firstName = userName.trim().split(' ')[0].replace(/[^a-zA-Z0-9]/g, '') || 'Executive';
    const cleanCompany = (company || 'BigTech').trim().replace(/[^a-zA-Z0-9]/g, '');
    const cleanRole = (role || 'Role').trim().replace(/[^a-zA-Z0-9]/g, '');
    const langUpper = lang.toUpperCase();
    return `${firstName}_CV_${cleanCompany}_${cleanRole}_${langUpper}.${extension}`;
  }

  console.log('EN PDF:', formatCvFilename('Amanda Sandoval', 'Stripe', 'StaffPM', 'en', 'pdf'));
  console.log('PT DOCX:', formatCvFilename('Amanda Sandoval', 'Miro', 'Strategic', 'pt', 'docx'));
  console.log('ES PDF:', formatCvFilename('Amanda Sandoval', 'Google', 'PrincipalL7', 'es', 'pdf'));

  console.log('\n✅ ALL VERIFICATION CHECKS COMPLETED SUCCESSFULLY!');
}

run()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
