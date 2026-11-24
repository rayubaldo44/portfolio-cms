/** Featured projects retain CMS order and link directly to each case study. */
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RevealItem, RevealStagger } from "@/components/motion/reveal-stagger";
import { TiltCard } from "@/components/motion/tilt-card";

const MAX_VISIBLE_TAGS = 3;

export interface FeaturedProjectDeckItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageSrc: string | null;
  tags: string[];
}

interface FeaturedProjectDeckProps {
  projects: FeaturedProjectDeckItem[];
}

export function FeaturedProjectDeck({ projects }: FeaturedProjectDeckProps) {
  return (
    <RevealStagger className="mt-8 grid auto-rows-fr grid-cols-1 gap-5 md:grid-cols-3">
      {projects.map((project) => (
        <RevealItem key={project.id} className="h-full min-w-0">
          <TiltCard className="h-full" maxTilt={0}>
            <Link
              href={`/projects/${project.slug}`}
              className="group flex h-full min-w-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <Card className="flex h-full w-full min-w-0 flex-col overflow-hidden group-hover:border-gray-300 dark:group-hover:border-gray-700">
                <div className="aspect-[16/10] shrink-0 overflow-hidden border-b border-gray-200/80 bg-gray-100 dark:border-gray-800 dark:bg-gray-950">
                  {project.imageSrc ? (
                    // Hosted URLs and uploaded data URLs are both supported.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.imageSrc}
                      alt={`${project.title} project preview`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="type-meta flex h-full items-center justify-center px-5 text-center text-gray-500 dark:text-gray-400">
                      Preview unavailable
                    </div>
                  )}
                </div>
                <CardHeader className="p-5 pb-0">
                  <CardTitle className="type-content-title type-break">
                    {project.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4 p-5 pt-4">
                  <CardDescription className="type-body-compact type-break line-clamp-3">
                    {project.description}
                  </CardDescription>
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="type-caption max-w-full [overflow-wrap:anywhere]"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > MAX_VISIBLE_TAGS && (
                        <Badge
                          variant="outline"
                          className="type-caption text-gray-500 dark:text-gray-400"
                          title={project.tags.slice(MAX_VISIBLE_TAGS).join(", ")}
                        >
                          +{project.tags.length - MAX_VISIBLE_TAGS} more
                        </Badge>
                      )}
                    </div>
                  )}
                  <span className="type-action mt-auto inline-flex items-center gap-1.5 pt-2 text-gray-600 transition-colors group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100">
                    Read case study
                    <ArrowRight
                      aria-hidden="true"
                      size={15}
                      weight="bold"
                      className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                    />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </TiltCard>
        </RevealItem>
      ))}
    </RevealStagger>
  );
}
