const createESLintConfig = require('@leonzalion/configs/eslint.cjs');

module.exports = createESLintConfig(__dirname, {
	rules: {
		'no-bitwise': 'off',
	},
});
