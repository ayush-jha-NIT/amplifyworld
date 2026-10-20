# Original raster generation log

Tool: built-in `image_gen.imagegen` through the included imagegen skill. No external paid image/video provider or API-key fallback was used. Original selected outputs are retained before optimization. Deterministic SVG/vector/code-native assets were authored directly.

## Mountain — `scene/mountain-main.png`

Style reference: supplied approved homepage, used only for the obsidian purple terrain aesthetic.

Prompt: “Use case: stylized-concept. Create a production website ASSET, not a page mockup. The attached image is a STYLE REFERENCE ONLY for the jagged black-purple mountain at the right of the hero. Render an original high-detail cinematic obsidian mountain cutout, wide landscape 1536x1024. Transparent background. Terrain occupies bottom 70 percent, dramatic central summit at x=55%, y=30%; asymmetrical ridges descending to both sides and irregular rocky foreground along bottom edge. Dark black obsidian stone, crisp triangular fractured surfaces and ridges with sophisticated violet and magenta rim lighting, strong depth, rich shadow detail visible against near-black. A broad smooth winding terrace on the front-right slope may support a separate luminous road later. No road, no glow trails, no text, no signs, no logo, no globe, no sky, no stars, no people, no buildings. The mountain is the ONLY object and should fill width without being cut off at left/right; no ground shadow outside the mountain. Preserve the reference's realistic cinematic 3D aesthetic rather than a simple vector mountain. Use real alpha transparency, not a checkerboard.”

## Earth beauty — `scene/earth-beauty.png`

Style reference: supplied approved homepage. Generated as a separate fallback still, not mistaken for a 3D asset.

Prompt: “Use case: stylized-concept. Asset type: transparent Earth beauty still for a cinematic website, standalone sphere. The attached approved web design is a style reference only. Create a 1200x1200 square isolated realistic 3D Earth viewed from space, with Europe, Africa and Asia visible, in deep midnight purple and black with subtle violet continents, delicate magenta illuminated digital network nodes (stylized decorative points, not measured cities) and a thin sophisticated cool violet atmospheric rim. Dramatic grazing light from upper left, lower right in deep shadow. Globe centered with 8% transparent margin around it. Same luxurious dark violet planet aesthetic as the globe in the reference, genuine round spherical depth. No orbit rings or trails, no logo, no arrow, no typography, no labels, no other objects, no stars or background. Real alpha transparency. This is a reusable isolated planet layer, not a page screenshot.”

## Earth surface — `scene/earth-surface.png`

Input: rendered original equirectangular SVG from public-domain Natural Earth polygons. This is a geographic style transfer, not a screenshot texture.

Prompt: “Use case: style-transfer. Edit the supplied equirectangular Earth map into a production 3D sphere texture, 2048x1024, exactly 2:1. Preserve the continent silhouettes, coordinates, coastlines, orientation and full rectangular framing of the provided map. Flat latitude-longitude equirectangular projection, not a sphere rendering. Create intricate photographic relief detail INSIDE the land shapes, dark obsidian violet oceans, purple land shading, very subtle magenta decorative network lights and fine thread connections on land, similar to a premium purple night Earth. No directional globe lighting, no vignetting, no atmosphere, no clouds covering coasts, no grid, no text, no labels, no border. Uniform lighting across the entire rectangle for a repeatable 3D albedo/emissive texture; left and right edges must join seamlessly. Keep almost-black deep violet ocean dominant, dark purple land so illuminated magenta points read clearly. Preserve the supplied map geometry and area relationships; do not invent continents. Opaque texture.”

The returned source size is recorded in the manifest. WebP/AVIF texture exports are resampled to 2048 × 1024 and 1024 × 512. The deterministic geographic SVG remains available as a simpler alternative. Artistic lighting points do not represent actual clients, traffic or measured locations.
