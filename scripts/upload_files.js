
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadDirectory(localDir, bucketName, prefix = '') {
    if (!fs.existsSync(localDir)) {
        console.log(`Directory not found: ${localDir}`);
        return;
    }

    const items = fs.readdirSync(localDir, { withFileTypes: true });

    for (const item of items) {
        const localPath = path.join(localDir, item.name);
        if (item.isDirectory()) {
            await uploadDirectory(localPath, bucketName, `${prefix}${item.name}/`);
        } else {
            const fileContent = fs.readFileSync(localPath);
            const storagePath = `${prefix}${item.name}`;
            const { data, error } = await supabase.storage
                .from(bucketName)
                .upload(storagePath, fileContent, {
                    upsert: true
                });

            if (error) {
                console.error(`Failed to upload ${storagePath}:`, error.message);
            } else {
                console.log(`Uploaded: ${bucketName}/${storagePath}`);
            }
        }
    }
}

async function main() {
    console.log('Starting file upload...');

    // Upload Materials
    await uploadDirectory(path.join(projectRoot, 'public', 'materials'), 'materials');

    // Upload Notices
    await uploadDirectory(path.join(projectRoot, 'public', 'notices'), 'notices');

    console.log('Upload complete.');
}

main().catch(console.error);
