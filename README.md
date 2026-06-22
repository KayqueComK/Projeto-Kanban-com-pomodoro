# 🌌 Zenith // Dashboard de Produtividade & Kanban Retrô

```
  ███████╗███████╗███╗   ██╗██╗████████╗██╗  ██╗
  ╚══███╔╝██╔════╝████╗  ██║██║╚══██╔══╝██║  ██║
    ███╔╝ █████╗  ██╔██╗ ██║██║   ██║   ███████║
   ███╔╝  ██╔══╝  ██║╚██╗██║██║   ██║   ██╔══██║
  ███████╗███████╗██║ ╚████║██║   ██║   ██║  ██║
  ╚══════╝╚══════╝╚═╝  ╚═══╝╚═╝   ╚═╝   ╚═╝  ╚═╝
```

> **[DEBUG://STATUS: ONLINE]**  
> Um dashboard de produtividade com estética retro-futurista 8-bit / cyberpunk roxo e rosa neon, focado em maximizar o seu foco diário.

---

## 🕹️ Funcionalidades principais

### 1. 📋 Quadro Kanban Interativo
* **Drag-and-Drop Fluido:** Arraste seus cartões de tarefas livremente entre as colunas **A Fazer**, **Em Andamento** e **Concluído**.
* **Brilho Dinâmico (Hover Glow):** Ao passar o mouse ou arrastar um cartão para cima de uma coluna, a borda do cartão brilha dinamicamente na cor temática da coluna:
  * 🔵 **A Fazer:** Glow Neon Ciano
  * 🟡 **Em Andamento:** Glow Neon Amarelo
  * 🟢 **Concluído:** Glow Neon Verde
* **Persistência de Dados:** Suas tarefas são salvas no `localStorage`, garantindo que nada se perca ao fechar o navegador.

### 2. ⏱️ Cronômetro Pomodoro Integrado
* **Ciclos de Foco:** Timer clássico de 25 minutos configurado com barra de progresso em anel dinâmico.
* **Alarme 8-bit Synthesizer:** Ao finalizar o ciclo de foco ou concluir uma tarefa, o sistema gera sonoridades retrô de chiptune sintetizadas em tempo real utilizando a **Web Audio API** (sem arquivos de áudio pesados, 100% puro código!).
* **Controles Rápidos:** Botões rápidos de *Play/Pause* e *Reset* com ícones vetoriais modernos e de alto contraste.

### 3. 📈 Gráfico de Desempenho (Canvas)
* **Visual Stepped Chart:** Um gráfico customizado gerado diretamente via tag `<canvas>` do HTML5 que renderiza seu progresso semanal em blocos pixelados.
* **Métricas em Tempo Real:** Mostra automaticamente a quantidade de tarefas concluídas e calcula sua taxa de eficiência.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando tecnologias web puras (Vanilla) de alta performance:
* **Estrutura:** HTML5 Semântico com suporte a Canvas e SVGs Inline.
* **Estilização:** CSS3 Vanilla utilizando variáveis nativas, efeitos de Glassmorphism e uma animação CRT Scanline para emular telas de fliperama antigas.
* **Lógica:** JavaScript ES6+ nativo com manipulação da **Web Audio API** para sintetizar notas de áudio e lógica de arrastar e soltar (Drag & Drop).

---

## 🚀 Como Iniciar o Projeto

Como o Zenith utiliza apenas arquivos estáticos nativos, rodar o projeto é extremamente simples:

1. Clone o repositório ou baixe os arquivos.
2. Abra o arquivo `index.html` diretamente em seu navegador **ou** utilize um servidor local de desenvolvimento (como o Live Server do VS Code ou o módulo HTTP do Python):
   ```bash
   # Utilizando Python
   python -m http.server 8080
   ```
3. Acesse `http://127.0.0.1:8080` no seu navegador.

> [!TIP]
> Para obter a melhor experiência visual e sonora, certifique-se de interagir com a página para que o navegador autorize a execução da **Web Audio API** para os efeitos de áudio sintetizado!

---

## 🎨 Design System & Estética
* **Tipografia:** `'Press Start 2P'` para cabeçalhos/títulos retrô e `'Share Tech Mono'` para descrições legíveis e cartões de dados.
* **Paleta de Cores:**
  * Base Escura: `#0b0813` (Fundo Base) e `#120e1e` (Painéis)
  * Neon Purple: `#be4dff` (Destaque Principal)
  * Retro Pink: `#ff55bb` (Destaque Secundário)
  * Glow de Borda de 4px sólida (`#000000`) com sombras deslocadas para efeito 3D pixelado clássico.

---

Desenvolvido com 💜 para Gamers de Produtividade.
