import { execFileSync } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const script = join(__dirname, '..', 'scripts', 'check-design.mjs');
const root = join(__dirname, '..');

function run(): { code: number; out: string } {
  try {
    const out = execFileSync('node', [script], { cwd: root, encoding: 'utf8' });
    return { code: 0, out };
  } catch (e: unknown) {
    const err = e as { status?: number; stdout?: string; stderr?: string };
    return { code: err.status ?? 1, out: `${err.stdout ?? ''}${err.stderr ?? ''}` };
  }
}

describe('check:design script', () => {
  it('passes with zero violations on the NOVA surface', () => {
    const { code, out } = run();
    expect(code).toBe(0);
    expect(out).toContain('OK');
  });

  it('fails when a banned pattern is introduced into a scanned dir', () => {
    const bad = join(root, 'src', 'components', 'ui', '__checkdesign_probe__.tsx');
    writeFileSync(bad, `export const c = '#ABCDEF';\n`);
    try {
      const { code, out } = run();
      expect(code).toBe(1);
      expect(out).toContain('hex-color');
    } finally {
      rmSync(bad, { force: true });
    }
  });
});
