// module.exports = {
// 	'env': {
// 		'browser': true,
// 		'es2021': true
// 	},
// 	'extends': [
// 		'eslint:recommended',
// 		'plugin:@typescript-eslint/recommended'
// 	],
// 	'overrides': [
// 	],
// 	'parser': '@typescript-eslint/parser',
// 	'parserOptions': {
// 		'ecmaVersion': 'latest',
// 		'sourceType': 'module'
// 	},
// 	'plugins': [
// 		'@typescript-eslint'
// 	],
// 	'rules': {
// 		'indent': [
// 			'error',
// 			'tab'
// 		],
// 		'linebreak-style': [
// 			'error',
// 			'unix'
// 		],
// 		'quotes': [
// 			'error',
// 			'single'
// 		],
// 		'semi': [
// 			'error',
// 			'always'
// 		]
// 	}
// };
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  ignorePatterns: ["dist", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  rules: {
    semi: ["warn", "always"],
    "@typescript-eslint/quotes": [
      "warn",
      "single",
      { allowTemplateLiterals: true },
    ],
    "@typescript-eslint/no-unused-vars": ["warn"],
  },
};
