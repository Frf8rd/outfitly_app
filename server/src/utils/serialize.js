// imageUrl se salvează relativ (/catalog/x.png); către aplicație îl trimitem absolut, ca să poată fi încărcat direct.
export const publicBase = (req) => process.env.PUBLIC_URL || `${req.protocol}://${req.get("host")}`;

export const catalogItemOut = (req, item, owned) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  subtype: item.subtype,
  color: item.color,
  styles: item.styles,
  warmth: item.warmth,
  waterproof: item.waterproof,
  imageUrl: item.imageUrl ? (item.imageUrl.startsWith("http") ? item.imageUrl : publicBase(req) + item.imageUrl) : "",
  ...(owned === undefined ? {} : { owned }),
});

export const wardrobeItemOut = (req, row) => ({
  id: row.id,
  addedAt: row.addedAt,
  catalogItem: catalogItemOut(req, row.catalogItem),
});

export const OUTFIT_INCLUDE = { items: { include: { wardrobeItem: { include: { catalogItem: true } } } } };

export const outfitOut = (req, o) => ({
  id: o.id,
  name: o.name,
  occasion: o.occasion,
  source: o.source,
  isFavorite: o.isFavorite,
  createdAt: o.createdAt,
  items: o.items.map((i) => wardrobeItemOut(req, i.wardrobeItem)),
});
