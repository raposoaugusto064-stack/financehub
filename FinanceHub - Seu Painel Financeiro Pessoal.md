# FinanceHub - Seu Painel Financeiro Pessoal

Bem-vindo ao **FinanceHub**, um painel financeiro completo, moderno e interativo para gerenciar suas finanças pessoais e cartões de crédito. Este sistema foi desenvolvido para funcionar **localmente no seu navegador**, sem a necessidade de hospedagem ou conexão com a internet, garantindo total privacidade e controle sobre seus dados.

## 🚀 Como Usar

Para começar a usar o FinanceHub, siga estes passos simples:

1.  **Baixe o Projeto**: Certifique-se de ter todos os arquivos do projeto (`index.html`, `style.css`, `script.js`, `charts.js`, `data.js`, e a pasta `assets` com as imagens e ícones) em um mesmo diretório no seu computador.
2.  **Abra no Navegador**: Localize o arquivo `index.html` e abra-o diretamente em qualquer navegador web moderno (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari, etc.).
3.  **Login (Opcional)**: Na primeira vez que você acessar, será apresentada uma tela de login. Você pode definir uma senha para proteger seus dados localmente ou entrar como visitante para testar o sistema sem senha. Se você definir uma senha, ela será usada para criptografar/descriptografar seus dados no `LocalStorage`.

## ✨ Funcionalidades Principais

O FinanceHub oferece uma gama completa de funcionalidades para o controle financeiro:

### 📊 Dashboard Geral

*   **Resumo Financeiro**: Visualize rapidamente seu **saldo total**, **total de receitas**, **total de despesas** e **economia**.
*   **Gráficos Intuitivos**: Gráfico de pizza com **categorias de gasto** e gráfico de barras mostrando a **evolução mensal**.
*   **Indicadores Visuais**: Cores (verde para positivo, vermelho para negativo) para fácil identificação da saúde financeira.
*   **Filtros Dinâmicos**: Filtre os dados por mês, ano e categoria para uma análise aprofundada.

### 📝 Controle de Gastos e Receitas

*   **Inserção de Transações**: Adicione novas transações (entrada ou saída) com campos detalhados:
    *   **Descrição**
    *   **Categoria**: Incluindo as categorias personalizadas `Academia`, `Streaming`, `Restaurantes`, `Viagens`, `Pets`.
    *   **Valor**
    *   **Data**
    *   **Método de Pagamento**
    *   **Observações**
    *   **Tags**: Para melhor organização e filtragem das transações.
*   **Edição e Exclusão**: Gerencie suas transações com facilidade, editando ou excluindo-as conforme necessário.
*   **Salvamento Local**: Todos os dados são salvos de forma segura no `LocalStorage` do seu navegador, garantindo privacidade e acesso offline.

### 💳 Gestão de Cartões de Crédito

*   **Cadastro de Cartões**: Registre seus cartões com informações como nome, limite, dia de vencimento, dia de fechamento, bandeira e uma cor personalizada para identificação visual.
*   **Controle de Faturas**: Acompanhe o valor atual da fatura, limite disponível e próximas parcelas.
*   **Gráfico de Evolução**: Visualize a evolução do uso da fatura ao longo do tempo.
*   **Alertas de Vencimento**: Receba notificações sobre as datas de vencimento das faturas.

### 🎯 Metas e Orçamentos

*   **Metas de Economia**: Crie metas de economia com marcos visuais de progresso.
*   **Orçamentos por Categoria**: Defina orçamentos para categorias específicas e acompanhe seus gastos em relação a eles, com alertas visuais de estouro.

### 📈 Meus Investimentos

*   **Acompanhamento de Investimentos**: Registre e monitore seus investimentos.
*   **Gráficos de Rentabilidade**: Visualize o desempenho dos seus investimentos com gráficos claros.

### 🔔 Alertas e Notificações

*   **Alertas Visuais e Sonoros**: Receba avisos para contas a vencer, faturas próximas do limite e despesas acima da média.
*   **Sistema de Notificações Internas**: Mantenha-se informado sobre eventos importantes com um feed de notificações.
*   **Lembretes para Pagamentos Recorrentes**: Configure lembretes para não esquecer de pagamentos importantes.

### 📊 Relatórios Financeiros

*   **Relatórios Detalhados**: Acesse relatórios de receitas vs. despesas, distribuição por categoria e métodos de pagamento.
*   **Exportação de Dados**: Exporte seus dados de transações para CSV para análises externas.

### 📈 Estatísticas Avançadas

*   **Análise Aprofundada**: Visualize médias, tendências e previsões financeiras.
*   **Visualização Anual**: Um modo especial para ter um panorama completo das suas finanças ao longo do ano.

### ⚙️ Configurações

*   **Preferências Gerais**: Configure a moeda padrão (pré-configurada para **Euro (€)**), idioma e tema (claro/escuro/automático).
*   **Segurança**: Opção de definir ou alterar sua senha de acesso.
*   **Backup e Restauração**: Faça backup dos seus dados para um arquivo JSON e restaure-os facilmente.
*   **Limpar Dados**: Opção para apagar todos os dados do sistema.
*   **Ferramentas**: Inclui uma **Calculadora de Conversão de Moedas**, **Calculadora de Juros Compostos** e **Simulador de Parcelamento**.

## 🎨 Design e Experiência do Usuário

*   **Interface Moderna**: Inspirado em painéis financeiros modernos como Nubank, Mobills e Notion.
*   **Responsivo**: Adapta-se a diferentes tamanhos de tela (desktops, tablets e smartphones).
*   **Tema Personalizado**: Cores em tons de **azul e roxo** para uma experiência visual agradável.
*   **Modo Escuro/Claro**: Alternância entre temas para conforto visual.
*   **Ícones Lucide**: Utilização de ícones modernos e consistentes para melhorar a usabilidade.

## 🛠️ Estrutura do Projeto

O projeto é composto pelos seguintes arquivos:

*   `index.html`: A estrutura principal da aplicação, contendo o layout, as seções e os modais.
*   `style.css`: O arquivo de estilos CSS, responsável por toda a parte visual, incluindo o tema personalizado e a responsividade.
*   `script.js`: O coração da aplicação, contendo toda a lógica JavaScript para interações, manipulação do DOM, gestão de eventos e integração com o `data.js` e `charts.js`.
*   `charts.js`: Contém as funções para criar e atualizar todos os gráficos dinâmicos usando a biblioteca Chart.js.
*   `data.js`: O módulo de gerenciamento de dados, responsável por todas as operações de leitura, escrita, atualização e exclusão no `LocalStorage`, além de cálculos financeiros e criptografia/descriptografia de dados.
*   `assets/`: Pasta contendo imagens e ícones utilizados na aplicação.

## 💻 Tecnologias Utilizadas

*   **HTML5**: Estrutura semântica da página.
*   **CSS3**: Estilização e responsividade, incluindo variáveis CSS para o tema.
*   **JavaScript (ES6+)**: Lógica de programação e interatividade.
*   **Chart.js**: Biblioteca para criação de gráficos dinâmicos.
*   **Lucide Icons**: Biblioteca de ícones moderna e personalizável.

--- 

**Desenvolvido por Manus AI**
