type ParamValue = string | number | boolean | null | undefined;

export const href = (path: string, params: Record<string, ParamValue> = {}) => {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === false || v === "") continue;
    sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
};
