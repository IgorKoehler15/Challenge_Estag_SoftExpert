import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook that uses MutationObserver to prevent unauthorized DOM manipulation
 * via browser DevTools (F12). Reloads the page if tampering is detected.
 * 
 * Uses a flag to distinguish React-driven updates from manual DOM edits.
 * React updates pause the observer briefly, so only external changes trigger reload.
 */
export default function useDomProtection() {
  const isReactUpdating = useRef(true);
  const observerRef = useRef(null);

  const pauseProtection = useCallback(() => {
    isReactUpdating.current = true;
  }, []);

  const resumeProtection = useCallback((delay = 150) => {
    setTimeout(() => {
      isReactUpdating.current = false;
    }, delay);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      if (isReactUpdating.current) return;

      let unauthorizedTampering = false;

      for (const mutation of mutations) {
        const target = mutation.target;

        // Skip React internal attribute changes
        if (mutation.type === 'attributes') {
          const attrName = mutation.attributeName;
          if (
            attrName &&
            (attrName.startsWith('data-react') ||
              attrName.startsWith('__react') ||
              attrName === 'value' ||
              attrName === 'class' ||
              attrName === 'style')
          ) {
            continue;
          }

          // Protect input type attributes from being changed
          if (attrName === 'type' && target.tagName === 'INPUT') {
            console.warn('Fraud attempt blocked! Input type attribute was tampered with.');
            unauthorizedTampering = true;
            break;
          }
        }

        // Detect direct DOM child/text manipulation
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          unauthorizedTampering = true;
          break;
        }
      }

      if (unauthorizedTampering) {
        console.warn('Unauthorized HTML manipulation detected! Reloading the page...');
        observer.disconnect();
        window.location.reload();
      }
    });

    observerRef.current = observer;

    const rootElement = document.getElementById('root');
    if (rootElement) {
      observer.observe(rootElement, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
      });
    }

    // Give React time to finish initial render before activating
    const timer = setTimeout(() => {
      isReactUpdating.current = false;
    }, 1000);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return { pauseProtection, resumeProtection };
}
