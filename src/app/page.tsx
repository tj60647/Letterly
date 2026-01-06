/**
 * @file src/app/page.tsx
 * @description The main entry point for the home page. Renders the LetterApp component.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: Next.js Pages, React Components, Home Route
 */

import LetterApp from "@/components/LetterApp";

/**
 * The Home Page.
 * Renders the main `LetterApp` component which contains the full application logic.
 * 
 * @returns {JSX.Element} The main page content.
 */
export default function Home() {
  return (
    <main>
      <LetterApp />
    </main>
  );
}
