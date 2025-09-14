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
      return;
    }

    const vv = window.visualViewport;
    if (!vv) return; // No further dynamic offset logic if unsupported

    const updateOffsets = () => {
      // Keyboard height approximation: difference between window inner height and visual viewport height
      const keyboardHeight = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);

      // Decide toolbar bottom offset: prefer actual keyboard height (JS) over env() fallback.
      // If keyboard not showing (height ~0) keep offset 0 so we don't add extra scroll padding.
      const offset = keyboardHeight > 16 ? keyboardHeight : 0; // threshold to avoid noise from minor resizes
      document.documentElement.style.setProperty('--toolbar-bottom-offset', offset + 'px');
    };

    updateOffsets();
    vv.addEventListener('resize', updateOffsets);
    vv.addEventListener('scroll', updateOffsets);
    return () => {
      vv.removeEventListener('resize', updateOffsets);
      vv.removeEventListener('scroll', updateOffsets);
    };
  }, []);
  return (
    <>
      <EditorList />
      <ToolbarPlugin />
    </>
  )
}
