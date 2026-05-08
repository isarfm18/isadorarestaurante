# Governança DevOps (GitHub Flow com branch principal `develop`)

Este projeto usa a branch `develop` como branch principal.

## ISSUE #01 — Branch Protection e fluxo de PR

Checklist de configuração no GitHub (Settings > Branches > Add rule):

1. **Branch name pattern:** `develop`
2. Marcar **Require a pull request before merging**
3. Marcar **Require approvals** e definir pelo menos **1 approval**
4. Marcar **Dismiss stale pull request approvals when new commits are pushed**
5. Marcar **Require status checks to pass before merging**
6. Selecionar checks obrigatórios do pipeline (ex.: `estagio_build`, `estagio_lint`, `job_sonar`)
7. Marcar **Restrict who can push to matching branches** (sem permissões diretas para desenvolvedores)
8. (Opcional) Marcar **Require conversation resolution before merging**

> Critério de aceite esperado: push direto na `develop` deve falhar e o merge ocorrer somente via PR aprovado.

### Fluxo padrão

```bash
git checkout develop
git pull origin develop
git checkout -b feature/setup
# ... alterações ...
git add .
git commit -m "chore: setup inicial"
git push -u origin feature/setup
# abrir PR feature/setup -> develop
```

## ISSUE #02 — SCA / Dependabot

- O arquivo `.github/dependabot.yml` ativa atualizações automáticas para:
  - Dependências `npm`
  - GitHub Actions
- Para alertas e security updates:
  - Ir em **Settings > Security & analysis**
  - Ativar **Dependabot alerts**
  - Ativar **Dependabot security updates**

### Processo de triagem de vulnerabilidades

1. Acessar aba **Security** do repositório.
2. Avaliar alertas críticos/altos.
3. Criar uma issue para cada vulnerabilidade crítica com:
   - pacote afetado
   - versão vulnerável
   - versão corrigida
   - link do advisory/CVE
4. Priorizar correção via PR separado por vulnerabilidade.
