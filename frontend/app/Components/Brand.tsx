import Link from "next/link";
import { Code2 } from "lucide-react";
export default function Brand({
  onNavigate,
}: {
  onNavigate?: (event: { preventDefault: () => void }) => void;
}) {
  return (
    <Link
      href="/"
      className="brand"
      aria-label="Co-op Code home"
      onNavigate={onNavigate}
    >
      <span className="brand-mark">
        <Code2 size={22} />
      </span>
      <span>
        co-op<span className="muted"> / code</span>
      </span>
    </Link>
  );
}
