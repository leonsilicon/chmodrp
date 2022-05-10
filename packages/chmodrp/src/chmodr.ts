/* eslint-disable no-bitwise */

import * as fs from 'node:fs';
import * as path from 'node:path';

// If a party has r, add x
// so that dirs are listable
const dirMode = (mode: number | string) => {
	mode = Number(mode);
	if (mode & 0o400) mode |= 0o100;
	if (mode & 0o40) mode |= 0o10;
	if (mode & 0o4) mode |= 0o1;
	return mode;
};

async function chmodrKid(
	entryPath: string,
	child: (fs.Stats & { name: string }) | string,
	mode: fs.Mode
): Promise<void> {
	if (typeof child === 'string') {
		const stats = await fs.promises.lstat(path.resolve(entryPath, child));
		(stats as any).name = child;
		await chmodrKid(entryPath, stats as any, mode);
		return;
	}

	if (child.isDirectory()) {
		await chmodr(path.resolve(entryPath, child.name), mode);
		await fs.promises.chmod(path.resolve(entryPath, child.name), dirMode(mode));
	} else {
		await fs.promises.chmod(path.resolve(entryPath, child.name), mode);
	}
}

interface StatsWithName extends fs.Stats {
	name: string;
}

function chmodrKidSync(
	entryPath: string,
	child: StatsWithName | string,
	mode: fs.Mode
) {
	if (typeof child === 'string') {
		const stats = fs.lstatSync(path.resolve(entryPath, child)) as StatsWithName;
		stats.name = child;
		child = stats;
	}

	if (child.isDirectory()) {
		chmodrSync(path.resolve(entryPath, child.name), mode);
		fs.chmodSync(path.resolve(entryPath, child.name), dirMode(mode));
	} else {
		fs.chmodSync(path.resolve(entryPath, child.name), mode);
	}
}

export async function chmodr(entryPath: string, mode: fs.Mode): Promise<void> {
	try {
		const children = await fs.promises.readdir(entryPath, {
			withFileTypes: true,
		});
		if (children.length === 0) {
			await fs.promises.chmod(entryPath, dirMode(mode));
			return;
		}

		await Promise.all(
			children.map(async (child) => {
				await chmodrKid(entryPath, child.name, mode);
				await fs.promises.chmod(entryPath, dirMode(mode));
			})
		);
	} catch (error: unknown) {
		const err = error as NodeJS.ErrnoException;

		// any error other than ENOTDIR means it's not readable, or
		// doesn't exist. Give up.
		if (err.code !== 'ENOTDIR') throw err;

		return fs.promises.chmod(entryPath, mode);
	}
}

export function chmodrSync(entryPath: string, mode: fs.Mode): void {
	let children;
	try {
		children = fs.readdirSync(entryPath, { withFileTypes: true });

		for (const child of children) {
			chmodrKidSync(entryPath, child.name, mode);
		}

		fs.chmodSync(entryPath, dirMode(mode));
	} catch (error: unknown) {
		const err = error as NodeJS.ErrnoException;

		if (err.code === 'ENOTDIR') {
			fs.chmodSync(entryPath, mode);
		}

		throw err;
	}
}
