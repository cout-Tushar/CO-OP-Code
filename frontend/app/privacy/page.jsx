import ContentPage from "../Components/ContentPage";
export const metadata = { title: "Privacy policy" };
export default function Page() {
  return (
    <ContentPage title="Privacy policy" eyebrow="POLICIES">
      <p>
        This Privacy Policy explains how Coop Code collects, uses, and protects
        the information of its users. By using our platform, you agree to the
        terms described in this policy.
      </p>

      <section>
        <h2>1. Information We Collect</h2>
        <p>
          When you sign up or use Coop Code, we may collect:
          <br />• Name and email address
          <br />• Login details
          <br />• Real-time editor content (code you write)
          <br />• Basic usage and activity logs
        </p>
      </section>

      <section>
        <h2>2. How We Use Your Data</h2>
        <p>
          We use your information to:
          <br />• Provide real-time collaboration
          <br />• Improve platform performance
          <br />• Maintain account security
          <br />• Enhance user experience and add new features
        </p>
      </section>

      <section>
        <h2>3. Data Security</h2>
        <p>
          Your data is stored securely using modern cloud infrastructure and
          encrypted connections. We take all reasonable measures to protect your
          information from unauthorized access.
        </p>
      </section>

      <section>
        <h2>4. Sharing of Information</h2>
        <p>
          We do <span>not</span> sell or share your personal information with
          third parties except:
          <br />• When legally required
          <br />• To protect platform security
          <br />• To provide essential service features (e.g., hosting
          providers)
        </p>
      </section>

      <section>
        <h2>5. Cookies & Tracking</h2>
        <p>
          Coop Code may use cookies to keep you logged in, remember preferences,
          and analyze usage — only to improve the platform experience.
        </p>
      </section>

      <section>
        <h2>6. Your Rights</h2>
        <p>
          You can request to:
          <br />• Delete your account
          <br />• Remove your data
          <br />• Update personal information
          <br />• Access your saved information
        </p>
      </section>

      <section>
        <h2>7. Contact</h2>
        <p>
          For any privacy-related questions, you can reach out to the developer:
          <br />
          <span>Tushar Mishra</span>
        </p>
      </section>
    </ContentPage>
  );
}
