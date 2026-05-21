// Workers / Node 両対応の id 生成。将来 cuid2 に変える場合はここだけ差し替える。
export const newId = () => crypto.randomUUID();
