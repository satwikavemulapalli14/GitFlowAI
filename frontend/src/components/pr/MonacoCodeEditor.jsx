import { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';
import { languageFromFilename } from '../../utils/patchUtils';

loader.config({ monaco });

export default function MonacoCodeEditor({ code, language, height }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const model = monaco.editor.createModel(code || '', language || 'plaintext');

    const editor = monaco.editor.create(containerRef.current, {
      model,
      readOnly: true,
      fontSize: 13,
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      renderOverviewRuler: false,
      contextmenu: false,
      folding: true,
    });

    editorRef.current = editor;

    return () => {
      editor.dispose();
      model.dispose();
    };
  }, [code, language]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-b-lg overflow-hidden border-t border-gray-200"
      style={{ height: height || Math.max(80, (code?.split('\n').length || 1) * 20 + 20) }}
    />
  );
}
