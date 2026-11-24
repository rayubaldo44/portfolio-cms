/**
 * Component: Certification Form | Type: Client | Deps: FormWrapper, Input
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { FormWrapper, type FormState } from "@/components/admin/form-wrapper";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { CERTIFICATION_CATEGORIES } from "@/lib/certification-categories";
import { CERTIFICATE_ACCEPT, certificateFileError } from "@/lib/certificate-file";

interface CertificationFormInitial {
  name?: string;
  issuer?: string;
  category?: string;
  date?: string;
  url?: string;
  imageUrl?: string;
  certificateUrl?: string;
  certificateIsPdf?: boolean;
  order?: number;
}

interface CertificationFormProps {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial?: CertificationFormInitial;
  id?: string;
  submitLabel?: string;
}

export function CertificationForm({
  action,
  initial,
  id,
  submitLabel,
}: CertificationFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [removed, setRemoved] = useState(false);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const certificateUrl = file ? preview : removed ? "" : initial?.certificateUrl;
  const isPdf = file ? file.type === "application/pdf" : initial?.certificateIsPdf;

  async function save(prev: FormState, formData: FormData) {
    if (error) return { error };
    // React resets uncontrolled file inputs after an action, including validation errors.
    // Retain the selected file in state so a corrected form can be resubmitted.
    if (file) formData.set("certificateFile", file);
    else formData.delete("certificateFile");
    return action(prev, formData);
  }

  return (
    <FormWrapper action={save} submitLabel={submitLabel}>
      {id && <input type="hidden" name="id" value={id} />}
      <input type="hidden" name="removeCertificate" value={String(removed)} />
      <div className="flex flex-col gap-4">
        <Input
          name="name"
          label="Name"
          placeholder="AWS Certified Solutions Architect"
          required
          defaultValue={initial?.name ?? ""}
        />
        <Input
          name="issuer"
          label="Issuer"
          placeholder="Amazon Web Services"
          required
          defaultValue={initial?.issuer ?? ""}
        />
        <Select name="category" label="Category (optional)" defaultValue={initial?.category ?? ""}>
          <option value="">Uncategorized</option>
          {CERTIFICATION_CATEGORIES.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Select>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="date"
            label="Date"
            type="date"
            required
            defaultValue={initial?.date ?? ""}
          />
          <Input
            name="order"
            label="Order"
            type="number"
            min={0}
            defaultValue={initial?.order ?? 0}
          />
        </div>
        <Input
          name="url"
          label="Credential URL"
          placeholder="https://…"
          defaultValue={initial?.url ?? ""}
        />
        <UploadFieldset>
          <Input
            ref={fileRef}
            name="certificateFile"
            label="Certificate file"
            type="file"
            accept={CERTIFICATE_ACCEPT}
            className="h-auto py-2 file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-gray-900 dark:file:bg-gray-800 dark:file:text-gray-100"
            helper="PNG, JPEG, WebP, GIF, or PDF. Maximum 1.5 MB. Uploads are saved with the certification."
            error={error}
            onChange={(event) => {
              const selected = event.target.files?.[0];
              if (!selected) return;
              const message = certificateFileError(selected);
              setError(message ?? "");
              if (message) {
                event.target.value = "";
                return;
              }
              setPreview(URL.createObjectURL(selected));
              setFile(selected);
              setRemoved(false);
            }}
          />
          {(file || certificateUrl) && (
            <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-800">
              {certificateUrl && !isPdf && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={certificateUrl} alt="Certificate preview" className="max-h-72 w-full rounded bg-gray-50 object-contain dark:bg-gray-950" />
              )}
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="break-words text-gray-700 dark:text-gray-300">{file?.name ?? (isPdf ? "Saved PDF certificate" : "Saved certificate image")}</p>
                  {certificateUrl && <a href={certificateUrl} target="_blank" rel="noopener noreferrer" className="inline-block rounded text-accent underline underline-offset-4 focus-visible:outline-2">{isPdf ? "Open PDF" : "View certificate"}</a>}
                </div>
                <button
                  type="button"
                  className="rounded-md px-3 py-2 text-red-700 hover:bg-red-50 focus-visible:outline-2 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950"
                  onClick={() => {
                    setFile(null);
                    setPreview("");
                    setRemoved(true);
                    setError("");
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                >Remove file</button>
              </div>
            </div>
          )}
          <Input
            name="imageUrl"
            label="Or use a hosted image URL"
            type="url"
            placeholder="https://…"
            helper="Optional. An uploaded certificate takes priority."
            defaultValue={initial?.imageUrl ?? ""}
          />
        </UploadFieldset>
      </div>
    </FormWrapper>
  );
}

function UploadFieldset({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <fieldset disabled={pending} className="flex min-w-0 flex-col gap-3">{children}</fieldset>;
}
