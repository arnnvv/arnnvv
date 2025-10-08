"use server";

import { appConfig } from "@/lib/config";
import type { ActionResult } from "@/lib/db/types";
import { globalPOSTRateLimit } from "@/lib/request";
import { sendEmail } from "@/lib/smtp";

export async function sendEmailAtn(formdata: FormData): Promise<ActionResult> {
  if (!(await globalPOSTRateLimit())) {
    return {
      success: false,
      message: "Rate Limit",
    };
  }

  const email = formdata.get("email") as string;
  const message = formdata.get("message") as string;

  if (!email) {
    return {
      success: false,
      message: "Email is needed",
    };
  }

  if (!message) {
    return {
      success: false,
      message: "Message is needed",
    };
  }

  const fullMessageBody = `New contact form submission from: ${email}\n\n---\n\n${message}`;

  try {
    await sendEmail(
      {
        host: appConfig.smtp.host,
        port: appConfig.smtp.port,
        auth: {
          user: appConfig.smtp.user,
          pass: appConfig.smtp.pass,
        },
      },
      {
        from: email,
        to: appConfig.smtp.to,
        subject: `Message from site ${email}`,
        text: fullMessageBody,
      },
    );
    return {
      success: true,
      message: "Message Sent",
    };
  } catch (e) {
    console.error(`Failed to send email: ${e}`);
    return {
      success: false,
      message: "Error sending message",
    };
  }
}
