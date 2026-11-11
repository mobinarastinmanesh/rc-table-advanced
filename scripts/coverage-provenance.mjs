import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { coverageInputs } from './coverage-inputs.mjs';

export default class CoverageProvenance {
  onTestRunStart() {
    this.fingerprint = coverageInputs().fingerprint;
  }
  onCoverage() {
    assert.equal(
      coverageInputs().fingerprint,
      this.fingerprint,
      'Coverage inputs changed during the test run. Run the complete suite again.',
    );
    mkdirSync('coverage', { recursive: true });
    writeFileSync(
      'coverage/provenance.json',
      JSON.stringify({ fingerprint: this.fingerprint }) + '\n',
    );
  }
}
