# 代码规范

## ESLint
```javascript
// .eslintrc.js
module.exports = {
  extends: ['eslint:recommended'],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error'
  }
}
```

## Prettier
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2
}
```

## Husky + lint-staged
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,vue}": ["eslint --fix", "git add"]
  }
}
```
