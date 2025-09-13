
import {useCallback, useState} from 'react';
import Editor from './Editor.tsx';

interface EditorItem {
  id: string;
  isEmpty: boolean; // track if still empty
}

export default function EditorList() {
  const [editors, setEditors] = useState<EditorItem[]>([{id: '1', isEmpty: true}]);

  const handleNonEmpty = useCallback((id: string) => {
    setEditors(prev => {
      // If this editor already marked non-empty, do nothing
      let changed = false;
      const next = prev.map(e => {
        if (e.id === id && e.isEmpty) {
          changed = true;
          return {...e, isEmpty: false};
        }
        return e;
      });
      if (!changed) return prev; // no state change
      // Only add a new empty editor if the edited one was the last one
      const isLast = prev[prev.length - 1].id === id;
      if (isLast) {
        const newId = String(prev.length + 1);
        next.push({id: newId, isEmpty: true});
      }
      return next;
    });
  }, []);

  return (
    <>
      {editors.map((e, idx) => (
        <Editor
          key={e.id}
          id={e.id}
            // autofocus the last (new) empty editor only on creation
          autoFocus={idx === editors.length - 1 && e.isEmpty && editors.length === 1}
          onBecomeNonEmpty={() => handleNonEmpty(e.id)}
        />
      ))}
    </>
  );
}
