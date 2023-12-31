import { rateLimit } from "@/lib/rate-limit";
import { Contact, contactSchema } from "@/lib/validations/contact";
import { NextRequest, NextResponse } from "next/server";
import nodemailer, { SendMailOptions } from "nodemailer";

async function sendEmail(mailContent: Contact) {
  const transporter = nodemailer.createTransport({
    host: "smtp.yandex.com",
    port: 465,
    secure: true,
    service: "Yandex",
    auth: {
      user: process.env.NODE_MAILER_USER,
      pass: process.env.NODE_MAILER_PASSWORD,
    },
  });

  const mailOptions: SendMailOptions = {
    from: process.env.NODE_MAILER_USER,
    to: process.env.PERSONAL_MAIL,
    subject: `Contact From - ${mailContent.name}`,
    text: `
            Name & Company: ${mailContent.name}
            \n
            Email: ${mailContent.email}
            \n
            Message: ${mailContent.message}
        `,
  };

  return await transporter.sendMail(mailOptions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const userKey = req.headers.get("x-real-ip") || req.ip || "Limiter";
  const rateLimitResponse = await rateLimit(userKey, 2, 60000);

  if (rateLimitResponse) return rateLimitResponse;

  try {
    contactSchema.parse(body);
    sendEmail(body);
    const captchaRes = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SERVER}&response=${body.captchaToken}`,
      {
        method: "POST",
      }
    );
    const captchaData = await captchaRes.json();
    if (!captchaData.success) {
      throw new Error("Captcha error", { cause: "captcha" });
    }

    return NextResponse.json(
      { message: "Mesajınız başarıyla alındı" },
      {
        status: 200,
      }
    );
  } catch (err) {
    const error = err as { cause: "captcha" };
    if (error?.cause === "captcha") {
      return NextResponse.json(
        {
          message: "Captcha doğrulanmadı!",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      { message: "Mesajınız Alınamadı" },
      { status: 500 }
    );
  }
}
