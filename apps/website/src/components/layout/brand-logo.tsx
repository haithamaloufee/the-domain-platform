import Image from "next/image";

export function BrandLogo({
  className,
  priority = false,
  src = "/brand/the-domain-logo.png",
}: {
  className?: string;
  priority?: boolean;
  src?: string;
}) {
  return (
    <Image
      alt="The Domain Entertainment Company"
      className={className}
      height={131}
      priority={priority}
      src={src}
      unoptimized={src.startsWith("https://")}
      width={600}
    />
  );
}
