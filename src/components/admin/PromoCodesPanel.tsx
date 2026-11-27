import { useEffect, useState, type FormEvent } from "react";
import { RefreshCw, Tag } from "lucide-react";
import { createPromoCode, fetchPromoCodes, setPromoCodeActive, type PromoCode } from "@/lib/adminApi";

const statusLabels: Record<PromoCode["status"], string> = {
  active: "Actif",
  inactive: "Désactivé",
  expired: "Expiré",
  exhausted: "Épuisé",
};

const statusTones: Record<PromoCode["status"], string> = {
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-slate-100 text-slate-500",
  expired: "bg-amber-50 text-amber-700",
  exhausted: "bg-amber-50 text-amber-700",
};

function formatDay(value?: string | null) {
  if (!value) return "Sans limite";
  return new Date(`${value}T12:00:00`).toLocaleDateString("fr-FR");
}

export default function PromoCodesPanel({ token }: { token: string }) {
  const [items, setItems] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("");
  const [expiresOn, setExpiresOn] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const response = await fetchPromoCodes(token);
      setItems((response.items || []).filter((item) => typeof item?.code === "string" && typeof item?.percent === "number"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy("create");
    setError("");
    setNotice("");
    try {
      const created = await createPromoCode(token, {
        code: code.trim(),
        percent: Number(percent),
        expires_on: expiresOn || null,
        max_uses: maxUses ? Number(maxUses) : null,
      });
      setNotice(`Code ${created.code} créé (−${created.percent} %).`);
      setCode("");
      setPercent("");
      setExpiresOn("");
      setMaxUses("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Création impossible.");
    } finally {
      setBusy("");
    }
  }

  async function toggle(item: PromoCode) {
    setBusy(item.code);
    setError("");
    setNotice("");
    try {
      await setPromoCodeActive(token, item.code, !item.active);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Modification impossible.");
    } finally {
      setBusy("");
    }
  }

  const input = "h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-slate-950";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-labelledby="promo-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-slate-400" />
          <h2 id="promo-title" className="font-semibold text-slate-950">Codes promo</h2>
        </div>
        <button type="button" className="action-button" onClick={() => load()}>
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Actualiser les codes
        </button>
      </div>

      <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <label className="grid gap-1 text-xs font-semibold text-slate-500">Code
          <input className={input} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="LANCEMENT25" maxLength={32} required />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-slate-500">Réduction (%)
          <input className={input} type="number" min={1} max={100} value={percent} onChange={(e) => setPercent(e.target.value)} placeholder="25" required />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-slate-500">Valable jusqu’au (facultatif)
          <input className={input} type="date" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-slate-500">Utilisations max (facultatif)
          <input className={input} type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Illimité" />
        </label>
        <button type="submit" className="primary-button h-10" disabled={busy === "create" || !code.trim() || !percent}>Créer le code</button>
      </form>

      {notice && <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</div>}
      {error && <div role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <div key={item.code} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-3">
            <div>
              <p className="font-mono text-sm font-semibold text-slate-950">{item.code} <span className="font-sans text-slate-500">−{item.percent} %</span></p>
              <p className="mt-1 text-xs text-slate-500">
                {item.uses} utilisation(s){item.max_uses ? ` / ${item.max_uses}` : ""} · {formatDay(item.expires_on)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTones[item.status] || statusTones.inactive}`}>{statusLabels[item.status] || item.status}</span>
              <button type="button" className="action-button" disabled={busy === item.code} onClick={() => toggle(item)}>
                {item.active ? "Désactiver" : "Réactiver"}
              </button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && <p className="py-4 text-center text-sm text-slate-500">Aucun code pour l’instant.</p>}
      </div>
    </section>
  );
}
