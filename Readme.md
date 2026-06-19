🍝 Isadora Restaurante - Sistema Web com DevOps 

Este projeto foi desenvolvido com a proposta central de aplicar os pilares da cultura DevOps, integrando automação, segurança e qualidade de código em todas as etapas do ciclo de vida de desenvolvimento de software (SDLC).

🎯 Proposta do Projeto
O objetivo principal é demonstrar a implementação de práticas modernas de CI/CD (Integração Contínua e Deploy Contínuo). O sistema não apenas gerencia as operações de um restaurante, mas também garante que cada alteração no código passe por rigorosas verificações de segurança e qualidade antes de chegar ao ambiente de produção.

🏗 Estrutura do Projeto (Arquitetura e Organização)
Para manter a organização e seguir as boas práticas de separação de responsabilidades, o projeto foi estruturado da seguinte forma:

/.github/workflows/: Contém o coração da nossa automação. Aqui ficam definidos os scripts da pipeline que automatizam o build, lint, análise de segurança e deploy.

/views/: Camada de interface (frontend), utilizando EJS para renderização dinâmica das páginas do sistema.

/config/: Responsável pelas configurações do ambiente e conexão com o banco de dados.

index.js: O ponto de entrada da aplicação, onde configuramos o Express e as rotas da API.

init.sql: Script de inicialização do banco de dados para garantir a consistência dos dados em qualquer ambiente.

sonar-project.properties: Arquivo de configuração que guia o SonarQube na análise de qualidade do nosso código.

🛠 Pipeline de CI/CD (DevOps em Ação)
O fluxo de desenvolvimento segue a metodologia de feature branching, garantindo segurança:

Desenvolvimento: Alterações são feitas na branch feature/setup.

Integração: Ao abrir um Pull Request, a pipeline é disparada automaticamente.

Qualidade: O código passa por análise estática (SonarQube) para evitar falhas de segurança e code smells.

Deploy: Após aprovação e merge nas branches develop, staging e main, o sistema é implantado automaticamente em ambiente de produção (AWS EC2).

🔐 Pilares de Segurança Aplicados
Remoção de rastros: Desativação de cabeçalhos informativos (x-powered-by) para evitar exposição de tecnologia.

Código Limpo: Uso de optional chaining (?.) para prevenir erros de execução e melhorar a legibilidade.

Análise Contínua: Monitoramento constante de vulnerabilidades através da integração com o SonarQube.