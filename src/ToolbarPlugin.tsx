import {INSERT_CHECK_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND, ListNode, ListItemNode} from '@lexical/list';
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

// Cycle checklist states: not a checklist -> unchecked checklist; unchecked checklist -> checked checklist; checked checklist -> remove list
function cycleChecklist(editor: LexicalEditor) {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return;
    }
    const inChecklist = isSelectionInListType('check');
    if (!inChecklist) {
      // Turn current selection into an (unchecked) checklist
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
      return;
    }

    // We're inside a checklist already. Determine if any selected list items are unchecked.
    const nodes = selection.getNodes();
    const listItemSet = new Set<ListItemNode>();
    for (const n of nodes) {
      let cur = n as unknown as null | { getParent?: () => unknown };
      while (cur && !(cur instanceof ListItemNode)) {
        if (typeof cur.getParent === 'function') {
          const parent = cur.getParent();
          cur = parent as typeof cur;
        } else {
          cur = null;
        }
      }
      if (cur instanceof ListItemNode) {
        listItemSet.add(cur);
      }
    }

    if (listItemSet.size === 0) {
      return; // Nothing to do
    }

    let anyUnchecked = false;
    let allChecked = true;
    for (const li of listItemSet) {
      if (!li.getChecked()) {
        anyUnchecked = true;
        allChecked = false;
        break;
      }
    }
    if (anyUnchecked) {
      // Mark all selected list items as checked
      for (const li of listItemSet) {
        li.setChecked(true);
      }
    } else if (allChecked) {
      // Remove list entirely (back to plain paragraphs)
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  });
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
  const onCheck = useCallback(() => { if (editor) { editor.focus(); cycleChecklist(editor); } }, [editor]);

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
