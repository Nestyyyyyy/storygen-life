import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";

import HayatOyunu, {
  type AlanOneriSaglayici,
  type IsimOneriSaglayici,
  type OneriSaglayici,
  type ProfilSaglayici,
  type SahneSaglayici,
  type SerbestCevapSaglayici,
} from "@/components/HayatOyunu";
import {
  alanOner,
  isimOner,
  oneriGetir,
  profilCoz,
  sahneGetir,
  serbestCevap,
} from "@/lib/hayat.functions";

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

  /* Karakter oluştururken: isim/meslek/kişilik önerileri ve serbest metnin
     oyun profiline çevrilmesi de sunucudaki yapay zekâdan geçer. */
  const alanOneriSaglayici = useCallback<AlanOneriSaglayici>(
    ({ tur, ipucu, kacinilan }) => alanOner({ data: { tur, ipucu, kacinilan } }),
    [],
  );

  const isimOneriSaglayici = useCallback<IsimOneriSaglayici>(
    ({ cinsiyet, kacinilan }) => isimOner({ data: { cinsiyet, kacinilan } }),
    [],
  );

  const profilSaglayici = useCallback<ProfilSaglayici>(
    ({ ad, tur }) => profilCoz({ data: { ad, tur } }),
    [],
  );

  const serbestCevapSaglayici = useCallback<SerbestCevapSaglayici>(
    ({ durum, olay, metin }) =>
      serbestCevap({
        data: {
          durum,
          olay: {
            id: olay.id,
            baslik: olay.baslik,
            metin: olay.metin,
            secenekler: olay.secenekler,
          },
          metin,
          yapayZeka: true,
        },
      }),
    [],
  );

  return (
    <HayatOyunu
      sahneSaglayici={sahneSaglayici}
      oneriSaglayici={oneriSaglayici}
      alanOneriSaglayici={alanOneriSaglayici}
      isimOneriSaglayici={isimOneriSaglayici}
      profilSaglayici={profilSaglayici}
      serbestCevapSaglayici={serbestCevapSaglayici}
    />
  );
}
