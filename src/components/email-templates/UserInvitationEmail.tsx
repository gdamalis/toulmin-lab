import * as React from "react";
import { getTranslations } from "next-intl/server";

interface UserInvitationEmailProps {
  inviterName: string;
  userRole: string;
  temporaryPassword: string | null;
  locale: string;
}

export async function UserInvitationEmail({
  inviterName,
  userRole,
  temporaryPassword,
  locale = "en",
}: Readonly<UserInvitationEmailProps>): Promise<React.ReactElement> {
  // Get translations using server-side next-intl
  const t = await getTranslations({ locale, namespace: 'email.invitation' });
  const roleT = await getTranslations({ locale, namespace: 'admin.users.roles' });

  // Get translated role
  const translatedRole = roleT(userRole) || userRole;

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const loginUrl = `${baseUrl}/auth`;

  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        lineHeight: "1.6",
        color: "#333333",
        backgroundColor: "#f8fafc",
        margin: 0,
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "32px 24px",
            textAlign: "center" as const,
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <img
            src={`${baseUrl}/logo.png`}
            alt="Toulmin Lab Logo"
            style={{
              height: "60px",
              width: "auto",
              marginBottom: "12px",
            }}
          />
          <p
            style={{
              color: "#6b7280",
              fontSize: "16px",
              margin: 0,
              fontWeight: "500",
            }}
          >
            {t('tagline')}
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: "32px 24px" }}>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#1f2937",
              marginTop: 0,
              marginBottom: "16px",
            }}
          >
            {t('greeting')}
          </h2>

          <p style={{ fontSize: "16px", marginBottom: "16px" }}>
            {t('invitedBy')} <strong>{inviterName}</strong>.
          </p>

          <p style={{ fontSize: "16px", marginBottom: "24px" }}>
            {t('roleAssigned')}:{" "}
            <strong style={{ color: "#1f71b9" }}>{translatedRole}</strong>
          </p>

          <div
            style={{
              backgroundColor: "#f1f5f9",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#1f2937",
                marginTop: 0,
                marginBottom: "12px",
              }}
            >
              {t('loginInstructions')}
            </h3>

            {temporaryPassword && (
              <>
                <p style={{ fontSize: "14px", marginBottom: "12px" }}>
                  <strong>Temporary Password:</strong>{" "}
                  <code
                    style={{
                      backgroundColor: "#e2e8f0",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "14px",
                      fontFamily:
                        'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    }}
                  >
                    {temporaryPassword}
                  </code>
                </p>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginBottom: "16px",
                  }}
                >
                  {t('temporaryPasswordNote')}
                </p>
              </>
            )}

            {!temporaryPassword && (
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  marginBottom: "16px",
                }}
              >
                {t('noPasswordNote')}
              </p>
            )}

            <a
              href={loginUrl}
              style={{
                display: "inline-block",
                backgroundColor: "#1f71b9",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "6px",
                textDecoration: "none",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              {t('getStarted')}
            </a>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#1f2937",
                marginTop: 0,
                marginBottom: "12px",
              }}
            >
              {t('features.title')}
            </h3>
            <ul style={{ paddingLeft: "20px", marginBottom: 0 }}>
              {t.raw('features.items').map((item: string, index: number) => (
                <li
                  key={index}
                  style={{ fontSize: "14px", marginBottom: "8px" }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p
            style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px" }}
          >
            {t('aboutPlatform')}
          </p>

          <p style={{ fontSize: "14px", color: "#6b7280" }}>{t('support')}</p>
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            padding: "24px",
            borderTop: "1px solid #e2e8f0",
            textAlign: "center" as const,
          }}
        >
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              margin: 0,
            }}
            dangerouslySetInnerHTML={{ __html: t('footer') }}
          />
        </div>
      </div>
    </div>
  );
}
