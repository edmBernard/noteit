import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {ListPlugin} from '@lexical/react/LexicalListPlugin';
import {CheckListPlugin} from '@lexical/react/LexicalCheckListPlugin';
import {ListItemNode, ListNode} from '@lexical/list';
import ActiveEditorPlugin from './ActiveEditorPlugin';
import type { EditorThemeClasses } from 'lexical';
import './Editor.css';

const theme: EditorThemeClasses = {
  // Root element of the content editable area
  root: 'editor-root',
  list: {
    checklist: 'editor-checklist',
    listitem: 'editor-listItem',
    listitemChecked: 'editor-listItemChecked',
    listitemUnchecked: 'editor-listItemUnchecked',
    nested: {
      listitem: 'editor-nestedListItem',
    },
    ol: 'editor-ol',
    ul: 'editor-ul',
  },
};

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: Error) {
  console.error(error);
}

export default function Editor() {
  const initialConfig = {
    namespace: 'MyEditor',
    theme,
    onError,
    nodes: [ListNode, ListItemNode]
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-wrapper">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              aria-placeholder="Enter some text..."
              placeholder={<div className="editor-placeholder">Enter some text...</div>}
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
      <HistoryPlugin />
      <AutoFocusPlugin />
      <ListPlugin />
      <CheckListPlugin />
      <ActiveEditorPlugin />
    </LexicalComposer>
  );
}
