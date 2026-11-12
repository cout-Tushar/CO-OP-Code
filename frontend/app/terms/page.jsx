import ContentPage from "../Components/ContentPage";
export const metadata = { title: "Terms of service" };
export default function Page() {
  return (
    <ContentPage title="Terms of service" eyebrow="POLICIES">
      <p>
        Please read these Terms of Service carefully before using our platform.
      </p>

      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using our website, you agree to comply with and be
          bound by these Terms of Service.
        </p>
      </section>

      <section>
        <h2>2. User Responsibilities</h2>
        <ul>
          <li>
            You must provide accurate information during account creation.
          </li>
          <li>
            You are responsible for maintaining the confidentiality of your
            account.
          </li>
          <li>You agree not to misuse or exploit the platform.</li>
        </ul>
      </section>

      <section>
        <h2>3. Prohibited Activities</h2>
        <ul>
          <li>Illegal or harmful activities.</li>
          <li>Uploading malicious code or scripts.</li>
          <li>Attempting to gain unauthorized access to systems.</li>
        </ul>
      </section>

      <section>
        <h2>4. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your account if you
          violate these terms.
        </p>
      </section>

      <section>
        <h2>5. Limitation of Liability</h2>
        <p>
          We are not liable for any damages resulting from the use or inability
          to use our platform.
        </p>
      </section>

      <section>
        <h2>6. Updates to Terms</h2>
        <p>
          We may update these Terms of Service at any time. Continued use of the
          platform indicates your acceptance of the new terms.
        </p>
      </section>

      <p>
        If you have any questions regarding these terms, please contact our
        support team.
      </p>
    </ContentPage>
  );
}
