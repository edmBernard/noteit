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
import LocalStoragePlugin from './LocalStoragePlugin';
import type { EditorThemeClasses } from 'lexical';
import './Editor.css';
import {useEffect, useRef} from 'react';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import { $getRoot } from 'lexical';

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

interface EditorProps {
  id: string;
  // Called whenever empty state changes (true=empty, false=non-empty)
  onEmptyStateChange?: (isEmpty: boolean) => void;
  autoFocus?: boolean;
}

// Internal plugin to detect empty/non-empty state changes continuously
function EmptinessListenerPlugin({onChange}: {onChange?: (isEmpty: boolean) => void}) {
  const [editor] = useLexicalComposerContext();
  const lastStateRef = useRef<boolean | null>(null);
  useEffect(() => {
    return editor.registerUpdateListener(({editorState}) => {
      editorState.read(() => {
        const root = $getRoot();
        const isEmpty = root.getTextContent().trim().length === 0;
        if (lastStateRef.current === isEmpty) return;
        lastStateRef.current = isEmpty;
        onChange?.(isEmpty);
      });
    });
  }, [editor, onChange]);
  return null;
}

export default function Editor({id, onEmptyStateChange, autoFocus}: EditorProps) {
  const initialConfig = {
    namespace: `editor-${id}`,
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
      {autoFocus && <AutoFocusPlugin />}
      <ListPlugin />
      <CheckListPlugin />
      <ActiveEditorPlugin />
      <EmptinessListenerPlugin onChange={onEmptyStateChange} />
      <LocalStoragePlugin storageKey={`noteit:editor:${id}`} />
    </LexicalComposer>
  );
}
