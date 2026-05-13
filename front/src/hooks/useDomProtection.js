/**
 * ============================================================
 * ARQUIVO: hooks/useDomProtection.js — PROTEÇÃO CONTRA MANIPULAÇÃO DO DOM
 * ============================================================
 *
 * Este é um HOOK CUSTOMIZADO (custom hook) que protege a aplicação
 * contra manipulações não autorizadas do HTML via DevTools (F12).
 *
 * O QUE É UM HOOK CUSTOMIZADO?
 * É uma função JavaScript que começa com "use" e pode usar outros
 * hooks do React (useState, useEffect, useRef, etc.) dentro dela.
 * Serve para EXTRAIR e REUTILIZAR lógica entre componentes.
 *
 * Regras de hooks:
 * 1. Sempre começam com "use" (convenção obrigatória)
 * 2. Só podem ser chamados dentro de componentes React ou outros hooks
 * 3. Não podem ser chamados dentro de if/for/while (devem estar no "topo")
 *
 * POR QUE ESTE HOOK EXISTE?
 * Em aplicações de e-commerce ou financeiras, um usuário mal-intencionado
 * poderia abrir o DevTools (F12) e alterar preços, quantidades ou outros
 * valores diretamente no HTML. Este hook detecta essas alterações e
 * recarrega a página, invalidando a manipulação.
 *
 * COMO FUNCIONA (resumo):
 * 1. Usa a API MutationObserver do navegador para "vigiar" o DOM
 * 2. Quando detecta uma mudança, verifica se foi feita pelo React
 *    (legítima) ou por algo externo (suspeita)
 * 3. Se for externa, recarrega a página automaticamente
 *
 * O DESAFIO: O React TAMBÉM modifica o DOM (é assim que ele funciona!).
 * Então precisamos de um mecanismo para PAUSAR a vigilância quando o
 * React está atualizando, e REATIVAR depois. É por isso que existem
 * as funções pauseProtection e resumeProtection.
 *
 * CONEXÃO COM OUTROS ARQUIVOS:
 * - Usado em App.js → componente ProtectedRoutes
 * - App.js pausa a proteção antes de cada renderização (useLayoutEffect)
 * - App.js reativa a proteção após cada renderização (useEffect)
 * - App.js pausa/reativa na navegação entre páginas
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * ─── HOOKS DO REACT USADOS AQUI ─────────────────────────────
 *
 * useEffect: executa código após a renderização (efeitos colaterais).
 *   Aqui usado para criar e destruir o MutationObserver.
 *
 * useRef: cria uma "caixa" que guarda um valor mutável sem causar
 *   re-renderização quando muda. Perfeito para:
 *   - Flags (isReactUpdating) que mudam frequentemente
 *   - Referências a objetos do DOM ou APIs do navegador (observer)
 *
 * useCallback: "memoriza" uma função para que ela não seja recriada
 *   a cada renderização. Isso é importante quando a função é passada
 *   como dependência de useEffect em outros componentes (App.js).
 *   Sem useCallback, o useEffect re-executaria desnecessariamente.
 */

export default function useDomProtection() {

  // ─── REFERÊNCIAS (useRef) ───────────────────────────────────

  /**
   * isReactUpdating: flag (bandeira) que indica se o React está
   * no meio de uma atualização do DOM.
   *
   * - true = "React está trabalhando, ignore mudanças no DOM"
   * - false = "React terminou, qualquer mudança é suspeita"
   *
   * Começa como true porque na montagem inicial o React ainda
   * está construindo a interface.
   *
   * POR QUE useRef E NÃO useState?
   * Porque mudar um ref NÃO causa re-renderização. Se usássemos
   * useState, cada vez que pausássemos/reativássemos a proteção,
   * o componente inteiro re-renderizaria — causando um loop infinito!
   */
  const isReactUpdating = useRef(true);

  /**
   * observerRef: guarda a referência ao objeto MutationObserver.
   * Precisamos dela para poder desconectar o observer quando o
   * componente for desmontado (cleanup).
   */
  const observerRef = useRef(null);

  // ─── FUNÇÕES DE CONTROLE ────────────────────────────────────

  /**
   * pauseProtection() — Pausa a vigilância do DOM.
   *
   * Chamada pelo App.js ANTES do React atualizar a tela.
   * Simplesmente muda a flag para true, fazendo o observer
   * ignorar qualquer mutação detectada.
   *
   * useCallback(fn, []) com array vazio = a função é criada UMA vez
   * e nunca muda. Isso garante estabilidade nas dependências de
   * useEffect no App.js.
   */
  const pauseProtection = useCallback(() => {
    isReactUpdating.current = true;
  }, []);

  /**
   * resumeProtection(delay) — Reativa a vigilância após um delay.
   *
   * PARÂMETRO:
   * - delay: tempo em milissegundos para esperar antes de reativar
   *   (padrão: 150ms)
   *
   * POR QUE UM DELAY?
   * O React pode fazer várias atualizações em sequência (batching).
   * Se reativássemos imediatamente, poderíamos pegar uma atualização
   * legítima do React no meio do caminho. O delay dá tempo para
   * TODAS as atualizações terminarem antes de "trancar" o DOM.
   *
   * setTimeout: função do JavaScript que executa código após X ms.
   * É assíncrona — não bloqueia o resto do código.
   */
  const resumeProtection = useCallback((delay = 150) => {
    setTimeout(() => {
      isReactUpdating.current = false;
    }, delay);
  }, []);

  // ─── EFEITO PRINCIPAL: Criar o MutationObserver ─────────────
  /**
   * Este useEffect executa UMA vez (array de dependências vazio [])
   * quando o componente é montado. Ele:
   * 1. Cria o MutationObserver
   * 2. Configura o que observar
   * 3. Inicia a observação
   * 4. Define a função de cleanup (limpeza) para quando desmontar
   */
  useEffect(() => {

    /**
     * ═══════════════════════════════════════════════════════════
     * MutationObserver — API nativa do navegador
     * ═══════════════════════════════════════════════════════════
     *
     * O QUE É?
     * É uma API do navegador que "observa" mudanças no DOM e
     * executa uma função (callback) sempre que algo muda.
     *
     * TIPOS DE MUTAÇÃO QUE ELE DETECTA:
     * - childList: nós filhos adicionados ou removidos
     * - attributes: atributos de elementos alterados
     * - characterData: conteúdo de texto alterado
     *
     * O callback recebe um array de "mutations" (mudanças detectadas).
     * Cada mutation tem informações sobre O QUE mudou e ONDE.
     */
    const observer = new MutationObserver((mutations) => {

      /**
       * PRIMEIRA VERIFICAÇÃO: Se o React está atualizando, ignora
       * TODAS as mutações. Isso evita falsos positivos.
       */
      if (isReactUpdating.current) return;

      let unauthorizedTampering = false;

      /**
       * LOOP: Analisa cada mutação individualmente para decidir
       * se é legítima ou suspeita.
       *
       * for...of: forma moderna de iterar sobre arrays/iteráveis.
       * Mais legível que for(let i=0; i<arr.length; i++)
       */
      for (const mutation of mutations) {
        const target = mutation.target; // Elemento que foi modificado

        // ─── ANÁLISE DE MUDANÇAS EM ATRIBUTOS ─────────────────
        /**
         * Se a mutação é do tipo "attributes" (um atributo HTML mudou),
         * verificamos SE é um atributo que o React normalmente altera.
         *
         * Atributos que o React usa internamente:
         * - data-react*: metadados internos do React
         * - __react*: propriedades internas do React
         * - value: valor de inputs (controlados pelo React)
         * - class: classes CSS (React usa className)
         * - style: estilos inline
         *
         * Se for um desses, é LEGÍTIMO → continue (pula para próxima mutação)
         */
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
            continue; // Pula — é uma mudança legítima do React
          }

          /**
           * CASO ESPECIAL: Protege o atributo "type" de inputs.
           *
           * POR QUE? Um atacante poderia mudar um input de type="number"
           * para type="text" e digitar valores inválidos, ou mudar
           * type="hidden" para type="text" e ver/alterar dados ocultos.
           *
           * Se detectar essa mudança, marca como fraude imediatamente.
           */
          if (attrName === 'type' && target.tagName === 'INPUT') {
            console.warn('Fraud attempt blocked! Input type attribute was tampered with.');
            unauthorizedTampering = true;
            break; // Sai do loop — já sabemos que é fraude
          }
        }

        // ─── ANÁLISE DE MUDANÇAS NO CONTEÚDO ──────────────────
        /**
         * Se a mutação é do tipo:
         * - childList: elementos HTML foram adicionados/removidos
         * - characterData: texto foi alterado diretamente
         *
         * E o React NÃO está atualizando (já verificamos acima),
         * então alguém está manipulando o DOM externamente.
         *
         * Exemplos de ataque:
         * - Mudar o texto "R$ 100,00" para "R$ 1,00" no DevTools
         * - Adicionar um elemento <script> malicioso
         * - Remover um campo de validação
         */
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          unauthorizedTampering = true;
          break;
        }
      }

      // ─── AÇÃO: Recarregar a página se detectou fraude ────────
      /**
       * Se qualquer manipulação não autorizada foi detectada:
       * 1. Loga um aviso no console (para debugging)
       * 2. Desconecta o observer (para de vigiar)
       * 3. Recarrega a página inteira (window.location.reload())
       *
       * O reload invalida qualquer alteração feita no DOM, pois
       * a página é reconstruída do zero com os dados corretos
       * vindos do servidor.
       */
      if (unauthorizedTampering) {
        console.warn('Unauthorized HTML manipulation detected! Reloading the page...');
        observer.disconnect();
        window.location.reload();
      }
    });

    // Guarda referência ao observer para uso futuro
    observerRef.current = observer;

    // ─── INICIAR A OBSERVAÇÃO ─────────────────────────────────
    /**
     * Busca o elemento #root (onde toda a aplicação React vive)
     * e começa a observar TODAS as mudanças dentro dele.
     *
     * Opções de observação:
     * - childList: true → observa adição/remoção de elementos filhos
     * - subtree: true → observa TODOS os descendentes (não só filhos diretos)
     * - characterData: true → observa mudanças em texto
     * - attributes: true → observa mudanças em atributos HTML
     *
     * subtree: true é crucial! Sem ele, só observaria mudanças
     * diretamente dentro de #root, não em elementos mais profundos.
     */
    const rootElement = document.getElementById('root');
    if (rootElement) {
      observer.observe(rootElement, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
      });
    }

    // ─── ATIVAÇÃO INICIAL COM DELAY ───────────────────────────
    /**
     * Espera 1 segundo (1000ms) antes de ativar a proteção.
     * Isso dá tempo para o React terminar a renderização inicial
     * completa (incluindo chamadas à API e atualizações de estado).
     *
     * Sem esse delay, o observer poderia detectar a construção
     * inicial da página como "manipulação" e recarregar em loop!
     */
    const timer = setTimeout(() => {
      isReactUpdating.current = false;
    }, 1000);

    // ─── CLEANUP (LIMPEZA) ────────────────────────────────────
    /**
     * A função retornada pelo useEffect é executada quando o
     * componente é DESMONTADO (removido da tela). Isso é essencial
     * para evitar "memory leaks" (vazamentos de memória).
     *
     * CONCEITO: CLEANUP EM useEffect
     * Sempre que um efeito cria algo que persiste (timer, observer,
     * event listener, conexão WebSocket), devemos LIMPAR no retorno.
     * Caso contrário, esses recursos continuam rodando em background
     * mesmo depois que o componente não existe mais.
     *
     * Aqui limpamos:
     * 1. O timer (clearTimeout) — cancela se ainda não executou
     * 2. O observer (disconnect) — para de vigiar o DOM
     */
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []); // [] = executa apenas na montagem (mount) e limpeza na desmontagem (unmount)

  // ─── RETORNO DO HOOK ────────────────────────────────────────
  /**
   * Retorna um objeto com as duas funções de controle.
   * O componente que usar este hook (App.js) recebe essas funções
   * e pode pausar/reativar a proteção conforme necessário.
   *
   * PADRÃO: Hooks customizados retornam valores/funções que o
   * componente consumidor precisa. É como uma "API" do hook.
   */
  return { pauseProtection, resumeProtection };
}
