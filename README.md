# Data Inventory Reconciler

## 📝 Sobre o Projeto
Este projeto consiste em um script em Node.js focado em inteligência de dados que automatiza a reconciliação e auditoria de inventários/estoques, extraindo informações de abas distintas, consolidando entradas duplicadas e apontando divergências quantitativas entre múltiplos sistemas gerenciadores. 

Trata-se de uma solução de automação corporativa desenvolvida internamente na **Victor Vision**, projetada especificamente para otimizar o processo de conferência e integridade de dados operacionais da empresa, reduzindo falhas manuais e garantindo a consistência na contagem física e lógica dos ativos.

> ⚠️ **Nota:** No momento, o projeto **não possui uma interface gráfica (UI)**. Ele foi desenvolvido utilizando **JavaScript puro (Vanilla JS)** focado em performance e lógica de backend, sendo executado e exibindo seus relatórios diretamente através do terminal de comandos.

## 🚀 Funcionalidades Chave
* Leitura dinâmica de arquivos e relatórios em formato Excel (`.xlsx`).
* Agrupamento inteligente e deduplicação de itens com base em *Part Numbers* (PN).
* Cruzamento de dados (*data matching*) entre diferentes fontes (Sistema de Gestão vs. Controle de Estoque).
* Geração de relatórios de divergências visuais com marcadores e exportação limpa em formato tabular (CSV) direto no console.

## 🛠️ Tecnologias Utilizadas
* [Node.js](https://nodejs.org/)
* [XLSX (SheetJS)](https://www.npmjs.com/package/xlsx) - Para manipulação de planilhas.
* JavaScript puro (ES6+)
