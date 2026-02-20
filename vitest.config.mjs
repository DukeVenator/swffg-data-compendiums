/**
 * Vitest config: tests and coverage with 80% thresholds on testable lib code.
 */
export default {
  test: {
    include: ["tests/**/*.test.mjs", "tests/**/*.integration.test.mjs"],
    environment: "node",
    fileParallelism: false
  },
  coverage: {
    provider: "v8",
    reporter: ["text", "lcov"],
    include: ["scripts/lib/**/*.mjs"],
    exclude: [
      "scripts/build.mjs",
      "scripts/release.mjs",
      "scripts/setup-wizard.mjs",
      "tests/**"
    ],
    thresholds: {
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    }
  }
};
