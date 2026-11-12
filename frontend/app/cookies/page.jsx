import ContentPage from "../Components/ContentPage";
export const metadata = { title: "Cookies policy" };
export default function Page() {
  return (
    <ContentPage title="Cookies policy" eyebrow="POLICIES">
      <p>
        This Cookies Policy explains how we use cookies and similar technologies
        to improve your experience on our platform.
      </p>

      <section>
        <h2>1. What Are Cookies?</h2>
        <p>
          Cookies are small text files stored on your device when you visit a
          website. They help the site function properly and improve your
          experience.
        </p>
      </section>

      <section>
        <h2>2. How We Use Cookies</h2>
        <ul>
          <li>To keep you logged in securely.</li>
          <li>To remember your preferences and settings.</li>
          <li>To analyze traffic and improve performance.</li>
        </ul>
      </section>

      <section>
        <h2>3. Types of Cookies We Use</h2>
        <ul>
          <li>
            <strong>Essential Cookies:</strong> Required for basic
            functionality.
          </li>
          <li>
            <strong>Analytics Cookies:</strong> Help us understand how users
            interact with the platform.
          </li>
          <li>
            <strong>Preference Cookies:</strong> Store user settings and
            preferences.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Managing Cookies</h2>
        <p>
          You can disable cookies through your browser settings. However, doing
          so may impact certain features of the platform.
        </p>
      </section>

      <section>
        <h2>5. Updates to This Policy</h2>
        <p>
          We may update this Cookies Policy as necessary. Continued use of the
          platform means you accept these changes.
        </p>
      </section>

      <p>
        If you have any questions about this Cookies Policy, feel free to
        contact us.
      </p>
    </ContentPage>
  );
}
