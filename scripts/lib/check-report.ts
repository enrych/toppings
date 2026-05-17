export type CheckReport = {
  hardFailures: number;
  warnings: number;
};

export function createCheckReport(): CheckReport {
  return { hardFailures: 0, warnings: 0 };
}

export function ok(report: CheckReport, msg: string): void {
  console.log(`  ✓ ${msg}`);
}

export function fail(report: CheckReport, msg: string): void {
  console.error(`  ✗ ${msg}`);
  report.hardFailures++;
}

export function warn(report: CheckReport, msg: string): void {
  console.warn(`  ⚠ ${msg}`);
  report.warnings++;
}

export function printCheckSummary(report: CheckReport): void {
  console.log("");
  if (report.hardFailures > 0) {
    console.error(
      `✗ Consistency check FAILED: ${report.hardFailures} error(s), ${report.warnings} warning(s)\n`,
    );
    process.exit(1);
  }
  if (report.warnings > 0) {
    console.log(`✓ Consistency check passed (${report.warnings} soft warning(s))\n`);
    return;
  }
  console.log("✓ Consistency check passed (no warnings)\n");
}
