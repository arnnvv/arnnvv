"use server";

import { createTransport } from "nodemailer";
import { appConfig } from "@/lib/config";
import { globalPOSTRateLimit } from "@/lib/request";
import type { ActionResult } from "@/type";

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

  const transporter = createTransport({
    host: appConfig.smtp.host,
    port: appConfig.smtp.port,
    secure: true,
    auth: {
      user: appConfig.smtp.user,
      pass: appConfig.smtp.pass,
    },
  });

  try {
    await transporter.sendMail({
      from: appConfig.smtp.user,
      to: appConfig.smtp.to,
      subject: `Message from site by ${email}`,
      text: message,
    });
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
