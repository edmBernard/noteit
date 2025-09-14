import './App.css'
import EditorList from './EditorList.tsx'
import ToolbarPlugin from './ToolbarPlugin';
import { useEffect } from 'react';


export default function App() {
  // Enable VirtualKeyboard API overlay mode (where supported) so the keyboard
  // doesn't push the visual viewport and instead overlays content. We then
  // use visualViewport + keyboard height env vars to keep toolbar visible.
  useEffect(() => {
    // Enable overlay if possible (only support on chrome for now)
    if ("virtualKeyboard" in navigator) {
      // @ts-expect-error: TypeScript doesn't recognize virtualKeyboard
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
