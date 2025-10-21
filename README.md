# FinanceHub - Painel Financeiro Pessoal

Um aplicativo web moderno e responsivo para gerenciar suas finanças pessoais com sincronização em tempo real usando Firebase.

## 🚀 Características

- **Dashboard Interativo**: Visualize um resumo completo de suas finanças
- **Gerenciamento de Transações**: Adicione, edite e exclua transações com facilidade
- **Cartões de Crédito**: Acompanhe seus cartões e limites disponíveis
- **Metas Financeiras**: Defina e acompanhe suas metas de poupança
- **Investimentos**: Registre e monitore seus investimentos
- **Relatórios e Estatísticas**: Análises detalhadas de seus gastos
- **Sincronização em Tempo Real**: Todos os dados são sincronizados instantaneamente entre dispositivos
- **Modo Offline**: Funciona mesmo sem conexão com a internet
- **Responsivo**: Funciona perfeitamente em desktop, tablet e celular

## 🔧 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Banco de Dados**: Firebase Firestore
- **Gráficos**: Chart.js
- **Ícones**: Lucide Icons
- **Hospedagem**: Netlify / GitHub Pages

## 📋 Pré-requisitos

- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Conexão com a internet para sincronização
- Conta do Firebase (já configurada)

## 🛠️ Instalação Local

1. Clone o repositório:
```bash
git clone https://github.com/raposoaugusto064-stack/financehub.git
cd financehub
```

2. Abra o arquivo `index.html` em um navegador web:
```bash
# No macOS
open index.html

# No Linux
xdg-open index.html

# No Windows
start index.html
```

## 🔐 Configuração do Firebase

O site já está configurado com as credenciais do Firebase. Se você precisar alterar as credenciais:

1. Edite o arquivo `firebase-config.js`
2. Substitua as credenciais existentes pelas suas próprias credenciais do Firebase
3. Salve o arquivo
4. Faça o push das alterações para o repositório

## 📱 Como Usar

### Acessar o Site

1. Acesse o site através do link de hospedagem
2. Clique em "Entrar como visitante" para começar (sem necessidade de senha)
3. Explore o dashboard e comece a adicionar suas transações

### Adicionar uma Transação

1. Vá para a seção "Transações"
2. Clique em "Nova Transação"
3. Preencha os detalhes (descrição, valor, categoria, data, etc.)
4. Clique em "Salvar"

### Gerenciar Cartões

1. Vá para a seção "Cartões"
2. Clique em "Novo Cartão" para adicionar um cartão
3. Preencha as informações do cartão
4. O limite disponível será atualizado automaticamente

### Definir Metas

1. Vá para a seção "Metas"
2. Clique em "Nova Meta"
3. Defina o valor alvo e a data limite
4. Acompanhe o progresso no dashboard

## 🔄 Sincronização em Tempo Real

Todos os dados são armazenados no Firebase Firestore e sincronizados em tempo real. Isso significa:

- **Múltiplos Dispositivos**: Use o site em seu celular, tablet e computador - os dados sempre estarão sincronizados
- **Atualizações Instantâneas**: Qualquer alteração feita em um dispositivo aparece imediatamente em todos os outros
- **Modo Offline**: O site funciona offline e sincroniza automaticamente quando a conexão é restaurada

## 📊 Relatórios e Estatísticas

- **Gráficos Dinâmicos**: Visualize seus gastos por categoria
- **Análises Mensais**: Acompanhe suas despesas mês a mês
- **Comparações**: Compare seu orçamento com seus gastos reais

## ⚙️ Configurações

Acesse a seção "Configurações" para:

- Alterar a moeda padrão (EUR, USD, BRL, GBP)
- Ativar/desativar notificações
- Escolher o tema (claro, escuro, automático)
- Exportar seus dados

## 🌐 Hospedagem

O site está hospedado no Netlify e pode ser acessado em:

**[Link do seu site será fornecido após o deploy]**

### Deploy Automático

O site é automaticamente atualizado quando você faz push para o repositório GitHub. Não é necessário fazer nada manualmente.

## 📈 Plano Futuro

- [ ] Autenticação com login/senha
- [ ] Suporte a múltiplas moedas com conversão automática
- [ ] Integração com bancos para importação automática de transações
- [ ] Notificações push
- [ ] Aplicativo mobile nativo
- [ ] Relatórios em PDF
- [ ] Integração com APIs de cotação de ações

## 🐛 Reportar Problemas

Se encontrar algum problema, por favor:

1. Verifique se o Firebase está acessível
2. Limpe o cache do navegador
3. Tente em outro navegador
4. Abra uma issue no GitHub

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ para gerenciamento financeiro pessoal.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se livre para:

1. Fazer um fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

## 📞 Suporte

Para suporte, entre em contato através das issues do GitHub.

---

**Versão**: 1.0.0  
**Última Atualização**: Outubro de 2025

