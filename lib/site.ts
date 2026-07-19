/** Date centrale ale firmei — o singură sursă de adevăr în tot site-ul. */
export const site = {
  name: "Full Work Services",
  legalName: "FULL WORK SERVICES S.R.L.",
  cui: "45291775",
  regCom: "J2021020993406",
  address: "Str. Grigore Ionescu nr. 63, Sector 2, București",
  addressEn: "63 Grigore Ionescu St., District 2, Bucharest, Romania",
  phoneDisplay: "0723 147 723",
  phoneE164: "+40723147723",
  email: "office@fullworkservices.com",
  whatsappBase: "https://wa.me/40723147723",
  facebook: "https://www.facebook.com/profile.php?id=100071014033361",
  url: "https://fullworkservices.com",
  founder: "Diana Dina",
} as const;

/** Link WhatsApp cu mesaj pre-completat. */
export function whatsappLink(text?: string) {
  return text
    ? `${site.whatsappBase}?text=${encodeURIComponent(text)}`
    : site.whatsappBase;
}
