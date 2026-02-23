/// <reference types="node" />
import { convexAuth } from "@convex-dev/auth/server";

const ResendProvider = {
    id: "resend",
    type: "email" as const,
    name: "Resend",
    async sendVerificationRequest({ identifier: to, url }: any) {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "KioskIA <kioskia@fueradelacaja.co>",
                to,
                subject: `Ingresa a KioskIA`,
                html: `
          <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #00BFA5;">KioskIA</h2>
            <p>Hola, haz clic en el siguiente enlace para ingresar a tu cuenta:</p>
            <a href="${url}" style="display: inline-block; background: #00BFA5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Ingresar a KioskIA
            </a>
            <p style="color: #999; font-size: 12px; margin-top: 24px;">Si no solicitaste este enlace, puedes ignorar este correo.</p>
          </div>
        `,
            }),
        });
        if (!res.ok) throw new Error("Resend failed: " + (await res.text()));
    },
};

export const { auth, signIn, signOut, store } = convexAuth({
    providers: [ResendProvider],
});
