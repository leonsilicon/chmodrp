import * as fs from 'node:fs';

export function rimraf(dir: string) {
	fs.rmSync(dir, { force: true, recursive: true });
}

export function mkdirp(dir: string) {
	fs.mkdirSync(dir, { recursive: true });
}
