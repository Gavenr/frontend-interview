# Monorepo

## 什么是 Monorepo?
在一个仓库中管理多个项目。

## pnpm workspace
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

## Turborepo
```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

## Lerna
```json
{
  "packages": ["packages/*"],
  "version": "independent"
}
```
