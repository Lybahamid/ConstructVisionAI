/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Dashboard from './components/Dashboard';

export default function App() {
  const [activeSite] = useState<string>('Site-North-Gate');

  return (
    <Dashboard activeSite={activeSite} />
  );
}
