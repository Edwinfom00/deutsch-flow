/**
 * Returns true if the feature launched less than 7 days ago.
 * Pass the launch date as an ISO string: "2026-04-17"
 */
export function isNewFeature(launchDateStr: string): boolean {
  const launchDate = new Date(launchDateStr).getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - launchDate < sevenDays;
}
