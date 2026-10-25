import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 font-semibold tracking-tight">
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-lg bg-brand text-lg leading-none text-white"
      >
        õ
      </span>
      <span className="text-lg">Vormik</span>
    </Link>
  );
}
