/**
 * Component: Project Form | Type: Client | Deps: FormWrapper, Input, Textarea, Checkbox, slugify
 */
"use client";

import { useState } from "react";
import { FormWrapper, type FormState } from "@/components/admin/form-wrapper";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { slugify } from "@/lib/utils";
import { ProjectImagePicker } from "@/components/admin/project-image-picker";
import { ProjectScreenshotPicker } from "@/components/admin/project-screenshot-picker";
import type { ProjectScreenshot } from "@/lib/project-screenshots";

interface ProjectFormInitial {
  title?: string;
  slug?: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  imageData?: string;
  screenshots?: ProjectScreenshot[];
  liveUrl?: string;
  githubUrl?: string;
  tags?: string;
  featured?: boolean;
  order?: number;
}

interface ProjectFormProps {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial?: ProjectFormInitial;
  id?: string;
  submitLabel?: string;
}

export function ProjectForm({
  action,
  initial,
  id,
  submitLabel,
}: ProjectFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugDirty, setSlugDirty] = useState(false);
  const [hasLiveDemo, setHasLiveDemo] = useState(Boolean(initial?.liveUrl));
  const [liveUrl, setLiveUrl] = useState(initial?.liveUrl ?? "");
  const [processingScreenshots, setProcessingScreenshots] = useState(false);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setTitle(value);
    if (!slugDirty) setSlug(slugify(value));
  }

  return (
    <FormWrapper action={action} submitLabel={submitLabel} disabled={processingScreenshots}>
      {id && <input type="hidden" name="id" value={id} />}
      <div className="flex flex-col gap-4">
        <Input
          name="title"
          label="Title"
          placeholder="My Cool Project"
          required
          value={title}
          onChange={handleTitleChange}
        />
        <Input
          name="slug"
          label="Slug"
          placeholder="my-cool-project"
          helper="Auto-generated from title. Used in the URL."
          required
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugDirty(true);
          }}
        />
        <Textarea
          name="description"
          label="Description"
          placeholder="A short, punchy summary."
          required
          defaultValue={initial?.description ?? ""}
        />
        <Textarea
          name="content"
          label="Content"
          placeholder="Optional longer write-up."
          rows={8}
          defaultValue={initial?.content ?? ""}
        />
        <ProjectImagePicker
          urlName="imageUrl"
          dataName="imageData"
          initialUrl={initial?.imageUrl ?? ""}
          initialData={initial?.imageData ?? ""}
        />
        <ProjectScreenshotPicker initial={initial?.screenshots} onProcessingChange={setProcessingScreenshots} />
        <Checkbox
          name="hasLiveDemo"
          role="switch"
          label="Has live demo"
          helper={hasLiveDemo ? "Visitors can open the live site." : 'Visitors will see “Offline Demo only”.'}
          checked={hasLiveDemo}
          onChange={(event) => setHasLiveDemo(event.target.checked)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {hasLiveDemo && (
            <Input
              name="liveUrl"
              label="Live URL"
              type="url"
              placeholder="https://…"
              required
              value={liveUrl}
              onChange={(event) => setLiveUrl(event.target.value)}
            />
          )}
          <Input
            name="githubUrl"
            label="GitHub URL"
            placeholder="https://…"
            defaultValue={initial?.githubUrl ?? ""}
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
          name="tags"
          label="Tags"
          placeholder="React, TypeScript, Next.js"
          helper="Comma-separated."
          defaultValue={initial?.tags ?? ""}
        />
        <Checkbox
          name="featured"
          label="Featured on homepage"
          defaultChecked={initial?.featured ?? false}
        />
      </div>
    </FormWrapper>
  );
}
