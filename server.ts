/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { startServer, app } from './server/app';

startServer().catch(err => {
  console.error('[SpectrumX] Fatal server initialization error:', err);
  process.exit(1);
});

export { app, startServer };
