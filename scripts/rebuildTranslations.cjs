import fs from 'fs';
import path from 'path';

// Let's just use ts-node or run it through ts-node or ES module loader
// We'll read the file, run a quick regex to convert it to a JSON-like string, parse it, modify it, and write it.
// Actually, it's easier to just use `eval` or `Function` on the exported object if we strip 'export const translations = '.
