import type {LexicalEditor} from 'lexical';

type Listener = (editor: LexicalEditor | null) => void;

let current: LexicalEditor | null = null;
const listeners = new Set<Listener>();

export function setActiveEditor(editor: LexicalEditor | null) {
  if (current === editor) return;
  current = editor;
  for (const l of listeners) l(current);
}

export function getActiveEditor(): LexicalEditor | null {
  return current;
}

export function subscribeActiveEditor(listener: Listener) {
  listeners.add(listener);
  listener(current);
  return () => {
    listeners.delete(listener);
  };
}
