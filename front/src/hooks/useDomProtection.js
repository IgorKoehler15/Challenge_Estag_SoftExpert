import { useEffect, useRef, useCallback } from 'react';
import logger from '../utils/logger';

// Hook customizado de proteção contra manipulação indevida do DOM
// Detecta alterações não autorizadas em atributos de inputs (ex: via DevTools)
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

        // Detecta alteração direta de texto (ex: editar conteúdo de <td>, <span>, <button> via DevTools)
        if (mutation.type === 'characterData') {
          logger.warn('Fraud attempt blocked! Text content was tampered with.');
          unauthorizedTampering = true;
          break;
        }

        // Detecta inserção/remoção de nós filhos (ex: deletar linhas da tabela, adicionar elementos)
        if (mutation.type === 'childList') {
          // Ignora mudanças no container principal (React gerencia isso nas navegações)
          const parentTag = target.tagName;
          if (parentTag === 'DIV' && target.id === 'root') continue;

          // Detecta remoção de nós que não são text nodes vazios
          if (mutation.removedNodes.length > 0) {
            for (const node of mutation.removedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                logger.warn('Fraud attempt blocked! DOM element was removed.');
                unauthorizedTampering = true;
                break;
              }
            }
          }

          // Detecta adição de nós que não são do React
          if (!unauthorizedTampering && mutation.addedNodes.length > 0) {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE && !node.hasAttribute('data-reactroot')) {
                logger.warn('Fraud attempt blocked! Unauthorized DOM element was added.');
                unauthorizedTampering = true;
                break;
              }
            }
          }

          if (unauthorizedTampering) break;
        }

        // Foca em alterações de atributos suspeitas
        if (mutation.type === 'attributes') {
          const attrName = mutation.attributeName;

          // Ignora atributos internos do React e mudanças de estilo/classe normais
          if (
            attrName &&
            (attrName.startsWith('data-react') ||
              attrName.startsWith('__react') ||
              attrName === 'value' ||
              attrName === 'class' ||
              attrName === 'style' ||
              attrName === 'disabled' ||
              attrName === 'readonly' ||
              attrName === 'aria-hidden')
          ) {
            continue;
          }

          // Detecta tentativa de alterar o tipo de um input (ex: text -> hidden)
          if (attrName === 'type' && target.tagName === 'INPUT') {
            logger.warn('Fraud attempt blocked! Input type attribute was tampered with.');
            unauthorizedTampering = true;
            break;
          }

          // Detecta alteração de atributos sensíveis em inputs (name, id, max, min, step)
          if (
            target.tagName === 'INPUT' &&
            ['name', 'id', 'max', 'min', 'step', 'maxlength', 'pattern'].includes(attrName)
          ) {
            logger.warn(`Suspicious attribute change detected: "${attrName}" on input.`);
            unauthorizedTampering = true;
            break;
          }
        }
      }

      // Se detectou manipulação não autorizada, recarrega a página
      if (unauthorizedTampering) {
        logger.warn('Unauthorized HTML manipulation detected! Reloading the page...');
        observer.disconnect();
        window.location.reload();
      }
    });
    observerRef.current = observer;

    // Observa todo o conteúdo dentro do elemento #root
    const rootElement = document.getElementById('root');
    if (rootElement) {
      observer.observe(rootElement, {
        subtree: true,
        childList: true,
        attributes: true,
        characterData: true,
        attributeFilter: ['type', 'name', 'id', 'max', 'min', 'step', 'maxlength', 'pattern'],
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
