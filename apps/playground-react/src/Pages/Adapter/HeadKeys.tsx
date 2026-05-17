import { Head, Link } from "@inertiajs/react";
import { useState } from "react";

export default function HeadKeys() {
  const [variant, setVariant] = useState<"first" | "second">("first");
  const showExtra = variant === "first";

  return (
    <>
      <Head title={`Head keys ${variant}`}>
        <meta head-key="playground-dedup" name="playground-dedup" content={variant} />
        {showExtra && (
          <meta head-key="playground-extra" name="playground-extra" content="present" />
        )}
      </Head>

      <h1>Head key checks (React)</h1>
      <nav>
        <Link href="/">Home</Link>
      </nav>
      <p>title と meta が adapter Head 経由で更新される。head-key で dedup される。</p>
      <button
        type="button"
        onClick={() => setVariant((value) => (value === "first" ? "second" : "first"))}
      >
        Swap head keys
      </button>
      <p>Current variant: {variant}</p>
    </>
  );
}
