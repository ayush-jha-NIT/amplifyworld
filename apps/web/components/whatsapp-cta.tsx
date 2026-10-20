import Image from "next/image";

type WhatsAppCtaProps = {
  label: "Let's Grow" | "Talk to Amplify World";
  variant?: "small" | "large";
  className?: string;
};

export function getWhatsAppHref(raw: string | undefined): string | null {
  const value = raw?.trim() ?? "";
  if (!/^\+?[1-9]\d{7,14}$/.test(value)) return null;
  const number = value.replace(/^\+/, "");
  const message = encodeURIComponent("Hello AmplifyWorld, I'd like to discuss growing my business.");
  return `https://wa.me/${number}?text=${message}`;
}

export function WhatsAppCta({ label, variant = "large", className = "" }: WhatsAppCtaProps) {
  const href = getWhatsAppHref(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
  const classNames = `wa-cta ${variant === "small" ? "wa-cta-small" : ""} ${className}`.trim();
  const contents = (
    <>
      <Image src="/design/icons/whatsapp.svg" alt="" aria-hidden="true" width={21} height={21} />
      <span>{label}</span>
    </>
  );

  if (!href) {
    return (
      <button
        type="button"
        className={classNames}
        disabled
        title="WhatsApp is not configured yet"
        aria-label={`${label}: WhatsApp business number not yet configured`}
        data-whatsapp-state="unconfigured"
      >
        {contents}
      </button>
    );
  }

  return (
    <a
      className={classNames}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} on WhatsApp (opens a new tab)`}
      data-whatsapp-state="configured"
    >
      {contents}
    </a>
  );
}
