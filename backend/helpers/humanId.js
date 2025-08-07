// Helper to generate the next human-readable material ID (6-character alphanumeric, base36)
async function getNextHumanId(Material) {
  const lastMaterial = await Material.findOne({
    humanId: { $regex: /^[A-Z0-9]{6}$/i },
  }).sort({ humanId: -1 });
  let nextId = 0;
  if (lastMaterial && lastMaterial.humanId) {
    // Parse as base36
    nextId = parseInt(lastMaterial.humanId, 36) + 1;
  }
  // Convert to base36, pad to 6 chars, uppercase
  const humanId = nextId.toString(36).toUpperCase().padStart(6, "0");
  return humanId;
}

module.exports = { getNextHumanId };
