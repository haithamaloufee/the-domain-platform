import Image from "next/image";

export function BrandLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      alt="The Domain Entertainment Company"
      className={className}
      height={131}
      priority={priority}
      src="/brand/the-domain-logo.png"
      width={600}
    />
  );
}
