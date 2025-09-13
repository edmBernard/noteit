import {useEffect} from 'react';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {KEY_SPACE_COMMAND, $getSelection, COMMAND_PRIORITY_CRITICAL, $isRangeSelection} from 'lexical';

/**
 * This plugin prevents the space bar from toggling a checklist item when the caret
 * is inside the text content of a checklist list item. Default Lexical behavior can
 * sometimes toggle when the space key targets the list item's marker region.
 *
 * We intercept KEY_SPACE_COMMAND and always insert a normal space (return false so
 * other lower-priority handlers still see it if needed). Alternatively, we could
 * dispatch an insertText command, but letting native insertion happen keeps IME behavior intact.
 */
export default function ChecklistSpaceFixPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_SPACE_COMMAND,
      (event: KeyboardEvent) => {
        // Always block native toggle + insert a space when editable and selection is a range.
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false; // let others handle if not text selection
        event.preventDefault();
        selection.insertText(' ');
        return true; // consumed
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor]);

  return null;
}
