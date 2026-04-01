export function getStatus(value, marker) {
  if (value === null || value === undefined || value === "") return "empty";
  const v = parseFloat(value);
  if (isNaN(v)) return "empty";
  if (v >= marker.optLow && v <= marker.optHigh) return "optimal";
  if (v >= marker.low && v <= marker.high) return "normal";
  return "flag";
}

export function getStatusColor(status, colors) {
  return colors[status] || colors.empty;
}
