import Image, { type ImageProps } from "next/image";

type Props = Omit<ImageProps, "src"> & { src: string };

/**
 * Wraps next/image, but falls back to a plain <img> for data: URIs (used by
 * the mock/dev placeholder fabrics) since the Next.js image optimizer only
 * handles local and remote-pattern-allowed URLs.
 */
export default function SmartImage({ src, alt, className, fill, width, height, sizes, priority }: Props) {
  if (src.startsWith("data:")) {
    if (fill) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src} alt={alt} className={`absolute inset-0 h-full w-full object-cover ${className ?? ""}`} />;
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} width={width} height={height} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      priority={priority}
    />
  );
}
