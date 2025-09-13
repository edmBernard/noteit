import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useEffect, useRef, useCallback} from 'react';
import type {EditorState, LexicalEditor} from 'lexical';

interface LocalStoragePluginProps {
  /** Storage key to use. Typically include editor id. */
  storageKey: string;
  /** Debounce delay in ms for saving (default 500). */
  debounceMs?: number;
}

// Simple debounce helper bound to latest callback
function useDebouncedCallback<TArgs extends unknown[]>(cb: (...args: TArgs) => void, delay: number) {
  const timeoutRef = useRef<number | null>(null);
  const cbRef = useRef(cb);
  cbRef.current = cb;
  return useCallback((...args: TArgs) => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      cbRef.current(...args);
    }, delay);
  }, [delay]);
}

function loadInitialState(storageKey: string, editor: LexicalEditor) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const json = JSON.parse(raw);
    if (!json || typeof json !== 'object') return;
    const editorState = editor.parseEditorState(json);
    // Replace current state only if current is empty (default new state)
    let isEmpty = true;
    editor.getEditorState().read(() => {
      const root = editor.getRootElement();
      // Simple heuristic: if DOM root has no text, treat empty.
      if (root && root.textContent && root.textContent.trim().length > 0) {
        isEmpty = false;
      }
    });
    if (isEmpty) {
      editor.setEditorState(editorState);
    }
  } catch (err) {
    console.warn('Failed to load editor state from localStorage', err);
  }
}

export default function LocalStoragePlugin({storageKey, debounceMs = 500}: LocalStoragePluginProps) {
  const [editor] = useLexicalComposerContext();

  // Load on mount (after editor initializes)
  useEffect(() => {
    loadInitialState(storageKey, editor);
  }, [storageKey, editor]);

  const save = useDebouncedCallback<[EditorState]>((editorState: EditorState) => {
    try {
      const json = editorState.toJSON();
      localStorage.setItem(storageKey, JSON.stringify(json));
    } catch (err) {
      console.warn('Failed to save editor state to localStorage', err);
    }
  }, debounceMs);

  useEffect(() => {
    return editor.registerUpdateListener(({editorState}) => {
      save(editorState);
    });
  }, [editor, save]);

  // Save one last time on unload (synchronously best effort)
  useEffect(() => {
    const handler = () => {
      try {
        const state = editor.getEditorState();
        const json = state.toJSON();
        localStorage.setItem(storageKey, JSON.stringify(json));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [editor, storageKey]);

  return null;
}
