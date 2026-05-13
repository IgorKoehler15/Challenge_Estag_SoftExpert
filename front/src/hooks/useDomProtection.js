import { useEffect, useRef, useCallback } from 'react';

// Hook customizado de proteção contra manipulação indevida do DOM
// Detecta alterações não autorizadas no HTML (ex: via DevTools) e recarrega a página
export default function useDomProtection() {

  // Flag que indica se o React está atualizando o DOM (evita falsos positivos)
  const isReactUpdating = useRef(true);
  const observerRef = useRef(null);

  // Pausa a proteção temporariamente (chamado antes de atualizações do React)
  const pauseProtection = useCallback(() => {
    isReactUpdating.current = true;
  }, []);

  // Retoma a proteção após um delay (chamado depois de atualizações do React)
  const resumeProtection = useCallback((delay = 150) => {
    setTimeout(() => {
      isReactUpdating.current = false;
    }, delay);
  }, []);

  useEffect(() => {
    // MutationObserver monitora alterações no DOM em tempo real
    const observer = new MutationObserver((mutations) => {
      // Ignora mutações durante atualizações legítimas do React
      if (isReactUpdating.current) return;

      let unauthorizedTampering = false;

      for (const mutation of mutations) {
        const target = mutation.target; 

        if (mutation.type === 'attributes') {
          const attrName = mutation.attributeName;

          // Ignora atributos internos do React e mudanças de estilo/classe normais
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

          // Detecta tentativa de alterar o tipo de um input (ex: text → hidden)
          if (attrName === 'type' && target.tagName === 'INPUT') {
            console.warn('Fraud attempt blocked! Input type attribute was tampered with.');
            unauthorizedTampering = true;
            break; 
          }
        }

        // Qualquer adição/remoção de nós ou alteração de texto é considerada suspeita
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          unauthorizedTampering = true;
          break;
        }
      }

      // Se detectou manipulação não autorizada, recarrega a página
      if (unauthorizedTampering) {
        console.warn('Unauthorized HTML manipulation detected! Reloading the page...');
        observer.disconnect();
        window.location.reload();
      }
    });
    observerRef.current = observer;

    // Observa todo o conteúdo dentro do elemento #root
    const rootElement = document.getElementById('root');
    if (rootElement) {
      observer.observe(rootElement, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
      });
    }

    // Aguarda 1 segundo para o React finalizar a renderização inicial
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
