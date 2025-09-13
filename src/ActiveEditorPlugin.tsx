import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useEffect} from 'react';
import {setActiveEditor} from './activeEditorStore';
import { $getSelection, $isRangeSelection } from 'lexical';

/** Plugin that marks this editor as active when it gains focus or selection changes. */
export default function ActiveEditorPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const root = editor.getRootElement();
    if (!root) return;
    const focusIn = () => setActiveEditor(editor);
    const focusOut = (e: FocusEvent) => {
      if (root && !root.contains(e.relatedTarget as Node)) {
        // Do not immediately clear; only clear when another editor focuses.
        // setActiveEditor(null);
      }
    };
    root.addEventListener('focusin', focusIn);
    root.addEventListener('focusout', focusOut);
    return () => {
      root.removeEventListener('focusin', focusIn);
      root.removeEventListener('focusout', focusOut);
    };
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({editorState}) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          setActiveEditor(editor);
        }
      });
    });
  }, [editor]);

  return null;
}
