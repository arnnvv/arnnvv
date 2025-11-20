import { Buffer } from "node:buffer";
import { connect } from "node:tls";

import {
  CONNECTION_TIMEOUT,
  MAX_BUFFER_SIZE,
  MAX_LINE_LENGTH,
  SMTP_CODES,
} from "./constants";
import { type MailOptions, type SmtpConfig, SmtpState } from "./db/types";

function sanitizeHeader(input: string): string {
  return input.replace(/[\r\n\x00-\x1F\x7F]/g, "").trim();
}

function debug(message: string) {
  if (
    process.env.NODE_ENV === "development" ||
    process.env["DEBUG"] === "true"
  ) {
    // eslint-disable-next-line no-console
    console.debug(message);
  }
}

class SmtpError extends Error {
  constructor(
    message: string,
    public code?: number,
  ) {
    super(message);
    this.name = "SmtpError";
  }
}

export async function sendEmail(
  config: SmtpConfig,
  mail: MailOptions,
): Promise<void> {
  if (!config || !mail || !config.auth) {
    throw new SmtpError("Invalid configuration or mail options provided.", 400);
  }

  return new Promise((resolve, reject) => {
    let state = SmtpState.GREETING;
    let buffer = "";

    const socket = connect({
      host: config.host,
      port: config.port,
      rejectUnauthorized: true,
      minVersion: "TLSv1.3",
      ciphers: "TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256",
    });

    function fail(err: Error) {
      console.error(`SMTP Error: ${err.message}`, {
        state: SmtpState[state],
        host: config.host,
      });

      if (socket && !socket.destroyed) {
        socket.write("QUIT\r\n", () => socket.destroy());
      }

      const publicError =
        err instanceof SmtpError
          ? new SmtpError(`SMTP operation failed: ${err.message}`, err.code)
          : new SmtpError("SMTP operation failed.", 500);

      reject(publicError);
    }

    socket.setEncoding("utf8");
    socket.setTimeout(CONNECTION_TIMEOUT, () =>
      fail(new SmtpError("Connection timed out.", 408)),
    );

    function sendCommand(cmd: string) {
      const logCmd =
        state === SmtpState.AUTH_USER || state === SmtpState.AUTH_PASS
          ? "[REDACTED]"
          : cmd;

      debug(`[SMTP CLIENT] C: ${logCmd}`);
      socket.write(`${cmd}\r\n`);
    }

    const processResponse = (response: string) => {
      debug(`[SMTP SERVER] S: ${response}`);
      const code = parseInt(response.substring(0, 3), 10);

      if (Number.isNaN(code)) {
        throw new SmtpError("Received invalid response from server.", 500);
      }

      try {
        switch (state) {
          case SmtpState.GREETING:
            if (code !== SMTP_CODES.GREETING)
              throw new SmtpError("Invalid greeting", code);
            sendCommand(`EHLO ${sanitizeHeader(config.host)}`);
            state = SmtpState.EHLO;
            break;

          case SmtpState.EHLO:
            if (code !== SMTP_CODES.OK)
              throw new SmtpError("EHLO rejected", code);
            sendCommand("AUTH LOGIN");
            state = SmtpState.AUTH;
            break;

          case SmtpState.AUTH:
            if (code !== SMTP_CODES.AUTH_PROMPT)
              throw new SmtpError("AUTH LOGIN rejected", code);
            sendCommand(Buffer.from(config.auth.user).toString("base64"));
            state = SmtpState.AUTH_USER;
            break;

          case SmtpState.AUTH_USER:
            if (code !== SMTP_CODES.AUTH_PROMPT)
              throw new SmtpError("Username rejected", code);
            sendCommand(Buffer.from(config.auth.pass).toString("base64"));
            state = SmtpState.AUTH_PASS;
            break;

          case SmtpState.AUTH_PASS:
            if (code !== SMTP_CODES.AUTH_SUCCESS)
              throw new SmtpError("Authentication failed", code);
            sendCommand(`MAIL FROM:<${sanitizeHeader(mail.from)}>`);
            state = SmtpState.MAIL_FROM;
            break;

          case SmtpState.MAIL_FROM:
            if (code !== SMTP_CODES.OK)
              throw new SmtpError("Sender rejected", code);
            sendCommand(`RCPT TO:<${sanitizeHeader(mail.to)}>`);
            state = SmtpState.RCPT_TO;
            break;

          case SmtpState.RCPT_TO:
            if (code !== SMTP_CODES.OK)
              throw new SmtpError("Recipient rejected", code);
            sendCommand("DATA");
            state = SmtpState.DATA;
            break;

          case SmtpState.DATA: {
            if (code !== SMTP_CODES.DATA_READY)
              throw new SmtpError("Server not ready for data", code);

            const fromUser = sanitizeHeader(mail.from);
            const safeBody = mail.text.replace(/^\./gm, "..");

            const emailData = [
              `From: "arnnvv.sbs" <${fromUser}>`,
              `To: <${sanitizeHeader(mail.to)}>`,
              `Subject: ${sanitizeHeader(mail.subject)}`,
              "Content-Type: text/plain; charset=utf-8",
              "MIME-Version: 1.0",
              "",
              safeBody,
            ].join("\r\n");

            sendCommand(`${emailData}\r\n.`);
            state = SmtpState.BODY;
            break;
          }

          case SmtpState.BODY:
            if (code !== SMTP_CODES.OK)
              throw new SmtpError("Message data rejected", code);
            sendCommand("QUIT");
            state = SmtpState.QUIT;
            break;

          case SmtpState.QUIT:
            if (code !== SMTP_CODES.GOODBYE)
              console.warn(`QUIT command response was not 221: ${response}`);
            state = SmtpState.DONE;
            socket.end();
            resolve();
            break;

          default:
            throw new SmtpError(`Unhandled state: ${SmtpState[state]}`, 500);
        }
      } catch (e) {
        fail(e as Error);
      }
    };

    socket.on("data", (data) => {
      buffer += data.toString();

      if (buffer.length > MAX_BUFFER_SIZE) {
        return fail(new SmtpError("Response buffer limit exceeded.", 500));
      }

      while (true) {
        const eolIndex = buffer.indexOf("\r\n");

        if (eolIndex === -1) {
          break;
        }

        const line = buffer.substring(0, eolIndex);
        buffer = buffer.substring(eolIndex + 2);

        if (line.length > MAX_LINE_LENGTH) {
          return fail(new SmtpError("Response line limit exceeded.", 500));
        }

        if (line.length > 0 && line.charAt(3) !== "-") {
          processResponse(line);
        } else if (line.length > 0) {
          debug(`[SMTP SERVER] S: ${line}`);
        }
      }
    });

    socket.on("error", (err) =>
      fail(new SmtpError(`TLS Socket Error: ${err.message}`)),
    );

    socket.on("end", () => {
      if (state !== SmtpState.DONE) {
        reject(
          new SmtpError("Connection ended prematurely by the server.", 500),
        );
      }
    });
  });
}
