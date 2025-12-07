const fs = require('fs');
const path = require('path');

const ocFolders = ['thea']; // OC directories

ocFolders.forEach(oc => {
    const basePath = path.join(__dirname, '..', oc, 'images'); // FIXED: go up one folder

    if (!fs.existsSync(basePath)) {
        console.warn(`Skipping ${oc} - no images folder found.`);
        return;
    }

    const refs = getFiles(path.join(basePath, 'refs'));
    const sfw = getFiles(path.join(basePath, 'sfw'));
    const nsfw = getFiles(path.join(basePath, 'nsfw'));

    const output = `
/**
 * Auto-generated gallery data for ${oc}.
 * Generated: ${new Date().toISOString()}
 */
const galleryData = {
    refs: ${JSON.stringify(refs)},
    sfw: ${JSON.stringify(sfw)},
    nsfw: ${JSON.stringify(nsfw)}
};
    `.trim();

    fs.writeFileSync(path.join(__dirname, '..', oc, 'gallery-data.js'), output, 'utf8');
    console.log(`✅ Generated gallery-data.js for ${oc}`);
});

function getFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
        .filter(file => /\.(jpe?g|png|gif|webp)$/i.test(file))
        .sort();
}
