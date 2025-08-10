import { FetchProtocol, Meta } from '../fetch-npm-module';
import { fetchWithRetries } from './utils';

type UnpkgMetaFiles = {
  path: string;
  type: 'file' | 'directory';
  files?: UnpkgMetaFiles[];
};

function normalize(files: UnpkgMetaFiles[], fileObject: Meta = {}) {
  for (let i = 0; i < files.length; i += 1) {
    const { files: childFiles, type, path } = files[i];
    if (type === 'file') {
      const absolutePath = path;
      fileObject[absolutePath] = true; // eslint-disable-line no-param-reassign
    }

    if (childFiles) {
      normalize(childFiles, fileObject);
    }
  }

  return fileObject;
}

export class UnpkgFetcher implements FetchProtocol {
  async file(name: string, version: string, path: string): Promise<string> {
    const url = `https://d1ks0e82elkklw.cloudfront.net/${name}@${version}${path}`;
    const result = await fetchWithRetries(url).then(x => x.text());

    return result;
  }

  async meta(name: string, version: string): Promise<Meta> {
    const url = `https://d1ks0e82elkklw.cloudfront.net/${name}@${version}/?meta`;
    const result: UnpkgMetaFiles = await fetchWithRetries(url).then(x =>
      x.json()
    );

    return normalize(result.files!, {});
  }
}
