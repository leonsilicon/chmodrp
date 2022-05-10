import { join } from 'desm';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { beforeAll, test } from 'vitest';

import { chmodrSync } from '~/index.js';
import { mkdirp, rimraf } from '~test/utils/fs.js';
import { tempDir } from '~test/utils/paths.js';

const fixtureDir = path.join(tempDir, 'symlink-sync');
const fileFixture = join(import.meta.url, '../fixtures/file');

beforeAll(() => {
	rimraf(fixtureDir);
	mkdirp(fixtureDir);
	fs.symlinkSync(fileFixture, path.join(fixtureDir, 'file-link'));
});

test('should complete successfully', () => {
	chmodrSync(fixtureDir, 0o700);
});

test('verify chmodr on dir with symlink to system files', () => {
	chmodrSync(fixtureDir, 0o644);
});
