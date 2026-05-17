import { Form, Link, useForm } from "@inertiajs/react";
import { useState } from "react";

type Props = {
  submitted: Record<string, unknown> | null;
};

export default function FormDemo(props: Props) {
  const cancelForm = useForm({ name: "" });
  const [cancelled, setCancelled] = useState(false);
  const [finished, setFinished] = useState(false);

  return (
    <>
      <h1>Form adapter checks (React)</h1>
      <nav>
        <Link href="/">Home</Link>
      </nav>

      <section>
        <h2>1. Form コンポ + resetOnSuccess</h2>
        <p>input は普通の name 属性で書く。submit 成功でフィールドがリセットされる。</p>
        <Form action="/adapter/form/success" method="post" resetOnSuccess>
          {({ isDirty, processing }) => (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
              <input name="tags[]" placeholder="First tag" />
              <input name="tags[]" placeholder="Second tag" />
              <label>
                <input name="active" type="checkbox" value="yes" /> Active
              </label>
              <p>
                Dirty: {isDirty ? "yes" : "no"} / Processing: {processing ? "yes" : "no"}
              </p>
              <button type="submit">Submit and reset</button>
            </div>
          )}
        </Form>
        <pre style={{ background: "#f6f6f6", padding: 8 }}>
          Last submitted: {JSON.stringify(props.submitted, null, 2)}
        </pre>
      </section>

      <section>
        <h2>2. useForm.cancel + onCancel/onFinish</h2>
        <p>遅い endpoint に POST → Cancel ボタンで中断 → onCancel と onFinish が発火する。</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 320 }}>
          <input
            value={cancelForm.data.name}
            placeholder="Slow request name"
            onChange={(event) => cancelForm.setData("name", event.currentTarget.value)}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => {
                setCancelled(false);
                setFinished(false);
                cancelForm.post("/adapter/form/cancel-slow", {
                  onCancel: () => setCancelled(true),
                  onFinish: () => setFinished(true),
                });
              }}
            >
              Start slow submit
            </button>
            <button type="button" onClick={() => cancelForm.cancel()}>
              Cancel
            </button>
          </div>
          <p>
            Processing: {cancelForm.processing ? "yes" : "no"} / Cancelled:{" "}
            {cancelled ? "yes" : "no"} / Finished: {finished ? "yes" : "no"}
          </p>
        </div>
      </section>
    </>
  );
}
