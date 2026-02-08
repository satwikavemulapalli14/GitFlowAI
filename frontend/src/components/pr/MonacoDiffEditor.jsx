import { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';
import { parsePatch, languageFromFilename } from '../../utils/patchUtils';

loader.config({ monaco });

function getMonacoTheme(isDark) {
  return isDark ? 'vs-dark' : 'vs';
}

export default function MonacoDiffEditor({ file }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !file.patch) return;

    const { original: originalText, modified: modifiedText } = parsePatch(file.patch);
    const lang = languageFromFilename(file.filename);

    const isDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;

    const originalModel = monaco.editor.createModel(originalText, lang);
    const modifiedModel = monaco.editor.createModel(modifiedText, lang);

    const editor = monaco.editor.createDiffEditor(containerRef.current, {
      theme: getMonacoTheme(isDark),
      readOnly: true,
      renderSideBySide: true,
      fontSize: 13,
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      diffAlgorithm: 'advanced',
      renderOverviewRuler: false,
      contextmenu: false,
      folding: true,
      enableSplitViewResizing: false,
    });

    editor.setModel({
      original: originalModel,
      modified: modifiedModel,
    });

    editorRef.current = editor;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e) => {
      monaco.editor.setTheme(getMonacoTheme(e.matches));
    };
    mediaQuery.addEventListener('change', handleThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
      editor.dispose();
      originalModel.dispose();
      modifiedModel.dispose();
    };
  }, [file]);

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{ height: Math.max(200, Math.min(600, (file.patch?.split('\n').length || 0) * 20)) }}
    />
  );
}
