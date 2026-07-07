const EXTENSION_TO_MONACO_LANG = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  rb: 'ruby',
  java: 'java',
  go: 'go',
  rs: 'rust',
  c: 'c',
  cpp: 'cpp',
  cs: 'csharp',
  h: 'c',
  hpp: 'cpp',
  swift: 'swift',
  kt: 'kotlin',
  scala: 'scala',
  php: 'php',
  r: 'r',
  m: 'objective-c',
  mm: 'objective-c',
  dart: 'dart',
  lua: 'lua',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  yml: 'yaml',
  yaml: 'yaml',
  json: 'json',
  xml: 'xml',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'scss',
  less: 'less',
  sql: 'sql',
  graphql: 'graphql',
  md: 'markdown',
  mdx: 'markdown',
  dockerfile: 'dockerfile',
  toml: 'plaintext',
  ini: 'ini',
  cfg: 'ini',
  conf: 'ini',
  env: 'plaintext',
  gitignore: 'plaintext',
  eslintrc: 'json',
  prettierrc: 'json',
  babelrc: 'json',
};

export function languageFromFilename(filename) {
  if (!filename) return 'plaintext';
  const basename = filename.split('/').pop().toLowerCase();

  const exactMatch = EXTENSION_TO_MONACO_LANG[basename];
  if (exactMatch) return exactMatch;

  if (basename === 'dockerfile' || basename.startsWith('dockerfile.')) return 'dockerfile';

  const ext = basename.includes('.') ? basename.split('.').pop() : '';
  return EXTENSION_TO_MONACO_LANG[ext] || 'plaintext';
}

export function parsePatch(patch) {
  if (!patch) return { original: '', modified: '' };

  const originalLines = [];
  const modifiedLines = [];
  const lines = patch.split('\n');

  for (const line of lines) {
    if (line.startsWith('@@') || line.startsWith('---') || line.startsWith('+++')) continue;
    if (line.startsWith('\\ ')) continue;

    if (line.startsWith('-')) {
      originalLines.push(line.slice(1));
    } else if (line.startsWith('+')) {
      modifiedLines.push(line.slice(1));
    } else if (line.startsWith(' ')) {
      const content = line.slice(1);
      originalLines.push(content);
      modifiedLines.push(content);
    }
  }

  return {
    original: originalLines.join('\n'),
    modified: modifiedLines.join('\n'),
  };
}
