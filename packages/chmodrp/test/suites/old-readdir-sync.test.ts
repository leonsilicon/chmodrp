import * as fs from 'node:fs';
import * as path from 'node:path';
import { beforeAll, expect, test } from 'vitest';

import { chmodrSync } from '~/index.js';
import { mkdirp, rimraf } from '~test/utils/fs.js';
import { tempDir } from '~test/utils/paths.js';

const dirs: string[] = [];
const fixtureDir = path.join(tempDir, 'old readdir');

function getDir() {
	const x = Math.floor(Math.random() * 16 ** 4).toString(16);
	const y = Math.floor(Math.random() * 16 ** 4).toString(16);
	const z = Math.floor(Math.random() * 16 ** 4).toString(16);
	const dir = path.join(fixtureDir, x, y, z);
	dirs.push(dir);
	return dir;
}

beforeAll(() => {
	rimraf(fixtureDir);
	for (let i = 0; i < 5; i++) {
		mkdirp(getDir());
	}
});

test('should complete successfully', () => {
	chmodrSync(fixtureDir, 0o700);
});

for (const dir of dirs) {
	test('verify ' + dir, () => {
		const stats = fs.statSync(dir);

		expect(stats.mode & 0o777, 'uid should be 0700').toEqual(0o700);
	});
}
