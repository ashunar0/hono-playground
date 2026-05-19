import { inputClass } from "@/lib/inputClass";

type Props = {
  name: string;
  type: "email" | "password" | "text";
  label: string;
  error?: string;
  autocomplete?: string;
};

export function FormField({ name, type, label, error, autocomplete }: Props) {
  return (
    <label class="flex flex-col gap-1">
      <span class="text-sm text-gray-700">{label}</span>
      <input
        type={type}
        name={name}
        autocomplete={autocomplete}
        aria-invalid={error ? "true" : undefined}
        class={inputClass(!!error)}
      />
      {error && <p class="text-sm text-red-500">{error}</p>}
    </label>
  );
}
