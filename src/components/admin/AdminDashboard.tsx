"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import {
  useAdminData,
  saveProduct,
  deleteProduct,
  saveBrand,
  deleteBrand,
  saveCategory,
  deleteCategory,
  addType,
  deleteType,
  saveArticle,
  deleteArticle,
  deleteLead,
  slugify,
  type Product,
  type Brand,
  type Section,
  type Article,
} from "@/lib/store";
import { STANDALONE_SECTIONS } from "@/data/categories";
import { uploadToImageKit } from "@/lib/uploadToImageKit";
import { Logo } from "@/components/Logo";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  LogoutIcon,
  BoxIcon,
  TagIcon,
  GridIcon,
  UsersIcon,
  CloseIcon,
  CheckIcon,
} from "@/components/Icons";

const inputCls =
  "w-full rounded border border-outline-variant bg-clinical-white px-3 py-2 text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

type Tab = "overview" | "products" | "categories" | "types" | "brands" | "articles" | "leads";

const tabs: { id: Tab; label: string; icon: (p: { className?: string }) => JSX.Element }[] = [
  { id: "overview", label: "Vue d'ensemble", icon: GridIcon },
  { id: "products", label: "Produits", icon: BoxIcon },
  { id: "categories", label: "Catégories", icon: GridIcon },
  { id: "types", label: "Types", icon: TagIcon },
  { id: "brands", label: "Marques", icon: TagIcon },
  { id: "articles", label: "Articles", icon: PencilIcon },
  { id: "leads", label: "Leads", icon: UsersIcon },
];

/** Surface async store errors to the admin without crashing the panel. */
function notifyError(e: unknown) {
  alert(e instanceof Error ? e.message : "Une erreur est survenue.");
}

export function AdminDashboard() {
  const router = useRouter();
  const { authed, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    // `authed` is null while the Supabase session is being restored.
    if (authed === false) router.replace("/admin/login");
  }, [authed, router]);

  if (!authed) {
    return <div className="container-max py-24 text-center text-on-surface-variant">Chargement…</div>;
  }

  return (
    <div className="container-max grid grid-cols-1 gap-8 py-10 lg:grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="h-fit rounded-lg border border-outline-variant bg-surface-gray p-4 lg:sticky lg:top-24">
        <div className="mb-4 flex items-center gap-2 px-2">
          <Logo showText={false} />
          <span className="font-display font-semibold text-primary-container">Admin</span>
        </div>
        <nav className="flex flex-col gap-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-3 rounded px-3 py-2.5 text-left transition-colors ${
                  tab === t.id
                    ? "bg-primary-container text-clinical-white"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                <Icon className="h-5 w-5" />
                {t.label}
              </button>
            );
          })}
        </nav>
        <button
          onClick={async () => {
            await logout();
            router.replace("/admin/login");
          }}
          className="mt-4 flex w-full items-center gap-3 rounded px-3 py-2.5 text-left text-error transition-colors hover:bg-error/10"
        >
          <LogoutIcon className="h-5 w-5" />
          Déconnexion
        </button>
      </aside>

      {/* Content */}
      <section>
        {tab === "overview" && <Overview onNav={setTab} />}
        {tab === "products" && <ProductsPanel />}
        {tab === "categories" && <CategoriesPanel />}
        {tab === "types" && <TypesPanel />}
        {tab === "brands" && <BrandsPanel />}
        {tab === "articles" && <ArticlesPanel />}
        {tab === "leads" && <LeadsPanel />}
      </section>
    </div>
  );
}

/* ───────────────── Overview ───────────────── */
function Overview({ onNav }: { onNav: (t: Tab) => void }) {
  const data = useAdminData();
  const cards = [
    { label: "Produits", value: data.products.length, tab: "products" as Tab, icon: BoxIcon },
    { label: "Catégories", value: data.sections.length, tab: "categories" as Tab, icon: GridIcon },
    { label: "Marques", value: data.brands.length, tab: "brands" as Tab, icon: TagIcon },
    { label: "Articles", value: data.articles.length, tab: "articles" as Tab, icon: PencilIcon },
    { label: "Leads", value: data.leads.length, tab: "leads" as Tab, icon: UsersIcon },
  ];
  return (
    <div>
      <PanelHeader title="Vue d'ensemble" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.label}
              onClick={() => onNav(c.tab)}
              className="flex flex-col items-start gap-2 rounded-lg border border-outline-variant bg-clinical-white p-5 text-left transition-shadow hover:shadow-md"
            >
              <Icon className="h-6 w-6 text-primary-container" />
              <span className="font-display text-display-md font-bold text-primary-container">{c.value}</span>
              <span className="text-sm text-on-surface-variant">{c.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────── Products ───────────────── */
function ProductsPanel() {
  const data = useAdminData();
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <PanelHeader
        title="Produits"
        action={
          <button onClick={() => setCreating(true)} className="btn-solid">
            <PlusIcon className="h-5 w-5" /> Ajouter un produit
          </button>
        }
      />
      <div className="overflow-x-auto rounded-lg border border-outline-variant">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-surface-gray font-mono text-label-caps uppercase text-on-surface-variant">
            <tr>
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Marque</th>
              <th className="px-4 py-3">Section</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {data.products.map((p) => {
              const brand = data.brands.find((b) => b.slug === p.brand);
              return (
                <tr key={p.slug} className="bg-clinical-white">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-surface-container-low">
                        {p.image ? (
                          <Image src={p.image} alt={p.name} fill className="object-contain p-1" />
                        ) : (
                          <span className="grid h-full w-full place-items-center text-[10px] text-on-surface-variant">—</span>
                        )}
                      </div>
                      <span className="font-medium text-on-surface">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{brand?.name ?? p.brand}</td>
                  <td className="px-4 py-3 text-on-surface-variant capitalize">{p.section}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <IconBtn label="Modifier" onClick={() => setEditing(p)}>
                        <PencilIcon className="h-4 w-4" />
                      </IconBtn>
                      <IconBtn
                        label="Supprimer"
                        danger
                        onClick={() => {
                          if (confirm(`Supprimer "${p.name}" ?`)) deleteProduct(p.slug).catch(notifyError);
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <ProductForm
          product={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ProductForm({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const data = useAdminData();
  const isEdit = !!product;
  const [form, setForm] = useState<Product>(
    product ?? {
      slug: "",
      name: "",
      brand: "",
      section: data.sections[0]?.slug ?? "consultation",
      subcategory: data.sections[0]?.subcategories[0]?.slug ?? "",
      image: "",
      featured: false,
      taglineFr: "",
      descriptionFr: "",
    }
  );
  const [uploading, setUploading] = useState<"image" | "gallery" | "brochure" | null>(null);
  const [saving, setSaving] = useState(false);

  const section = data.sections.find((s) => s.slug === form.section);

  const set = <K extends keyof Product>(k: K, v: Product[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleImage = async (file?: File) => {
    if (!file) return;
    setUploading("image");
    try {
      const { url } = await uploadToImageKit(file, { folder: "products" });
      set("image", url);
    } catch (e) {
      notifyError(e);
    } finally {
      setUploading(null);
    }
  };
  const handleBrochure = async (file?: File) => {
    if (!file) return;
    setUploading("brochure");
    try {
      const { url } = await uploadToImageKit(file, { folder: "brochures" });
      set("brochure", url);
    } catch (e) {
      notifyError(e);
    } finally {
      setUploading(null);
    }
  };

  const handleGallery = async (files?: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading("gallery");
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const { url } = await uploadToImageKit(file, { folder: "products" });
        urls.push(url);
      }
      setForm((f) => ({ ...f, images: [...(f.images ?? []), ...urls] }));
    } catch (e) {
      notifyError(e);
    } finally {
      setUploading(null);
    }
  };
  const moveImage = (idx: number, dir: -1 | 1) =>
    setForm((f) => {
      const arr = [...(f.images ?? [])];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return f;
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      return { ...f, images: arr };
    });
  const removeImage = (idx: number) =>
    setForm((f) => ({ ...f, images: (f.images ?? []).filter((_, i) => i !== idx) }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = isEdit ? form.slug : slugify(form.name);
    setSaving(true);
    try {
      await saveProduct({ ...form, slug }, product?.slug);
      onClose();
    } catch (err) {
      notifyError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? `Modifier ${product?.name}` : "Nouveau produit"} onClose={onClose} wide>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nom du produit">
            <input className={inputCls} required value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Marque">
            <select className={inputCls} value={form.brand} onChange={(e) => set("brand", e.target.value)}>
              <option value="">— Aucune marque —</option>
              {data.brands.map((b) => (
                <option key={b.slug} value={b.slug}>{b.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Section">
            <select
              className={inputCls}
              value={form.section}
              onChange={(e) => {
                const sec = data.sections.find((s) => s.slug === e.target.value);
                setForm((f) => ({
                  ...f,
                  section: e.target.value as Product["section"],
                  subcategory: sec?.subcategories[0]?.slug ?? "",
                }));
              }}
            >
              {data.sections.map((s) => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>
          </Field>
          {section && section.subcategories.length > 0 && (
            <Field label="Type (catégorie)">
              <select className={inputCls} value={form.subcategory} onChange={(e) => set("subcategory", e.target.value)}>
                {section.subcategories.map((sc) => (
                  <option key={sc.slug} value={sc.slug}>{sc.name}</option>
                ))}
              </select>
            </Field>
          )}
        </div>

        {/* Image — uploaded to ImageKit (signed), URL stored in Supabase */}
        <Field label="Image principale (couverture)">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded border border-outline-variant bg-surface-container-low">
              {form.image && <Image src={form.image} alt="" fill className="object-contain p-1" />}
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                disabled={uploading !== null}
                onChange={(e) => handleImage(e.target.files?.[0])}
                className="text-sm"
              />
              {uploading === "image" ? (
                <span className="text-sm text-on-surface-variant">Envoi de l&apos;image…</span>
              ) : (
                <input
                  className={inputCls}
                  placeholder="https://ik.imagekit.io/…"
                  value={form.image}
                  onChange={(e) => set("image", e.target.value)}
                />
              )}
            </div>
          </div>
        </Field>

        {/* Gallery — extra images (one or many); the main image above is the cover */}
        <Field label="Galerie (images supplémentaires)">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading !== null}
                onChange={(e) => handleGallery(e.target.files)}
                className="text-sm"
              />
              {uploading === "gallery" && (
                <span className="text-sm text-on-surface-variant">Envoi des images…</span>
              )}
            </div>
            {(form.images?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-3">
                {(form.images ?? []).map((url, idx) => (
                  <div
                    key={idx}
                    className="group relative h-20 w-20 overflow-hidden rounded border border-outline-variant bg-surface-container-low"
                  >
                    <Image src={url} alt="" fill className="object-contain p-1" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      aria-label="Retirer l'image"
                      className="absolute right-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full bg-on-surface/70 text-xs leading-none text-clinical-white opacity-0 transition group-hover:opacity-100"
                    >
                      ×
                    </button>
                    <div className="absolute inset-x-0 bottom-0 flex justify-between bg-on-surface/60 px-1 text-clinical-white opacity-0 transition group-hover:opacity-100">
                      <button type="button" disabled={idx === 0} onClick={() => moveImage(idx, -1)} aria-label="Avancer">‹</button>
                      <button type="button" disabled={idx === (form.images ?? []).length - 1} onClick={() => moveImage(idx, 1)} aria-label="Reculer">›</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-on-surface-variant">
              L&apos;« Image principale » ci-dessus est la couverture ; ces images apparaissent ensuite dans le carrousel du produit. Vous pouvez en ajouter une ou plusieurs.
            </p>
          </div>
        </Field>

        {/* Brochure (PDF) — uploaded to ImageKit, URL stored in Supabase */}
        <Field label="Brochure">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept="application/pdf"
              disabled={uploading !== null}
              onChange={(e) => handleBrochure(e.target.files?.[0])}
              className="text-sm"
            />
            {uploading === "brochure" ? (
              <span className="text-sm text-on-surface-variant">Envoi de la brochure…</span>
            ) : form.brochure ? (
              <span className="inline-flex items-center gap-2 text-sm text-status-success">
                <CheckIcon className="h-4 w-4" /> Brochure attachée
                <button
                  type="button"
                  onClick={() => set("brochure", undefined)}
                  className="text-error underline"
                >
                  retirer
                </button>
              </span>
            ) : (
              <span className="text-sm text-on-surface-variant">Aucune brochure</span>
            )}
          </div>
        </Field>

        <Field label="Accroche (affichée dans le carrousel d'accueil)">
          <input className={inputCls} value={form.taglineFr} onChange={(e) => set("taglineFr", e.target.value)} />
        </Field>
        <Field label="Description (les retours à la ligne sont conservés)">
          <textarea className={inputCls} rows={8} value={form.descriptionFr} onChange={(e) => set("descriptionFr", e.target.value)} />
        </Field>

        <div className="flex flex-wrap gap-6">
          <Toggle label="Produit en vedette (accueil)" checked={!!form.featured} onChange={(v) => set("featured", v)} />
        </div>

        {/* Hero photo — only relevant when the product is featured on the home hero */}
        {form.featured && (
          <Field label="Photo affichée dans le carrousel d'accueil">
            {[form.image, ...(form.images ?? [])].filter(Boolean).length === 0 ? (
              <p className="text-sm text-on-surface-variant">Ajoutez d&apos;abord une image au produit.</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-3">
                  {[form.image, ...(form.images ?? [])].filter(Boolean).map((url, idx) => {
                    const selected = (form.heroImage ?? form.image) === url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => set("heroImage", url)}
                        aria-label={`Choisir la photo ${idx + 1} pour le hero`}
                        aria-current={selected}
                        className={`relative h-20 w-20 overflow-hidden rounded border bg-clinical-white transition ${
                          selected ? "border-primary ring-2 ring-primary" : "border-outline-variant hover:border-primary/50"
                        }`}
                      >
                        <Image src={url} alt="" fill className="object-contain p-1" />
                        {idx === 0 && (
                          <span className="absolute left-0 top-0 bg-on-surface/70 px-1 text-[10px] leading-tight text-clinical-white">
                            couverture
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-on-surface-variant">
                  Par défaut, la couverture est utilisée. Cliquez une photo pour l&apos;afficher dans le carrousel d&apos;accueil.
                </p>
              </>
            )}
          </Field>
        )}

        <div className="mt-2 flex justify-end gap-3 border-t border-outline-variant pt-4">
          <button type="button" onClick={onClose} className="btn-outline">Annuler</button>
          <button type="submit" disabled={saving || uploading !== null} className="btn-solid disabled:opacity-60">
            {saving ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer le produit"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function CategoriesPanel() {
  const data = useAdminData();
  const [editing, setEditing] = useState<Section | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <PanelHeader
        title="Catégories (sections)"
        action={
          <button onClick={() => setCreating(true)} className="btn-solid">
            <PlusIcon className="h-5 w-5" /> Ajouter une catégorie
          </button>
        }
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.sections.map((s) => (
          <div key={s.slug} className="rounded-lg border border-outline-variant bg-clinical-white p-5">
            <p className="font-mono text-label-caps uppercase text-on-surface-variant">{s.label}</p>
            <h3 className="mb-1 font-display text-lg font-semibold text-on-surface">{s.name}</h3>
            <p className="mb-3 text-sm text-on-surface-variant">{s.subcategories.length} types · {data.products.filter((p) => p.section === s.slug).length} produits</p>
            <div className="flex gap-2">
              <IconBtn label="Modifier" onClick={() => setEditing(s)}><PencilIcon className="h-4 w-4" /></IconBtn>
              {!STANDALONE_SECTIONS.includes(s.slug) && (
                <IconBtn label="Supprimer" danger onClick={() => { if (confirm(`Supprimer la catégorie "${s.name}" ?`)) deleteCategory(s.slug).catch(notifyError); }}>
                  <TrashIcon className="h-4 w-4" />
                </IconBtn>
              )}
            </div>
          </div>
        ))}
      </div>

      {(creating || editing) && (
        <CategoryForm section={editing} onClose={() => { setCreating(false); setEditing(null); }} />
      )}
    </div>
  );
}

function CategoryForm({ section, onClose }: { section: Section | null; onClose: () => void }) {
  const isEdit = !!section;
  const [form, setForm] = useState<Section>(
    section ?? {
      slug: "" as Section["slug"],
      label: "",
      name: "",
      description: "",
      subcategories: [] as Section["subcategories"],
    }
  );
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = isEdit ? form.slug : (slugify(form.name) as Section["slug"]);
    setSaving(true);
    try {
      await saveCategory({ ...form, slug }, section?.slug);
      onClose();
    } catch (err) {
      notifyError(err);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal title={isEdit ? `Modifier ${section?.name}` : "Nouvelle catégorie"} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Nom"><input className={inputCls} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Description"><textarea className={inputCls} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
        <div className="flex justify-end gap-3 border-t border-outline-variant pt-4">
          <button type="button" onClick={onClose} className="btn-outline">Annuler</button>
          <button type="submit" disabled={saving} className="btn-solid disabled:opacity-60">
            {saving ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function TypesPanel() {
  const data = useAdminData();
  // Types only exist under the Ophtalmologie sections (Optique/Occasion are flat).
  const manageable = data.sections.filter((s) => !STANDALONE_SECTIONS.includes(s.slug));
  const [sectionSlug, setSectionSlug] = useState<string>("");
  const [name, setName] = useState("");
  const effectiveSlug = sectionSlug || manageable[0]?.slug || "";
  const section = manageable.find((s) => s.slug === effectiveSlug);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !section) return;
    try {
      await addType(section.slug, { slug: slugify(name), name: name.trim() });
      setName("");
    } catch (err) {
      notifyError(err);
    }
  };

  return (
    <div>
      <PanelHeader title="Types (sous-catégories)" />
      <div className="mb-5 max-w-sm">
        <Field label="Catégorie">
          <select className={inputCls} value={effectiveSlug} onChange={(e) => setSectionSlug(e.target.value)}>
            {manageable.map((s) => (
              <option key={s.slug} value={s.slug}>{s.name}</option>
            ))}
          </select>
        </Field>
      </div>

      <form onSubmit={add} className="mb-6 flex gap-2">
        <input className={inputCls} placeholder="Nom du nouveau type" value={name} onChange={(e) => setName(e.target.value)} />
        <button type="submit" className="btn-solid shrink-0"><PlusIcon className="h-5 w-5" /> Ajouter</button>
      </form>

      <div className="overflow-hidden rounded-lg border border-outline-variant">
        <ul className="divide-y divide-outline-variant">
          {section?.subcategories.map((sc) => (
            <li key={sc.slug} className="flex items-center justify-between bg-clinical-white px-4 py-3">
              <div>
                <span className="text-on-surface">{sc.name}</span>
                <span className="ml-2 text-xs text-on-surface-variant">
                  {data.products.filter((p) => p.subcategory === sc.slug).length} produit(s)
                </span>
              </div>
              <IconBtn label="Supprimer" danger onClick={() => deleteType(section.slug, sc.slug).catch(notifyError)}>
                <TrashIcon className="h-4 w-4" />
              </IconBtn>
            </li>
          ))}
          {section && section.subcategories.length === 0 && (
            <li className="bg-clinical-white px-4 py-6 text-center text-sm text-on-surface-variant">Aucun type.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function BrandsPanel() {
  const data = useAdminData();
  const [editing, setEditing] = useState<Brand | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <PanelHeader
        title="Marques"
        action={
          <button onClick={() => setCreating(true)} className="btn-solid">
            <PlusIcon className="h-5 w-5" /> Ajouter une marque
          </button>
        }
      />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {data.brands.map((b) => (
          <div key={b.slug} className="flex flex-col items-center gap-3 rounded-lg border border-outline-variant bg-clinical-white p-4 text-center">
            <div className="flex h-16 items-center justify-center">
              {b.logo ? (
                <Image src={b.logo} alt={b.name} width={120} height={56} className="max-h-14 w-auto object-contain" />
              ) : (
                <span className="font-mono text-label-caps uppercase text-primary-container">{b.name}</span>
              )}
            </div>
            <span className="text-sm font-medium text-on-surface">{b.name}</span>
            {b.isPartner === false && (
              <span className="rounded-full bg-outline-variant/40 px-2 py-0.5 font-mono text-label-caps uppercase text-on-surface-variant">
                Non partenaire
              </span>
            )}
            <div className="flex gap-2">
              <IconBtn label="Modifier" onClick={() => setEditing(b)}><PencilIcon className="h-4 w-4" /></IconBtn>
              <IconBtn label="Supprimer" danger onClick={() => { if (confirm(`Supprimer "${b.name}" ?`)) deleteBrand(b.slug).catch(notifyError); }}>
                <TrashIcon className="h-4 w-4" />
              </IconBtn>
            </div>
          </div>
        ))}
      </div>

      {(creating || editing) && <BrandForm brand={editing} onClose={() => { setCreating(false); setEditing(null); }} />}
    </div>
  );
}

function BrandForm({ brand, onClose }: { brand: Brand | null; onClose: () => void }) {
  const isEdit = !!brand;
  const [form, setForm] = useState<Brand>(brand ?? { slug: "", name: "", logo: "", isPartner: true });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleLogo = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadToImageKit(file, { folder: "brands" });
      setForm((f) => ({ ...f, logo: url }));
    } catch (e) {
      notifyError(e);
    } finally {
      setUploading(false);
    }
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = isEdit ? form.slug : slugify(form.name);
    setSaving(true);
    try {
      await saveBrand({ ...form, slug }, brand?.slug);
      onClose();
    } catch (err) {
      notifyError(err);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal title={isEdit ? `Modifier ${brand?.name}` : "Nouvelle marque"} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Nom"><input className={inputCls} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Logo">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-24 items-center justify-center overflow-hidden rounded border border-outline-variant bg-white">
              {form.logo && <Image src={form.logo} alt="" fill className="object-contain p-1" />}
            </div>
            <div className="flex flex-col gap-2">
              <input type="file" accept="image/*" disabled={uploading} onChange={(e) => handleLogo(e.target.files?.[0])} className="text-sm" />
              {uploading ? (
                <span className="text-sm text-on-surface-variant">Envoi du logo…</span>
              ) : (
                <input className={inputCls} placeholder="https://ik.imagekit.io/…" value={form.logo ?? ""} onChange={(e) => setForm({ ...form, logo: e.target.value })} />
              )}
            </div>
          </div>
        </Field>
        <Toggle
          label="Marque partenaire (visible sur l'accueil et dans la recherche)"
          checked={form.isPartner !== false}
          onChange={(v) => setForm({ ...form, isPartner: v })}
        />
        <div className="flex justify-end gap-3 border-t border-outline-variant pt-4">
          <button type="button" onClick={onClose} className="btn-outline">Annuler</button>
          <button type="submit" disabled={saving || uploading} className="btn-solid disabled:opacity-60">
            {saving ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ───────────────── Articles (blog) ───────────────── */
function ArticlesPanel() {
  const data = useAdminData();
  const [editing, setEditing] = useState<Article | null>(null);
  const [creating, setCreating] = useState(false);
  const fmt = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { dateStyle: "medium" });

  return (
    <div>
      <PanelHeader
        title="Articles"
        action={
          <button onClick={() => setCreating(true)} className="btn-solid">
            <PlusIcon className="h-5 w-5" /> Ajouter un article
          </button>
        }
      />
      <div className="overflow-x-auto rounded-lg border border-outline-variant">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-surface-gray font-mono text-label-caps uppercase text-on-surface-variant">
            <tr>
              <th className="px-4 py-3">Article</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {data.articles.map((a) => (
              <tr key={a.slug} className="bg-clinical-white">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded bg-surface-container-low">
                      {a.cover ? (
                        <Image src={a.cover} alt={a.title} fill className="object-cover" />
                      ) : (
                        <span className="grid h-full w-full place-items-center text-[10px] text-on-surface-variant">—</span>
                      )}
                    </div>
                    <span className="font-medium text-on-surface">{a.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-on-surface-variant">{a.category}</td>
                <td className="px-4 py-3 text-on-surface-variant">{fmt(a.date)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-label-caps uppercase ${
                      a.published !== false
                        ? "bg-status-success/10 text-status-success"
                        : "bg-outline-variant/40 text-on-surface-variant"
                    }`}
                  >
                    {a.published !== false ? "Publié" : "Brouillon"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <IconBtn label="Modifier" onClick={() => setEditing(a)}>
                      <PencilIcon className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn
                      label="Supprimer"
                      danger
                      onClick={() => {
                        if (confirm(`Supprimer "${a.title}" ?`)) deleteArticle(a.slug).catch(notifyError);
                      }}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </IconBtn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.ready && data.articles.length === 0 && (
          <p className="bg-clinical-white px-4 py-6 text-center text-sm text-on-surface-variant">
            Aucun article — ajoutez le premier, ou exécutez seed-blog.sql pour importer les articles de démonstration.
          </p>
        )}
      </div>

      {(creating || editing) && (
        <ArticleForm
          article={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ArticleForm({ article, onClose }: { article: Article | null; onClose: () => void }) {
  const isEdit = !!article;
  const [form, setForm] = useState<Article>(
    article ?? {
      slug: "",
      title: "",
      excerpt: "",
      category: "Actualités",
      date: new Date().toISOString(),
      cover: "",
      body: "",
      published: true,
    }
  );
  const [uploading, setUploading] = useState<"cover" | "pdf" | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Article>(k: K, v: Article[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleCover = async (file?: File) => {
    if (!file) return;
    setUploading("cover");
    try {
      const { url } = await uploadToImageKit(file, { folder: "articles" });
      set("cover", url);
    } catch (e) {
      notifyError(e);
    } finally {
      setUploading(null);
    }
  };

  const handlePdf = async (file?: File) => {
    if (!file) return;
    setUploading("pdf");
    try {
      const { url } = await uploadToImageKit(file, { folder: "articles" });
      set("pdf", url);
    } catch (e) {
      notifyError(e);
    } finally {
      setUploading(null);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = isEdit ? form.slug : slugify(form.title);
    setSaving(true);
    try {
      await saveArticle({ ...form, slug }, article?.slug);
      onClose();
    } catch (err) {
      notifyError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? `Modifier ${article?.title}` : "Nouvel article"} onClose={onClose} wide>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Titre">
            <input className={inputCls} required value={form.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="Catégorie">
            <input
              className={inputCls}
              placeholder="Technologie, Conseils Cliniques…"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            />
          </Field>
        </div>

        {/* Cover — uploaded to ImageKit (signed), URL stored in Supabase */}
        <Field label="Image de couverture">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded border border-outline-variant bg-surface-container-low">
              {form.cover && <Image src={form.cover} alt="" fill className="object-cover" />}
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/*"
                disabled={uploading !== null}
                onChange={(e) => handleCover(e.target.files?.[0])}
                className="text-sm"
              />
              {uploading === "cover" ? (
                <span className="text-sm text-on-surface-variant">Envoi de l&apos;image…</span>
              ) : (
                <input
                  className={inputCls}
                  placeholder="https://ik.imagekit.io/…"
                  value={form.cover}
                  onChange={(e) => set("cover", e.target.value)}
                />
              )}
            </div>
          </div>
        </Field>

        {/* PDF — l'article peut être un document à consulter/télécharger */}
        <Field label="Document PDF (optionnel — affiché avec un bouton de téléchargement)">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              accept="application/pdf"
              disabled={uploading !== null}
              onChange={(e) => handlePdf(e.target.files?.[0])}
              className="text-sm"
            />
            {uploading === "pdf" ? (
              <span className="text-sm text-on-surface-variant">Envoi du PDF…</span>
            ) : form.pdf ? (
              <span className="inline-flex items-center gap-2 text-sm text-status-success">
                <CheckIcon className="h-4 w-4" /> PDF attaché
                <button type="button" onClick={() => set("pdf", undefined)} className="text-error underline">
                  retirer
                </button>
              </span>
            ) : (
              <span className="text-sm text-on-surface-variant">Aucun PDF (max 10 Mo)</span>
            )}
          </div>
        </Field>

        <Field label={form.pdf ? "Contenu (optionnel avec un PDF — le 1er paragraphe sert d'extrait)" : "Contenu (les lignes vides séparent les paragraphes — le 1er sert d'extrait)"}>
          <textarea
            className={inputCls}
            rows={10}
            required={!form.pdf}
            value={form.body ?? ""}
            onChange={(e) => set("body", e.target.value)}
          />
        </Field>

        <div className="flex flex-wrap gap-6">
          <Toggle label="Publié (visible sur le blog)" checked={form.published !== false} onChange={(v) => set("published", v)} />
        </div>

        <div className="mt-2 flex justify-end gap-3 border-t border-outline-variant pt-4">
          <button type="button" onClick={onClose} className="btn-outline">Annuler</button>
          <button type="submit" disabled={saving || uploading !== null} className="btn-solid disabled:opacity-60">
            {saving ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer l'article"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ───────────────── Leads ───────────────── */
function LeadsPanel() {
  const data = useAdminData();
  const fmt = (iso: string) => new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });

  const exportCsv = () => {
    const head = ["Nom", "Email", "Téléphone", "Établissement", "Produit", "Date"];
    const rows = data.leads.map((l) => [l.name, l.email, l.phone, l.organization, l.productName, l.date]);
    const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads-ophtahealth.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PanelHeader
        title="Leads — téléchargements de brochures"
        action={
          data.leads.length > 0 ? (
            <button onClick={exportCsv} className="btn-outline">Exporter CSV</button>
          ) : undefined
        }
      />
      {data.leads.length === 0 ? (
        <div className="rounded-lg border border-dashed border-outline-variant bg-surface-gray p-12 text-center text-on-surface-variant">
          Aucun lead pour le moment. Les contacts ayant téléchargé une brochure apparaîtront ici.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-outline-variant">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-surface-gray font-mono text-label-caps uppercase text-on-surface-variant">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Établissement</th>
                <th className="px-4 py-3">Produit</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {data.leads.map((l) => (
                <tr key={l.id} className="bg-clinical-white">
                  <td className="px-4 py-3 font-medium text-on-surface">{l.name}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{l.email}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{l.phone}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{l.organization}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{l.productName}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{fmt(l.date)}</td>
                  <td className="px-4 py-3 text-right">
                    <IconBtn label="Supprimer" danger onClick={() => deleteLead(l.id).catch(notifyError)}>
                      <TrashIcon className="h-4 w-4" />
                    </IconBtn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ───────────────── Shared UI ───────────────── */
function PanelHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-display text-headline-lg text-primary-container">{title}</h1>
      {action}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-label-caps uppercase text-on-surface-variant">{label}</label>
      {children}
    </div>
  );
}

function IconBtn({
  children,
  label,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 place-items-center rounded border transition-colors ${
        danger
          ? "border-error/30 text-error hover:bg-error/10"
          : "border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-2">
      <span
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-status-success" : "bg-outline-variant"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? "left-[22px]" : "left-0.5"}`}
        />
      </span>
      <span className="text-sm text-on-surface">{label}</span>
    </button>
  );
}

function Modal({ title, children, onClose, wide }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-on-surface/50 p-4" onClick={onClose}>
      <div
        className={`my-8 w-full animate-fadeIn rounded-lg border border-outline-variant bg-clinical-white p-6 shadow-xl ${wide ? "max-w-2xl" : "max-w-md"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-headline-md text-primary-container">{title}</h2>
          <button onClick={onClose} aria-label="Fermer" className="text-on-surface-variant hover:text-primary">
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
