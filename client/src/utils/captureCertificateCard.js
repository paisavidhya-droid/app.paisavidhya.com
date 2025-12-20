// client/src/utils/captureCertificateCard.js
import { toBlob } from "html-to-image";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export const captureCardAsBlob = async () => {
  const node = document.getElementById("share-certificate-card");
  if (!node) throw new Error("Card not found");

  // Give browser a moment to paint fonts/layout (helps Inter / webfonts)
  await wait(80);

  const blob = await toBlob(node, {
    cacheBust: true,
    pixelRatio: 3, // sharper on mobile share
    backgroundColor: "#022c22",
  });

  if (!blob) throw new Error("Failed to generate image");
  return blob;
};
