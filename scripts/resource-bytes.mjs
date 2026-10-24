import {readFileSync} from 'node:fs';

// Match the repository's LF checkout policy before hashing text. Binary media
// must retain their exact bytes; never decode image, video or font payloads.
export function resourceBytes(path) {
  const bytes=readFileSync(path);
  return /\.(?:js|mjs|css|svg|json|txt)$/i.test(path)
    ? Buffer.from(bytes.toString('utf8').replace(/\r\n/g,'\n'))
    : bytes;
}
