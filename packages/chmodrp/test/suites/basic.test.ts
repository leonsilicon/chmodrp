import * as fs from 'node:fs';
import * as path from 'node:path';
import { beforeAll, expect, test } from 'vitest';

import { chmodr } from '~/index.js';
import { mkdirp, rimraf } from '~test/utils/fs.js';
import { tempDir } from '~test/utils/paths.js';

const dirs: string[] = [];
const fixtureDir = path.join(tempDir, 'basic');

function getDir() {
	let dir = fixtureDir;

	dir += '/' + Math.floor(Math.random() * 16 ** 4).toString(16);
	dirs.push(dir);
	dir += '/' + Math.floor(Math.random() * 16 ** 4).toString(16);
	dirs.push(dir);
	dir += '/' + Math.floor(Math.random() * 16 ** 4).toString(16);
	dirs.push(dir);
	return dir;
}

beforeAll(() => {
	rimraf(fixtureDir);
	for (let i = 0; i < 5; i++) {
		mkdirp(getDir());
	}
});

test('should complete successfully', async () => {
	await chmodr(fixtureDir, 0o700);
});

for (const dir of dirs) {
	test('verify ' + dir, () => {
		const st = fs.statSync(dir);
		expect(st.mode & 0o777, 'mode should be 0700').toEqual(0o700);
	});
}
