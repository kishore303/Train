export function computeRisk(t: any, assets: any[]): { score: number, priority: string } {
  const asset = assets.find(a => a.id === t.assetId);
  // 1) Asset Criticality (0-20) based on condition
  const condMap: any = { Good: 5, Fair: 10, Poor: 16, Critical: 20 };
  const criticality = condMap[asset?.condition] ?? 10;
  // 2) Safety Impact (0-25) by priority/type
  const safetyMap: any = { Critical: 25, High: 18, Medium: 10, Low: 4 };
  const safety = safetyMap[t.priority] ?? 10;
  // 3) Overdue Days (0-20) — requestedDate vs today 2026-09-02
  const today = new Date('2026-09-02');
  const req = new Date(t.requestedDate);
  const diff = Math.max(0, Math.floor((today.getTime() - req.getTime()) / 86400000));
  const overdue = Math.min(20, diff * 4);
  // 4) Failure Risk (0-15) based on availability low = higher risk
  const avail = asset?.availability ?? 85;
  const failure = Math.round((100 - avail) * 0.6); // 0-15 approx
  // 5) Operational Impact (0-20) by duration & train conflicts proxy (trafficDensity)
  const op = Math.min(20, (t.durationHrs || 4) * 2 + (t.estCostLakhs || 5) * 0.5);

  let raw = criticality + safety + overdue + failure + op; // 0-100 approx
  raw = Math.max(0, Math.min(100, Math.round(raw)));
  let priority = 'LOW';
  if (raw >= 80) priority = 'CRITICAL';
  else if (raw >= 60) priority = 'HIGH';
  else if (raw >= 40) priority = 'MEDIUM';
  else priority = 'LOW';
  return { score: raw, priority };
}
