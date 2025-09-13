
import {useCallback, useState} from 'react';
import Editor from './Editor.tsx';

interface EditorItem {
  id: string;
  isEmpty: boolean; // track if still empty
}

export default function EditorList() {
  const [editors, setEditors] = useState<EditorItem[]>([{id: '1', isEmpty: true}]);

  const handleEmptyStateChange = useCallback((id: string, isEmpty: boolean) => {
    setEditors(prev => {
      const next = prev.map(e => e.id === id ? {...e, isEmpty} : e);

      // If the last empty editor becomes non-empty and it is the final one, ensure there's a trailing empty editor.
      const last = next[next.length - 1];
      if (!last.isEmpty) {
        // Append exactly one empty editor at end
        const newId = String(next.length + 1);
        next.push({id: newId, isEmpty: true});
      }

      // Prune extra empty editors at end: keep only one trailing empty editor
      let i = next.length - 1;
      // Count consecutive empties from end
      while (i > 0 && next[i - 1].isEmpty && next[i].isEmpty) {
        // Remove the earlier one, keep the very last
        next.splice(i - 1, 1);
        i--;
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
          // autofocus only the first editor initially
          autoFocus={idx === 0 && e.isEmpty && editors.length === 1}
          onEmptyStateChange={(isEmpty) => handleEmptyStateChange(e.id, isEmpty)}
        />
      ))}
    </>
  );
}
