import {INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND, ListNode} from '@lexical/list';
import {useCallback, useEffect, useState} from 'react';
import { $getSelection, $isRangeSelection, type LexicalEditor } from 'lexical';
import {subscribeActiveEditor, getActiveEditor} from './activeEditorStore';
import './ToolbarPlugin.css';

function isSelectionInListType(listType: 'bullet' | 'number' | 'check'): boolean {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) return false;
  const anchorNode = selection.anchor.getNode();
  const element = anchorNode.getTopLevelElementOrThrow();
  if (element instanceof ListNode) {
    return element.getListType() === listType;
  }
  return false;
}

function toggleList(listType: 'bullet' | 'number' | 'check', editor: LexicalEditor) {
  let inSameType = false;
  editor.getEditorState().read(() => {
    inSameType = isSelectionInListType(listType);
  });
  if (inSameType) {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  } else {
    const command = listType === 'bullet'
      ? INSERT_UNORDERED_LIST_COMMAND
      : listType === 'number'
        ? INSERT_ORDERED_LIST_COMMAND
        : INSERT_CHECK_LIST_COMMAND;
    editor.dispatchCommand(command, undefined);
  }
}

export default function ToolbarPlugin() {
  const [editor, setEditor] = useState<LexicalEditor | null>(() => getActiveEditor());
  const [listType, setListType] = useState<'bullet' | 'number' | 'check' | null>(null);

  // Subscribe to active editor changes
  useEffect(() => {
    const unsubscribe = subscribeActiveEditor((e) => setEditor(e));
    return () => { unsubscribe(); };
  }, []);

  // Track selection changes for current active editor
  useEffect(() => {
    if (!editor) return undefined;
    const unregister = editor.registerUpdateListener(({editorState}) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          const element = anchorNode.getTopLevelElementOrThrow();
          if (element instanceof ListNode) {
            const lt = element.getListType();
            if (lt === 'bullet' || lt === 'number' || lt === 'check') {
              setListType(lt);
            } else {
              setListType(null);
            }
          } else {
            setListType(null);
          }
        } else {
          setListType(null);
        }
      });
    });
    return () => unregister();
  }, [editor]);

  const onBullet = useCallback(() => { if (editor) { editor.focus(); toggleList('bullet', editor); } }, [editor]);
  const onNumber = useCallback(() => { if (editor) { editor.focus(); toggleList('number', editor); } }, [editor]);
  const onCheck = useCallback(() => { if (editor) { editor.focus(); toggleList('check', editor); } }, [editor]);

  const inactive = !editor;

  return (
    <div className={`lex-toolbar${inactive ? ' lex-toolbar-hidden' : ''}`}>
      <button
        type="button"
        onClick={onCheck}
        aria-label="Toggle checklist"
        className={listType === 'check' ? 'active' : ''}
        disabled={inactive}
      >☑︎</button>
      <button
        type="button"
        onClick={onBullet}
        aria-label="Toggle bullet list"
        className={listType === 'bullet' ? 'active' : ''}
        disabled={inactive}
      >• </button>
      <button
        type="button"
        onClick={onNumber}
        aria-label="Toggle numbered list"
        className={listType === 'number' ? 'active' : ''}
        disabled={inactive}
      >1.</button>
    </div>
  );
}
