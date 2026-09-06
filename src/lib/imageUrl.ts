/**
 * Normalizes an image reference from the Google Sheet into something
 * directly displayable in <img>/<Image>/SVG <image> tags.
 *
 * Accepts:
 *  - data: URIs (mock placeholders) — passed through untouched
 *  - plain https:// image URLs — passed through untouched
 *  - Google Drive "share" links (file/d/<id>/view, open?id=<id>, uc?id=<id>)
 *    — rewritten to a direct-content URL
 */
export function resolveImageUrl(raw: string | undefined | null): string {
  if (!raw) return "";
  const url = raw.trim();
  if (url.startsWith("data:")) return url;

  const driveId = extractDriveFileId(url);
  if (driveId) {
    return `https://lh3.googleusercontent.com/d/${driveId}=w1600`;
  }

  return url;
}

function extractDriveFileId(url: string): string | null {
  if (!url.includes("drive.google.com") && !url.includes("googleusercontent.com")) return null;

  const fileMatch = url.match(/\/file\/d\/([^/]+)/);
  if (fileMatch) return fileMatch[1];

  const idParamMatch = url.match(/[?&]id=([^&]+)/);
  if (idParamMatch) return idParamMatch[1];

  const lhMatch = url.match(/googleusercontent\.com\/d\/([^=/]+)/);
  if (lhMatch) return lhMatch[1];

  return null;
}
