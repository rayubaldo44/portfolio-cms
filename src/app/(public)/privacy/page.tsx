import { publicMetadata } from "@/lib/site";

export const metadata = publicMetadata("/privacy", "Privacy information");

export default function PrivacyPage() {
  return (
    <div className="py-16">
      <h1 className="type-page-title">Privacy information</h1>
      <div className="type-body mt-8 flex max-w-2xl flex-col gap-5">
        <p>This is a sample disclosure for a portfolio CMS. The person deploying this site must replace it with information matching their hosting, services, and contact details.</p>
        <p>The browser stores your theme preference locally. Admin sign-in sets an HTTP-only session cookie. The application uses transient, per-process rate limits for chat and login.</p>
        <p>When enabled by the operator, chat sends messages and public portfolio context to Google Gemini. The application does not save chat conversations in its database. Avoid sending confidential information.</p>
        <p>Optional GitHub and Spotify features contact those services. Spotify playback may load a third-party iframe. Hosting providers may maintain request logs under their own policies.</p>
        <p>Before deploying, describe your actual data processing and provide a working contact method. This sample is not a statement about a particular deployment.</p>
      </div>
    </div>
  );
}
