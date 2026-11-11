import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getSettings } from "@/lib/store";
import { resolvePublicAppUrl } from "@/lib/appUrl";
import { sendEmail, getAdminNotificationEmail } from "@/lib/email";
import {
  getResolvedEmailSettings,
  buildSamplePreviewVariables,
  renderEmailFromTemplate,
} from "@/lib/emailTemplates";

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { templateKey = "approved", recipientEmail, emailSettings } = body || {};

    const currentSettings = await getSettings();
    const resolvedEmailSettings = emailSettings
      ? getResolvedEmailSettings({ emailSettings })
      : getResolvedEmailSettings(currentSettings);

    const appUrl = resolvePublicAppUrl(request);
    const sampleVars = buildSamplePreviewVariables(
      currentSettings,
      appUrl,
      request
    );
    const rendered = renderEmailFromTemplate({
      templateKey,
      emailSettings: resolvedEmailSettings,
      variables: sampleVars,
    });

    const target =
      (recipientEmail && recipientEmail.trim()) ||
      currentSettings?.email ||
      getAdminNotificationEmail();

    const result = await sendEmail({
      to: target,
      subject: `[TEST] ${rendered.subject}`,
      html: rendered.html,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error?.message || result.error || "Échec de l'envoi test.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      simulated: Boolean(result.simulated),
      recipient: target,
      subject: `[TEST] ${rendered.subject}`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
