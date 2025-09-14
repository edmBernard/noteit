import './App.css'
import EditorList from './EditorList.tsx'
import ToolbarPlugin from './ToolbarPlugin';
import { useEffect } from 'react';


export default function App() {
  // Enable VirtualKeyboard API overlay mode (where supported) so the keyboard
  // doesn't push the visual viewport and instead overlays content. We then
  // use visualViewport + keyboard height env vars to keep toolbar visible.
  useEffect(() => {
    // Enable overlay if possible (Chrome / Edge mobile)
    if ('virtualKeyboard' in navigator) {
      // @ts-expect-error experimental
      navigator.virtualKeyboard.overlaysContent = true;
    }

  }, []);
  return (
    <>
      <EditorList />
      <ToolbarPlugin />
    </>
  )
}
