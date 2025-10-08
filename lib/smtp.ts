import { Buffer } from "node:buffer";
import { connect } from "node:tls";
import { CONNECTION_TIMEOUT, SMTP_CODES } from "./constants";
import { type MailOptions, type SmtpConfig, SmtpState } from "./db/types";

function sanitizeHeader(input: string): string {
  return input.replace(/(\r\n|\r|\n)/g, "");
}

class SmtpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SmtpError";
  }
}

export async function sendEmail(
  config: SmtpConfig,
  mail: MailOptions,
): Promise<void> {
  if (!config || !mail || !config.auth) {
    throw new SmtpError("Invalid configuration or mail options provided.");
  }

  return new Promise((resolve, reject) => {
    let state = SmtpState.GREETING;
    let buffer = "";

    const socket = connect({
      host: config.host,
      port: config.port,
      rejectUnauthorized: true,
    });

    function fail(err: Error) {
      if (socket && !socket.destroyed) {
        socket.write("QUIT\r\n", () => socket.destroy());
      }
      reject(err);
    }

    socket.setEncoding("utf8");
    socket.setTimeout(CONNECTION_TIMEOUT, () =>
      fail(new SmtpError("Connection timed out.")),
    );

    function sendCommand(cmd: string) {
      socket.write(`${cmd}\r\n`);
    }

    const processResponse = (response: string) => {
      const code = parseInt(response.substring(0, 3), 10);

      try {
        switch (state) {
          case SmtpState.GREETING:
            if (code !== SMTP_CODES.GREETING)
              throw new SmtpError("Invalid greeting");
            sendCommand(`EHLO ${sanitizeHeader(config.host)}`);
            state = SmtpState.EHLO;
            break;

          case SmtpState.EHLO:
            if (code !== SMTP_CODES.OK) throw new SmtpError("EHLO rejected");
            sendCommand("AUTH LOGIN");
            state = SmtpState.AUTH;
            break;

          case SmtpState.AUTH:
            if (code !== SMTP_CODES.AUTH_PROMPT)
              throw new SmtpError("AUTH LOGIN rejected");
            sendCommand(Buffer.from(config.auth.user).toString("base64"));
            state = SmtpState.AUTH_USER;
            break;

          case SmtpState.AUTH_USER:
            if (code !== SMTP_CODES.AUTH_PROMPT)
              throw new SmtpError("Username rejected");
            sendCommand(Buffer.from(config.auth.pass).toString("base64"));
            state = SmtpState.AUTH_PASS;
            break;

          case SmtpState.AUTH_PASS:
            if (code !== SMTP_CODES.AUTH_SUCCESS)
              throw new SmtpError("Authentication failed");
            sendCommand(`MAIL FROM:<${sanitizeHeader(mail.from)}>`);
            state = SmtpState.MAIL_FROM;
            break;

          case SmtpState.MAIL_FROM:
            if (code !== SMTP_CODES.OK) throw new SmtpError("Sender rejected");
            sendCommand(`RCPT TO:<${sanitizeHeader(mail.to)}>`);
            state = SmtpState.RCPT_TO;
            break;

          case SmtpState.RCPT_TO:
            if (code !== SMTP_CODES.OK)
              throw new SmtpError("Recipient rejected");
            sendCommand("DATA");
            state = SmtpState.DATA;
            break;

          case SmtpState.DATA: {
            if (code !== SMTP_CODES.DATA_READY)
              throw new SmtpError("Server not ready for data");
            const fromName = sanitizeHeader(
              mail.from || mail.from.split("@")[0],
            );
            const safeBody = mail.text.replace(/^\./gm, "..");

            const emailData = [
              `From: "${fromName}" <${sanitizeHeader(mail.from)}>`,
              `To: <${sanitizeHeader(mail.to)}>`,
              `Subject: ${sanitizeHeader(mail.subject)}`,
              "Content-Type: text/plain; charset=utf-8",
              "",
              safeBody,
            ].join("\r\n");

            sendCommand(`${emailData}\r\n.`);
            state = SmtpState.BODY;
            break;
          }

          case SmtpState.BODY:
            if (code !== SMTP_CODES.OK)
              throw new SmtpError("Message data rejected");
            sendCommand("QUIT");
            state = SmtpState.QUIT;
            break;

          case SmtpState.QUIT:
            if (code !== SMTP_CODES.GOODBYE)
              throw new SmtpError("QUIT command failed");
            state = SmtpState.DONE;
            socket.end();
            resolve();
            break;

          default:
            throw new SmtpError(`Unhandled state: ${SmtpState[state]}`);
        }
      } catch (e) {
        fail(e as Error);
      }
    };

    socket.on("data", (data) => {
      buffer += data.toString();
      while (true) {
        const eolIndex = buffer.indexOf("\r\n");

        if (eolIndex === -1) {
          break;
        }

        const line = buffer.substring(0, eolIndex);
        buffer = buffer.substring(eolIndex + 2);

        if (line.length > 0 && line.charAt(3) !== "-") {
          processResponse(line);
        }
      }
    });

    socket.on("error", (err) =>
      fail(new SmtpError(`TLS Socket Error: ${err.message}`)),
    );
    socket.on("end", () => {
      if (state !== SmtpState.DONE) {
        reject(new SmtpError("Connection ended prematurely by the server."));
      }
    });
  });
}
