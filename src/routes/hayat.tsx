import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";

import HayatOyunu, { type OneriSaglayici, type SahneSaglayici } from "@/components/HayatOyunu";
import { oneriGetir, sahneGetir } from "@/lib/hayat.functions";

export const Route = createFileRoute("/hayat")({
  head: () => ({
    meta: [
      { title: "Hayat Simülatörü — Bir hayat, sayısız yol" },
      {
        name: "description",
        content:
          "Karakterini yarat, hedefini seç ve bebeklikten yaşlılığa bir ömrü yaşa. Sahneleri yapay zekâ yazar, kararlarında akıl hocan yanında.",
      },
      { property: "og:title", content: "Hayat Simülatörü" },
      {
        property: "og:description",
        content:
          "Her oynayışta farklı bir hayat: yaşına uygun olaylar, kalıcı ilişkiler ve yapay zekâ önerileri.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HayatSayfasi,
});

function HayatSayfasi() {
  /* Sahneler ve öneriler sunucudaki yapay zekâdan gelir; anahtar yoksa ya da
     istek düşerse sunucu aynı yanıtı yerel motordan üretir. */
  const sahneSaglayici = useCallback<SahneSaglayici>(
    ({ durum, sonKaliplar, kacinilanBasliklar }) =>
      sahneGetir({ data: { durum, sonKaliplar, kacinilanBasliklar, yapayZeka: true } }),
    [],
  );

  const oneriSaglayici = useCallback<OneriSaglayici>(
    ({ durum, olay }) =>
      oneriGetir({
        data: {
          durum,
          olay: {
            id: olay.id,
            baslik: olay.baslik,
            metin: olay.metin,
            secenekler: olay.secenekler,
          },
          yapayZeka: true,
        },
      }),
    [],
  );

  return <HayatOyunu sahneSaglayici={sahneSaglayici} oneriSaglayici={oneriSaglayici} />;
}
